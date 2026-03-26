from typing import Dict, List, Tuple
from schemas import SkillsVector

def build_skills_graph(source_vectors: Dict[str, SkillsVector]) -> Tuple[SkillsVector, Dict[str, List[str]]]:
    """
    Given an arbitrary number of skill vectors keyed by their source,
    this returns:
    1. A unified / normalized score for each skill.
    2. A dictionary mapping each skill to the list of sources that verified it.
    """
    normalized_scores: SkillsVector = {}
    graph_intersections: Dict[str, List[str]] = {}

    for source_name, vector in source_vectors.items():
        for skill_name, score in vector.items():
            
            # Update the provenance/intersection map
            if skill_name not in graph_intersections:
                graph_intersections[skill_name] = []
            graph_intersections[skill_name].append(source_name)
            
            # Simple heuristic for normalized score: Keep the max score across all vectors
            # (If I proved I'm 0.9 on GitHub but LinkedIn says 0.5, I get 0.9)
            if skill_name not in normalized_scores:
                normalized_scores[skill_name] = score
            else:
                normalized_scores[skill_name] = max(normalized_scores[skill_name], score)

    return normalized_scores, graph_intersections
