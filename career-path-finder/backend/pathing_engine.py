"""
Sparc AI — Career GPS Pathing Engine
========================================
Loads persona data and computes routes, alternatives, and graph data
for the Navigate dashboard.

For the demo, routes are pre-computed in persona JSON files.
The schema is general and ready for dynamic computation.
"""

import json
import os
import logging

PERSONAS_DIR = os.path.join(os.path.dirname(__file__), "personas")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - [GPS Engine] - %(message)s")


def _load_persona(persona_id: str, role: str = None, company: str = None) -> dict | None:
    import random
    filepath = os.path.join(PERSONAS_DIR, f"{persona_id}.json")
    
    if not os.path.exists(filepath):
        logging.warning(f"Persona strictly not found: {persona_id}. Falling back to base routing profile.")
        if "sophia" in persona_id.lower() or "martinez" in persona_id.lower():
            filepath = os.path.join(PERSONAS_DIR, "sophia.json")
        elif "meenal" in persona_id.lower():
            filepath = os.path.join(PERSONAS_DIR, "meenalpande.json")
        else:
            filepath = os.path.join(PERSONAS_DIR, "alex.json")

    try:
        with open(filepath, "r") as f:
            data = json.load(f)
            
            if role and role != data["target_role"]["title"]:
                old_title = data["target_role"]["title"]
                data["target_role"]["title"] = role
                
                # Mock a dynamic skill vector for the new role
                if "QA" in role or "Quality" in role:
                    data["target_role"]["required_skills"] = {
                        "Quality Assurance": 0.95,
                        "Documentation & Compliance": 0.90,
                        "Lab Techniques": 0.75,
                        "Data Reporting": 0.60,
                        "Molecular Biology": 0.50
                    }
                elif "Research" in role or "CRC" in role:
                    data["target_role"]["required_skills"] = {
                        "Regulatory Compliance": 0.90,
                        "Patient Interaction": 0.85,
                        "Documentation & Compliance": 0.80,
                        "Data Reporting": 0.70,
                        "Biostatistics": 0.50
                    }
                elif "Sales" in role:
                    data["target_role"]["required_skills"] = {
                        "Patient Interaction": 0.95,
                        "Pharmacology": 0.70,
                        "Data Reporting": 0.60,
                        "Regulatory Compliance": 0.50
                    }
                else:
                    # Generic fallback scramble
                    new_skills = {}
                    for k, v in data["target_role"]["required_skills"].items():
                        new_skills[k] = max(0.1, min(1.0, v + random.uniform(-0.3, 0.3)))
                    data["target_role"]["required_skills"] = new_skills

                # Synthetically construct entirely new pathways tailored to the new destination role
                new_routes = []
                
                # 1. Fastest Route (Direct)
                r1_steps = [
                    {"type": "course", "title": f"Intensive Certification: {role} Fundamentals", "duration": "3 months", "skills_gained": {list(data["target_role"]["required_skills"].keys())[0]: 0.3}},
                    {"type": "degree", "title": f"Advanced Degree Specialization in {role.split()[0]}", "duration": "1.5 years", "cost": "$45,000", "skills_gained": {list(data["target_role"]["required_skills"].keys())[1]: 0.4}},
                    {"type": "role", "title": f"Junior {role}", "duration": "1 year", "salary": f"${random.randint(60, 90)},000/yr", "skills_gained": {list(data["target_role"]["required_skills"].keys())[2]: 0.2}},
                    {"type": "role", "title": role, "salary": f"${random.randint(95, 140)},000/yr", "skills_gained": {}}
                ]
                new_routes.append({
                    "id": "fastest", "label": "Fastest Route", "subtitle": "Direct Focus", "icon": "clock",
                    "steps": r1_steps, "total_time": "2.8 years", "total_cost": "$46,200", "arrival_probability": 92
                })
                
                # 2. Avoid High Debt (Stepping Stone)
                r2_steps = [
                    {"type": "course", "title": "Open Source Contributions & Micro-Credentials", "duration": "6 months", "cost": "$0", "skills_gained": {list(data["target_role"]["required_skills"].keys())[0]: 0.2}},
                    {"type": "role", "title": f"Associate Analyst ({role.split()[0]} focus)", "duration": "2 years", "salary": f"${random.randint(50, 75)},000/yr", "skills_gained": {list(data["target_role"]["required_skills"].keys())[1]: 0.5}},
                    {"type": "degree", "title": "Employer-Sponsored Upskilling Program", "duration": "1 year", "skills_gained": {list(data["target_role"]["required_skills"].keys())[2]: 0.3}},
                    {"type": "role", "title": role, "salary": f"${random.randint(90, 135)},000/yr", "skills_gained": {}}
                ]
                new_routes.append({
                    "id": "low_debt", "label": "Avoid High Debt", "subtitle": "Industry Stepping Stone", "icon": "shield-dollar",
                    "steps": r2_steps, "total_time": "3.5 years", "total_cost": "$0", "arrival_probability": 88
                })

                # 3. Lateral Pivot (Maximize current skills)
                r3_steps = [
                    {"type": "experience", "title": "Internal Company Transfer Project", "duration": "8 months", "skills_gained": {list(data["target_role"]["required_skills"].keys())[0]: 0.4}},
                    {"type": "credential", "title": f"Industry Standard Verification: {role}", "duration": "2 months", "cost": "$800", "skills_gained": {list(data["target_role"]["required_skills"].keys())[1]: 0.3}},
                    {"type": "role", "title": role, "salary": f"${random.randint(95, 140)},000/yr", "skills_gained": {}}
                ]
                new_routes.append({
                    "id": "maximize_degree", "label": "Maximize Current Trajectory", "subtitle": "Lateral Pivot", "icon": "graduation-cap",
                    "steps": r3_steps, "total_time": "10 months", "total_cost": "$800", "arrival_probability": 75
                })
                
                data["routes"] = new_routes

            if company:
                data["target_role"]["company"] = company
                
            return data
    except FileNotFoundError:
        logging.error(f"Persona not found: {persona_id}")
        return None


