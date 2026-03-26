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
