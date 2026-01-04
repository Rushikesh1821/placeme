"""
AI Service for Placement Management System

Flask microservice for:
- Resume parsing
- Skill extraction using NLP
- Resume analysis
- OpenAI integration (optional)
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import traceback

# Import custom modules
from resume_parser import ResumeParser
from skill_matcher import SkillMatcher
from openai_service import OpenAIService

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize services
resume_parser = ResumeParser()
skill_matcher = SkillMatcher()
openai_service = OpenAIService(api_key=os.getenv('OPENAI_API_KEY'))

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'AI Resume Parser',
        'version': '1.0.0'
    })

@app.route('/parse-resume', methods=['POST'])
def parse_resume():
    """
    Parse resume text and extract information
    
    Expected JSON body:
    {
        "text": "Resume text content",
        "resumeId": "MongoDB resume ID (optional)"
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                'success': False,
                'error': 'Resume text is required'
            }), 400
        
        text = data.get('text', '')
        resume_id = data.get('resumeId')
        
        if not text.strip():
            return jsonify({
                'success': False,
                'error': 'Resume text is empty'
            }), 400
        
        # Parse resume
        parsed_data = resume_parser.parse(text)
        
        # Extract skills
        skills = skill_matcher.extract_skills(text)
        
        # Generate analysis
        analysis = resume_parser.analyze_resume(text, skills)
        
        return jsonify({
            'success': True,
            'resumeId': resume_id,
            'structuredData': parsed_data,
            'skills': skills,
            'analysis': analysis
        })
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/extract-skills', methods=['POST'])
def extract_skills():
    """
    Extract skills from text
    
    Expected JSON body:
    {
        "text": "Text content to extract skills from"
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                'success': False,
                'error': 'Text is required'
            }), 400
        
        text = data.get('text', '')
        skills = skill_matcher.extract_skills(text)
        
        return jsonify({
            'success': True,
            'skills': skills
        })
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/match-skills', methods=['POST'])
def match_skills():
    """
    Match candidate skills against job requirements
    
    Expected JSON body:
    {
        "candidateSkills": ["python", "javascript", ...],
        "requiredSkills": {
            "mandatory": ["python", "sql"],
            "preferred": ["react", "docker"]
        }
    }
    """
    try:
        data = request.get_json()
        
        candidate_skills = data.get('candidateSkills', [])
        required_skills = data.get('requiredSkills', {})
        
        result = skill_matcher.match_skills(candidate_skills, required_skills)
        
        return jsonify({
            'success': True,
            'matchResult': result
        })
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/analyze-resume', methods=['POST'])
def analyze_resume():
    """
    Deep analysis of resume using AI
    
    Expected JSON body:
    {
        "resumeId": "MongoDB resume ID",
        "text": "Resume text content"
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                'success': False,
                'error': 'Resume text is required'
            }), 400
        
        text = data.get('text', '')
        resume_id = data.get('resumeId')
        
        # Try OpenAI analysis if available
        if openai_service.is_available():
            analysis = openai_service.analyze_resume(text)
        else:
            # Fallback to local analysis
            skills = skill_matcher.extract_skills(text)
            analysis = resume_parser.analyze_resume(text, skills)
        
        return jsonify({
            'success': True,
            'resumeId': resume_id,
            'analysis': analysis
        })
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/calculate-eligibility', methods=['POST'])
def calculate_eligibility():
    """
    Calculate eligibility score for a candidate against job requirements
    
    Expected JSON body:
    {
        "candidate": {
            "skills": ["python", "java"],
            "cgpa": 8.5,
            "branch": "Computer Science",
            "experienceMonths": 6
        },
        "job": {
            "requiredSkills": {
                "mandatory": ["python"],
                "preferred": ["java", "docker"]
            },
            "minCgpa": 7.0,
            "branches": ["Computer Science", "IT"],
            "minExperience": 0
        }
    }
    """
    try:
        data = request.get_json()
        
        candidate = data.get('candidate', {})
        job = data.get('job', {})
        
        # Calculate skill match
        skill_result = skill_matcher.match_skills(
            candidate.get('skills', []),
            job.get('requiredSkills', {})
        )
        
        # Calculate CGPA score
        cgpa = candidate.get('cgpa', 0)
        min_cgpa = job.get('minCgpa', 0)
        cgpa_score = min(100, (cgpa / max(min_cgpa, 1)) * 100) if cgpa >= min_cgpa else (cgpa / max(min_cgpa, 1)) * 50
        
        # Branch match
        candidate_branch = candidate.get('branch', '').lower()
        eligible_branches = [b.lower() for b in job.get('branches', [])]
        branch_match = candidate_branch in eligible_branches or any(
            candidate_branch in b or b in candidate_branch 
            for b in eligible_branches
        )
        branch_score = 100 if branch_match else 0
        
        # Experience score
        exp_months = candidate.get('experienceMonths', 0)
        min_exp = job.get('minExperience', 0) * 12
        exp_score = min(100, 50 + (exp_months / max(min_exp, 1)) * 50) if min_exp > 0 else 50 + min(50, exp_months * 5)
        
        # Calculate overall score using the formula
        overall_score = (
            skill_result['matchPercentage'] * 0.4 +
            cgpa_score * 0.3 +
            branch_score * 0.2 +
            exp_score * 0.1
        )
        
        # Determine eligibility status
        if overall_score >= 70 and branch_match and cgpa >= min_cgpa:
            status = 'Eligible'
        elif overall_score >= 50 and branch_match:
            status = 'Partially Eligible'
        else:
            status = 'Not Eligible'
        
        return jsonify({
            'success': True,
            'eligibility': {
                'overallScore': round(overall_score, 2),
                'status': status,
                'breakdown': {
                    'skillMatch': {
                        'score': skill_result['matchPercentage'],
                        'weight': 0.4,
                        'weightedScore': round(skill_result['matchPercentage'] * 0.4, 2)
                    },
                    'cgpaScore': {
                        'score': round(cgpa_score, 2),
                        'weight': 0.3,
                        'weightedScore': round(cgpa_score * 0.3, 2)
                    },
                    'branchMatch': {
                        'score': branch_score,
                        'weight': 0.2,
                        'weightedScore': round(branch_score * 0.2, 2)
                    },
                    'experienceScore': {
                        'score': round(exp_score, 2),
                        'weight': 0.1,
                        'weightedScore': round(exp_score * 0.1, 2)
                    }
                },
                'skillAnalysis': skill_result
            }
        })
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/suggest-improvements', methods=['POST'])
def suggest_improvements():
    """
    Suggest resume improvements
    
    Expected JSON body:
    {
        "text": "Resume text",
        "targetRole": "Software Engineer (optional)"
    }
    """
    try:
        data = request.get_json()
        
        text = data.get('text', '')
        target_role = data.get('targetRole', '')
        
        # Extract current skills
        skills = skill_matcher.extract_skills(text)
        
        # Generate suggestions
        suggestions = resume_parser.generate_suggestions(text, skills, target_role)
        
        return jsonify({
            'success': True,
            'suggestions': suggestions
        })
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    debug = os.getenv('FLASK_ENV', 'development') == 'development'
    
    print(f"""
    ╔═══════════════════════════════════════════════════════════╗
    ║                                                           ║
    ║   🤖 AI Resume Parser Service                             ║
    ║                                                           ║
    ║   Running on: http://localhost:{port}                      ║
    ║   Debug mode: {debug}                                     ║
    ║                                                           ║
    ╚═══════════════════════════════════════════════════════════╝
    """)
    
    app.run(host='0.0.0.0', port=port, debug=debug)
