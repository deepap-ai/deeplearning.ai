"""
SpArc AI — JobHop Career Graph Engine
==========================================
Loads the real JobHop transition graph (240K edges from 361K Belgian resumes)
and provides graph-based career path finding.

Output is shaped to match the existing CareerRoute / RouteStep schema
so the frontend SubwayMap, RouteTimeline, and SkillEvolution components
render it with zero changes.

Usage:
    from jobhop_engine import JobHopGraph
    graph = JobHopGraph()  # loads on first import
    
    # Explore from a role
    graph.get_top_transitions("administrative assistant", limit=10)
    
    # Find paths between two roles
    graph.find_career_paths("warehouse worker", "software developer")
    
    # Get alternative destinations
    graph.get_alternatives("sales assistant", limit=5)
    
    # Autocomplete / search roles
    graph.search_roles("software")
"""

import csv
import json
import os
import logging
import heapq
from collections import defaultdict
from typing import Optional

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "jobhop_transition_graph.csv")
KARRIEREWEGE_PATH = os.path.join(os.path.dirname(__file__), "data", "karrierewege_transition_graph.csv")
SKILLS_LOOKUP_PATH = os.path.join(os.path.dirname(__file__), "data", "role_skills_lookup.json")
MIN_EDGE_COUNT = 5  # Filter out edges with fewer than 5 observed transitions

logging.basicConfig(level=logging.INFO, format="%(asctime)s - [JobHop Engine] - %(message)s")


