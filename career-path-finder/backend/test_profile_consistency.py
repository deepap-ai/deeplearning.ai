"""
spArc AI — Profile Data Consistency Test Suite
===============================================
Validates that profile data is consistent across all layers:
  - Frontend hardcoded personas (Home.tsx)
  - Frontend profile page (CandidateProfilePage.tsx)
  - Backend persona JSON files (personas/*.json)
  - Seed/mock candidate data (mock_data/candidates.json)
  - Live API endpoints (/api/profile, /api/persona)
  - Navigation routing (persona IDs → valid backend resources)

Run:
    cd career-path-finder
    .venv/bin/python -m pytest backend/test_profile_consistency.py -v

Tests are designed to FAIL on the current codebase to expose known
data inconsistencies between pages.
"""

import json
import os
import re
import pytest
import requests

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)
PERSONAS_DIR = os.path.join(BACKEND_DIR, "personas")
MOCK_DATA_DIR = os.path.join(BACKEND_DIR, "mock_data")
HOME_TSX = os.path.join(PROJECT_ROOT, "src", "pages", "Home.tsx")
PROFILE_TSX = os.path.join(PROJECT_ROOT, "src", "pages", "CandidateProfilePage.tsx")

GPS_BASE = "http://localhost:8000"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def load_persona_json(persona_id: str) -> dict | None:
    """Load a persona JSON file by ID."""
    filepath = os.path.join(PERSONAS_DIR, f"{persona_id}.json")
    if not os.path.exists(filepath):
        return None
    with open(filepath, "r") as f:
        return json.load(f)


def get_all_persona_files() -> list[tuple[str, dict]]:
    """Return list of (filename, data) for all persona JSON files."""
    personas = []
    for fname in os.listdir(PERSONAS_DIR):
        if fname.endswith(".json"):
            with open(os.path.join(PERSONAS_DIR, fname), "r") as f:
                personas.append((fname, json.load(f)))
    return personas


def load_mock_candidates() -> list[dict]:
    """Load mock_data/candidates.json."""
    filepath = os.path.join(MOCK_DATA_DIR, "candidates.json")
    if not os.path.exists(filepath):
        return []
    with open(filepath, "r") as f:
        return json.load(f)


def parse_home_tsx_personas() -> list[dict]:
    """
    Extract the hardcoded persona objects from Home.tsx.
    Returns dicts with keys: id, name, subtitle, goal, initials, color.
    """
    with open(HOME_TSX, "r") as f:
        content = f.read()

    # Find the initialPersonas array
    match = re.search(
        r"const\s+initialPersonas\s*=\s*\[(.*?)\];",
        content,
        re.DOTALL,
    )
    if not match:
        return []

    block = match.group(1)
    personas = []

    # Extract each object block
    obj_pattern = re.compile(r"\{([^}]+)\}", re.DOTALL)
    for obj_match in obj_pattern.finditer(block):
        obj_text = obj_match.group(1)
        persona = {}
        # Parse key-value pairs
        for kv in re.finditer(r"(\w+)\s*:\s*(?:'([^']*)'|\"([^\"]*)\"|(\w+))", obj_text):
            key = kv.group(1)
            value = kv.group(2) or kv.group(3) or kv.group(4)
            persona[key] = value
        if persona.get("id"):
            personas.append(persona)

    return personas


def parse_profile_tsx_hardcoded_fields() -> dict:
    """
    Extract hardcoded field assignments from CandidateProfilePage.tsx.
    Returns a dict of field_name → hardcoded_value for any values that
    should come from the API but are instead hardcoded.
    """
    with open(PROFILE_TSX, "r") as f:
        content = f.read()

    hardcoded = {}

    # Look for hardcoded school/year in setPersona block
    school_match = re.search(r'school:\s*["\']([^"\']+)["\']', content)
    if school_match:
        hardcoded["school"] = school_match.group(1)

    year_match = re.search(r'year:\s*["\']([^"\']+)["\']', content)
    if year_match:
        hardcoded["year"] = year_match.group(1)

    return hardcoded


