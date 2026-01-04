"""
Eligibility Calculator Module

Calculates student eligibility scores for job postings using
the formula: (Skill Match × 0.4) + (CGPA × 0.3) + (Branch Match × 0.2) + (Experience × 0.1)
"""

from typing import Dict, List, Optional
from dataclasses import dataclass
from enum import Enum


class EligibilityLevel(Enum):
    """Eligibility classification levels."""
    HIGHLY_ELIGIBLE = "highly_eligible"
    ELIGIBLE = "eligible"
    PARTIALLY_ELIGIBLE = "partially_eligible"
    NOT_ELIGIBLE = "not_eligible"


@dataclass
class StudentProfile:
    """Student profile data structure."""
    name: str
    email: str
    branch: str
    cgpa: float
    skills: List[str]
    experience_months: int
    backlogs: int = 0
    tenth_percentage: float = 0.0
    twelfth_percentage: float = 0.0


@dataclass
class JobRequirements:
    """Job requirements data structure."""
    title: str
    company: str
    required_branches: List[str]
    min_cgpa: float
    min_tenth: float
    min_twelfth: float
    max_backlogs: int
    min_experience_months: int
    mandatory_skills: List[str]
    preferred_skills: List[str]


class EligibilityCalculator:
    """
    Calculate student eligibility scores for job postings.
    
    Formula: (Skill Match × 0.4) + (CGPA × 0.3) + (Branch Match × 0.2) + (Experience × 0.1)
    """
    
    def __init__(self):
        # Scoring weights
        self.weights = {
            'skill_match': 0.4,
            'cgpa': 0.3,
            'branch_match': 0.2,
            'experience': 0.1
        }
        
        # Branch aliases for matching
        self.branch_aliases = {
            'cse': ['computer science', 'cs', 'cse', 'computer science and engineering'],
            'it': ['information technology', 'it'],
            'ece': ['electronics and communication', 'ece', 'electronics'],
            'ee': ['electrical engineering', 'ee', 'electrical'],
            'me': ['mechanical engineering', 'me', 'mechanical'],
            'ce': ['civil engineering', 'ce', 'civil'],
            'all': ['all branches', 'all', 'any']
        }
    
    def calculate_eligibility(
        self,
        student: Dict,
        job: Dict,
        skill_match_percentage: Optional[float] = None
    ) -> Dict:
        """
        Calculate comprehensive eligibility score.
        
        Args:
            student: Student profile dictionary
            job: Job requirements dictionary
            skill_match_percentage: Pre-calculated skill match (0-100), optional
            
        Returns:
            Detailed eligibility analysis
        """
        # Parse inputs
        student_profile = self._parse_student(student)
        job_requirements = self._parse_job(job)
        
        # Check hard requirements (disqualifiers)
        disqualifiers = self._check_disqualifiers(student_profile, job_requirements)
        
        if disqualifiers:
            return {
                'isEligible': False,
                'eligibilityLevel': EligibilityLevel.NOT_ELIGIBLE.value,
                'totalScore': 0,
                'scores': {},
                'disqualifiers': disqualifiers,
                'suggestions': self._generate_suggestions_for_disqualifiers(disqualifiers),
                'analysis': 'Student does not meet minimum requirements for this position.'
            }
        
        # Calculate component scores
        scores = {}
        
        # Skill Match Score (0-100)
        if skill_match_percentage is not None:
            scores['skill_match'] = min(skill_match_percentage, 100)
        else:
            scores['skill_match'] = self._calculate_skill_match(
                student_profile.skills,
                job_requirements.mandatory_skills,
                job_requirements.preferred_skills
            )
        
        # CGPA Score (0-100)
        scores['cgpa'] = self._calculate_cgpa_score(
            student_profile.cgpa,
            job_requirements.min_cgpa
        )
        
        # Branch Match Score (0-100)
        scores['branch_match'] = self._calculate_branch_match(
            student_profile.branch,
            job_requirements.required_branches
        )
        
        # Experience Score (0-100)
        scores['experience'] = self._calculate_experience_score(
            student_profile.experience_months,
            job_requirements.min_experience_months
        )
        
        # Calculate weighted total
        total_score = (
            scores['skill_match'] * self.weights['skill_match'] +
            scores['cgpa'] * self.weights['cgpa'] +
            scores['branch_match'] * self.weights['branch_match'] +
            scores['experience'] * self.weights['experience']
        )
        
        # Determine eligibility level
        eligibility_level = self._determine_level(total_score)
        
        # Generate detailed analysis
        analysis = self._generate_analysis(scores, total_score, eligibility_level)
        
        # Generate improvement suggestions
        suggestions = self._generate_suggestions(scores, student_profile, job_requirements)
        
        return {
            'isEligible': eligibility_level != EligibilityLevel.NOT_ELIGIBLE.value,
            'eligibilityLevel': eligibility_level,
            'totalScore': round(total_score, 2),
            'scores': {
                'skillMatch': {
                    'score': round(scores['skill_match'], 2),
                    'weight': self.weights['skill_match'],
                    'weightedScore': round(scores['skill_match'] * self.weights['skill_match'], 2)
                },
                'cgpa': {
                    'score': round(scores['cgpa'], 2),
                    'weight': self.weights['cgpa'],
                    'weightedScore': round(scores['cgpa'] * self.weights['cgpa'], 2)
                },
                'branchMatch': {
                    'score': round(scores['branch_match'], 2),
                    'weight': self.weights['branch_match'],
                    'weightedScore': round(scores['branch_match'] * self.weights['branch_match'], 2)
                },
                'experience': {
                    'score': round(scores['experience'], 2),
                    'weight': self.weights['experience'],
                    'weightedScore': round(scores['experience'] * self.weights['experience'], 2)
                }
            },
            'disqualifiers': [],
            'suggestions': suggestions,
            'analysis': analysis,
            'breakdown': {
                'studentCGPA': student_profile.cgpa,
                'requiredCGPA': job_requirements.min_cgpa,
                'studentBranch': student_profile.branch,
                'requiredBranches': job_requirements.required_branches,
                'studentExperience': student_profile.experience_months,
                'requiredExperience': job_requirements.min_experience_months
            }
        }
    
    def _parse_student(self, data: Dict) -> StudentProfile:
        """Parse student data into StudentProfile."""
        return StudentProfile(
            name=data.get('name', ''),
            email=data.get('email', ''),
            branch=data.get('branch', '').lower(),
            cgpa=float(data.get('cgpa', 0)),
            skills=[s.lower() for s in data.get('skills', [])],
            experience_months=int(data.get('experienceMonths', data.get('experience_months', 0))),
            backlogs=int(data.get('backlogs', 0)),
            tenth_percentage=float(data.get('tenthPercentage', data.get('tenth_percentage', 0))),
            twelfth_percentage=float(data.get('twelfthPercentage', data.get('twelfth_percentage', 0)))
        )
    
    def _parse_job(self, data: Dict) -> JobRequirements:
        """Parse job data into JobRequirements."""
        return JobRequirements(
            title=data.get('title', ''),
            company=data.get('company', ''),
            required_branches=[b.lower() for b in data.get('requiredBranches', data.get('required_branches', ['all']))],
            min_cgpa=float(data.get('minCGPA', data.get('min_cgpa', 0))),
            min_tenth=float(data.get('minTenth', data.get('min_tenth', 0))),
            min_twelfth=float(data.get('minTwelfth', data.get('min_twelfth', 0))),
            max_backlogs=int(data.get('maxBacklogs', data.get('max_backlogs', 100))),
            min_experience_months=int(data.get('minExperienceMonths', data.get('min_experience_months', 0))),
            mandatory_skills=[s.lower() for s in data.get('mandatorySkills', data.get('mandatory_skills', []))],
            preferred_skills=[s.lower() for s in data.get('preferredSkills', data.get('preferred_skills', []))]
        )
    
    def _check_disqualifiers(
        self,
        student: StudentProfile,
        job: JobRequirements
    ) -> List[Dict]:
        """Check for hard disqualifying criteria."""
        disqualifiers = []
        
        # CGPA check
        if student.cgpa < job.min_cgpa:
            disqualifiers.append({
                'type': 'cgpa',
                'message': f'CGPA {student.cgpa} is below minimum requirement of {job.min_cgpa}',
                'current': student.cgpa,
                'required': job.min_cgpa
            })
        
        # Backlog check
        if student.backlogs > job.max_backlogs:
            disqualifiers.append({
                'type': 'backlogs',
                'message': f'{student.backlogs} backlogs exceed maximum allowed ({job.max_backlogs})',
                'current': student.backlogs,
                'required': job.max_backlogs
            })
        
        # 10th percentage check
        if job.min_tenth > 0 and student.tenth_percentage < job.min_tenth:
            disqualifiers.append({
                'type': 'tenth_percentage',
                'message': f'10th percentage {student.tenth_percentage}% is below minimum {job.min_tenth}%',
                'current': student.tenth_percentage,
                'required': job.min_tenth
            })
        
        # 12th percentage check
        if job.min_twelfth > 0 and student.twelfth_percentage < job.min_twelfth:
            disqualifiers.append({
                'type': 'twelfth_percentage',
                'message': f'12th percentage {student.twelfth_percentage}% is below minimum {job.min_twelfth}%',
                'current': student.twelfth_percentage,
                'required': job.min_twelfth
            })
        
        # Branch check (if not 'all')
        if 'all' not in job.required_branches:
            branch_match = self._is_branch_match(student.branch, job.required_branches)
            if not branch_match:
                disqualifiers.append({
                    'type': 'branch',
                    'message': f'Branch "{student.branch}" not in required branches: {job.required_branches}',
                    'current': student.branch,
                    'required': job.required_branches
                })
        
        return disqualifiers
    
    def _is_branch_match(self, student_branch: str, required_branches: List[str]) -> bool:
        """Check if student branch matches any required branch."""
        student_branch = student_branch.lower().strip()
        
        for req_branch in required_branches:
            req_branch = req_branch.lower().strip()
            
            # Direct match
            if student_branch == req_branch:
                return True
            
            # Check aliases
            for key, aliases in self.branch_aliases.items():
                if req_branch in aliases or req_branch == key:
                    if student_branch in aliases or student_branch == key:
                        return True
        
        return False
    
    def _calculate_skill_match(
        self,
        student_skills: List[str],
        mandatory_skills: List[str],
        preferred_skills: List[str]
    ) -> float:
        """Calculate skill match percentage."""
        if not mandatory_skills and not preferred_skills:
            return 100.0
        
        student_set = set(s.lower() for s in student_skills)
        
        # Calculate mandatory match
        mandatory_matched = sum(1 for s in mandatory_skills if s.lower() in student_set or
                               any(s.lower() in ss or ss in s.lower() for ss in student_set))
        mandatory_score = (mandatory_matched / max(len(mandatory_skills), 1)) * 100
        
        # Calculate preferred match
        preferred_matched = sum(1 for s in preferred_skills if s.lower() in student_set or
                               any(s.lower() in ss or ss in s.lower() for ss in student_set))
        preferred_score = (preferred_matched / max(len(preferred_skills), 1)) * 100
        
        # Weighted combination (mandatory 70%, preferred 30%)
        return mandatory_score * 0.7 + preferred_score * 0.3
    
    def _calculate_cgpa_score(self, student_cgpa: float, min_cgpa: float) -> float:
        """Calculate CGPA score normalized to 0-100."""
        max_cgpa = 10.0
        
        if student_cgpa >= max_cgpa:
            return 100.0
        
        if student_cgpa < min_cgpa:
            # Below minimum, scaled down
            return (student_cgpa / max_cgpa) * 50
        
        # Above minimum, scale between 50-100
        range_above_min = max_cgpa - min_cgpa
        student_above_min = student_cgpa - min_cgpa
        
        return 50 + (student_above_min / range_above_min) * 50
    
    def _calculate_branch_match(
        self,
        student_branch: str,
        required_branches: List[str]
    ) -> float:
        """Calculate branch match score."""
        if 'all' in [b.lower() for b in required_branches]:
            return 100.0
        
        if self._is_branch_match(student_branch, required_branches):
            return 100.0
        
        # Check for related branches (partial match)
        related_branches = {
            'cse': ['it', 'ece'],
            'it': ['cse', 'ece'],
            'ece': ['ee', 'cse', 'it'],
            'ee': ['ece'],
            'me': ['ce'],
            'ce': ['me']
        }
        
        student_branch_key = student_branch.lower()
        for key, aliases in self.branch_aliases.items():
            if student_branch_key in aliases:
                student_branch_key = key
                break
        
        if student_branch_key in related_branches:
            for req_branch in required_branches:
                req_key = req_branch.lower()
                for key, aliases in self.branch_aliases.items():
                    if req_key in aliases:
                        req_key = key
                        break
                
                if req_key in related_branches.get(student_branch_key, []):
                    return 50.0  # Partial match for related branch
        
        return 0.0
    
    def _calculate_experience_score(
        self,
        student_months: int,
        min_months: int
    ) -> float:
        """Calculate experience score."""
        if min_months == 0:
            # No experience required
            if student_months > 0:
                return min(100, 70 + student_months * 2)  # Bonus for having experience
            return 70.0
        
        if student_months >= min_months:
            # Calculate bonus for extra experience (up to 100)
            extra_months = student_months - min_months
            return min(100, 80 + extra_months * 2)
        
        # Below requirement
        return (student_months / min_months) * 60
    
    def _determine_level(self, score: float) -> str:
        """Determine eligibility level based on score."""
        if score >= 80:
            return EligibilityLevel.HIGHLY_ELIGIBLE.value
        elif score >= 60:
            return EligibilityLevel.ELIGIBLE.value
        elif score >= 40:
            return EligibilityLevel.PARTIALLY_ELIGIBLE.value
        else:
            return EligibilityLevel.NOT_ELIGIBLE.value
    
    def _generate_analysis(
        self,
        scores: Dict[str, float],
        total: float,
        level: str
    ) -> str:
        """Generate human-readable analysis."""
        level_messages = {
            EligibilityLevel.HIGHLY_ELIGIBLE.value: "Excellent match! Strong candidate for this position.",
            EligibilityLevel.ELIGIBLE.value: "Good match. Candidate meets most requirements.",
            EligibilityLevel.PARTIALLY_ELIGIBLE.value: "Partial match. Some areas need improvement.",
            EligibilityLevel.NOT_ELIGIBLE.value: "Low match. Significant gaps in requirements."
        }
        
        analysis_parts = [level_messages.get(level, "")]
        
        # Highlight strengths
        strengths = [k for k, v in scores.items() if v >= 80]
        if strengths:
            strength_names = [s.replace('_', ' ').title() for s in strengths]
            analysis_parts.append(f"Strengths: {', '.join(strength_names)}.")
        
        # Highlight areas for improvement
        weaknesses = [k for k, v in scores.items() if v < 60]
        if weaknesses:
            weakness_names = [w.replace('_', ' ').title() for w in weaknesses]
            analysis_parts.append(f"Areas to improve: {', '.join(weakness_names)}.")
        
        return " ".join(analysis_parts)
    
    def _generate_suggestions(
        self,
        scores: Dict[str, float],
        student: StudentProfile,
        job: JobRequirements
    ) -> List[str]:
        """Generate improvement suggestions."""
        suggestions = []
        
        # Skill suggestions
        if scores['skill_match'] < 80:
            missing_skills = set(job.mandatory_skills) - set(student.skills)
            if missing_skills:
                suggestions.append(f"Learn these required skills: {', '.join(list(missing_skills)[:5])}")
            
            missing_preferred = set(job.preferred_skills) - set(student.skills)
            if missing_preferred:
                suggestions.append(f"Consider learning: {', '.join(list(missing_preferred)[:3])}")
        
        # Experience suggestions
        if scores['experience'] < 70 and job.min_experience_months > 0:
            gap = job.min_experience_months - student.experience_months
            if gap > 0:
                suggestions.append(f"Gain {gap} more months of relevant experience through internships or projects")
        
        # General suggestions based on low scores
        if scores['skill_match'] < 60:
            suggestions.append("Build projects showcasing required technical skills")
        
        if scores['experience'] < 60:
            suggestions.append("Participate in hackathons or contribute to open-source projects")
        
        return suggestions
    
    def _generate_suggestions_for_disqualifiers(self, disqualifiers: List[Dict]) -> List[str]:
        """Generate suggestions for disqualifying criteria."""
        suggestions = []
        
        for d in disqualifiers:
            if d['type'] == 'cgpa':
                suggestions.append("Focus on improving academic performance in remaining semesters")
            elif d['type'] == 'backlogs':
                suggestions.append("Clear pending backlogs before applying")
            elif d['type'] == 'branch':
                suggestions.append("This position may not be suitable for your branch. Look for roles open to all branches.")
        
        return suggestions
    
    def batch_calculate(
        self,
        students: List[Dict],
        job: Dict
    ) -> List[Dict]:
        """
        Calculate eligibility for multiple students.
        
        Args:
            students: List of student profiles
            job: Job requirements
            
        Returns:
            List of eligibility results, sorted by score
        """
        results = []
        
        for student in students:
            result = self.calculate_eligibility(student, job)
            result['student'] = {
                'name': student.get('name', ''),
                'email': student.get('email', ''),
                'branch': student.get('branch', '')
            }
            results.append(result)
        
        # Sort by total score (descending)
        results.sort(key=lambda x: x['totalScore'], reverse=True)
        
        return results
