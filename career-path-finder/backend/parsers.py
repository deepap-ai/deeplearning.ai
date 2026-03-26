from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, Union
from schemas import SkillsVector
import io
import pypdf

class BaseParser(ABC):
    @abstractmethod
    def parse(self, input_data: Any) -> SkillsVector:
        """
        Parses the input data and returns a normalized SkillsVector mapping 
        skill identifiers to confidence scores (0.0 to 1.0).
        """
        pass

import re
from github_live import fetch_github_profile

class GitHubParser(BaseParser):
    def parse(self, input_data: str) -> SkillsVector:
        if not input_data:
            return {}
            
        handle = input_data.strip()
        # Extract username if input is a URL like https://github.com/benbrandt
        match = re.search(r'github\.com/([^/]+)', handle)
        if match:
            handle = match.group(1)
            
        try:
            profile_data = fetch_github_profile(handle)
            return profile_data.get("skill_vector", {})
        except Exception:
            return {}

class HackerRankParser(BaseParser):
    def parse(self, input_data: str) -> SkillsVector:
        # Mock logic tuned for "Alex" based on HackerRank Data
        if not input_data:
            return {}
        return {
            "Algorithms": 0.90,
            "Data Structures": 0.88,
            "Python": 0.85,
            "System Design": 0.70
        }

class LinkedInParser(BaseParser):
    def parse(self, input_data: str) -> SkillsVector:
        # Mock logic tuned for "Alex" based on LinkedIn Data
        if not input_data:
            return {}
        return {
            "Agile": 0.80,
            "Team Leadership": 0.75,
            "React": 0.90,
            "Product Strategy": 0.65,
            "Tech Writing": 0.70
        }

class DocumentParser(BaseParser):
    def __init__(self, doc_type: str):
        self.doc_type = doc_type

    def parse(self, input_data: Union[str, bytes]) -> SkillsVector:
        if not input_data:
            return {}
            
        text = ""
        if isinstance(input_data, bytes):
            try:
                reader = pypdf.PdfReader(io.BytesIO(input_data))
                # read in strictly limited chunks (max 5 pages at a time) per user rules
                pages = reader.pages[:5]
                text = "".join(page.extract_text() for page in pages if page.extract_text())
            except Exception as e:
                text = ""
        else:
            text = input_data
            
        text_lower = text.lower()
        skills = {}
        
        # Simple Keyword Extraction
        keywords = {
            "python": 0.90, "react": 0.85, "node.js": 0.75, "agile": 0.85,
            "machine learning": 0.80, "system design": 0.75, "algorithms": 0.85,
            "data structures": 0.80, "typescript": 0.80, "javascript": 0.80,
            "aws": 0.75, "docker": 0.70, "kubernetes": 0.70, "sql": 0.75,
            "c++": 0.80, "java": 0.80, "go": 0.75, "ruby": 0.70,
            "deep learning": 0.85, "nlp": 0.80,
            "reinforcement learning": 0.85, "multi-agent systems": 0.80,
            "prompt decomposition": 0.80, "backend architecture": 0.80,
            "systems thinking": 0.85, "product strategy": 0.80
        }
        
        proper_names = {
            "python": "Python", "react": "React", "node.js": "Node.js", "agile": "Agile",
            "machine learning": "Machine Learning", "system design": "System Design",
            "algorithms": "Algorithms", "data structures": "Data Structures",
            "typescript": "TypeScript", "javascript": "JavaScript", "aws": "AWS",
            "docker": "Docker", "kubernetes": "Kubernetes", "sql": "SQL",
            "c++": "C++", "java": "Java", "go": "Go", "ruby": "Ruby",
            "deep learning": "Deep Learning", "nlp": "NLP",
            "reinforcement learning": "Reinforcement Learning",
            "multi-agent systems": "Multi-Agent Systems",
            "prompt decomposition": "Prompt Decomposition",
            "backend architecture": "Backend Architecture",
            "systems thinking": "Systems Thinking",
            "product strategy": "Product Strategy"
        }
        
        for kw, score in keywords.items():
            if kw in text_lower:
                skills[proper_names[kw]] = score
                
        # If no keywords matched, fallback to some default generic terms
        if not skills:
            if self.doc_type == "resume":
                skills = {"Agile": 0.70, "Product Strategy": 0.65}
            elif self.doc_type == "transcript":
                skills = {"Linear Algebra": 0.75, "Calculus": 0.70}
                
        return skills


class SkillsParserFactory:
    """
    Factory to instantiate and run parsers based on the source type.
    """
    @classmethod
    def run_all(cls, sources: Dict[str, Any]) -> Dict[str, SkillsVector]:
        vectors = {}
        if sources.get("github"):
            vectors["GitHub"] = GitHubParser().parse(sources["github"])
            
        if sources.get("hackerrank"):
            vectors["HackerRank"] = HackerRankParser().parse(sources["hackerrank"])
            
        if sources.get("linkedin"):
            vectors["LinkedIn"] = LinkedInParser().parse(sources["linkedin"])
            
        if sources.get("resume"):
            vectors["Resume"] = DocumentParser("resume").parse(sources["resume"])
            
        if sources.get("transcript"):
            vectors["Transcript"] = DocumentParser("transcript").parse(sources["transcript"])
            
        return vectors