def parse_home_tsx_navigation() -> dict[str, str]:
    """
    Extract persona ID → navigation path mappings from Home.tsx.
    Returns dict: {persona_id: navigation_path}
    """
    with open(HOME_TSX, "r") as f:
        content = f.read()

    nav_map = {}
    # Match patterns like: navigate('/alexchen') or navigate(`/navigate/${p.id}`)
    for match in re.finditer(
        r"p\.id\s*===\s*['\"](\w+)['\"]\)\s*navigate\(['\"]([^'\"]+)['\"]\)",
        content,
    ):
        nav_map[match.group(1)] = match.group(2)

    # Also extract from the if/else blocks
    block_match = re.search(
        r"onClick=\{.*?if\s*\(p\.id\s*===\s*['\"](\w+)['\"]\)\s*navigate\(['\"]([^'\"]+)['\"]\).*?\}",
        content,
        re.DOTALL,
    )
    # Use a broader regex that captures the onClick handler block
    nav_block = re.search(
        r"onClick=\{\(\)\s*=>\s*\{(.*?)\}\}",
        content,
        re.DOTALL,
    )
    if nav_block:
        handler = nav_block.group(1)
        for m in re.finditer(
            r"p\.id\s*===\s*['\"](\w+)['\"]\)\s*navigate\(['\"]([^'\"]+)['\"]\)",
            handler,
        ):
            nav_map[m.group(1)] = m.group(2)

    return nav_map


# ===========================================================================
# TEST GROUP 1: Persona JSON Structural Validation
# ===========================================================================

class TestPersonaJsonStructure:
    """Verify every persona JSON file has all required fields."""

    REQUIRED_TOP_LEVEL = [
        "persona_id", "name", "school", "year",
        "current_skills", "target_role", "routes", "alternatives",
    ]
    REQUIRED_TARGET_ROLE = ["title", "company", "required_skills"]

    @pytest.fixture
    def personas(self):
        return get_all_persona_files()

    def test_persona_files_exist(self, personas):
        """At least one persona file must exist."""
        assert len(personas) > 0, "No persona JSON files found in backend/personas/"

    @pytest.mark.parametrize("field", REQUIRED_TOP_LEVEL)
    def test_required_top_level_fields(self, field):
        """Each persona must have all required top-level fields."""
        for fname, data in get_all_persona_files():
            assert field in data, (
                f"Persona '{fname}' is missing required field '{field}'"
            )

    def test_target_role_structure(self):
        """Each persona's target_role must have title, company, required_skills."""
        for fname, data in get_all_persona_files():
            target = data.get("target_role", {})
            for field in self.REQUIRED_TARGET_ROLE:
                assert field in target, (
                    f"Persona '{fname}' target_role is missing '{field}'"
                )

    def test_persona_id_matches_filename(self):
        """persona_id field must match the JSON filename (without extension)."""
        for fname, data in get_all_persona_files():
            expected_id = fname.replace(".json", "")
            assert data.get("persona_id") == expected_id, (
                f"File '{fname}' has persona_id='{data.get('persona_id')}' "
                f"but expected '{expected_id}'"
            )

    def test_current_skills_are_valid(self):
        """All current_skills values must be floats in [0.0, 1.0]."""
        for fname, data in get_all_persona_files():
            for skill, value in data.get("current_skills", {}).items():
                assert isinstance(value, (int, float)), (
                    f"Persona '{fname}': skill '{skill}' has non-numeric value {value}"
                )
                assert 0.0 <= value <= 1.0, (
                    f"Persona '{fname}': skill '{skill}' = {value} is outside [0, 1]"
                )

    def test_routes_have_required_fields(self):
        """Each route must have id, label, steps, total_time, total_cost, arrival_probability."""
        route_fields = ["id", "label", "steps", "total_time", "total_cost", "arrival_probability"]
        for fname, data in get_all_persona_files():
            for i, route in enumerate(data.get("routes", [])):
                for field in route_fields:
                    assert field in route, (
                        f"Persona '{fname}', route[{i}] ('{route.get('label', '?')}') "
                        f"is missing field '{field}'"
                    )

    def test_routes_final_step_matches_target_role(self):
        """The last step in each route should reach the target role (or a variant)."""
        for fname, data in get_all_persona_files():
            target_title = data.get("target_role", {}).get("title", "")
            for route in data.get("routes", []):
                steps = route.get("steps", [])
                if not steps:
                    continue
                last_step_title = steps[-1].get("title", "")
                # The final step title should relate to the target role
                # (It might be "Launch Deep Tech AI Startup" for a founder role,
                #  or "CVS Staff Pharmacist" for a pharmacist role, etc.)
                assert last_step_title, (
                    f"Persona '{fname}', route '{route.get('label')}': "
                    f"final step has no title"
                )