def get_persona(persona_id: str, role: str = None, company: str = None) -> dict | None:
    """Return full persona profile."""
    return _load_persona(persona_id, role, company)


def get_persona_routes(persona_id: str, role: str = None, company: str = None) -> dict | None:
    """Return route data for a persona: routes, alternatives, and skill vectors."""
    persona = _load_persona(persona_id, role, company)
    if not persona:
        return None

    return {
        "persona_id": persona["persona_id"],
        "name": persona["name"],
        "target_role": persona["target_role"]["title"],
        "target_company": persona["target_role"]["company"],
        "current_skills": persona["current_skills"],
        "target_skills": persona["target_role"]["required_skills"],
        "routes": persona["routes"],
        "alternatives": persona["alternatives"],
    }


def get_persona_graph(persona_id: str, role: str = None, company: str = None) -> dict | None:
    """
    Generate force-graph-compatible nodes/links for the proximity map.
    Creates a dual-cluster layout: user skills (left) vs target requirements (right).
    """
    persona = _load_persona(persona_id, role, company)
    if not persona:
        return None

    current = persona["current_skills"]
    target = persona["target_role"]["required_skills"]
    name = persona["name"]
    role = persona["target_role"]["title"]

    nodes = []
    links = []

    # Root nodes (anchors)
    nodes.append({"id": name, "group": 0, "val": 50, "type": "user", "side": "left"})
    nodes.append({"id": role, "group": 5, "val": 50, "type": "target", "side": "right"})

    # Skill domain color mapping
    skill_groups = _assign_skill_groups(set(current.keys()) | set(target.keys()))

    # Current skills (left cluster)
    for skill, level in current.items():
        if level > 0:
            node_id = skill
            nodes.append({
                "id": node_id,
                "group": skill_groups.get(skill, 1),
                "val": max(12, int(level * 35)),
                "level": level,
                "side": "left",
                "source": "Verified",
            })
            links.append({"source": name, "target": node_id})

    # Target skills (right cluster) — only add if not already present
    existing_ids = {n["id"] for n in nodes}
    for skill, level in target.items():
        target_node_id = f"{skill} (Required)"
        nodes.append({
            "id": target_node_id,
            "group": skill_groups.get(skill, 1),
            "val": max(12, int(level * 35)),
            "level": level,
            "side": "right",
            "source": "Target",
        })
        links.append({"source": role, "target": target_node_id})

        # Bridge links between matching skills
        if skill in current and current[skill] > 0:
            delta = level - current[skill]
            bridge_type = "met" if delta <= 0 else ("partial" if delta <= 0.3 else "gap")
            links.append({
                "source": skill,
                "target": target_node_id,
                "bridge": True,
                "bridge_type": bridge_type,
                "delta": round(delta, 2),
            })

    return {"nodes": nodes, "links": links}


def _assign_skill_groups(skills: set) -> dict:
    """Assign color groups to skills based on domain keywords."""
    groups = {}
    for skill in skills:
        s = skill.lower()
        if any(k in s for k in ["bio", "chemistry", "lab", "molecular", "organic", "pharmac", "clinical"]):
            groups[skill] = 1  # Blue — Science/Bio
        elif any(k in s for k in ["data", "statistic", "report", "quality", "document", "compliance", "regulatory"]):
            groups[skill] = 2  # Green — Quantitative/Regulatory
        elif any(k in s for k in ["python", "ml", "ai", "agent", "system", "non-deterministic", "logic", "web"]):
            groups[skill] = 3  # Purple — Tech/AI
        elif any(k in s for k in ["leadership", "business", "fundrais", "ethics", "patient"]):
            groups[skill] = 4  # Orange — Soft/Business
        else:
            groups[skill] = 1  # Default blue
    return groups