class JobHopGraph:
    """
    In-memory career transition graph built from the JobHop dataset.
    Uses adjacency lists for efficient traversal — no external graph library required
    at runtime (we implement BFS/Dijkstra directly for transparency).
    """

    def __init__(self, data_path: str = DATA_PATH, min_count: int = MIN_EDGE_COUNT):
        self.nodes: set[str] = set()  # role labels
        self.edges: dict[str, list[dict]] = defaultdict(list)  # from_label -> [edge_data]
        self.reverse_edges: dict[str, list[dict]] = defaultdict(list)  # to_label -> [edge_data]
        self.role_metadata: dict[str, dict] = {}  # role_label -> aggregated stats
        self._label_to_code: dict[str, str] = {}
        self._code_to_label: dict[str, str] = {}
        self.role_skills: dict[str, dict[str, float]] = {}  # role_label_lower -> {skill: weight}
        self._loaded = False

        self._load(data_path, min_count)

    def _load(self, data_path: str, min_count: int):
        """Load CSV and build adjacency lists."""
        if not os.path.exists(data_path):
            logging.error(f"JobHop data not found at {data_path}")
            return

        edge_count = 0

        def _safe_float(val, default=0.0):
            try:
                return float(val) if val else default
            except (ValueError, TypeError):
                return default

        def _safe_int(val, default=0):
            try:
                return int(float(val)) if val else default
            except (ValueError, TypeError):
                return default

        with open(data_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    count = int(float(row["count"]))
                except (ValueError, TypeError):
                    continue
                if count < min_count:
                    continue

                from_label = row["from_label"].strip()
                to_label = row["to_label"].strip()

                edge = {
                    "from_label": from_label,
                    "to_label": to_label,
                    "from_code": row["from_code"],
                    "to_code": row["to_code"],
                    "count": count,
                    "avg_time_years": round(_safe_float(row["avg_time_in_source_years"]), 1),
                    "median_time_years": round(_safe_float(row["median_time_in_source_years"]), 1),
                    "pct_university": round(_safe_float(row["pct_university"]) * 100, 1),
                    "transition_probability": round(_safe_float(row["transition_probability"], 0.001), 4),
                    "from_isco": _safe_int(row["from_isco"]),
                    "to_isco": _safe_int(row["to_isco"]),
                    "mobility_direction": row.get("mobility_direction", "lateral") or "lateral",
                }

                self.edges[from_label].append(edge)
                self.reverse_edges[to_label].append(edge)
                self.nodes.add(from_label)
                self.nodes.add(to_label)
                self._label_to_code[from_label] = row["from_code"]
                self._label_to_code[to_label] = row["to_code"]
                self._code_to_label[row["from_code"]] = from_label
                self._code_to_label[row["to_code"]] = to_label
                edge_count += 1

        # Build per-role metadata
        for role in self.nodes:
            outgoing = self.edges.get(role, [])
            incoming = self.reverse_edges.get(role, [])
            total_out = sum(e["count"] for e in outgoing)
            self.role_metadata[role] = {
                "outgoing_count": len(outgoing),
                "incoming_count": len(incoming),
                "total_transitions_out": total_out,
                "total_transitions_in": sum(e["count"] for e in incoming),
                "esco_code": self._label_to_code.get(role, ""),
            }

        self._loaded = True
        logging.info(f"JobHop graph loaded: {len(self.nodes):,} roles, {edge_count:,} edges (min_count={min_count})")

        self._load_skills_lookup()
        self._merge_karrierewege()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def search_roles(self, query: str, limit: int = 15) -> list[dict]:
        """Fuzzy search for role names. Returns roles sorted by transition volume."""
        if not self._loaded:
            return []
        q = query.lower().strip()
        matches = []
        for role in self.nodes:
            if q in role.lower():
                meta = self.role_metadata.get(role, {})
                matches.append({
                    "label": role,
                    "code": self._label_to_code.get(role, ""),
                    "outgoing_edges": meta.get("outgoing_count", 0),
                    "total_transitions": meta.get("total_transitions_out", 0),
                })
        matches.sort(key=lambda x: x["total_transitions"], reverse=True)
        return matches[:limit]

    def get_top_transitions(self, from_role: str, limit: int = 10) -> dict:
        """
        Get the most common next roles from a given role.
        Returns data shaped for direct frontend consumption.
        """
        from_role = self._resolve_role(from_role)
        if not from_role:
            return {"error": "Role not found", "suggestions": self.search_roles(from_role or "", 5)}

        outgoing = sorted(self.edges.get(from_role, []), key=lambda e: e["count"], reverse=True)
        meta = self.role_metadata.get(from_role, {})

        transitions = []
        for edge in outgoing[:limit]:
            transitions.append({
                "to_role": edge["to_label"],
                "to_code": edge["to_code"],
                "count": edge["count"],
                "probability": edge["transition_probability"],
                "avg_time_in_current_years": edge["avg_time_years"],
                "pct_university": edge["pct_university"],
                "mobility_direction": edge["mobility_direction"],
            })

        return {
            "from_role": from_role,
            "from_code": self._label_to_code.get(from_role, ""),
            "total_outgoing_edges": meta.get("outgoing_count", 0),
            "transitions": transitions,
        }

    def find_career_paths(
        self,
        from_role: str,
        to_role: str,
        max_hops: int = 5,
        top_k: int = 3,
    ) -> dict:
        """
        Find the top-K career paths from one role to another using
        modified Dijkstra on -log(probability) so we maximize the
        product of transition probabilities along the path.

        Returns data in the CareerRoute schema for direct rendering
        by the existing SubwayMap / RouteTimeline components.
        """
        from_role = self._resolve_role(from_role)
        to_role = self._resolve_role(to_role)

        if not from_role or not to_role:
            return {
                "error": "One or both roles not found",
                "from_suggestions": self.search_roles(from_role or "", 5),
                "to_suggestions": self.search_roles(to_role or "", 5),
            }

        if from_role == to_role:
            return {"error": "From and to roles are the same", "routes": []}

        # K-shortest paths via modified Dijkstra (Yen's algorithm simplified)
        raw_paths = self._k_shortest_paths(from_role, to_role, max_hops, top_k)

        if not raw_paths:
            return {
                "from_role": from_role,
                "to_role": to_role,
                "routes": [],
                "message": f"No path found from '{from_role}' to '{to_role}' within {max_hops} hops. Try broader roles.",
            }

        # Convert to CareerRoute schema
        routes = []
        route_labels = ["Most Likely Path", "Alternative Path", "Fastest Pivot", "Long Route", "Scenic Route"]

        for i, (path, edges, total_cost) in enumerate(raw_paths):
            steps = []
            total_time_years = 0
            combined_probability = 1.0

            for j, edge in enumerate(edges):
                step_role = edge["to_label"]
                avg_time = edge["avg_time_years"]
                total_time_years += avg_time
                combined_probability *= edge["transition_probability"]

                # Determine step type based on mobility direction
                step_type = "role"
                if edge["mobility_direction"] == "upward":
                    step_type = "role"
                elif edge["mobility_direction"] == "lateral":
                    step_type = "experience"

                duration_str = "N/A" if avg_time == 0.0 else (f"~{avg_time:.0f} yr" if avg_time >= 1 else f"~{avg_time * 12:.0f} mo")


                steps.append({
                    "type": step_type,
                    "title": step_role,
                    "duration": duration_str,
                    "cost": f"{edge['count']:,} people made this move",
                    "salary": edge["mobility_direction"],
                    "skills_gained": self._compute_skills_gained(edge["from_label"], edge["to_label"]),
                    "year": f"Step {j + 1}",
                })

            arrival_prob = min(95, max(10, int(combined_probability * 1000)))
            time_str = f"~{total_time_years:.0f} years" if total_time_years >= 1 else f"~{total_time_years * 12:.0f} months"

            routes.append({
                "id": f"jobhop_path_{i}",
                "label": route_labels[i] if i < len(route_labels) else f"Path {i + 1}",
                "subtitle": f"{len(edges)} steps, {edges[0]['count']:,} started this way",
                "icon": "rocket" if i == 0 else "building",
                "steps": steps,
                "total_time": time_str,
                "total_cost": f"Based on {sum(e['count'] for e in edges):,} observed transitions",
                "arrival_probability": arrival_prob,
            })

        return {
            "from_role": from_role,
            "to_role": to_role,
            "routes": routes,
            "alternatives": self._get_alternatives_for_path(from_role, to_role),
        }

    def get_alternatives(self, from_role: str, limit: int = 5) -> list[dict]:
        """
        Get alternative destination roles reachable within 2 hops.
        Shaped to match AlternativeDestination schema.
        """
        from_role = self._resolve_role(from_role)
        if not from_role:
            return []

        # Collect 2-hop reachable roles weighted by combined transition count
        reachable: dict[str, dict] = {}

        # 1-hop destinations
        for edge in self.edges.get(from_role, []):
            dest = edge["to_label"]
            if dest == from_role:
                continue
            if dest not in reachable or edge["count"] > reachable[dest]["score"]:
                reachable[dest] = {
                    "title": dest,
                    "company": f"via direct transition ({edge['count']:,} observed)",
                    "match": min(95, int(edge["transition_probability"] * 500)),
                    "gap_summary": f"{edge['mobility_direction'].title()} move, avg {edge['avg_time_years']:.1f}yr tenure before transition",
                    "score": edge["count"],
                    "hops": 1,
                }

        # 2-hop destinations (only if we need more)
        if len(reachable) < limit * 2:
            for edge1 in sorted(self.edges.get(from_role, []), key=lambda e: e["count"], reverse=True)[:20]:
                mid = edge1["to_label"]
                for edge2 in sorted(self.edges.get(mid, []), key=lambda e: e["count"], reverse=True)[:10]:
                    dest = edge2["to_label"]
                    if dest == from_role or dest == mid:
                        continue
                    combined = min(edge1["count"], edge2["count"])
                    if dest not in reachable or combined > reachable[dest].get("score", 0):
                        reachable[dest] = {
                            "title": dest,
                            "company": f"via {mid} (2 steps)",
                            "match": min(85, int(edge1["transition_probability"] * edge2["transition_probability"] * 2000)),
                            "gap_summary": f"Through {mid}, {edge1['mobility_direction']} then {edge2['mobility_direction']}",
                            "score": combined,
                            "hops": 2,
                        }

        # Sort by score, prefer 1-hop, return top N
        results = sorted(reachable.values(), key=lambda x: (-x.get("hops", 1) == 1, -x["score"]))
        # Clean up internal score field
        for r in results:
            r.pop("score", None)
            r.pop("hops", None)
        return results[:limit]

    def get_role_stats(self, role: str) -> Optional[dict]:
        """Get detailed statistics for a single role."""
        role = self._resolve_role(role)
        if not role:
            return None

        meta = self.role_metadata.get(role, {})
        top_out = sorted(self.edges.get(role, []), key=lambda e: e["count"], reverse=True)[:5]
        top_in = sorted(self.reverse_edges.get(role, []), key=lambda e: e["count"], reverse=True)[:5]

        return {
            "role": role,
            "code": meta.get("esco_code", ""),
            "outgoing_paths": meta.get("outgoing_count", 0),
            "incoming_paths": meta.get("incoming_count", 0),
            "top_next_roles": [{"role": e["to_label"], "count": e["count"], "probability": e["transition_probability"]} for e in top_out],
            "top_previous_roles": [{"role": e["from_label"], "count": e["count"], "probability": e["transition_probability"]} for e in top_in],
            "avg_tenure_years": round(sum(e["avg_time_years"] for e in top_out) / max(len(top_out), 1), 1),
            "pct_university": round(sum(e["pct_university"] for e in top_out) / max(len(top_out), 1), 1),
            "skills": self.role_skills.get(role.lower(), {}),
        }

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _merge_karrierewege(self, data_path: str = KARRIEREWEGE_PATH, min_count: int = 3):
        """
        Merge Karrierewege transition edges into the graph.
        Only adds edges for role pairs NOT already present in JobHop,
        so JobHop data always takes precedence where it overlaps.
        """
        if not os.path.exists(data_path):
            logging.warning(f"Karrierewege graph not found at {data_path} — skipping merge")
            return

        # Build a set of existing (from, to) pairs for fast lookup
        existing_pairs: set[tuple[str, str]] = set()
        for from_role, edges in self.edges.items():
            for edge in edges:
                existing_pairs.add((from_role, edge["to_label"]))

        def _safe_float(val, default=0.0):
            try:
                return float(val) if val and val != "" else default
            except (ValueError, TypeError):
                return default

        def _safe_int(val, default=0):
            try:
                return int(float(val)) if val and val != "" else default
            except (ValueError, TypeError):
                return default

        added = 0
        with open(data_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    count = int(float(row["count"]))
                except (ValueError, TypeError):
                    continue
                if count < min_count:
                    continue

                from_label = row["from_label"].strip()
                to_label = row["to_label"].strip()

                # Skip if JobHop already has this pair
                if (from_label, to_label) in existing_pairs:
                    continue

                edge = {
                    "from_label": from_label,
                    "to_label": to_label,
                    "from_code": row["from_code"],
                    "to_code": row["to_code"],
                    "count": count,
                    "avg_time_years": 0.0,       # not available in Karrierewege
                    "median_time_years": 0.0,
                    "pct_university": 0.0,
                    "transition_probability": round(_safe_float(row["transition_probability"], 0.001), 4),
                    "from_isco": _safe_int(row["from_isco"]),
                    "to_isco": _safe_int(row["to_isco"]),
                    "mobility_direction": row.get("mobility_direction", "lateral") or "lateral",
                    "source": "karrierewege",   # provenance tag
                }

                self.edges[from_label].append(edge)
                self.reverse_edges[to_label].append(edge)
                self.nodes.add(from_label)
                self.nodes.add(to_label)
                self._label_to_code[from_label] = row["from_code"]
                self._label_to_code[to_label] = row["to_code"]
                self._code_to_label[row["from_code"]] = from_label
                self._code_to_label[row["to_code"]] = to_label
                existing_pairs.add((from_label, to_label))
                added += 1

        # Rebuild metadata for any new nodes
        for role in self.nodes:
            if role not in self.role_metadata:
                outgoing = self.edges.get(role, [])
                incoming = self.reverse_edges.get(role, [])
                self.role_metadata[role] = {
                    "outgoing_count": len(outgoing),
                    "incoming_count": len(incoming),
                    "total_transitions_out": sum(e["count"] for e in outgoing),
                    "total_transitions_in": sum(e["count"] for e in incoming),
                    "esco_code": self._label_to_code.get(role, ""),
                }

        logging.info(f"Karrierewege merge complete: {added:,} new edges added, "
                     f"{len(self.nodes):,} total roles now in graph")

    def _load_skills_lookup(self):
        """Load pre-computed role → skills mapping from ESCO data."""
        if not os.path.exists(SKILLS_LOOKUP_PATH):
            logging.warning(f"Skills lookup not found at {SKILLS_LOOKUP_PATH} — skills_gained will be empty")
            return

        with open(SKILLS_LOOKUP_PATH, "r", encoding="utf-8") as f:
            raw = json.load(f)

        self.role_skills = {k: v for k, v in raw.items() if not k.startswith("_")}

        roles_with_skills = sum(1 for role in self.nodes if role.lower() in self.role_skills)
        logging.info(f"Skills lookup loaded: {len(self.role_skills)} role entries, "
                     f"{roles_with_skills}/{len(self.nodes)} graph roles matched")

    def _compute_skills_gained(self, from_role: str, to_role: str) -> dict[str, float]:
        """
        Compute skills gained when transitioning from one role to another.
        skills_gained = skills(to_role) - skills(from_role)
        Only includes skills that are NEW in the destination role or at higher weight.
        """
        from_skills = self.role_skills.get(from_role.lower(), {})
        to_skills = self.role_skills.get(to_role.lower(), {})

        if not to_skills:
            return {}

        gained = {}
        for skill, weight in to_skills.items():
            if skill not in from_skills:
                gained[skill] = weight
            elif weight > from_skills[skill]:
                gained[skill] = round(weight - from_skills[skill], 2)

        # Cap at top 8 skills per step to keep UI clean
        if len(gained) > 8:
            gained = dict(sorted(gained.items(), key=lambda x: -x[1])[:8])

        return gained

    def _resolve_role(self, role: str) -> Optional[str]:
        """Try to find exact match, then case-insensitive match."""
        if not role or not self._loaded:
            return None
        if role in self.nodes:
            return role
        # Case-insensitive
        role_lower = role.lower().strip()
        for node in self.nodes:
            if node.lower() == role_lower:
                return node
        # Code lookup
        if role in self._code_to_label:
            return self._code_to_label[role]
        return None

    def _k_shortest_paths(
        self, start: str, end: str, max_hops: int, k: int
    ) -> list[tuple[list[str], list[dict], float]]:
        """
        Find K shortest paths using a priority queue BFS.
        Weight = -log(transition_probability) so we maximize probability product.
        Returns list of (path_nodes, path_edges, total_weight).
        """
        import math

        # Priority queue: (cost, path_nodes, path_edges)
        heap: list[tuple[float, list[str], list[dict]]] = [(0.0, [start], [])]
        found: list[tuple[list[str], list[dict], float]] = []
        visited_counts: dict[str, int] = defaultdict(int)

        while heap and len(found) < k:
            cost, path, edges = heapq.heappop(heap)
            current = path[-1]

            visited_counts[current] += 1
            # Allow a node to be visited at most k times (for k-shortest)
            if visited_counts[current] > k:
                continue

            if current == end and len(path) > 1:
                found.append((path, edges, cost))
                continue

            if len(path) - 1 >= max_hops:
                continue

            # Expand neighbors, sorted by count descending to explore popular paths first
            neighbors = sorted(
                self.edges.get(current, []),
                key=lambda e: e["count"],
                reverse=True,
            )[:50]  # Limit branching factor for performance

            for edge in neighbors:
                next_node = edge["to_label"]
                if next_node in path:  # No cycles
                    continue

                prob = edge["transition_probability"]
                if prob <= 0:
                    continue

                edge_cost = -math.log(prob)
                new_cost = cost + edge_cost
                heapq.heappush(heap, (new_cost, path + [next_node], edges + [edge]))

        return found

    def _get_alternatives_for_path(self, from_role: str, to_role: str, limit: int = 4) -> list[dict]:
        """Get alternative destinations similar to the target role."""
        # Find roles that share incoming edges with the target
        target_feeders = {e["from_label"] for e in self.reverse_edges.get(to_role, [])}

        alternatives = []
        seen = {from_role, to_role}

        for feeder in list(target_feeders)[:20]:
            for edge in self.edges.get(feeder, []):
                dest = edge["to_label"]
                if dest in seen:
                    continue
                seen.add(dest)
                alternatives.append({
                    "title": dest,
                    "company": f"Also reachable via {feeder}",
                    "match": min(90, int(edge["transition_probability"] * 400)),
                    "gap_summary": f"{edge['mobility_direction'].title()} from {feeder}, {edge['count']:,} observed",
                })

        alternatives.sort(key=lambda x: x["match"], reverse=True)
        return alternatives[:limit]


# ------------------------------------------------------------------
# Singleton instance (loaded once when module is imported)
# ------------------------------------------------------------------
_graph: Optional[JobHopGraph] = None


def get_graph() -> JobHopGraph:
    """Get or create the singleton graph instance."""
    global _graph
    if _graph is None:
        _graph = JobHopGraph()
    return _graph