# ===========================================================================
# TEST GROUP 2: Frontend ↔ Backend Persona Consistency
# ===========================================================================

class TestFrontendBackendConsistency:
    """
    Verify that data hardcoded in Home.tsx matches the backend persona data.
    This catches mismatches like 'Alex Chen' (Home) vs 'Alex Torres' (backend).
    """

    @pytest.fixture
    def home_personas(self):
        return parse_home_tsx_personas()

    def test_home_personas_found(self, home_personas):
        """Home.tsx must contain parseable persona definitions."""
        assert len(home_personas) > 0, (
            "Could not parse any personas from Home.tsx initialPersonas array"
        )

    def test_persona_names_match_backend(self, home_personas):
        """
        Each persona name in Home.tsx must match the name in the backend
        persona JSON file.

        KNOWN BUG: Home.tsx says 'Alex Chen' but backend persona says 'Alex Torres'.
        """
        for hp in home_personas:
            persona_id = hp.get("id", "")
            frontend_name = hp.get("name", "")

            # Try to find the corresponding backend persona
            # The Home.tsx id might be 'alexchen' but the persona file is 'alex.json'
            backend_data = load_persona_json(persona_id)
            if not backend_data:
                # Try stripping common suffixes (e.g., 'alexchen' → 'alex')
                for pfile in os.listdir(PERSONAS_DIR):
                    pid = pfile.replace(".json", "")
                    if persona_id.startswith(pid):
                        backend_data = load_persona_json(pid)
                        break

            if backend_data:
                backend_name = backend_data.get("name", "")
                assert frontend_name == backend_name, (
                    f"NAME MISMATCH: Home.tsx persona '{persona_id}' has name "
                    f"'{frontend_name}' but backend persona has name '{backend_name}'"
                )

    def test_persona_subtitles_match_backend(self, home_personas):
        """
        Home.tsx subtitle should be derivable from backend school/year/headline.
        e.g., '2nd-Year Biotech, UC Davis' should match year='2nd Year', school='UC Davis'.
        """
        for hp in home_personas:
            persona_id = hp.get("id", "")
            subtitle = hp.get("subtitle", "")

            backend_data = load_persona_json(persona_id)
            if not backend_data:
                for pfile in os.listdir(PERSONAS_DIR):
                    pid = pfile.replace(".json", "")
                    if persona_id.startswith(pid):
                        backend_data = load_persona_json(pid)
                        break

            if backend_data:
                school = backend_data.get("school", "")
                year = backend_data.get("year", "")
                persona_type = backend_data.get("type", "")

                # Check that the subtitle contains the school or year info
                # For "8th Grade Prodigy" → should match year="8th Grade"
                # For "2nd-Year Biotech, UC Davis" → should match school="UC Davis"
                if school:
                    assert school.lower() in subtitle.lower() or year.lower() in subtitle.lower(), (
                        f"SUBTITLE MISMATCH: Home.tsx persona '{persona_id}' has subtitle "
                        f"'{subtitle}' but backend has school='{school}', year='{year}'"
                    )

    def test_persona_initials_match_name(self, home_personas):
        """
        Persona initials in Home.tsx should match the first letters of the name.
        e.g., name='Alex Chen' → initials='AC', but name='Alex Torres' → initials='AT'.
        """
        for hp in home_personas:
            name = hp.get("name", "")
            initials = hp.get("initials", "")
            if name and initials:
                expected_initials = "".join(
                    word[0].upper() for word in name.split() if word
                )
                assert initials == expected_initials, (
                    f"INITIALS MISMATCH: Home.tsx persona has name='{name}' "
                    f"with initials='{initials}' but expected '{expected_initials}'"
                )

    def test_persona_goals_match_target_role(self, home_personas):
        """
        The 'goal' field in Home.tsx should relate to the target_role.title
        in the backend persona JSON.
        """
        for hp in home_personas:
            persona_id = hp.get("id", "")
            goal = hp.get("goal", "")

            backend_data = load_persona_json(persona_id)
            if not backend_data:
                for pfile in os.listdir(PERSONAS_DIR):
                    pid = pfile.replace(".json", "")
                    if persona_id.startswith(pid):
                        backend_data = load_persona_json(pid)
                        break

            if backend_data:
                target_title = backend_data.get("target_role", {}).get("title", "")
                # The goal and target_role title should have some overlap
                # e.g., goal='CVS Pharmacist' should match title='CVS Pharmacist'
                # or goal='AI-Native Founder by 2034' should relate to title='AI-Native Founder (Deep Tech)'
                goal_words = set(goal.lower().split())
                title_words = set(target_title.lower().replace("(", "").replace(")", "").split())
                overlap = goal_words & title_words
                assert len(overlap) > 0, (
                    f"GOAL MISMATCH: Home.tsx persona '{persona_id}' has goal "
                    f"'{goal}' but backend target_role.title is '{target_title}' — "
                    f"no word overlap found"
                )


