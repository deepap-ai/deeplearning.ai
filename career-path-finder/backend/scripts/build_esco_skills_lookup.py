#!/usr/bin/env python3
"""
Build the role → skills lookup JSON from ESCO bulk CSV data.

Reads 3 ESCO CSV files (occupations, skills, occupationSkillRelations),
matches them to JobHop role labels, and outputs a compact JSON mapping
each role to its associated skills with weights.

Output: backend/data/role_skills_lookup.json

Usage:
    python backend/scripts/build_esco_skills_lookup.py --esco-dir /path/to/esco-csvs

The --esco-dir should contain:
    - occupations_en.csv
    - skills_en.csv
    - occupationSkillRelations.csv
"""

import csv
import json
import os
import sys
import logging
import argparse
from collections import defaultdict
from datetime import datetime, timezone

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BACKEND_DIR, "data")
JOBHOP_CSV = os.path.join(DATA_DIR, "jobhop_transition_graph.csv")
OUTPUT_PATH = os.path.join(DATA_DIR, "role_skills_lookup.json")
REPORT_PATH = os.path.join(DATA_DIR, "esco_match_report.json")

MAX_SKILLS_PER_ROLE = 15
MIN_EDGE_COUNT = 5  # Match the engine's filter

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(message)s")
log = logging.getLogger(__name__)


# ------------------------------------------------------------------
# Step 1: Load ESCO CSVs
# ------------------------------------------------------------------

def _find_file(directory: str, pattern: str) -> str:
    """Find a CSV file matching a case-insensitive pattern in the directory."""
    pattern_lower = pattern.lower()
    candidates = []
    for fname in os.listdir(directory):
        fname_lower = fname.lower()
        if not fname_lower.endswith(".csv"):
            continue
        # Match: pattern is a prefix of the filename (before _en or .csv)
        base = fname_lower.replace("_en.csv", "").replace(".csv", "")
        if base == pattern_lower or fname_lower.startswith(pattern_lower):
            candidates.append(fname)
    if candidates:
        # Prefer exact base match over prefix match
        candidates.sort(key=lambda f: len(f))
        return os.path.join(directory, candidates[0])
    raise FileNotFoundError(f"Could not find '{pattern}' in {directory}. CSV files: {[f for f in os.listdir(directory) if f.endswith('.csv')]}")


def _detect_delimiter(filepath: str) -> str:
    """Detect CSV delimiter (comma or tab)."""
    with open(filepath, "r", encoding="utf-8") as f:
        first_line = f.readline()
    if "\t" in first_line and first_line.count("\t") > first_line.count(","):
        return "\t"
    return ","


def _normalize_columns(row: dict) -> dict:
    """Normalize column names: lowercase, strip whitespace and BOM."""
    return {k.strip().lower().lstrip("\ufeff"): v for k, v in row.items()}


def load_occupations(esco_dir: str) -> tuple[dict, dict, dict, dict]:
    """
    Parse occupations_en.csv.
    Returns:
        uri_to_label: {conceptUri -> preferredLabel}
        label_to_uri: {lowercase_label -> conceptUri}
        alt_label_to_uri: {lowercase_alt_label -> conceptUri}
        isco4_to_uris: {4-digit ISCO code -> [conceptUri, ...]}
    """
    filepath = _find_file(esco_dir, "occupations")
    delimiter = _detect_delimiter(filepath)
    log.info(f"Loading occupations from {filepath} (delimiter={'TAB' if delimiter == chr(9) else 'COMMA'})")

    uri_to_label = {}
    label_to_uri = {}
    alt_label_to_uri = {}
    isco4_to_uris = defaultdict(list)

    with open(filepath, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter=delimiter)
        for row in reader:
            row = _normalize_columns(row)

            uri = row.get("concepturi", "").strip()
            label = row.get("preferredlabel", "").strip()
            alt_labels_raw = row.get("altlabels", "").strip()
            isco_group = row.get("iscogroup", row.get("code", "")).strip()

            if not uri or not label:
                continue

            uri_to_label[uri] = label
            label_lower = label.lower()
            label_to_uri[label_lower] = uri

            # Parse alt labels (newline or semicolon separated)
            if alt_labels_raw:
                for sep in ["\n", ";", "|"]:
                    if sep in alt_labels_raw:
                        for alt in alt_labels_raw.split(sep):
                            alt = alt.strip().lower()
                            if alt and alt != label_lower:
                                alt_label_to_uri[alt] = uri
                        break
                else:
                    alt = alt_labels_raw.strip().lower()
                    if alt and alt != label_lower:
                        alt_label_to_uri[alt] = uri

            # Map ISCO 4-digit group
            if isco_group and len(isco_group) >= 4:
                isco4 = isco_group[:4]
                isco4_to_uris[isco4].append(uri)

    log.info(f"  Loaded {len(uri_to_label)} occupations, {len(alt_label_to_uri)} alt labels, {len(isco4_to_uris)} ISCO-4 groups")
    return uri_to_label, label_to_uri, alt_label_to_uri, dict(isco4_to_uris)


