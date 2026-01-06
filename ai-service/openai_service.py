"""
Lightweight OpenAI integration shim for the AI service.
Provides OpenAIService with:
- is_available(): returns True only if an API key is set and openai package is importable
- analyze_resume(text): calls OpenAI if available, otherwise returns a simple local analysis
"""

import os
import traceback

class OpenAIService:
    def __init__(self, api_key=None):
        self.api_key = api_key or os.getenv('OPENAI_API_KEY')
        self._available = False
        self._client = None

        if self.api_key:
            try:
                import openai
                openai.api_key = self.api_key
                self._client = openai
                self._available = True
            except Exception:
                # openai not installed or failed to initialize; remain unavailable
                self._available = False

    def is_available(self):
        return bool(self._available)

    def analyze_resume(self, text):
        """Return analysis dict. Uses OpenAI if available, otherwise a deterministic local summary."""
        if not text:
            return {'summary': '', 'keywords': [], 'notes': 'No text provided'}

        if self.is_available():
            try:
                # Minimal, safe request: use the completions API if available
                resp = self._client.ChatCompletion.create(
                    model='gpt-4o-mini',
                    messages=[
                        { 'role': 'system', 'content': 'You are a helpful resume analyzer.' },
                        { 'role': 'user', 'content': f'Extract key skills and provide a brief summary for the following resume text:\n\n{text[:4000]}' }
                    ],
                    max_tokens=300
                )
                content = resp.choices[0].message.content
                return { 'summary': content }
            except Exception:
                traceback.print_exc()
                # Fall back to local analysis below

        # Local deterministic fallback analysis
        lower = text.lower()
        # very small skill heuristics
        keywords = []
        common_skills = ['python', 'javascript', 'react', 'node', 'django', 'flask', 'sql', 'mongodb', 'aws', 'docker', 'kubernetes']
        for s in common_skills:
            if s in lower and s not in keywords:
                keywords.append(s)

        summary = (text.strip().replace('\n', ' ')[:400] + '...') if len(text.strip()) > 400 else text.strip()
        return { 'summary': summary, 'keywords': keywords, 'notes': 'Local fallback analysis used' }