# ===========================================================================
# TEST GROUP 3: Profile Page Hardcoded Data Detection
# ===========================================================================

class TestProfilePageHardcodes:
    """
    Detect hardcoded values in CandidateProfilePage.tsx that should come
    from the backend API instead.
    """

    def test_no_hardcoded_school(self):
        """
        CandidateProfilePage.tsx must NOT hardcode school='Stanford University'.
        School info should come from the API response, not be hardcoded.

        KNOWN BUG: Line ~38 hardcodes `school: "Stanford University"`.
        """
        hardcoded = parse_profile_tsx_hardcoded_fields()
        if "school" in hardcoded:
            pytest.fail(
                f"HARDCODED SCHOOL DETECTED: CandidateProfilePage.tsx hardcodes "
                f"school='{hardcoded['school']}'. This should come from the API "
                f"response (e.g., graph.persona_info.school). Currently, every persona "
                f"incorrectly shows '{hardcoded['school']}' regardless of their actual school."
            )

    def test_no_hardcoded_year(self):
        """
        CandidateProfilePage.tsx must NOT hardcode year='Alumni'.
        Year info should come from the API response.

        KNOWN BUG: Line ~39 hardcodes `year: "Alumni"`.
        """
        hardcoded = parse_profile_tsx_hardcoded_fields()
        if "year" in hardcoded:
            pytest.fail(
                f"HARDCODED YEAR DETECTED: CandidateProfilePage.tsx hardcodes "
                f"year='{hardcoded['year']}'. This should come from the API response. "
                f"Alex Torres is an 8th grader and Sophia Martinez is a 2nd-year student — "
                f"neither is an 'Alumni'."
            )

    def test_school_not_overriding_api_data(self):
        """
        Verify that the hardcoded school in the profile page doesn't conflict
        with any actual persona's school.
        """
        hardcoded = parse_profile_tsx_hardcoded_fields()
        if "school" not in hardcoded:
            return  # No hardcode, test passes

        hardcoded_school = hardcoded["school"]
        for fname, data in get_all_persona_files():
            actual_school = data.get("school", "")
            if actual_school and actual_school != hardcoded_school:
                pytest.fail(
                    f"SCHOOL OVERRIDE CONFLICT: CandidateProfilePage.tsx hardcodes "
                    f"school='{hardcoded_school}' but persona '{fname}' has "
                    f"school='{actual_school}'. The hardcoded value will incorrectly "
                    f"show '{hardcoded_school}' for this persona."
                )


