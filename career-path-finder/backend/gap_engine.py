import json
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - [Gap Engine] - %(message)s')

def calculate_gap(candidate_vector, jd_vector):
    logging.info("Initializing Delta Calculation...")
    
    deltas = {}
    recommendations = {}
    
    for skill, required_score in jd_vector.items():
        candidate_score = candidate_vector.get(skill, 0.0)
        gap = required_score - candidate_score
        
        # We only care about negative gaps (where candidate is deficient)
        if gap > 0:
            deltas[skill] = round(gap, 2)
            logging.info(f"Detected Gap in '{skill}': Target {required_score} vs Actual {candidate_score} (Delta: {round(gap, 2)})")
            
            # Map gap to actionable task (Pillar 5: Upskilling Engine)
            if skill == "Prompt Decomposition":
                recommendations[skill] = {
                    "action": "Resolve targeted GitHub issue in LangChain repository",
                    "repo": "langchain-ai/langchain",
                    "issue": "#1452: Enhance recursive prompt splitting"
                }
            elif skill == "C++":
                recommendations[skill] = {
                    "action": "Complete Custom Architecture Prompt",
                    "details": "Build a zero-allocation memory pool in C++ for the simulated game engine."
                }
            elif skill == "Multi-Agent Systems":
                recommendations[skill] = {
                    "action": "Micro-credential Assignment",
                    "details": "Implement a 2-agent negotiation simulation using AutoGen."
                }
            elif skill == "Systems Thinking":
                recommendations[skill] = {
                    "action": "Resolve targeted GitHub issue in Apache Kafka",
                    "repo": "apache/kafka",
                    "issue": "#14523: Redesign partition rebalancing protocol"
                }
            elif skill == "Backend Architecture":
                recommendations[skill] = {
                    "action": "Complete Custom Architecture Prompt",
                    "details": "Design and implement a rate-limiting middleware using the token bucket algorithm with Redis backing store."
                }
            elif skill == "Reinforcement Learning":
                recommendations[skill] = {
                    "action": "Micro-credential Assignment",
                    "details": "Complete DeepMind x UCL RL Course — Module 4: Policy Gradient Methods with implementation exercise."
                }
            elif skill == "Python":
                recommendations[skill] = {
                    "action": "Resolve targeted GitHub issue in CPython",
                    "repo": "python/cpython",
                    "issue": "#108345: Optimize asyncio task scheduling for high-concurrency workloads"
                }
            # --- Pharmacy / Biotech Skills ---
            elif skill == "Pharmacology":
                recommendations[skill] = {
                    "action": "Complete PharmD Prerequisite Coursework",
                    "details": "Enroll in NPB 101 (Systemic Physiology) and PHR 150 (Clinical Pharmacology) to build foundational drug mechanism knowledge."
                }
            elif skill == "Patient Interaction":
                recommendations[skill] = {
                    "action": "Clinical Volunteer Hours",
                    "details": "Complete 100+ patient contact hours at UC Davis Medical Center or local CVS pharmacy as a pharmacy technician trainee."
                }
            elif skill == "Clinical Rotation Hours":
                recommendations[skill] = {
                    "action": "PharmD Clinical Rotations (APPE)",
                    "details": "Complete 1,500+ hours of Advanced Pharmacy Practice Experiences (APPE) across community, hospital, and ambulatory care settings."
                }
            elif skill == "PharmD Credential":
                recommendations[skill] = {
                    "action": "NAPLEX Licensure Examination",
                    "details": "Pass the North American Pharmacist Licensure Examination (NAPLEX) and state-specific MPJE after completing PharmD program."
                }
            elif skill == "Regulatory Compliance":
                recommendations[skill] = {
                    "action": "Regulatory Affairs Certificate",
                    "details": "Complete RAPS Regulatory Affairs Certification (RAC) or equivalent FDA compliance training program."
                }
            elif skill == "Quality Assurance":
                recommendations[skill] = {
                    "action": "GMP/GLP Certification",
                    "details": "Complete Good Manufacturing Practice (GMP) and Good Laboratory Practice (GLP) certification — available through ASQ or ISPE."
                }
            elif skill == "Documentation & Compliance":
                recommendations[skill] = {
                    "action": "SOP Writing Workshop",
                    "details": "Complete Standard Operating Procedure documentation training through AAPS or equivalent pharmaceutical industry workshop."
                }
            elif skill == "Biostatistics":
                recommendations[skill] = {
                    "action": "Applied Biostatistics Course",
                    "details": "Complete STA 100 (Applied Statistics for Bio Sciences) or Coursera's Biostatistics in Public Health specialization."
                }
            # --- Education / College Admissions Skills ---
            elif skill == "PIQ Storytelling":
                recommendations[skill] = {
                    "action": "UC Personal Insight Questions Workshop",
                    "details": "Complete 4 PIQ essays (350 words each) with iterative feedback — focus on leadership narrative, overcoming challenges, and creative contributions."
                }
            elif skill == "Standardized Testing":
                recommendations[skill] = {
                    "action": "SAT/ACT Preparation Program",
                    "details": "Complete 8-week standardized test prep through Khan Academy SAT Practice or Princeton Review — target 1500+ SAT or 34+ ACT."
                }
            elif skill == "Community Service":
                recommendations[skill] = {
                    "action": "Sustained Community Impact Project",
                    "details": "Lead a 6-month community initiative (e.g., Palo Alto Library coding workshop series or youth mentorship program) to demonstrate sustained impact."
                }
            elif skill == "Academic Writing":
                recommendations[skill] = {
                    "action": "Advanced Composition Portfolio",
                    "details": "Complete AP English Language portfolio with 3 analytical essays demonstrating rhetorical analysis, argument construction, and synthesis."
                }
            elif skill == "Research Methods":
                recommendations[skill] = {
                    "action": "Summer STEM Research Program",
                    "details": "Apply to Stanford SIMR, UC Berkeley ATDP, or SSP (Summer Science Program) for hands-on research experience with publication potential."
                }
            elif skill == "Leadership":
                recommendations[skill] = {
                    "action": "Elected/Appointed Leadership Role",
                    "details": "Secure a captain or president role in a school club (e.g., Robotics Team Captain, Science Olympiad President) to demonstrate sustained leadership."
                }
            # --- Culinary / Hospitality Skills ---
            elif skill == "Knife Skills":
                recommendations[skill] = {
                    "action": "Advanced Butchery & Knife Skills Intensive",
                    "details": "Complete a 40-hour butchery workshop — achieve 3mm brunoise/julienne precision. Practice daily mise en place sets."
                }
            elif skill == "Culinary Techniques":
                recommendations[skill] = {
                    "action": "Stage at Fine Dining Restaurant",
                    "details": "Complete a 3-month stage at a Michelin-starred kitchen to master sous-vide, fermentation, advanced plating, and mother sauces."
                }
            elif skill == "Brigade Leadership":
                recommendations[skill] = {
                    "action": "Sous Chef Apprenticeship",
                    "details": "Lead a 4-person station team during high-volume service. Practice brigade communication, expediting, and conflict resolution under pressure."
                }
            elif skill == "Kitchen Management":
                recommendations[skill] = {
                    "action": "Hospitality Management Training Program",
                    "details": "Complete a Marriott/Hilton/Ritz-Carlton management trainee program covering P&L management, labor scheduling, and health inspection compliance."
                }
            elif skill == "Menu Engineering":
                recommendations[skill] = {
                    "action": "Menu Design & Food Cost Optimization",
                    "details": "Design a 12-item seasonal menu with full food cost analysis (target 28-32% food cost ratio). Include dietary accommodation and allergen management."
                }
            elif skill == "Wine & Beverage Pairing":
                recommendations[skill] = {
                    "action": "Court of Master Sommeliers — Introductory Course",
                    "details": "Complete the CMS Introductory Sommelier Certificate covering Old/New World wines, spirits, and food pairing principles."
                }
            elif skill == "ServSafe Certification":
                recommendations[skill] = {
                    "action": "ServSafe Food Protection Manager Exam",
                    "details": "Pass the National Restaurant Association ServSafe exam — covers foodborne illness prevention, HACCP principles, and facility sanitation."
                }
            elif skill == "Inventory Management":
                recommendations[skill] = {
                    "action": "Supply Chain & Inventory Practicum",
                    "details": "Implement a par-level inventory system for a 200-seat operation — track waste, optimize ordering cycles, and manage vendor relationships."
                }
            elif skill == "Molecular Gastronomy":
                recommendations[skill] = {
                    "action": "Food Science Lab — Experimental Techniques",
                    "details": "Complete Cal Poly Pilot Plant projects on Maillard reaction optimization, hydrocolloid applications, and protein moisture retention at molecular level."
                }
            elif skill == "Farm-to-Table Sourcing":
                recommendations[skill] = {
                    "action": "Local Agriculture Partnership Development",
                    "details": "Establish sourcing relationships with 5+ SLO County farms. Learn seasonal availability, negotiate wholesale contracts, and implement traceability systems."
                }
            else:
                recommendations[skill] = {
                    "action": "Curated Module",
                    "details": f"Advanced {skill} Workshop"
                }
    
    result = {
        "deltas": deltas,
        "upskilling_tasks": recommendations
    }
    
    logging.info(f"Final Gap Analysis & Upskilling Routing: {json.dumps(result)}")
    return result

if __name__ == "__main__":
    with open("maya_verified_vector.json", "r") as f:
        candidate = json.load(f)
    with open("ideal_jd_vector.json", "r") as f:
        jd = json.load(f)
        
    res = calculate_gap(candidate, jd)
    with open("gap_analysis.json", "w") as f:
        json.dump(res, f, indent=2)
    logging.info("Wrote gap_analysis.json")
