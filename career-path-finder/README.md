# Sparc AI — Career GPS

> **"Your GPS for Career Trajectories."**

Sparc AI maps the optimal path from your current skills to your dream role. It decomposes academic transcripts, GitHub repos, and competition records into atomic skill nodes, then computes multi-path career routes through a Skills Space — like Waze, but for careers.

## Demo Personas

The platform ships with two golden-path personas:

- **Sophia Martinez** — 2nd-year Biotech student at UC Davis → CVS Pharmacist. Transcript-based ingestion with 12 courses, 3 career routes (Direct Clinical, Low Debt, Lateral Pivot), and 3 alternative destinations.
- **Alex Torres** — 14-year-old 8th grader → AI-Native Founder by 2034. GitHub/HackerRank-based ingestion with 2 career routes (Solo Founder, Enterprise Architect) and 2 alternatives.

## Architecture

| Layer | Description | Status |
|-------|-------------|--------|
| Data Ingestion | Transcript parser, GitHub/HackerRank scanners | Demo-ready with animated UX |
| Skill Decomposition | Courses/repos → atomic skill nodes on [0, 1] scale | Functional |
| GPS Pathing Engine | Multi-path route computation (Fastest, Low Debt, Maximize Degree) | Pre-computed routes |
| Proximity Map | Dual-cluster force graph: current skills vs target requirements | Functional (react-force-graph-2d) |
| Route Timeline | Step-by-step path visualization with costs, durations, skill gains | Functional |
| Alternative Destinations | Lateral career matches with match percentages | Functional |
| Gap Analysis Engine | Delta calculation: JD vector − Candidate vector | Functional |
| UX/UI | React/Tailwind with Framer Motion animations | Built |

## Quick Start

### Frontend
```bash
npm install
npm run dev          # http://localhost:5173
```

### Backend
```bash
cd backend/
pip install -r requirements.txt

# Main server (persona routes + core API)
python main.py       # http://localhost:8000

# Secondary server (gap analysis + verification pipeline)
uvicorn api:app --reload --port 8001
```

The frontend calls both servers. If backends are unavailable, it falls back to static JSON data — all views still render.

## Project Structure

```
src/
  pages/
    Home.tsx                 Persona-driven landing page
    NavigateDashboard.tsx    Main GPS navigation dashboard (3-column layout)
    Dashboard.tsx            Individual candidate skill graph
    OrgDashboard.tsx         Recruiter / organization view
    CollegeDashboard.tsx     Institutional / dean view
    ProfileBuilder.tsx       Manual profile creation
    Upload.tsx               Redirect to profile builder
  components/
    TranscriptExplosion.tsx  Transcript → skill node explosion animation
    SourceScanAnimation.tsx  GitHub/HackerRank scan animation
    ProximityMap.tsx         Dual-cluster force-directed skill graph
    RouteFilterPanel.tsx     Route tab selector (Fastest, Low Debt, etc.)
    RouteTimeline.tsx        Vertical step-by-step path timeline
    AlternativeDestinations.tsx  Lateral career match cards
    SkillGraphVisualizer.tsx Force graph for individual profiles
    SkillRadarChart.tsx      Radar chart overlay
    GapAnalysisPanel.tsx     Skill gap breakdown
    CandidateModal.tsx       Candidate detail modal
    MissionControlTerminal.tsx  GPS engine log terminal
    GlobalSearchModal.tsx    Cmd+K search palette
  services/
    api.ts                   Backend client with fallback to static JSON
  data/
    sophia_routes.json       Sophia fallback data
    alex_routes.json         Alex fallback data
    agentic_traces.log       Terminal log content

backend/
  main.py                    FastAPI server (port 8000) — persona + core endpoints
  api.py                     FastAPI server (port 8001) — gap analysis + verification
  pathing_engine.py          Career GPS routing engine
  schemas.py                 Pydantic models (RouteStep, CareerRoute, etc.)
  personas/
    sophia.json              Sophia Martinez full persona + route data
    alex.json                Alex Torres full persona + route data
  gap_engine.py              Delta calculation
  github_oracle.py           Mock GitHub verification
  seed_data.py               Demo seed data generator
  mock_data/                 Generated candidate/company/college JSON
```

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS 4, Vite 7, Framer Motion, react-force-graph-2d, Recharts, Lucide
- **Backend**: Python 3.10+, FastAPI, Pydantic, Uvicorn
- **Deployment**: Cloudflare Tunnel

## Key Routes

| Path | Page |
|------|------|
| `/` | Home — persona cards + demo launcher |
| `/navigate/:persona_id` | GPS Navigation Dashboard |
| `/dashboard` | Individual candidate skill graph |
| `/org` | Organization / recruiter view |
| `/college` | College / institutional view |
| `/build` | Profile builder |

## API Endpoints

### Main Server (port 8000)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Health check |
| GET | `/api/persona/{id}` | Full persona profile |
| GET | `/api/persona/{id}/routes` | Routes, alternatives, skill vectors |
| GET | `/api/persona/{id}/graph` | Force-graph nodes/links for proximity map |
| GET | `/api/profile/{id}` | Legacy skill graph data |
| POST | `/api/profile` | Create new profile |
| GET | `/api/candidates` | List all candidates |
| GET | `/api/companies` | List all companies |
| GET | `/api/colleges` | List all colleges |

### Secondary Server (port 8001)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/verify` | Verify GitHub profile → skill vector |
| POST | `/api/gap-analysis` | Compute skill gaps |
| POST | `/api/ingest-jd` | Parse job description → skill vector |