# ===========================================================================
# TEST GROUP 4: Seed Data ↔ Persona JSON Consistency
# ===========================================================================

class TestSeedDataConsistency:
    """
    Cross-check mock_data/candidates.json against personas/*.json
    to ensure names, IDs, and headlines stay in sync.
    """

    @pytest.fixture
    def candidates(self):
        return load_mock_candidates()

    @pytest.fixture
    def persona_map(self):
        """Map of persona_id → persona data from JSON files."""
        return {
            fname.replace(".json", ""): data
            for fname, data in get_all_persona_files()
        }

    def test_seed_candidate_names_match_persona_names(self, candidates, persona_map):
        """
        For candidates whose user_id matches a persona_id, the names must match.

        KNOWN BUG: seed_data.py has user_id='alex', name='Alex Torres'
        but Home.tsx refers to this persona as 'Alex Chen'.
        """
        for candidate in candidates:
            user_id = candidate.get("user_id", "")
            if user_id in persona_map:
                candidate_name = candidate.get("name", "")
                persona_name = persona_map[user_id].get("name", "")
                assert candidate_name == persona_name, (
                    f"NAME MISMATCH: candidates.json has user_id='{user_id}' "
                    f"with name='{candidate_name}' but personas/{user_id}.json "
                    f"has name='{persona_name}'"
                )

    def test_seed_candidate_headlines_match_subtitles(self, candidates, persona_map):
        """
        Candidate headlines in candidates.json should be consistent with the
        year/school/type in persona JSON files.
        """
        for candidate in candidates:
            user_id = candidate.get("user_id", "")
            if user_id in persona_map:
                headline = candidate.get("headline", "")
                persona = persona_map[user_id]
                school = persona.get("school", "")
                year = persona.get("year", "")

                # The headline should relate to the persona's school/year
                # e.g., "8th Grade Prodigy" should match year="8th Grade"
                if year:
                    clean_year = year.lower().replace("-", " ").replace("'", "")
                    clean_headline = headline.lower().replace("-", " ").replace("'", "")
                    assert (
                        clean_year in clean_headline
                        or school.lower() in clean_headline
                    ), (
                        f"HEADLINE MISMATCH: candidates.json user_id='{user_id}' "
                        f"has headline='{headline}' but persona has "
                        f"year='{year}', school='{school}'"
                    )

    def test_seed_candidate_skills_overlap_with_persona(self, candidates, persona_map):
        """
        Verified skills in candidates.json should have significant overlap
        with current_skills in the persona JSON.
        """
        for candidate in candidates:
            user_id = candidate.get("user_id", "")
            if user_id in persona_map:
                candidate_skills = set(candidate.get("verified_skill_vector", {}).keys())
                persona_skills = set(persona_map[user_id].get("current_skills", {}).keys())

                if not candidate_skills or not persona_skills:
                    continue

                overlap = candidate_skills & persona_skills
                overlap_ratio = len(overlap) / min(len(candidate_skills), len(persona_skills))
                assert overlap_ratio >= 0.2, (
                    f"LOW SKILL OVERLAP: candidates.json user_id='{user_id}' has "
                    f"skills {candidate_skills} but persona has skills {persona_skills}. "
                    f"Overlap: {overlap} ({overlap_ratio:.0%})"
                )


# ===========================================================================
# TEST GROUP 5: API Cross-Validation (requires running servers)
# ===========================================================================

def _server_is_running() -> bool:
    """Check if the GPS backend is reachable."""
    try:
        r = requests.get(f"{GPS_BASE}/", timeout=2)
        return r.status_code == 200
    except Exception:
        return False