def load_skills(esco_dir: str) -> tuple[dict, dict]:
    """
    Parse skills_en.csv.
    Returns:
        uri_to_label: {conceptUri -> preferredLabel}
        uri_to_type: {conceptUri -> skillType} (e.g. "skill/competence", "knowledge")
    """
    filepath = _find_file(esco_dir, "skills")
    delimiter = _detect_delimiter(filepath)
    log.info(f"Loading skills from {filepath}")

    uri_to_label = {}
    uri_to_type = {}

    with open(filepath, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter=delimiter)
        for row in reader:
            row = _normalize_columns(row)

            uri = row.get("concepturi", "").strip()
            label = row.get("preferredlabel", "").strip()
            skill_type = row.get("skilltype", row.get("concepttype", "")).strip().lower()

            if not uri or not label:
                continue

            uri_to_label[uri] = label
            uri_to_type[uri] = skill_type

    log.info(f"  Loaded {len(uri_to_label)} skills")
    return uri_to_label, uri_to_type


def load_occupation_skill_relations(esco_dir: str) -> dict[str, list[tuple[str, str]]]:
    """
    Parse occupationSkillRelations.csv.
    Returns:
        occ_uri_to_skill_rels: {occupationUri -> [(skillUri, relationType), ...]}
    """
    filepath = _find_file(esco_dir, "occupationSkillRelation")
    delimiter = _detect_delimiter(filepath)
    log.info(f"Loading occupation-skill relations from {filepath}")

    relations = defaultdict(list)

    with open(filepath, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter=delimiter)
        for row in reader:
            row = _normalize_columns(row)

            occ_uri = row.get("occupationuri", "").strip()
            skill_uri = row.get("skilluri", "").strip()
            rel_type = row.get("relationtype", "").strip().lower()

            if not occ_uri or not skill_uri:
                continue

            relations[occ_uri].append((skill_uri, rel_type))

    total_rels = sum(len(v) for v in relations.values())
    log.info(f"  Loaded {total_rels} relations across {len(relations)} occupations")
    return dict(relations)


# ------------------------------------------------------------------
# Step 2: Build occupation → skills index
# ------------------------------------------------------------------

