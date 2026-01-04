"""
Skill Matcher Module

Extracts and matches skills from text against job requirements.
"""

import re
from typing import Dict, List, Set, Tuple

class SkillMatcher:
    """
    Extract skills from text and match against job requirements.
    """
    
    def __init__(self):
        # Comprehensive skill database
        self.technical_skills = {
            # Programming Languages
            'programming_languages': [
                'python', 'javascript', 'java', 'c++', 'c#', 'c', 'ruby', 'go', 'golang',
                'rust', 'swift', 'kotlin', 'typescript', 'php', 'scala', 'r', 'matlab',
                'perl', 'haskell', 'lua', 'dart', 'objective-c', 'assembly', 'cobol',
                'fortran', 'groovy', 'julia', 'elixir', 'clojure', 'erlang', 'f#'
            ],
            
            # Web Development
            'web_frontend': [
                'html', 'html5', 'css', 'css3', 'sass', 'scss', 'less', 'tailwind',
                'bootstrap', 'material-ui', 'mui', 'chakra-ui', 'ant design',
                'react', 'reactjs', 'react.js', 'angular', 'angularjs', 'vue', 'vuejs',
                'vue.js', 'svelte', 'next.js', 'nextjs', 'nuxt.js', 'nuxtjs',
                'gatsby', 'remix', 'jquery', 'webpack', 'vite', 'rollup', 'parcel',
                'babel', 'redux', 'mobx', 'recoil', 'zustand', 'context api'
            ],
            
            # Web Backend
            'web_backend': [
                'node.js', 'nodejs', 'express', 'express.js', 'fastify', 'nest.js',
                'nestjs', 'koa', 'hapi', 'django', 'flask', 'fastapi', 'tornado',
                'spring', 'spring boot', 'springboot', 'hibernate', 'struts',
                'asp.net', '.net', 'dotnet', '.net core', 'rails', 'ruby on rails',
                'laravel', 'symfony', 'codeigniter', 'gin', 'echo', 'fiber',
                'actix', 'rocket', 'phoenix', 'graphql', 'rest', 'restful', 'api',
                'microservices', 'serverless', 'grpc', 'websocket', 'socket.io'
            ],
            
            # Databases
            'databases': [
                'mysql', 'postgresql', 'postgres', 'mongodb', 'redis', 'elasticsearch',
                'sqlite', 'oracle', 'sql server', 'mssql', 'mariadb', 'cassandra',
                'dynamodb', 'firebase', 'firestore', 'couchdb', 'neo4j', 'graphdb',
                'influxdb', 'timescaledb', 'cockroachdb', 'supabase', 'prisma',
                'sequelize', 'typeorm', 'mongoose', 'sql', 'nosql', 'plsql'
            ],
            
            # Cloud & DevOps
            'cloud_devops': [
                'aws', 'amazon web services', 'azure', 'microsoft azure', 'gcp',
                'google cloud', 'google cloud platform', 'heroku', 'digitalocean',
                'linode', 'vultr', 'cloudflare', 'vercel', 'netlify', 'railway',
                'docker', 'kubernetes', 'k8s', 'openshift', 'podman', 'containerd',
                'jenkins', 'gitlab ci', 'github actions', 'circleci', 'travis ci',
                'teamcity', 'bamboo', 'argo cd', 'terraform', 'ansible', 'puppet',
                'chef', 'vagrant', 'packer', 'helm', 'prometheus', 'grafana',
                'elk', 'elasticsearch', 'logstash', 'kibana', 'datadog', 'new relic',
                'splunk', 'nagios', 'zabbix', 'cloudwatch', 'nginx', 'apache',
                'load balancer', 'cdn', 'ci/cd', 'cicd', 'devops', 'sre', 'iaas',
                'paas', 'saas', 'lambda', 'ec2', 's3', 'rds', 'eks', 'ecs'
            ],
            
            # AI/ML/Data Science
            'ai_ml_data': [
                'machine learning', 'ml', 'deep learning', 'dl', 'artificial intelligence',
                'ai', 'neural network', 'cnn', 'rnn', 'lstm', 'transformer', 'bert',
                'gpt', 'llm', 'nlp', 'natural language processing', 'computer vision',
                'opencv', 'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'sklearn',
                'pandas', 'numpy', 'scipy', 'matplotlib', 'seaborn', 'plotly',
                'jupyter', 'anaconda', 'data analysis', 'data science', 'data engineering',
                'etl', 'data pipeline', 'spark', 'pyspark', 'hadoop', 'hive', 'pig',
                'kafka', 'airflow', 'mlflow', 'kubeflow', 'dvc', 'weights & biases',
                'hugging face', 'langchain', 'openai api', 'stable diffusion',
                'regression', 'classification', 'clustering', 'reinforcement learning',
                'feature engineering', 'model deployment', 'mlops', 'data visualization',
                'tableau', 'power bi', 'looker', 'metabase', 'superset', 'dbt'
            ],
            
            # Mobile Development
            'mobile': [
                'android', 'ios', 'react native', 'flutter', 'xamarin', 'ionic',
                'cordova', 'phonegap', 'swift', 'swiftui', 'kotlin', 'java android',
                'objective-c', 'cocoa', 'uikit', 'android studio', 'xcode',
                'firebase', 'push notifications', 'mobile ui', 'mobile ux'
            ],
            
            # Version Control & Collaboration
            'version_control': [
                'git', 'github', 'gitlab', 'bitbucket', 'svn', 'subversion',
                'mercurial', 'perforce', 'azure devops', 'jira', 'confluence',
                'trello', 'asana', 'notion', 'slack', 'teams'
            ],
            
            # Testing
            'testing': [
                'jest', 'mocha', 'chai', 'jasmine', 'cypress', 'selenium',
                'playwright', 'puppeteer', 'pytest', 'unittest', 'junit',
                'testng', 'rspec', 'cucumber', 'postman', 'insomnia',
                'unit testing', 'integration testing', 'e2e testing', 'tdd', 'bdd',
                'qa', 'quality assurance', 'test automation', 'load testing',
                'jmeter', 'gatling', 'locust', 'k6'
            ],
            
            # Security
            'security': [
                'cybersecurity', 'security', 'penetration testing', 'ethical hacking',
                'owasp', 'ssl', 'tls', 'https', 'oauth', 'oauth2', 'jwt',
                'encryption', 'authentication', 'authorization', 'sso', 'ldap',
                'active directory', 'firewall', 'vpn', 'ids', 'ips', 'siem',
                'vulnerability assessment', 'security audit', 'compliance',
                'gdpr', 'hipaa', 'pci-dss', 'sox', 'iso 27001'
            ],
            
            # Other Tools & Technologies
            'other_tech': [
                'linux', 'unix', 'windows server', 'bash', 'shell scripting',
                'powershell', 'vim', 'emacs', 'vscode', 'intellij', 'eclipse',
                'postman', 'swagger', 'openapi', 'soap', 'xml', 'json', 'yaml',
                'markdown', 'latex', 'regex', 'cron', 'rabbitmq', 'celery',
                'redis queue', 'message queue', 'event driven', 'blockchain',
                'solidity', 'web3', 'ethereum', 'smart contracts', 'nft',
                'iot', 'embedded systems', 'arduino', 'raspberry pi',
                'agile', 'scrum', 'kanban', 'waterfall', 'sdlc'
            ]
        }
        
        # Soft skills
        self.soft_skills = [
            'communication', 'leadership', 'teamwork', 'problem solving',
            'critical thinking', 'time management', 'adaptability', 'creativity',
            'attention to detail', 'analytical', 'interpersonal', 'presentation',
            'negotiation', 'conflict resolution', 'decision making', 'mentoring',
            'collaboration', 'flexibility', 'initiative', 'work ethic',
            'emotional intelligence', 'patience', 'empathy', 'active listening',
            'public speaking', 'writing', 'research', 'project management',
            'organizational', 'multitasking', 'self-motivated', 'team player'
        ]
        
        # Build flattened skill set for quick lookup
        self.all_technical_skills = set()
        for category_skills in self.technical_skills.values():
            for skill in category_skills:
                self.all_technical_skills.add(skill.lower())
        
        # Common skill aliases
        self.skill_aliases = {
            'js': 'javascript',
            'ts': 'typescript',
            'py': 'python',
            'node': 'node.js',
            'react': 'reactjs',
            'vue': 'vuejs',
            'angular': 'angularjs',
            'postgres': 'postgresql',
            'mongo': 'mongodb',
            'k8s': 'kubernetes',
            'tf': 'tensorflow',
            'sklearn': 'scikit-learn',
            'aws': 'amazon web services',
            'gcp': 'google cloud platform'
        }
    
    def extract_skills(self, text: str) -> Dict[str, List[Dict]]:
        """
        Extract skills from resume text.
        
        Args:
            text: Resume text content
            
        Returns:
            Dictionary with categorized skills
        """
        text_lower = text.lower()
        
        # Find technical skills
        technical = []
        found_skills = set()
        
        for category, skills in self.technical_skills.items():
            for skill in skills:
                skill_lower = skill.lower()
                
                # Check if skill is in text (with word boundaries for short skills)
                if len(skill_lower) <= 3:
                    # Use word boundary for short skills
                    pattern = r'\b' + re.escape(skill_lower) + r'\b'
                    if re.search(pattern, text_lower):
                        if skill_lower not in found_skills:
                            found_skills.add(skill_lower)
                            technical.append({
                                'skill': skill,
                                'confidence': 0.9,
                                'category': category.replace('_', ' ').title()
                            })
                else:
                    if skill_lower in text_lower:
                        if skill_lower not in found_skills:
                            found_skills.add(skill_lower)
                            technical.append({
                                'skill': skill,
                                'confidence': 0.85,
                                'category': category.replace('_', ' ').title()
                            })
        
        # Find soft skills
        soft = []
        for skill in self.soft_skills:
            if skill.lower() in text_lower:
                soft.append({
                    'skill': skill.title(),
                    'confidence': 0.75
                })
        
        # Extract tools (look for specific patterns)
        tools = self._extract_tools(text_lower)
        
        # Extract domains/industries
        domains = self._extract_domains(text_lower)
        
        return {
            'technical': technical,
            'soft': soft,
            'tools': tools,
            'domains': domains
        }
    
    def _extract_tools(self, text: str) -> List[Dict]:
        """Extract development tools."""
        tools = []
        tool_keywords = [
            'vs code', 'visual studio', 'pycharm', 'webstorm', 'android studio',
            'xcode', 'eclipse', 'intellij', 'sublime', 'atom', 'notepad++',
            'figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator',
            'jira', 'confluence', 'slack', 'teams', 'zoom', 'notion',
            'postman', 'insomnia', 'charles', 'fiddler', 'wireshark'
        ]
        
        for tool in tool_keywords:
            if tool in text:
                tools.append({
                    'skill': tool.title(),
                    'confidence': 0.8
                })
        
        return tools
    
    def _extract_domains(self, text: str) -> List[Dict]:
        """Extract domain expertise."""
        domains = []
        domain_keywords = {
            'fintech': ['fintech', 'banking', 'payment', 'financial', 'trading'],
            'healthcare': ['healthcare', 'medical', 'health', 'clinical', 'hospital'],
            'ecommerce': ['e-commerce', 'ecommerce', 'retail', 'shopping', 'marketplace'],
            'edtech': ['edtech', 'education', 'learning', 'lms', 'e-learning'],
            'gaming': ['gaming', 'game development', 'unity', 'unreal'],
            'iot': ['iot', 'internet of things', 'embedded', 'sensors'],
            'blockchain': ['blockchain', 'crypto', 'web3', 'defi', 'nft'],
            'ai': ['artificial intelligence', 'machine learning', 'deep learning'],
            'saas': ['saas', 'software as a service', 'b2b', 'enterprise']
        }
        
        for domain, keywords in domain_keywords.items():
            if any(kw in text for kw in keywords):
                domains.append({
                    'skill': domain.upper() if domain in ['iot', 'ai', 'saas'] else domain.title(),
                    'confidence': 0.7
                })
        
        return domains
    
    def match_skills(self, candidate_skills: List[str], required_skills: Dict) -> Dict:
        """
        Match candidate skills against job requirements.
        
        Args:
            candidate_skills: List of candidate's skills
            required_skills: Dictionary with 'mandatory' and 'preferred' skill lists
            
        Returns:
            Match analysis with percentages and details
        """
        # Normalize candidate skills
        candidate_set = set(s.lower().strip() for s in candidate_skills)
        
        # Add aliases
        expanded_candidate = set(candidate_set)
        for skill in candidate_set:
            if skill in self.skill_aliases:
                expanded_candidate.add(self.skill_aliases[skill])
            # Check reverse aliases
            for alias, full in self.skill_aliases.items():
                if skill == full:
                    expanded_candidate.add(alias)
        
        # Get required skills
        mandatory = [s.lower().strip() for s in required_skills.get('mandatory', [])]
        preferred = [s.lower().strip() for s in required_skills.get('preferred', [])]
        
        # Match mandatory skills
        mandatory_matched = []
        mandatory_missing = []
        
        for skill in mandatory:
            if self._skill_matches(skill, expanded_candidate):
                mandatory_matched.append(skill)
            else:
                mandatory_missing.append(skill)
        
        # Match preferred skills
        preferred_matched = []
        preferred_missing = []
        
        for skill in preferred:
            if self._skill_matches(skill, expanded_candidate):
                preferred_matched.append(skill)
            else:
                preferred_missing.append(skill)
        
        # Calculate percentages
        mandatory_percentage = (len(mandatory_matched) / max(len(mandatory), 1)) * 100
        preferred_percentage = (len(preferred_matched) / max(len(preferred), 1)) * 100
        
        # Overall match (weighted: mandatory 70%, preferred 30%)
        overall_percentage = (mandatory_percentage * 0.7 + preferred_percentage * 0.3)
        
        return {
            'matchPercentage': round(overall_percentage, 2),
            'mandatory': {
                'matched': mandatory_matched,
                'missing': mandatory_missing,
                'percentage': round(mandatory_percentage, 2)
            },
            'preferred': {
                'matched': preferred_matched,
                'missing': preferred_missing,
                'percentage': round(preferred_percentage, 2)
            },
            'totalRequired': len(mandatory) + len(preferred),
            'totalMatched': len(mandatory_matched) + len(preferred_matched),
            'candidateExtraSkills': list(expanded_candidate - set(mandatory) - set(preferred))[:10]
        }
    
    def _skill_matches(self, required_skill: str, candidate_skills: Set[str]) -> bool:
        """Check if a required skill matches any candidate skill."""
        required_skill = required_skill.lower().strip()
        
        # Direct match
        if required_skill in candidate_skills:
            return True
        
        # Partial match (for compound skills)
        for skill in candidate_skills:
            # Check if one contains the other
            if required_skill in skill or skill in required_skill:
                return True
            
            # Check word overlap for multi-word skills
            req_words = set(required_skill.split())
            skill_words = set(skill.split())
            if len(req_words & skill_words) >= min(len(req_words), len(skill_words)) * 0.5:
                return True
        
        return False
    
    def get_skill_category(self, skill: str) -> str:
        """Get the category of a skill."""
        skill_lower = skill.lower()
        
        for category, skills in self.technical_skills.items():
            if skill_lower in [s.lower() for s in skills]:
                return category.replace('_', ' ').title()
        
        if skill_lower in [s.lower() for s in self.soft_skills]:
            return 'Soft Skills'
        
        return 'Other'
    
    def suggest_skills(self, current_skills: List[str], target_role: str = '') -> List[str]:
        """
        Suggest skills based on current skills and target role.
        
        Args:
            current_skills: List of current skills
            target_role: Target job role (optional)
            
        Returns:
            List of suggested skills to learn
        """
        current_set = set(s.lower() for s in current_skills)
        suggestions = []
        
        # Suggest based on current skills (related technologies)
        skill_relationships = {
            'react': ['redux', 'next.js', 'typescript', 'jest'],
            'vue': ['vuex', 'nuxt.js', 'typescript', 'jest'],
            'angular': ['rxjs', 'typescript', 'jasmine', 'ngrx'],
            'python': ['django', 'flask', 'fastapi', 'pytest'],
            'node.js': ['express', 'nest.js', 'typescript', 'jest'],
            'java': ['spring boot', 'hibernate', 'junit', 'maven'],
            'machine learning': ['tensorflow', 'pytorch', 'scikit-learn', 'pandas'],
            'docker': ['kubernetes', 'ci/cd', 'terraform', 'aws'],
            'aws': ['docker', 'terraform', 'kubernetes', 'lambda']
        }
        
        for skill in current_set:
            if skill in skill_relationships:
                for related in skill_relationships[skill]:
                    if related.lower() not in current_set:
                        suggestions.append(related)
        
        # Suggest based on role
        role_skills = {
            'frontend': ['react', 'typescript', 'css', 'testing', 'webpack'],
            'backend': ['node.js', 'python', 'sql', 'docker', 'api design'],
            'fullstack': ['react', 'node.js', 'sql', 'docker', 'aws'],
            'devops': ['docker', 'kubernetes', 'terraform', 'ci/cd', 'aws'],
            'data scientist': ['python', 'machine learning', 'sql', 'tensorflow', 'pandas'],
            'mobile': ['react native', 'flutter', 'firebase', 'ios', 'android']
        }
        
        target_lower = target_role.lower()
        for role, skills in role_skills.items():
            if role in target_lower:
                for skill in skills:
                    if skill.lower() not in current_set and skill not in suggestions:
                        suggestions.append(skill)
        
        return suggestions[:10]  # Limit to 10 suggestions
