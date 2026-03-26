/**
 * spArc AI — Frontend API Service
 *
 * Each function calls the FastAPI backend and falls back to static JSON
 * when the backend is unreachable (demo safety net).
 */
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8001";

// --- Static fallback data (current pre-baked JSONs) ---
import fallbackCandidate from "../data/maya_verified_vector.json";
import fallbackJD from "../data/ideal_jd_vector.json";
import fallbackGap from "../data/gap_analysis.json";


/** POST /api/verify — Verify a GitHub profile and get a skill vector. */
export async function verifyProfile(githubHandle: string) {
  try {
    const res = await fetch(`${API_BASE}/api/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ github_handle: githubHandle }),
    });
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("[api] verifyProfile failed, using fallback data:", err);
    return {
      handle: githubHandle,
      skill_vector: fallbackCandidate,
      confidence: 0.87,
      sources: ["GitHub (52 repos)", "Static Analysis", "Git Log Reasoning"],
    };
  }
}


/** POST /api/gap-analysis — Compute deltas between candidate and JD vectors. */
export async function runGapAnalysis(
  candidateVector: Record<string, number>,
  jdVector: Record<string, number>
) {
  try {
    const res = await fetch(`${API_BASE}/api/gap-analysis`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidate_vector: candidateVector,
        jd_vector: jdVector,
      }),
    });
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("[api] runGapAnalysis failed, using fallback data:", err);
    return fallbackGap;
  }
}


/** POST /api/ingest-jd — Parse raw JD text into a skill vector. */
export async function ingestJD(rawText: string) {
  try {
    const res = await fetch(`${API_BASE}/api/ingest-jd`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raw_text: rawText }),
    });
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("[api] ingestJD failed, using fallback data:", err);
    return {
      jd_vector: fallbackJD,
      role_title: "Senior AI Agent Architect",
    };
  }
}


/** GET /api/health — Check if the backend is reachable. */
export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/health`, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}


// ---------------------------------------------------------
// spArc AI GPS Persona Endpoints (port 8000)
// ---------------------------------------------------------
const GPS_BASE = import.meta.env.VITE_GPS_URL || "http://localhost:8000";

import fallbackSophiaRoutes from "../data/sophia_routes.json";
import fallbackAlexRoutes from "../data/alex_routes.json";

const ROUTE_FALLBACKS: Record<string, any> = {
  sophia: fallbackSophiaRoutes,
  alex: fallbackAlexRoutes,
};

/** GET /api/persona/:id — Full persona profile. */
export async function getPersona(personaId: string, role?: string | null, company?: string | null) {
  try {
    const query = new URLSearchParams();
    if (role) query.append('role', role);
    if (company) query.append('company', company);
    const qs = query.toString() ? `?${query.toString()}` : '';

    const res = await fetch(`${GPS_BASE}/api/persona/${personaId}${qs}`);
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("[api] getPersona failed, using fallback:", err);
    return ROUTE_FALLBACKS[personaId] || ROUTE_FALLBACKS['alex'] || null;
  }
}

/** GET /api/persona/:id/routes — Routes, alternatives, and skill vectors. */
export async function getPersonaRoutes(personaId: string, role?: string | null, company?: string | null) {
  try {
    const query = new URLSearchParams();
    if (role) query.append('role', role);
    if (company) query.append('company', company);
    const qs = query.toString() ? `?${query.toString()}` : '';

    const res = await fetch(`${GPS_BASE}/api/persona/${personaId}/routes${qs}`);
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("[api] getPersonaRoutes failed, using fallback:", err);
    return ROUTE_FALLBACKS[personaId] || ROUTE_FALLBACKS['alex'] || null;
  }
}

/** GET /api/persona/:id/graph — Force-graph data for proximity map. */
export async function getPersonaGraph(personaId: string, role?: string | null, company?: string | null) {
  try {
    const query = new URLSearchParams();
    if (role) query.append('role', role);
    if (company) query.append('company', company);
    const qs = query.toString() ? `?${query.toString()}` : '';

    const res = await fetch(`${GPS_BASE}/api/persona/${personaId}/graph${qs}`);
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("[api] getPersonaGraph failed, using fallback:", err);
    return ROUTE_FALLBACKS[personaId] ? undefined : null; // Fallback graph isn't strictly typed yet, but returning null is safer or we can build a mock graph
  }
}

/** GET /api/profile/:id — Fetches the active profile data including graph_intersections. */
export async function getProfile(personaId: string) {
  try {
    const res = await fetch(`${GPS_BASE}/api/profile/${personaId}`);
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("[api] getProfile failed:", err);
    return null;
  }
}


// ---------------------------------------------------------
// JobHop + Karrierewege Career Graph Endpoints (Real Data — 800K+ Resumes)
// ---------------------------------------------------------

/** GET /api/explore/search — Autocomplete role search. */
export async function exploreSearchRoles(query: string) {
  try {
    const res = await fetch(`${GPS_BASE}/api/explore/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("[api] exploreSearchRoles failed:", err);
    return { results: [] };
  }
}

/** GET /api/explore/transitions — Top transitions from a role. */
export async function exploreTransitions(role: string) {
  try {
    const res = await fetch(`${GPS_BASE}/api/explore/transitions?role=${encodeURIComponent(role)}`);
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("[api] exploreTransitions failed:", err);
    return null;
  }
}

/** GET /api/explore/paths — Find real career paths between two roles. */
export async function exploreCareerPaths(fromRole: string, toRole: string) {
  try {
    const res = await fetch(
      `${GPS_BASE}/api/explore/paths?from_role=${encodeURIComponent(fromRole)}&to_role=${encodeURIComponent(toRole)}`
    );
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("[api] exploreCareerPaths failed:", err);
    return null;
  }
}

/** GET /api/explore/alternatives — Alternative destinations from a role. */
export async function exploreAlternatives(role: string) {
  try {
    const res = await fetch(`${GPS_BASE}/api/explore/alternatives?role=${encodeURIComponent(role)}`);
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("[api] exploreAlternatives failed:", err);
    return null;
  }
}

/** GET /api/explore/role-stats — Detailed stats for a role. */
export async function exploreRoleStats(role: string) {
  try {
    const res = await fetch(`${GPS_BASE}/api/explore/role-stats?role=${encodeURIComponent(role)}`);
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("[api] exploreRoleStats failed:", err);
    return null;
  }
}
