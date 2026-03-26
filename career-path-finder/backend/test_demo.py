import requests
import json
import sys

# The backend servers are running on 8000 (GPS) and 8001 (Verification/Recruiting)
GPS_BASE = "http://localhost:8000"
API_BASE = "http://localhost:8001"

def print_result(name, success, details=""):
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status} | {name}")
    if details:
        print(f"       -> {details}")
    return success

all_passed = True

print("========== SPARC AI DEMO TEST SUITE ==========\n")

# ---------------------------------------------------------
# Test 1: The Candidate Journey (Profile Building & Verification)
# ---------------------------------------------------------
print("--- 1. Candidate Journey ---")
try:
    # Test JD Ingestion (Skill Extraction Engine)
    res = requests.post(f"{API_BASE}/api/ingest-jd", json={"raw_text": "Looking for a React developer with AI experience and 5 years in Node.js"})
    
    if res.status_code == 200:
        data = res.json()
        skills = data.get("jd_vector", {})
        success = len(skills) > 0
        all_passed &= print_result("JD Skill Extraction (Engine Check)", success, f"Extracted {len(skills)} atomic skills")
    else:
        all_passed &= print_result("JD Skill Extraction (Engine Check)", False, f"Status Code: {res.status_code}")

    # Test GitHub Scan Verification
    res = requests.post(f"{API_BASE}/api/verify", json={"github_handle": "meenalpande"})
    if res.status_code == 200:
        data = res.json()
        skills = data.get("skill_vector", {})
        all_passed &= print_result("Source Scan Verification (GitHub)", len(skills) > 0, f"Verified {len(skills)} skills")
    else:
        all_passed &= print_result("Source Scan Verification (GitHub)", False, f"Status Code: {res.status_code}")

except Exception as e:
    print(f"Error in Candidate Journey tests: {e}")
    all_passed = False

# ---------------------------------------------------------
# Test 2: The Career GPS (Navigation & Trajectories)
# ---------------------------------------------------------
print("\n--- 2. Career GPS Navigation ---")
try:
    # Test Proximity Force Graph
    res = requests.get(f"{GPS_BASE}/api/persona/sophia/graph")
    if res.status_code == 200:
        data = res.json()
        nodes = data.get("nodes", [])
        links = data.get("links", [])
        has_dual_clusters = any(n.get("side") == "left" for n in nodes) and any(n.get("side") == "right" for n in nodes)
        bridge_formed = any(l.get("bridge") for l in links)
        all_passed &= print_result("ProximityMap Force Graph", has_dual_clusters and bridge_formed, f"Nodes: {len(nodes)}, Links: {len(links)}")
    else:
        all_passed &= print_result("ProximityMap Force Graph", False, f"Status Code: {res.status_code}")

    # Test Career Routes
    res = requests.get(f"{GPS_BASE}/api/persona/sophia/routes")
    if res.status_code == 200:
        data = res.json()
        routes = data.get("routes", [])
        has_options = len(routes) >= 3
        all_passed &= print_result("Career GPS Routes", has_options, f"Found {len(routes)} distinct path trajectories")
    else:
        all_passed &= print_result("Career GPS Routes", False, f"Status Code: {res.status_code}")

    # Test Dynamic Role Override (Ensure target path changes)
    res_default = requests.get(f"{GPS_BASE}/api/persona/sophia/routes")
    res_override = requests.get(f"{GPS_BASE}/api/persona/sophia/routes?role=Biotech+QA+Analyst")
    if res_default.status_code == 200 and res_override.status_code == 200:
        d1 = res_default.json()
        d2 = res_override.json()
        title_changed = d1.get("target_role") != d2.get("target_role") and d2.get("target_role") == "Biotech QA Analyst"
        all_passed &= print_result("Dynamic Alternative Destinations Matrix", title_changed, "Role properly overridden via query parameter")
    else:
        all_passed &= print_result("Dynamic Alternative Destinations Matrix", False, "Failed to resolve routes")

    # Test Deep Gap Analysis
    if res_override.status_code == 200:
        d2 = res_override.json()
        gap_res = requests.post(f"{API_BASE}/api/gap-analysis", json={
            "candidate_vector": d2.get("current_skills", {}),
            "jd_vector": {"Quality Assurance": 0.9} # specific to the mock role change
        })
        if gap_res.status_code == 200:
            gaps = gap_res.json()
            deltas = gaps.get("deltas", {})
            tasks = gaps.get("upskilling_tasks", {})
            all_passed &= print_result("Deep Gap Analysis Panel", len(tasks) > 0, f"Generated {len(tasks)} actionable upskilling tasks")
        else:
            all_passed &= print_result("Deep Gap Analysis Panel", False, f"Status Code: {gap_res.status_code}")
            
except Exception as e:
    print(f"Error in Career GPS tests: {e}")
    all_passed = False

# ---------------------------------------------------------
# Test 3: Recruiter Dashboard
# ---------------------------------------------------------
print("\n--- 3. Recruiter Intelligence ---")
try:
    # Test Recruiter Search
    res = requests.get(f"{API_BASE}/api/recruit/search?query=Staff+Engineer")
    if res.status_code == 200:
        data = res.json()
        results = data.get("results", [])
        has_trust_metrics = len(results) > 0 and "trust_score" in results[0] and "signal_quality" in results[0]
        all_passed &= print_result("Natural Language Search & Metrics", has_trust_metrics, f"Found {len(results)} matches with Trust & Signal Scores")
    else:
        all_passed &= print_result("Natural Language Search & Metrics", False, f"Status Code: {res.status_code}")

    # Test Active Profile Endpoint
    res = requests.get(f"{GPS_BASE}/api/profile/sophia")
    if res.status_code == 200:
        data = res.json()
        all_passed &= print_result("Profile Verification Trace (Graph Payload)", "nodes" in data, "Successfully returned node schema for verification")
    else:
        all_passed &= print_result("Profile Verification Trace (Graph Payload)", False, f"Status Code: {res.status_code}")

except Exception as e:
    print(f"Error in Recruiter tests: {e}")
    all_passed = False

print("\n==============================================")
if all_passed:
    print("🎉 ALL TESTS PASSED! The Demo is structurally sound.")
    sys.exit(0)
else:
    print("⚠️ SOME TESTS FAILED! Code changes may be required.")
    sys.exit(1)
