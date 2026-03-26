from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from datetime import datetime

# A vector of skills mapped to their confidence/intensity score
SkillsVector = Dict[str, float]


# --------------------------------------------------------------------------------
# Shared Sub-Models
# --------------------------------------------------------------------------------

class SkillNode(BaseModel):
    """
    Represents a specific skill or capability within a vector.
    """
    # The name of the skill (e.g. "Systems Thinking", "Python", "Agile")
    name: str 
    
    # Mathematical intensity/weight (0.0 to 1.0)
    intensity: float = Field(..., ge=0.0, le=1.0)
    
    # What verified this? (e.g. "GitHub Oracle", "Course 6.0001")
    provenance: str 

# --------------------------------------------------------------------------------
# 1. Individuals (Targeting Supply Side)
# --------------------------------------------------------------------------------

class CandidateProfile(BaseModel):
    """
    Represents an individual user (e.g. "Alex Chen").
    This is the core "Supply" in the marketplace.
    """
    user_id: str
    name: str
    headline: Optional[str] = None
    
    # The sum total of their verified capabilities
    # e.g. {"Python": SkillNode(name="Python", intensity=0.85, ...)}
    verified_skill_vector: Dict[str, SkillNode]
    
    # NEW fields for the SkillsParser
    normalized_scores: SkillsVector = {}
    graph_intersections: Dict[str, List[str]] = {} # e.g. {"Python": ["GitHub", "Resume"]}
    
    last_synced: datetime = Field(default_factory=datetime.utcnow)

class ProfileBuildRequest(BaseModel):
    """
    Incoming request to the /api/build endpoint for the candidate builder.
    """
    name: str
    headline: str
    github_url: Optional[str] = None
    hackerrank_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    resume_text: Optional[str] = None
    transcript_text: Optional[str] = None

# --------------------------------------------------------------------------------
# 2. Hiring Organizations (Targeting Demand Side)
# --------------------------------------------------------------------------------

class JobProfile(BaseModel):
    """
    Represents a specific Job Description or Role.
    This acts as the target "Target SkillGraph" that pulling candidates.
    """
    job_id: str
    title: str
    department: str
    
    # The "Ideal" centroid of required skills to perform this job.
    required_skill_vector: Dict[str, SkillNode]

class CompanyProfile(BaseModel):
    """
    Represents an Employer/Organization.
    """
    company_id: str
    name: str
    industry: str
    
    # All active roles they are hiring for
    open_roles: List[JobProfile] = []

# --------------------------------------------------------------------------------
# 3. Academic Institutions (Targeting Supply Generation)
# --------------------------------------------------------------------------------

class CourseProfile(BaseModel):
    """
    Represents a discrete unit of learning (a class, a bootcamp module, etc.)
    """
    course_id: str
    title: str
    
    # The specific skills this course imparts *if completed successfully*.
    imparted_skill_vector: Dict[str, SkillNode]

class CollegeProfile(BaseModel):
    """
    Represents a traditional 4-year University or academic body (e.g. MIT).
    """
    institution_id: str
    name: str
    
    # Institution Metadata
    # These are stored statically as they typically only change annually
    national_rank: Optional[int] = None
    student_count: Optional[int] = None
    acceptance_rate: Optional[float] = None  # e.g., 0.04 for 4%
    
    # The catalog of all courses offered
    curriculum: List[CourseProfile] = []
    
    @property
    def number_of_courses(self) -> int:
        """Dynamically computed based on the ingested curriculum length."""
        return len(self.curriculum)

# --------------------------------------------------------------------------------
# 4. Alternative Education & Validation
# --------------------------------------------------------------------------------

class BootcampProfile(BaseModel):
    """
    Represents an intensive upskilling program (e.g. General Assembly, App Academy).
    """
    bootcamp_id: str
    name: str
    
    # Similar to college curriculum, but usually much more compressed and focused
    modules: List[CourseProfile] = []

class CredentialProviderProfile(BaseModel):
    """
    Represents an entity that provides verifiable exams/certifications (e.g. AWS).
    """
    provider_id: str
    name: str
    
    # Maps a certification name to the skills it mathematically proves
    # e.g. {"AWS Solutions Architect": {"System Design": 0.9, ...}}
    certifications: Dict[str, Dict[str, SkillNode]] = {}

class ResearchLabProfile(BaseModel):
    """
    Represents an applied research group (e.g. MIT CSAIL, OpenAI alignment lab).
    """
    lab_id: str
    name: str
    focus_area: str
    
    # Labs generate highly specialized vector clusters unlike standard courses
    active_projects: List[CourseProfile] = []

class TestProviderProfile(BaseModel):
    """
    Represents pure assessment platforms (e.g. HackerRank, LeetCode, CodeSignal).
    These act strictly as verifiers, not upskillers.
    """
    provider_id: str
    name: str

    # Supported assessment types (e.g. "Algorithmic Speed", "System Design")
    assessment_types: List[str] = []


# --------------------------------------------------------------------------------
# 5. Sparc AI GPS Routing Models
# --------------------------------------------------------------------------------

class RouteStep(BaseModel):
    """A single step in a career navigation route."""
    type: str  # "course", "degree", "credential", "role", "experience"
    title: str
    duration: Optional[str] = None
    cost: Optional[str] = None
    salary: Optional[str] = None
    skills_gained: Dict[str, float] = {}
    year: Optional[str] = None

class CareerRoute(BaseModel):
    """A complete career path from current state to target role."""
    id: str
    label: str
    subtitle: Optional[str] = None
    icon: str  # "clock", "shield-dollar", "graduation-cap", "rocket", "building"
    steps: List[RouteStep]
    total_time: str
    total_cost: str
    arrival_probability: int  # 0-100

class AlternativeDestination(BaseModel):
    """A lateral career match the user may also qualify for."""
    title: str
    company: str
    match: int  # 0-100
    gap_summary: str

class PersonaRouteResponse(BaseModel):
    """Full route response for a persona."""
    persona_id: str
    name: str
    target_role: str
    target_company: Optional[str] = None
    current_skills: Dict[str, float]
    target_skills: Dict[str, float]
    routes: List[CareerRoute]
    alternatives: List[AlternativeDestination]
