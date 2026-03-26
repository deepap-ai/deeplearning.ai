# Sparc AI Backend

FastAPI servers powering the Sparc AI Career GPS.

## Setup

```bash
pip install -r requirements.txt
```

## Run

Two servers handle different concerns:

```bash
# Main server — persona routes, core API, search feeds
python main.py                           # http://localhost:8000

# Secondary server — gap analysis, verification pipeline
uvicorn api:app --reload --port 8001     # http://localhost:8001
```

## Main Server Endpoints (port 8000)

### GPS Persona Routes
- `GET /api/persona/{id}` — Full persona profile (name, school, skills, courses, sources)
- `GET /api/persona/{id}/routes` — Computed career routes, alternatives, and skill vectors
- `GET /api/persona/{id}/graph` — Force-graph nodes/links for the dual-cluster proximity map

### Core API
- `GET /` — Health check
- `GET /api/profile/{id}` — Legacy skill graph data
- `POST /api/profile` — Create a new profile from ProfileBuilder input
- `GET /api/candidates` — List all candidates
- `GET /api/companies` — List all companies
- `GET /api/colleges` — List all colleges

## Secondary Server Endpoints (port 8001)

- `GET /api/health` — Health check
- `POST /api/verify` — Verify GitHub profile → skill vector
- `POST /api/gap-analysis` — Compute skill gaps (JD vector − candidate vector)
- `POST /api/ingest-jd` — Parse job description → required skill vector

## Persona Data

Persona JSON files live in `personas/`:
- `sophia.json` — Sophia Martinez (UC Davis Biotech → CVS Pharmacist)
- `alex.json` — Alex Torres (8th grader → AI-Native Founder)

Each file contains the full persona profile, transcript/source data, current skills, target role with required skills, pre-computed career routes, and alternative destinations.

## Key Modules

| File | Purpose |
|------|---------|
| `main.py` | FastAPI app (port 8000) — persona endpoints + core API |
| `api.py` | FastAPI app (port 8001) — gap analysis + verification pipeline |
| `pathing_engine.py` | Loads persona JSON, computes route responses and graph data |
| `schemas.py` | Pydantic models (RouteStep, CareerRoute, AlternativeDestination, etc.) |
| `gap_engine.py` | Skill delta calculation engine |
| `seed_data.py` | Generates demo candidate/company/college data |
| `github_oracle.py` | Mock GitHub verification agent |
