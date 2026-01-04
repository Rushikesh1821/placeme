"""
Resume Parser Module

Extracts structured information from resume text using NLP techniques.
"""

import re
import spacy
from typing import Dict, List, Any, Optional

# Load spaCy model
try:
    nlp = spacy.load('en_core_web_sm')
except OSError:
    print("Downloading spaCy model...")
    import subprocess
    subprocess.run(['python', '-m', 'spacy', 'download', 'en_core_web_sm'])
    nlp = spacy.load('en_core_web_sm')


class ResumeParser:
    """
    Parse and extract information from resume text.
    """
    
    def __init__(self):
        self.email_pattern = re.compile(r'[\w\.-]+@[\w\.-]+\.\w+')
        self.phone_pattern = re.compile(r'[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{4,6}[-\s\.]?[0-9]{0,4}')
        self.linkedin_pattern = re.compile(r'linkedin\.com/in/[\w-]+')
        self.github_pattern = re.compile(r'github\.com/[\w-]+')
        
        # Education keywords
        self.degree_keywords = [
            'bachelor', 'b.tech', 'b.e.', 'btech', 'b.sc', 'bsc',
            'master', 'm.tech', 'mtech', 'm.e.', 'm.sc', 'msc', 'mba',
            'phd', 'doctorate', 'diploma'
        ]
        
        # Section headers
        self.section_headers = {
            'education': ['education', 'academic', 'qualification', 'degree'],
            'experience': ['experience', 'employment', 'work history', 'professional background'],
            'skills': ['skills', 'technical skills', 'competencies', 'expertise'],
            'projects': ['projects', 'portfolio', 'work samples'],
            'certifications': ['certifications', 'certificates', 'credentials', 'courses'],
            'achievements': ['achievements', 'awards', 'honors', 'accomplishments']
        }
    
    def parse(self, text: str) -> Dict[str, Any]:
        """
        Parse resume text and extract structured information.
        
        Args:
            text: Raw resume text
            
        Returns:
            Dictionary with structured resume data
        """
        # Process with spaCy
        doc = nlp(text)
        
        # Extract basic information
        result = {
            'name': self._extract_name(doc, text),
            'email': self._extract_email(text),
            'phone': self._extract_phone(text),
            'linkedin': self._extract_linkedin(text),
            'github': self._extract_github(text),
            'summary': self._extract_summary(text),
            'education': self._extract_education(text),
            'experience': self._extract_experience(text, doc),
            'projects': self._extract_projects(text),
            'certifications': self._extract_certifications(text)
        }
        
        return result
    
    def _extract_name(self, doc, text: str) -> str:
        """Extract name from resume."""
        # Try to find PERSON entities
        for ent in doc.ents:
            if ent.label_ == 'PERSON':
                return ent.text
        
        # Fallback: First line often contains name
        lines = text.strip().split('\n')
        if lines:
            first_line = lines[0].strip()
            # Check if it looks like a name (2-4 words, no special chars)
            words = first_line.split()
            if 1 <= len(words) <= 4 and all(word.isalpha() for word in words):
                return first_line
        
        return ''
    
    def _extract_email(self, text: str) -> str:
        """Extract email address."""
        match = self.email_pattern.search(text)
        return match.group(0) if match else ''
    
    def _extract_phone(self, text: str) -> str:
        """Extract phone number."""
        match = self.phone_pattern.search(text)
        return match.group(0) if match else ''
    
    def _extract_linkedin(self, text: str) -> str:
        """Extract LinkedIn profile URL."""
        match = self.linkedin_pattern.search(text.lower())
        if match:
            return f"https://{match.group(0)}"
        return ''
    
    def _extract_github(self, text: str) -> str:
        """Extract GitHub profile URL."""
        match = self.github_pattern.search(text.lower())
        if match:
            return f"https://{match.group(0)}"
        return ''
    
    def _extract_summary(self, text: str) -> str:
        """Extract professional summary/objective."""
        text_lower = text.lower()
        
        summary_keywords = ['summary', 'objective', 'profile', 'about me', 'career objective']
        
        for keyword in summary_keywords:
            if keyword in text_lower:
                start_idx = text_lower.find(keyword)
                # Find the end of this section
                end_idx = len(text)
                for header in self.section_headers['education'] + self.section_headers['experience']:
                    header_idx = text_lower.find(header, start_idx + len(keyword))
                    if header_idx != -1 and header_idx < end_idx:
                        end_idx = header_idx
                
                summary = text[start_idx:end_idx].strip()
                # Clean up
                lines = summary.split('\n')[1:3]  # Skip header, take first 2-3 lines
                return ' '.join(lines).strip()
        
        return ''
    
    def _extract_education(self, text: str) -> List[Dict]:
        """Extract education information."""
        education = []
        text_lower = text.lower()
        
        # Find education section
        edu_start = -1
        for keyword in self.section_headers['education']:
            idx = text_lower.find(keyword)
            if idx != -1:
                edu_start = idx
                break
        
        if edu_start == -1:
            return education
        
        # Find section end
        edu_end = len(text)
        for section_type, keywords in self.section_headers.items():
            if section_type == 'education':
                continue
            for keyword in keywords:
                idx = text_lower.find(keyword, edu_start + 10)
                if idx != -1 and idx < edu_end:
                    edu_end = idx
        
        edu_text = text[edu_start:edu_end]
        
        # Extract degree information
        for keyword in self.degree_keywords:
            if keyword in edu_text.lower():
                lines = edu_text.split('\n')
                for i, line in enumerate(lines):
                    if keyword in line.lower():
                        entry = {
                            'degree': line.strip(),
                            'institution': lines[i+1].strip() if i+1 < len(lines) else '',
                            'field': '',
                            'grade': ''
                        }
                        
                        # Try to find grade/CGPA
                        for search_line in lines[i:i+3]:
                            cgpa_match = re.search(r'(\d+\.?\d*)\s*(cgpa|gpa|%|percentage)', search_line.lower())
                            if cgpa_match:
                                entry['grade'] = cgpa_match.group(0)
                        
                        education.append(entry)
                        break
        
        return education
    
    def _extract_experience(self, text: str, doc) -> List[Dict]:
        """Extract work experience."""
        experience = []
        text_lower = text.lower()
        
        # Find experience section
        exp_start = -1
        for keyword in self.section_headers['experience']:
            idx = text_lower.find(keyword)
            if idx != -1:
                exp_start = idx
                break
        
        if exp_start == -1:
            return experience
        
        # Find section end
        exp_end = len(text)
        for section_type, keywords in self.section_headers.items():
            if section_type == 'experience':
                continue
            for keyword in keywords:
                idx = text_lower.find(keyword, exp_start + 10)
                if idx != -1 and idx < exp_end:
                    exp_end = idx
        
        exp_text = text[exp_start:exp_end]
        
        # Extract organization names from NER
        exp_doc = nlp(exp_text)
        orgs = [ent.text for ent in exp_doc.ents if ent.label_ == 'ORG']
        
        # Extract date ranges
        date_pattern = re.compile(r'(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*\d{2,4}\s*[-–to]+\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|present|current)[a-z]*\s*\d{0,4}', re.IGNORECASE)
        dates = date_pattern.findall(exp_text)
        
        # Build experience entries
        lines = exp_text.split('\n')
        for i, org in enumerate(orgs[:5]):  # Limit to 5 experiences
            entry = {
                'company': org,
                'title': '',
                'startDate': '',
                'endDate': '',
                'description': ''
            }
            
            # Find title near company name
            for line in lines:
                if org.lower() in line.lower():
                    # Previous or next line might be title
                    line_idx = lines.index(line)
                    if line_idx > 0:
                        potential_title = lines[line_idx - 1].strip()
                        if len(potential_title) < 50 and not any(kw in potential_title.lower() for kw in ['experience', 'work']):
                            entry['title'] = potential_title
                    break
            
            # Add dates if available
            if i < len(dates):
                entry['startDate'] = dates[i][0]
                entry['endDate'] = dates[i][1]
            
            experience.append(entry)
        
        return experience
    
    def _extract_projects(self, text: str) -> List[Dict]:
        """Extract project information."""
        projects = []
        text_lower = text.lower()
        
        # Find projects section
        proj_start = -1
        for keyword in self.section_headers['projects']:
            idx = text_lower.find(keyword)
            if idx != -1:
                proj_start = idx
                break
        
        if proj_start == -1:
            return projects
        
        # Find section end
        proj_end = len(text)
        for section_type, keywords in self.section_headers.items():
            if section_type == 'projects':
                continue
            for keyword in keywords:
                idx = text_lower.find(keyword, proj_start + 10)
                if idx != -1 and idx < proj_end:
                    proj_end = idx
        
        proj_text = text[proj_start:proj_end]
        lines = proj_text.split('\n')
        
        current_project = None
        for line in lines[1:]:  # Skip header
            line = line.strip()
            if not line:
                if current_project:
                    projects.append(current_project)
                    current_project = None
                continue
            
            # Check if this is a new project title (usually bold or starts with bullet)
            if line.startswith(('•', '-', '*', '●')) or (len(line) < 60 and line[0].isupper()):
                if current_project:
                    projects.append(current_project)
                
                current_project = {
                    'name': line.lstrip('•-*● '),
                    'description': '',
                    'technologies': [],
                    'link': ''
                }
            elif current_project:
                current_project['description'] += ' ' + line
        
        if current_project:
            projects.append(current_project)
        
        return projects[:5]  # Limit to 5 projects
    
    def _extract_certifications(self, text: str) -> List[Dict]:
        """Extract certifications."""
        certifications = []
        text_lower = text.lower()
        
        # Find certifications section
        cert_start = -1
        for keyword in self.section_headers['certifications']:
            idx = text_lower.find(keyword)
            if idx != -1:
                cert_start = idx
                break
        
        if cert_start == -1:
            return certifications
        
        # Find section end
        cert_end = len(text)
        for section_type, keywords in self.section_headers.items():
            if section_type == 'certifications':
                continue
            for keyword in keywords:
                idx = text_lower.find(keyword, cert_start + 10)
                if idx != -1 and idx < cert_end:
                    cert_end = idx
        
        cert_text = text[cert_start:cert_end]
        lines = cert_text.split('\n')
        
        for line in lines[1:]:  # Skip header
            line = line.strip()
            if line and len(line) > 5:
                certifications.append({
                    'name': line.lstrip('•-*● '),
                    'issuer': '',
                    'date': ''
                })
        
        return certifications[:10]  # Limit to 10
    
    def analyze_resume(self, text: str, skills: Dict) -> Dict:
        """
        Analyze resume quality and generate scores.
        
        Args:
            text: Resume text
            skills: Extracted skills dictionary
            
        Returns:
            Analysis results with scores and suggestions
        """
        # Calculate various scores
        word_count = len(text.split())
        
        # Skills score
        total_skills = sum(len(s) for s in skills.values() if isinstance(s, list))
        skills_score = min(100, total_skills * 8)
        
        # Content score based on sections present
        sections_found = 0
        text_lower = text.lower()
        for section_keywords in self.section_headers.values():
            if any(kw in text_lower for kw in section_keywords):
                sections_found += 1
        
        content_score = (sections_found / len(self.section_headers)) * 100
        
        # Experience score
        exp_keywords = ['intern', 'developer', 'engineer', 'analyst', 'manager', 'lead', 'worked', 'developed', 'implemented']
        exp_mentions = sum(1 for kw in exp_keywords if kw in text_lower)
        experience_score = min(100, exp_mentions * 12)
        
        # Education score
        edu_keywords = ['university', 'college', 'institute', 'bachelor', 'master', 'degree', 'cgpa', 'gpa']
        edu_mentions = sum(1 for kw in edu_keywords if kw in text_lower)
        education_score = min(100, edu_mentions * 15)
        
        # Overall score
        overall_score = (
            skills_score * 0.35 +
            content_score * 0.25 +
            experience_score * 0.25 +
            education_score * 0.15
        )
        
        # Generate suggestions
        suggestions = self.generate_suggestions(text, skills, '')
        
        return {
            'overallScore': round(overall_score, 1),
            'skillsScore': round(skills_score, 1),
            'experienceScore': round(experience_score, 1),
            'educationScore': round(education_score, 1),
            'presentationScore': round(content_score, 1),
            'suggestions': suggestions,
            'keywords': self._extract_keywords(text),
            'summary': f"Resume has {word_count} words with {total_skills} identified skills.",
            'analyzedAt': None  # Will be set by caller
        }
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Extract important keywords from resume."""
        doc = nlp(text)
        
        # Get noun phrases and named entities
        keywords = set()
        
        for chunk in doc.noun_chunks:
            if len(chunk.text) > 2:
                keywords.add(chunk.text.lower())
        
        for ent in doc.ents:
            if ent.label_ in ['ORG', 'PRODUCT', 'WORK_OF_ART']:
                keywords.add(ent.text.lower())
        
        return list(keywords)[:20]
    
    def generate_suggestions(self, text: str, skills: Dict, target_role: str) -> List[str]:
        """Generate improvement suggestions."""
        suggestions = []
        text_lower = text.lower()
        
        # Check for missing sections
        if 'summary' not in text_lower and 'objective' not in text_lower:
            suggestions.append("Add a professional summary or objective statement at the beginning")
        
        if 'project' not in text_lower:
            suggestions.append("Include relevant projects to showcase your practical experience")
        
        if 'certification' not in text_lower and 'certificate' not in text_lower:
            suggestions.append("Add relevant certifications to strengthen your profile")
        
        # Check skills
        tech_skills = skills.get('technical', [])
        if len(tech_skills) < 5:
            suggestions.append("Add more technical skills relevant to your target role")
        
        # Check for action verbs
        action_verbs = ['developed', 'implemented', 'designed', 'created', 'managed', 'led', 'achieved', 'improved']
        verb_count = sum(1 for verb in action_verbs if verb in text_lower)
        if verb_count < 3:
            suggestions.append("Use more action verbs (developed, implemented, achieved) to describe your accomplishments")
        
        # Check for quantifiable achievements
        if not re.search(r'\d+%|\$\d+|\d+\s*(users|customers|projects)', text_lower):
            suggestions.append("Add quantifiable achievements (e.g., 'increased efficiency by 25%')")
        
        # Check length
        word_count = len(text.split())
        if word_count < 200:
            suggestions.append("Your resume seems too brief. Add more details about your experience and skills")
        elif word_count > 1000:
            suggestions.append("Consider condensing your resume to highlight the most relevant information")
        
        # Check contact information
        if '@' not in text:
            suggestions.append("Ensure your email address is clearly visible")
        
        if 'linkedin' not in text_lower:
            suggestions.append("Add your LinkedIn profile URL")
        
        if 'github' not in text_lower and any(skill in ['python', 'javascript', 'java', 'react', 'node'] for skill in [s.get('skill', '').lower() for s in tech_skills]):
            suggestions.append("Add your GitHub profile to showcase your code")
        
        return suggestions[:8]  # Limit suggestions
