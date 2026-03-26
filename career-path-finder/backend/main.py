
from fastapi import FastAPI, HTTPException, Request, Form, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import json
import logging
import os
import uuid
from datetime import datetime
from schemas import CandidateProfile, SkillNode
from pathing_engine import get_persona, get_persona_routes, get_persona_graph
from parsers import SkillsParserFactory
from graph_integration import build_skills_graph
from gap_engine import calculate_gap
from jobhop_engine import get_graph

MOCK_DIR = os.path.join(os.path.dirname(__file__), "mock_data")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - [Sparc AI API] - %(message)s')

app = FastAPI(title="Sparc AI Core Engine")

# Allow React frontend to access the API (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://sparc-ai.org",
        "https://www.sparc-ai.org",
        "https://career-path-finder-b4cv.vercel.app",
        "https://career-path-finder-b4cv-4mzkzgm3h-adeepa-4398s-projects.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def _load_json(filename: str):
    """Helper to safely load local JSON mocks."""
    filepath = os.path.join(os.path.dirname(__file__), filename)
    try:
        with open(filepath, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        logging.error(f"Data file not found: {filename}")
        return None

@app.get("/")
def health_check():
    return {"status": "Sparc AI Engine is online.", "version": "1.0.0"}

@app.get("/api/profile/{user_id}")
def get_arc_profile(user_id: str):
    """
    Returns the dynamic Force Graph schema (nodes and links) 
    representing a verified user's Latent SkillGraph.
    """
    logging.info(f"Fetching Sparc AI data for requested ID: {user_id}")
    
    # Check candidates.json first (reversed to get most recently built)
    candidates = _load_json("mock_data/candidates.json") or []
    candidate = next((c for c in reversed(candidates) if c["user_id"] == user_id), None)
    
    if not candidate:
        # Fallback to name match for profiles generated before the UUID fix
        candidate = next((c for c in reversed(candidates) if "".join(ch for ch in c.get("name", "") if ch.isalnum()).lower() == user_id), None)

    if not candidate:
        logging.warning(f"Candidate {user_id} not found. Returning empty graph.")
        return {"nodes": [{"id": user_id, "group": 0, "val": 50, "type": "user"}], "links": []}

    name = candidate.get("name", user_id)
    verified_data = candidate.get("verified_skill_vector", {})
    normalized_scores = candidate.get("normalized_scores", {})
    graph_intersections = candidate.get("graph_intersections", {})

    # Auto-fill legacy data for older profiles (e.g. sophia, maya)
    if not normalized_scores and verified_data:
        for skill_name, skill_node in verified_data.items():
            intensity = skill_node.get("intensity", 0.5) if isinstance(skill_node, dict) else 0.5
            normalized_scores[skill_name] = intensity
            
    if not graph_intersections and verified_data:
        for skill_name, skill_node in verified_data.items():
            provenance = skill_node.get("provenance", "Unknown") if isinstance(skill_node, dict) else "Unknown"
            # parse comma-separated string into a list of sources
            sources = [s.strip() for s in provenance.split(",") if s.strip()]
            graph_intersections[skill_name] = sources

    # Transform the flat key-value dict into the D3 Force Graph schema
    nodes = [{"id": name, "group": 0, "val": 50, "type": "user"}]
    links = []
    
    # Simple semantic grouping rule based on the known keys
    group_map = {
        "Systems Thinking": 1, 
        "Backend Architecture": 1, 
        "Python": 1,
        "C++": 1,
        "Reinforcement Learning": 2, 
        "Multi-Agent Systems": 2, 
        "Prompt Decomposition": 2
    }
    
    for skill_name, skill_node in verified_data.items():
        intensity_score = skill_node.get("intensity", 0.5) if isinstance(skill_node, dict) else 0.5
        provenance = skill_node.get("provenance", "Unknown") if isinstance(skill_node, dict) else "Unknown"
        
        # Override with our new multi-source SkillsParser data if available
        if skill_name in normalized_scores:
            intensity_score = normalized_scores[skill_name]
            # List of sources (e.g. ["GitHub", "Resume"])
            sources_list = graph_intersections.get(skill_name, [])
            provenance = ", ".join(sources_list) if sources_list else provenance
            
        # Only render nodes meeting a certain verification threshold (e.g. > 0.3)
        if intensity_score > 0.3:
            # Scale node size by their verified intensity (0.0 - 1.0)
            node_size = max(15, int(intensity_score * 40)) 
            group_id = group_map.get(skill_name, 3)
            
            # Nodes
            nodes.append({
                "id": skill_name, 
                "group": group_id, 
                "val": node_size,
                "source": provenance
            })
            
            # Links back to central user
            links.append({
                "source": name,
                "target": skill_name
            })
            
    # Add a cross-link for architectural logic demonstration just to make graph dynamic
    if "Backend Architecture" in verified_data and "Systems Thinking" in verified_data:
        links.append({"source": "Backend Architecture", "target": "Systems Thinking"})
    if "Reinforcement Learning" in verified_data and "Multi-Agent Systems" in verified_data:
        links.append({"source": "Reinforcement Learning", "target": "Multi-Agent Systems"})

    # Try to enrich with school/year from the persona JSON file
    persona_school = ""
    persona_year = ""
    personas_dir = os.path.join(os.path.dirname(__file__), "personas")
    persona_filepath = os.path.join(personas_dir, f"{user_id}.json")
    if os.path.exists(persona_filepath):
        try:
            with open(persona_filepath, "r") as pf:
                persona_data = json.load(pf)
                persona_school = persona_data.get("school", "")
                persona_year = persona_data.get("year", "")
        except Exception:
            pass

    return {
        "nodes": nodes,
        "links": links,
        "graph_intersections": graph_intersections,
        "normalized_scores": normalized_scores,
        "persona_info": {
            "name": name,
            "headline": candidate.get("headline", ""),
            "school": persona_school,
            "year": persona_year
        }
    }

# ---------------------------------------------------------
# Dynamic API Feeds (Populating the Search Overlay)
# ---------------------------------------------------------

@app.get("/api/candidates")
def get_candidates():
    """Return the list of generated candidates."""
    data = _load_json("mock_data/candidates.json")
    return data if data else []

@app.get("/api/companies")
def get_companies():
    """Return the list of generated companies."""
    data = _load_json("mock_data/companies.json")
    return data if data else []

@app.get("/api/colleges")
def get_colleges():
    """Return the list of generated colleges."""
    data = _load_json("mock_data/colleges.json")
    return data if data else []

# ---------------------------------------------------------
# Sparc AI GPS Persona Endpoints
# ---------------------------------------------------------

@app.get("/api/persona/{persona_id}")
def api_get_persona(persona_id: str, role: str = None, company: str = None):
    """Return full persona profile for the Navigate dashboard."""
    data = get_persona(persona_id, role, company)
    if not data:
        raise HTTPException(status_code=404, detail=f"Persona '{persona_id}' not found")
    return data


@app.get("/api/persona/{persona_id}/routes")
def api_get_persona_routes(persona_id: str, role: str = None, company: str = None):
    """Return computed routes, alternatives, and skill vectors for a persona."""
    data = get_persona_routes(persona_id, role, company)
    if not data:
        raise HTTPException(status_code=404, detail=f"Persona '{persona_id}' not found")
    return data


@app.get("/api/persona/{persona_id}/graph")
def api_get_persona_graph(persona_id: str, role: str = None, company: str = None):
    """Return force-graph-compatible nodes/links for the proximity map."""
    data = get_persona_graph(persona_id, role, company)
    if not data:
        raise HTTPException(status_code=404, detail=f"Persona '{persona_id}' not found")
    return data


# ---------------------------------------------------------
# JobHop Career Graph Endpoints (Real Data — 361K Resumes)
# ---------------------------------------------------------

@app.get("/api/explore/search")
def explore_search_roles(q: str = ""):
    """Autocomplete search for role names in the JobHop graph."""
    if not q or len(q) < 2:
        return {"results": []}
    graph = get_graph()
    return {"results": graph.search_roles(q, limit=15)}


@app.get("/api/explore/transitions")
def explore_transitions(role: str = ""):
    """Get the most common next career moves from a given role."""
    if not role:
        raise HTTPException(status_code=400, detail="'role' query parameter is required")
    graph = get_graph()
    data = graph.get_top_transitions(role, limit=15)
    if "error" in data:
        raise HTTPException(status_code=404, detail=data["error"])
    return data


@app.get("/api/explore/paths")
def explore_paths(
    from_role: str = "",
    to_role: str = "",
    max_hops: int = 5,
    top_k: int = 3,
):
    """
    Find career paths between two roles using real transition data.
    Returns data in the CareerRoute schema — directly consumable by
    the existing SubwayMap and RouteTimeline components.
    """
    if not from_role or not to_role:
        raise HTTPException(status_code=400, detail="Both 'from_role' and 'to_role' are required")
    graph = get_graph()
    data = graph.find_career_paths(from_role, to_role, max_hops=max_hops, top_k=top_k)
    if "error" in data:
        raise HTTPException(status_code=404, detail=data["error"])
    return data


@app.get("/api/explore/alternatives")
def explore_alternatives(role: str = "", limit: int = 5):
    """Get alternative destination roles reachable from the given role."""
    if not role:
        raise HTTPException(status_code=400, detail="'role' query parameter is required")
    graph = get_graph()
    return {"role": role, "alternatives": graph.get_alternatives(role, limit=limit)}


@app.get("/api/explore/role-stats")
def explore_role_stats(role: str = ""):
    """Get detailed statistics for a single role."""
    if not role:
        raise HTTPException(status_code=400, detail="'role' query parameter is required")
    graph = get_graph()
    data = graph.get_role_stats(role)
    if not data:
        raise HTTPException(status_code=404, detail=f"Role '{role}' not found")
    return data



# ---------------------------------------------------------
# Gap Analysis Endpoint (consolidated from api.py port 8001)
# ---------------------------------------------------------
from pydantic import BaseModel as PydanticBaseModel

class GapAnalysisRequest(PydanticBaseModel):
    candidate_vector: dict[str, float]
    jd_vector: dict[str, float]

@app.post("/api/gap-analysis")
def run_gap_analysis(req: GapAnalysisRequest):
    """Compute the delta between a candidate's verified vector and a JD vector."""
    logging.info("[Gap Engine] Received gap analysis request")
    result = calculate_gap(req.candidate_vector, req.jd_vector)
    return result


# ---------------------------------------------------------
# Recruit Search Endpoint (consolidated from api.py port 8001)
# ---------------------------------------------------------

@app.get("/api/recruit/search")
def search_talent(query: str = ""):
    """Search the candidate database."""
    import random
    logging.info(f"[Recruit] Searching talent pool for: '{query}'")
    candidates_path = os.path.join(MOCK_DIR, "candidates.json")
    try:
        with open(candidates_path, "r") as f:
            candidates = json.load(f)
    except FileNotFoundError:
        candidates = []

    # Deduplicate by canonical name
    deduped = {}
    for c in candidates:
        canonical_name = (c.get("name") or "").lower().strip()
        if canonical_name:
            deduped[canonical_name] = c

    results = list(deduped.values())

    if not query:
        return {"results": results}

    query_lower = query.lower()
    scored_results = []

    for c in results:
        score = 0
        text_parts = [
            str(c.get("name", "")).lower(),
            str(c.get("headline", "")).lower()
        ]
        skills = c.get("verified_skill_vector", {})
        for s in skills.keys():
            text_parts.append(str(s).lower())
        blob = " ".join(text_parts)

        # High-signal keyword matching
        for kw in ["agent", "cuda", "distributed systems", "biotech", "chef",
                    "culinary", "food", "kitchen", "hospitality"]:
            if kw in query_lower and kw in blob:
                score += 10
        if "react" in query_lower and "react" in blob:
            score += 5
        if "python" in query_lower and "python" in blob:
            score += 5

        # General substring matching for words > 3 chars
        words = query_lower.replace(",", "").replace(".", "").split()
        for w in words:
            if len(w) > 3 and w in blob:
                score += 1

        if score > 0:
            scored_results.append((score, c))

    scored_results.sort(key=lambda x: x[0], reverse=True)

    final_results = []
    base_match = 96

    for score, c in scored_results:
        if "match_score" not in c:
            c["match_score"] = max(70, base_match)
            base_match -= random.randint(2, 6)
        if "trust_score" not in c:
            v_skills = c.get("verified_skill_vector", {})
            v_count = sum(1 for s in v_skills.values()
                         if isinstance(s, dict) and
                         any(k in str(s.get("provenance", "")).lower()
                             for k in ["github", "transcript", "verified", "practical"]))
            ratio = v_count / max(1, len(v_skills))
            c["trust_score"] = int(50 + (ratio * 45) + random.randint(1, 4))
        if "signal_quality" not in c:
            c["signal_quality"] = min(99, c["trust_score"] + random.randint(-5, 5))
        final_results.append(c)

    return {"results": final_results}


# ---------------------------------------------------------
# Profile Builder Endpoints
# ---------------------------------------------------------

@app.post("/api/build")
async def create_profile_via_parsers(
    name: str = Form(...),
    headline: str = Form(...),
    github_url: str = Form(""),
    hackerrank_url: str = Form(""),
    linkedin_url: str = Form(""),
    education: str = Form(""),
    resume: UploadFile = None,
    transcript: UploadFile = None
):
    """
    Ingest data from the ProfileBuilder frontend, run the exact SkillsParser suite,
    and generate the consolidated SkillsGraph intersections.
    """
    if name:
        new_user_id = name.lower().replace(" ", "")
    else:
        new_user_id = f"user_{uuid.uuid4().hex[:8]}"
        
    resume_bytes = None
    if resume and resume.filename:
        resume_bytes = await resume.read()
        
    transcript_bytes = None
    if transcript and transcript.filename:
        transcript_bytes = await transcript.read()
    
    # 1. Run the Parsers
    sources = {
        "github": github_url,
        "hackerrank": hackerrank_url,
        "linkedin": linkedin_url,
        "resume": resume_bytes,
        "transcript": transcript_bytes
    }
    
    source_vectors = SkillsParserFactory.run_all(sources)
    
    # 2. Build the Intersections Graph
    normalized_scores, graph_intersections = build_skills_graph(source_vectors)
    
    # Create the verified_skill_vector to satisfy the legacy schema requirement
    # We populate it from the normalized scores.
    skills = {}
    for skill_name, intensity in normalized_scores.items():
        provenances = graph_intersections.get(skill_name, [])
        skills[skill_name] = SkillNode(
            name=skill_name, 
            intensity=intensity, 
            provenance=", ".join(provenances) if provenances else "Parsed Data"
        )
        
    # 3. Instantiate Schema
    new_candidate = CandidateProfile(
        user_id=new_user_id,
        name=name,
        headline=headline,
        verified_skill_vector=skills,
        normalized_scores=normalized_scores,
        graph_intersections=graph_intersections,
        last_synced=datetime.utcnow()
    )
    
    # 4. Save to Mock Store
    candidates_file = os.path.join(MOCK_DIR, "candidates.json")
    existing_candidates = _load_json("mock_data/candidates.json") or []
    
    existing_candidates.append(new_candidate.model_dump())
    
    with open(candidates_file, "w") as f:
        json.dump(existing_candidates, f, indent=2, default=str)
        
    return new_candidate.model_dump()


@app.post("/api/profile")
async def create_profile(request: Request):
    """
    Ingest data from the ProfileBuilder frontend, run a simulated verification agent, 
    generate a CandidateProfile, and save it to the mock JSON database.
    """
    body = await request.json()
    
    # Generate a unique ID for the new user based on their name
    raw_name = body.get("name", "Candidate")
    new_user_id = "".join(c for c in raw_name if c.isalnum()).lower()
    if not new_user_id:
        new_user_id = f"user_{uuid.uuid4().hex[:8]}"
    
    # 1. Simulate the Action of the AI Verification Agents
    # In a real app, this would pass the GitHub and HackerRank URLs to github_oracle.py
    # Here we parse the headline/education to assign a deterministic but dynamic mock vector
    
    headline = body.get("headline", "").lower()
    education = body.get("education", "").lower()
    
    skills = {}
    
    if "machine learning" in headline or "ai" in headline:
        skills["Machine Learning"] = SkillNode(name="Machine Learning", intensity=0.85, provenance="GitHub Oracle")
        skills["Python"] = SkillNode(name="Python", intensity=0.9, provenance="GitHub Oracle")
    elif "frontend" in headline or "react" in headline:
        skills["React"] = SkillNode(name="React", intensity=0.85, provenance="GitHub Oracle")
        skills["TypeScript"] = SkillNode(name="TypeScript", intensity=0.8, provenance="GitHub Oracle")
    else:
        # Default Fullstack
        skills["Python"] = SkillNode(name="Python", intensity=0.7, provenance="GitHub Oracle")
        skills["System Design"] = SkillNode(name="System Design", intensity=0.6, provenance="HackerRank Oracle")
        
    if "stanford" in education or "mit" in education or "berkeley" in education:
        skills["Algorithms"] = SkillNode(name="Algorithms", intensity=0.8, provenance="Academic Verification")
        skills["Data Structures"] = SkillNode(name="Data Structures", intensity=0.8, provenance="Academic Verification")

    # 2. Instantiate the Strict Pydantic Schema
    new_candidate = CandidateProfile(
        user_id=new_user_id,
        name=body.get("name", "Unknown User"),
        headline=body.get("headline", "New Sparc AI User"),
        verified_skill_vector=skills,
        last_synced=datetime.utcnow()
    )
    
    # 3. Save to the JSON Document Store
    candidates_file = os.path.join(MOCK_DIR, "candidates.json")
    existing_candidates = _load_json("mock_data/candidates.json") or []
    
    # Append the dict representation of the Pydantic model
    existing_candidates.append(new_candidate.model_dump())
    
    with open(candidates_file, "w") as f:
        json.dump(existing_candidates, f, indent=2, default=str)
        
    return new_candidate.model_dump()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