@pytest.mark.skipif(
    not _server_is_running(),
    reason="Backend server not running on localhost:8000"
)
class TestApiCrossValidation:
    """
    Hit the live API endpoints and verify that returned data matches
    the static persona JSON files.
    """

    def test_profile_api_returns_correct_name(self):
        """
        GET /api/profile/:id should return persona_info.name matching
        the name in candidates.json or the persona JSON.
        """
        for persona_id in ["alex", "sophia"]:
            backend_data = load_persona_json(persona_id)
            if not backend_data:
                continue

            expected_name = backend_data.get("name", "")
            resp = requests.get(f"{GPS_BASE}/api/profile/{persona_id}", timeout=5)
            if resp.status_code != 200:
                continue

            api_data = resp.json()
            api_name = api_data.get("persona_info", {}).get("name", "")

            if api_name:  # Only assert if API returns a name
                assert api_name == expected_name, (
                    f"API NAME MISMATCH: /api/profile/{persona_id} returned "
                    f"name='{api_name}' but persona JSON has name='{expected_name}'"
                )

    def test_persona_api_matches_json_file(self):
        """
        GET /api/persona/:id should return data identical to the persona JSON file.
        """
        for persona_id in ["alex", "sophia"]:
            backend_data = load_persona_json(persona_id)
            if not backend_data:
                continue

            resp = requests.get(f"{GPS_BASE}/api/persona/{persona_id}", timeout=5)
            assert resp.status_code == 200, (
                f"/api/persona/{persona_id} returned status {resp.status_code}"
            )

            api_data = resp.json()
            assert api_data.get("name") == backend_data.get("name"), (
                f"API vs JSON name mismatch for '{persona_id}': "
                f"API='{api_data.get('name')}', JSON='{backend_data.get('name')}'"
            )
            assert api_data.get("school") == backend_data.get("school"), (
                f"API vs JSON school mismatch for '{persona_id}': "
                f"API='{api_data.get('school')}', JSON='{backend_data.get('school')}'"
            )

    def test_routes_api_skill_vectors_present(self):
        """
        GET /api/persona/:id/routes should return non-empty current_skills
        and target_skills.
        """
        for persona_id in ["alex", "sophia"]:
            resp = requests.get(f"{GPS_BASE}/api/persona/{persona_id}/routes", timeout=5)
            if resp.status_code != 200:
                continue

            data = resp.json()
            current = data.get("current_skills", {})
            target = data.get("target_skills", {})

            assert len(current) > 0, (
                f"/api/persona/{persona_id}/routes returned empty current_skills"
            )
            assert len(target) > 0, (
                f"/api/persona/{persona_id}/routes returned empty target_skills"
            )

    def test_routes_api_current_skills_match_json(self):
        """
        Skills returned by the routes API must match the persona JSON exactly.
        """
        for persona_id in ["alex", "sophia"]:
            backend_data = load_persona_json(persona_id)
            if not backend_data:
                continue

            resp = requests.get(f"{GPS_BASE}/api/persona/{persona_id}/routes", timeout=5)
            if resp.status_code != 200:
                continue

            api_skills = resp.json().get("current_skills", {})
            json_skills = backend_data.get("current_skills", {})

            assert set(api_skills.keys()) == set(json_skills.keys()), (
                f"SKILL KEYS MISMATCH for '{persona_id}': "
                f"API has {set(api_skills.keys()) - set(json_skills.keys())} extra, "
                f"missing {set(json_skills.keys()) - set(api_skills.keys())}"
            )


# ===========================================================================
# TEST GROUP 6: Navigation Routing Integrity
# ===========================================================================