def build_occupation_skills_index(
    occ_skill_rels: dict[str, list[tuple[str, str]]],
    skill_uri_to_label: dict[str, str],
    skill_uri_to_type: dict[str, str],
) -> dict[str, dict[str, float]]:
    """
    Build occupation_uri -> {skill_label: weight} index.
    Weight: 1.0 for essential, 0.5 for optional.
    Prefers skill/competence type over knowledge type.
    Caps at MAX_SKILLS_PER_ROLE.
    """
    occ_skills = {}

    for occ_uri, rels in occ_skill_rels.items():
        skills_with_meta = []

        for skill_uri, rel_type in rels:
            label = skill_uri_to_label.get(skill_uri)
            if not label:
                continue

            stype = skill_uri_to_type.get(skill_uri, "")
            is_essential = "essential" in rel_type
            weight = 1.0 if is_essential else 0.5

            # Classify: skills/competences get priority over knowledge
            is_knowledge = "knowledge" in stype
            skills_with_meta.append((label, weight, is_knowledge))

        if not skills_with_meta:
            continue

        # Sort: essential first, then skills/competences before knowledge, then alphabetical
        skills_with_meta.sort(key=lambda x: (-x[1], x[2], x[0]))

        # Cap at MAX_SKILLS_PER_ROLE
        capped = skills_with_meta[:MAX_SKILLS_PER_ROLE]

        # If we had to cap and there are knowledge items, try to keep more competences
        if len(skills_with_meta) > MAX_SKILLS_PER_ROLE:
            competences = [s for s in skills_with_meta if not s[2]]
            knowledge = [s for s in skills_with_meta if s[2]]
            if len(competences) >= MAX_SKILLS_PER_ROLE:
                capped = competences[:MAX_SKILLS_PER_ROLE]
            else:
                capped = competences + knowledge[:MAX_SKILLS_PER_ROLE - len(competences)]

        occ_skills[occ_uri] = {label: weight for label, weight, _ in capped}

    log.info(f"  Built skills index for {len(occ_skills)} occupations")
    return occ_skills


# ------------------------------------------------------------------
# Step 3: Load JobHop roles
# ------------------------------------------------------------------

