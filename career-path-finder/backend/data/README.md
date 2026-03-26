# Career Transition Graph — Data Documentation

## Source

**JobHop Dataset** from VDAB (Vlaamse Dienst voor Arbeidsbemiddeling — Belgian public employment service).

- Paper: [JobHop: A Graph-Based Approach to Career Path Planning](https://zenodo.org/records/6590832)
- License: **CC BY 4.0** (commercial use allowed with attribution)
- Download: https://zenodo.org/records/6590832
- Original format: Parquet files (`jobhop_full.parquet`, ~12MB)

The dataset contains **361,000 anonymized resumes** with **1.68 million job transitions** observed between 2000–2020 in the Belgian labor market.

## File: `jobhop_transition_graph.csv`

This is a **pre-aggregated directed graph** derived from the raw Parquet data. Each row represents a unique edge (role A → role B) with aggregated statistics.

### Columns

| Column | Type | Description |
|--------|------|-------------|
| `from_isco_code` | string | ISCO-08 occupation code for the origin role |
| `from_label` | string | Human-readable name of the origin role (e.g. "warehouse worker") |
| `to_isco_code` | string | ISCO-08 occupation code for the destination role |
| `to_label` | string | Human-readable name of the destination role |
| `count` | int | Number of people who made this exact transition |
| `avg_time_years` | float | Average time between the two roles (in years) |
| `median_time_years` | float | Median time between the two roles |
| `transition_probability` | float | P(destination \| origin) — fraction of people leaving origin who went to destination |
| `reverse_count` | int | Number of people who made the reverse transition (B → A) |
| `mobility_direction` | string | "upward", "downward", or "lateral" based on ISCO major group comparison |
| `first_observed` | string | Earliest quarter this transition was observed (e.g. "2005Q1") |
| `last_observed` | string | Latest quarter this transition was observed |

### Scale

- **240,706 total edges** (unique from→to pairs)
- **1,404 unique roles** after aggregation
- **23,528 edges** after filtering to count ≥ 5 (what the engine loads at runtime)

## How the Engine Uses This Data

`jobhop_engine.py` loads the CSV at startup and applies these filters:

1. **Minimum count threshold** (`min_count=5`): Edges with fewer than 5 observed transitions are dropped. This removes noise from one-off career moves and keeps only statistically meaningful paths. This reduces edges from 240K to ~23K.

2. **Adjacency list construction**: Remaining edges are stored as in-memory adjacency lists (no database, no NetworkX). Each node's outgoing edges are sorted by count for fast lookup.

3. **Pathfinding**: Modified Dijkstra using `-log(probability)` as edge weights. Minimizing the sum of negative log-probabilities is equivalent to maximizing the product of transition probabilities along the path. This finds the "most likely" career trajectory based on what real people actually did.

4. **K-shortest paths**: A priority-queue BFS variant that allows nodes to be visited up to K times, returning the top K distinct paths ranked by combined probability.

5. **Branching limit**: At each node, only the top 50 outgoing edges (by count) are explored. This keeps pathfinding fast without missing meaningful routes.

## Important Caveats

- **Belgian labor market**: Role names and transition patterns reflect the Belgian/European job market. Some roles (e.g. "ICT help desk agent") use European naming conventions. US-specific roles like "product manager" or "data scientist" may have low representation.
- **ISCO-08 codes**: The occupation taxonomy is ISCO-08, not US O*NET/SOC. Mapping to O*NET is a planned enhancement.
- **Time period**: Data spans 2000–2020. Newer career paths (e.g. AI/ML roles) may be underrepresented.
- **Skills enrichment via ESCO**: The transition CSV itself does not contain skill data, but each role is mapped to ESCO skills via `role_skills_lookup.json` (see below). The engine computes `skills_gained` (set difference) per transition at query time.

## ESCO Skills Enrichment

### Source

**ESCO v1.2.1** (European Skills, Competences, Qualifications and Occupations) from the European Commission.

- Portal: https://esco.ec.europa.eu/en/use-esco/download
- License: **EU Open Data** (free to use with attribution)
- Version used: v1.2.1 (December 2025)

### Files used from ESCO bulk CSV download

| File | Records | Purpose |
|------|---------|---------|
| `occupations_en.csv` | ~3,039 | ESCO occupations with `conceptUri`, `preferredLabel`, `altLabels`, `iscoGroup` |
| `skills_en.csv` | ~13,939 | Skills/competences with `conceptUri`, `preferredLabel`, `skillType` |
| `occupationSkillRelations_en.csv` | ~126,051 | Maps occupations → skills with `relationType` (essential/optional) |

Raw ESCO CSVs are stored in `backend/data/esco_raw/` (gitignored due to size).

### Generated file: `role_skills_lookup.json`

A pre-computed JSON mapping each JobHop role label to its ESCO skills with weights:

```json
{
  "sales assistant": {
    "carry out active selling": 1.0,
    "customer service": 1.0,
    "communication": 0.5
  }
}
```

- **Weights**: 1.0 = essential skill, 0.5 = optional skill
- **Cap**: 15 skills per role (competences preferred over knowledge)
- **Size**: ~900KB, committed to the repo

### Matching strategy (three-tier)

The ETL script (`backend/scripts/build_esco_skills_lookup.py`) matches each of the 1,404 JobHop roles to ESCO occupations using:

1. **Tier 1 — Exact label match** (case-insensitive `preferredLabel`)
2. **Tier 2 — Alternative label match** (`altLabels` field, semicolon-separated)
3. **Tier 3 — ISCO-08 4-digit fallback** (truncate JobHop code e.g. `"5223.4"` → `"5223"`, aggregate skills from all ESCO occupations in that ISCO group, discount weights by 0.7)

Current match rate: **100%** (1,394 exact + 6 alt + 4 ISCO fallback).

### How skills_gained is computed

For each career transition (Role A → Role B), the engine computes:

```
skills_gained = skills(Role B) - skills(Role A)
```

This is the set of skills that are new or at higher weight in the destination role. Capped at 8 per step for UI clarity. The frontend renders these as colored skill badges on the SubwayMap and RouteTimeline components.

### How to regenerate

1. Download ESCO CSVs from https://esco.ec.europa.eu/en/use-esco/download (English, CSV, Classification)
2. Place files in `backend/data/esco_raw/`
3. Run: `python3 backend/scripts/build_esco_skills_lookup.py --esco-dir backend/data/esco_raw/`
4. Check `backend/data/esco_match_report.json` for match quality

## How to Regenerate or Replace

The CSV was generated from the raw Parquet data using `jobhop_analysis.py` (in the parent `deepap-ai/` directory, not committed to this repo). The key steps:

```python
import pandas as pd

df = pd.read_parquet("jobhop_full.parquet")

# Group by (from_role, to_role), aggregate counts and timing
transitions = df.groupby(["from_isco_code", "from_label", "to_isco_code", "to_label"]).agg(
    count=("person_id", "count"),
    avg_time_years=("time_between_years", "mean"),
    median_time_years=("time_between_years", "median"),
    # ... etc
)

transitions.to_csv("jobhop_transition_graph.csv", index=False)
```

To supplement with US data, you would:

1. Obtain a US career transitions dataset (e.g. from LinkedIn Economic Graph, BLS, or O*NET)
2. Map roles to a shared taxonomy (ISCO-08 or O*NET SOC)
3. Generate a CSV with the same column schema
4. Either replace this file or concatenate and re-aggregate

The engine only cares about the column schema — swap the CSV and restart the server.