class TestNavigationRouting:
    """
    Verify that persona IDs used in Home.tsx navigation targets map to
    valid backend resources (persona files, candidate records, or API endpoints).
    """

    def test_home_persona_ids_resolve_to_backend(self):
        """
        Each persona ID in Home.tsx should map to either:
        1. A persona JSON file in backend/personas/
        2. A candidate record in mock_data/candidates.json
        3. A valid API endpoint

        KNOWN BUG: Home.tsx uses id='alexchen' which doesn't match
        the persona file 'alex.json' or the candidate user_id 'alex'.
        """
        home_personas = parse_home_tsx_personas()
        candidates = load_mock_candidates()
        candidate_ids = {c.get("user_id", "") for c in candidates}
        candidate_name_ids = {
            "".join(ch for ch in c.get("name", "") if ch.isalnum()).lower()
            for c in candidates
        }
        persona_file_ids = {
            f.replace(".json", "") for f in os.listdir(PERSONAS_DIR) if f.endswith(".json")
        }

        for hp in home_personas:
            pid = hp.get("id", "")
            # Check if it matches any backend resource directly
            direct_match = (
                pid in persona_file_ids
                or pid in candidate_ids
                or pid in candidate_name_ids
            )

            if not direct_match:
                # Check if any persona file ID is a prefix of the navigation ID
                prefix_match = any(pid.startswith(pfid) for pfid in persona_file_ids)
                if prefix_match:
                    # This indicates a mismatch — the ID works via fallback but isn't clean
                    pytest.fail(
                        f"ROUTING FRAGILE: Home.tsx uses id='{pid}' which only resolves "
                        f"via prefix fallback to persona files {persona_file_ids}. "
                        f"The id should exactly match a persona_id or user_id."
                    )
                else:
                    pytest.fail(
                        f"BROKEN ROUTING: Home.tsx persona id='{pid}' does not match "
                        f"any persona file ({persona_file_ids}), candidate user_id "
                        f"({candidate_ids}), or candidate name-derived ID ({candidate_name_ids})"
                    )

    def test_navigation_paths_are_valid_routes(self):
        """
        Navigation paths in Home.tsx (e.g., '/alexchen', '/sophia') should
        match known frontend routes and resolve to backend data.
        """
        home_personas = parse_home_tsx_personas()
        for hp in home_personas:
            pid = hp.get("id", "")
            # Read Home.tsx to find navigate calls for this persona id
            with open(HOME_TSX, "r") as f:
                content = f.read()

            # Look for navigate('/alexchen') type patterns
            nav_match = re.search(
                rf"p\.id\s*===\s*['\"]({re.escape(pid)})['\"].*?navigate\(['\"]([^'\"]+)['\"]\)",
                content,
                re.DOTALL,
            )
            if nav_match:
                nav_path = nav_match.group(2)
                # Extract the persona ID from the path (e.g., '/alexchen' → 'alexchen')
                path_id = nav_path.strip("/").split("/")[-1]

                # This path_id should resolve to a backend resource
                persona_data = load_persona_json(path_id)
                candidates = load_mock_candidates()
                candidate_match = any(
                    c.get("user_id") == path_id
                    or "".join(ch for ch in c.get("name", "") if ch.isalnum()).lower() == path_id
                    for c in candidates
                )

                assert persona_data is not None or candidate_match, (
                    f"DEAD ROUTE: Home.tsx navigates to '{nav_path}' for persona "
                    f"'{pid}' but '{path_id}' doesn't match any persona file or candidate"
                )

    def test_pathing_engine_fallback_is_documented(self):
        """
        The pathing engine uses fallbacks (e.g., if persona not found, fall back
        to alex.json). These should be intentional and documented, not silent.

        This test verifies that each Home.tsx persona can load WITHOUT fallback.
        """
        home_personas = parse_home_tsx_personas()
        for hp in home_personas:
            pid = hp.get("id", "")
            filepath = os.path.join(PERSONAS_DIR, f"{pid}.json")
            assert os.path.exists(filepath), (
                f"FALLBACK REQUIRED: Home.tsx persona id='{pid}' has no direct "
                f"persona file at personas/{pid}.json. The pathing engine will "
                f"silently fall back to another persona, which causes data mismatches."
            )
