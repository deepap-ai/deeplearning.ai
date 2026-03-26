import json
import os
from datetime import datetime
from uuid import uuid4
from schemas import (
    CandidateProfile, CompanyProfile, JobProfile, 
    CollegeProfile, CourseProfile, SkillNode
)

MOCK_DIR = os.path.join(os.path.dirname(__file__), "mock_data")
os.makedirs(MOCK_DIR, exist_ok=True)

def _save_json(filename: str, data: dict):
    with open(os.path.join(MOCK_DIR, filename), 'w') as f:
        json.dump(data, f, indent=2, default=str)

def generate_mock_data():
    # ---------------------------------------------------------
    # 1. Generate 5 Colleges
    # ---------------------------------------------------------
    colleges = [
        CollegeProfile(
            institution_id="col_01", name="MIT", national_rank=1, student_count=11934, acceptance_rate=0.04,
            curriculum=[
                CourseProfile(course_id="c_01", title="Intro to CS", imparted_skill_vector={"Python": SkillNode(name="Python", intensity=0.4, provenance="MIT 6.0001")}),
                CourseProfile(course_id="c_02", title="Machine Learning", imparted_skill_vector={"Machine Learning": SkillNode(name="Machine Learning", intensity=0.7, provenance="MIT 6.3900")})
            ]
        ),
        CollegeProfile(
            institution_id="col_02", name="Stanford University", national_rank=2, student_count=17326, acceptance_rate=0.04,
            curriculum=[
                CourseProfile(course_id="c_03", title="Design and Analysis of Algorithms", imparted_skill_vector={"Algorithms": SkillNode(name="Algorithms", intensity=0.8, provenance="Stanford CS161")}),
                CourseProfile(course_id="c_04", title="Computer Systems", imparted_skill_vector={"System Design": SkillNode(name="System Design", intensity=0.7, provenance="Stanford CS110")})
            ]
        ),
        CollegeProfile(
            institution_id="col_03", name="UC Berkeley", national_rank=4, student_count=45307, acceptance_rate=0.11,
            curriculum=[
                CourseProfile(course_id="c_05", title="Structure and Interpretation of Computer Programs", imparted_skill_vector={"Python": SkillNode(name="Python", intensity=0.6, provenance="UCB CS61A")}),
                CourseProfile(course_id="c_06", title="Data Structures", imparted_skill_vector={"Data Structures": SkillNode(name="Data Structures", intensity=0.7, provenance="UCB CS61B")})
            ]
        ),
        CollegeProfile(
            institution_id="col_04", name="Carnegie Mellon University", national_rank=3, student_count=14586, acceptance_rate=0.11,
            curriculum=[
                CourseProfile(course_id="c_07", title="Parallel Computer Architecture and Programming", imparted_skill_vector={"C++": SkillNode(name="C++", intensity=0.8, provenance="CMU 15-418")}),
                CourseProfile(course_id="c_08", title="Distributed Systems", imparted_skill_vector={"Distributed Systems": SkillNode(name="Distributed Systems", intensity=0.8, provenance="CMU 15-440")})
            ]
        ),
        CollegeProfile(
            institution_id="col_05", name="University of Washington", national_rank=10, student_count=49165, acceptance_rate=0.53,
            curriculum=[
                CourseProfile(course_id="c_09", title="Software Engineering", imparted_skill_vector={"Agile": SkillNode(name="Agile", intensity=0.6, provenance="UW CSE403")}),
                CourseProfile(course_id="c_10", title="Database Systems", imparted_skill_vector={"SQL": SkillNode(name="SQL", intensity=0.7, provenance="UW CSE414")})
            ]
        )
    ]
    _save_json("colleges.json", [c.model_dump() for c in colleges])

    # ---------------------------------------------------------
    # 2. Generate 5 Companies (Each with 5 Jobs)
    # ---------------------------------------------------------
    def _create_jobs(company_code: str) -> list[JobProfile]:
        roles = ["Backend Engineer", "Frontend Developer", "Data Scientist", "Product Manager", "DevOps Engineer"]
        deps = ["Engineering", "Product", "Data", "Product", "Infrastructure"]
        skills = [
            {"Python": 0.8, "System Design": 0.7, "API Design": 0.6},
            {"React": 0.9, "TypeScript": 0.8, "CSS": 0.7},
            {"Machine Learning": 0.8, "Python": 0.9, "SQL": 0.7},
            {"Agile": 0.8, "Communication": 0.9, "Data Analysis": 0.6},
            {"AWS": 0.8, "Docker": 0.8, "CI/CD": 0.7}
        ]
        jobs = []
        for i in range(5):
            req_skills = {
                name: SkillNode(name=name, intensity=val, provenance="Target JD Vector")
                for name, val in skills[i].items()
            }
            jobs.append(JobProfile(
                job_id=f"job_{company_code}_{i}", 
                title=roles[i], 
                department=deps[i], 
                required_skill_vector=req_skills
            ))
        return jobs

    companies = [
        CompanyProfile(company_id="comp_01", name="Stripe", industry="FinTech", open_roles=_create_jobs("stripe")),
        CompanyProfile(company_id="comp_02", name="OpenAI", industry="Artificial Intelligence", open_roles=_create_jobs("openai")),
        CompanyProfile(company_id="comp_03", name="SpaceX", industry="Aerospace", open_roles=_create_jobs("spacex")),
        CompanyProfile(company_id="comp_04", name="Vercel", industry="Developer Tools", open_roles=_create_jobs("vercel")),
        CompanyProfile(company_id="comp_05", name="Anthropic", industry="Artificial Intelligence", open_roles=_create_jobs("anthropic"))
    ]
    _save_json("companies.json", [c.model_dump() for c in companies])

    # ---------------------------------------------------------
    # 3. Generate 5 Candidates
    # ---------------------------------------------------------
    candidates = [
        CandidateProfile(
            user_id="alex", name="Alex Chen", headline="8th Grade Prodigy",
            verified_skill_vector={
                "Python": SkillNode(name="Python", intensity=0.9, provenance="GitHub Oracle"),
                "C++": SkillNode(name="C++", intensity=0.85, provenance="HackerRank Oracle"),
                "Data Structures": SkillNode(name="Data Structures", intensity=0.8, provenance="HackerRank Oracle"),
                "Distributed Systems": SkillNode(name="Distributed Systems", intensity=0.7, provenance="GitHub Oracle"),
                "Non-Deterministic Logic": SkillNode(name="Non-Deterministic Logic", intensity=0.85, provenance="COSMOS Cluster"),
            }
        ),
        CandidateProfile(
            user_id="sophia", name="Sophia Martinez", headline="2nd-Year Biotech, UC Davis",
            verified_skill_vector={
                "Molecular Biology": SkillNode(name="Molecular Biology", intensity=0.8, provenance="UC Davis Transcript"),
                "Data Reporting": SkillNode(name="Data Reporting", intensity=0.75, provenance="UC Davis Transcript"),
                "Regulatory Compliance": SkillNode(name="Regulatory Compliance", intensity=0.6, provenance="UC Davis Transcript"),
                "Lab Protocols": SkillNode(name="Lab Protocols", intensity=0.85, provenance="UC Davis Transcript")
            }
        ),
        CandidateProfile(
            user_id="maya", name="Maya Patel", headline="11th Grader",
            verified_skill_vector={
                "Python": SkillNode(name="Python", intensity=0.8, provenance="GitHub Oracle"),
                "Agent Stewardship": SkillNode(name="Agent Stewardship", intensity=0.7, provenance="Dual Enrollment CC")
            }
        )
    ]
    _save_json("candidates.json", [c.model_dump() for c in candidates])

    print(f"✅ Generated 5 Colleges, 5 Companies (25 Jobs), and 5 Candidates inside {MOCK_DIR}")

if __name__ == "__main__":
    generate_mock_data()