def load_jobhop_roles() -> dict[str, str]:
    """
    Load unique (label -> code) pairs from jobhop_transition_graph.csv.
    Only includes roles that appear in edges with count >= MIN_EDGE_COUNT.
    """
    if not os.path.exists(JOBHOP_CSV):
        log.error(f"JobHop CSV not found at {JOBHOP_CSV}")
        sys.exit(1)

    roles = {}  # label -> code

    with open(JOBHOP_CSV, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                count = int(float(row["count"]))
            except (ValueError, TypeError):
                continue
            if count < MIN_EDGE_COUNT:
                continue

            from_label = row["from_label"].strip()
            to_label = row["to_label"].strip()
            from_code = row["from_code"].strip()
            to_code = row["to_code"].strip()

            if from_label and from_label not in roles:
                roles[from_label] = from_code
            if to_label and to_label not in roles:
                roles[to_label] = to_code

    log.info(f"Loaded {len(roles)} unique JobHop roles (from edges with count >= {MIN_EDGE_COUNT})")
    return roles


# ------------------------------------------------------------------
# Step 4: Match roles to ESCO skills (three-tier strategy)
# ------------------------------------------------------------------

def match_roles(
    jobhop_roles: dict[str, str],
    label_to_uri: dict[str, str],
    alt_label_to_uri: dict[str, str],
    isco4_to_uris: dict[str, list[str]],
    occ_skills: dict[str, dict[str, float]],
) -> tuple[dict[str, dict[str, float]], dict]:
    """
    Match each JobHop role to ESCO skills using 3-tier strategy.
    Returns:
        role_skills: {role_label_lower -> {skill: weight}}
        report: match quality statistics
    """
    role_skills = {}
    tier1_count = 0
    tier2_count = 0
    tier3_count = 0
    unmatched = []

    for label, code in jobhop_roles.items():
        label_lower = label.lower().strip()

        # Tier 1: Exact preferred label match
        uri = label_to_uri.get(label_lower)
        if uri and uri in occ_skills:
            role_skills[label_lower] = occ_skills[uri]
            tier1_count += 1
            continue

        # Tier 2: Alternative label match
        uri = alt_label_to_uri.get(label_lower)
        if uri and uri in occ_skills:
            role_skills[label_lower] = occ_skills[uri]
            tier2_count += 1
            continue

        # Tier 3: ISCO-08 4-digit fallback
        # Truncate code like "5223.4" to "5223"
        isco4 = code.split(".")[0] if "." in code else code
        if len(isco4) > 4:
            isco4 = isco4[:4]

        if isco4 in isco4_to_uris:
            # Aggregate skills from all occupations in this ISCO group
            aggregated = {}
            for occ_uri in isco4_to_uris[isco4]:
                skills = occ_skills.get(occ_uri, {})
                for skill, weight in skills.items():
                    # Keep max weight across occupations, then discount by 0.7
                    current = aggregated.get(skill, 0.0)
                    aggregated[skill] = max(current, weight)

            if aggregated:
                # Discount weights and cap
                discounted = {s: round(w * 0.7, 2) for s, w in aggregated.items()}
                # Sort by weight desc, cap
                top = dict(sorted(discounted.items(), key=lambda x: -x[1])[:MAX_SKILLS_PER_ROLE])
                role_skills[label_lower] = top
                tier3_count += 1
                continue

        unmatched.append({"label": label, "code": code})

    total = len(jobhop_roles)
    matched = tier1_count + tier2_count + tier3_count
    report = {
        "total_roles": total,
        "matched": matched,
        "match_rate": round(matched / total * 100, 1) if total > 0 else 0,
        "tier1_exact_label": tier1_count,
        "tier2_alt_label": tier2_count,
        "tier3_isco_fallback": tier3_count,
        "unmatched_count": len(unmatched),
        "unmatched_roles": unmatched[:50],  # Cap for readability
    }

    log.info(f"Match results: {tier1_count} exact + {tier2_count} alt + {tier3_count} ISCO = {matched}/{total} ({report['match_rate']}%)")
    if unmatched:
        log.info(f"  {len(unmatched)} unmatched roles (first 5: {[u['label'] for u in unmatched[:5]]})")

    return role_skills, report


# ------------------------------------------------------------------
# Step 5: Output
# ------------------------------------------------------------------

def write_output(role_skills: dict[str, dict[str, float]], report: dict):
    """Write role_skills_lookup.json and esco_match_report.json."""

    # Compute stats
    skill_counts = [len(v) for v in role_skills.values()]
    avg_skills = round(sum(skill_counts) / len(skill_counts), 1) if skill_counts else 0

    output = {
        "_metadata": {
            "esco_version": "1.2",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "total_roles": report["total_roles"],
            "roles_with_skills": len(role_skills),
            "avg_skills_per_role": avg_skills,
        },
    }
    # Sort roles alphabetically for deterministic output
    for label in sorted(role_skills.keys()):
        output[label] = role_skills[label]

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    log.info(f"Wrote {OUTPUT_PATH} ({os.path.getsize(OUTPUT_PATH) / 1024:.0f} KB)")

    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    log.info(f"Wrote {REPORT_PATH}")


# ------------------------------------------------------------------
# Main
# ------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Build role → skills lookup JSON from ESCO bulk CSV data."
    )
    parser.add_argument(
        "--esco-dir",
        required=True,
        help="Path to directory containing ESCO CSV files (occupations_en.csv, skills_en.csv, occupationSkillRelations.csv)",
    )
    args = parser.parse_args()

    esco_dir = os.path.abspath(args.esco_dir)
    if not os.path.isdir(esco_dir):
        log.error(f"ESCO directory not found: {esco_dir}")
        sys.exit(1)

    log.info(f"ESCO directory: {esco_dir}")
    log.info(f"JobHop CSV: {JOBHOP_CSV}")
    log.info(f"Output: {OUTPUT_PATH}")

    # 1. Load ESCO data
    occ_uri_to_label, label_to_uri, alt_label_to_uri, isco4_to_uris = load_occupations(esco_dir)
    skill_uri_to_label, skill_uri_to_type = load_skills(esco_dir)
    occ_skill_rels = load_occupation_skill_relations(esco_dir)

    # 2. Build occupation -> skills index
    occ_skills = build_occupation_skills_index(occ_skill_rels, skill_uri_to_label, skill_uri_to_type)

    # 3. Load JobHop roles
    jobhop_roles = load_jobhop_roles()

    # 4. Match roles to skills
    role_skills, report = match_roles(
        jobhop_roles, label_to_uri, alt_label_to_uri, isco4_to_uris, occ_skills
    )

    # 5. Write output
    write_output(role_skills, report)

    log.info("Done!")


if __name__ == "__main__":
    main()
