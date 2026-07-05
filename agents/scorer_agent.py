"""Scorer Agent — reads a job posting, scores it against the profile."""
import os

from anthropic import Anthropic
from dotenv import load_dotenv

from schemas import ScoreResult

from pathlib import Path

import yaml

import argparse
import json
import sys

MODEL = os.environ.get("ANTHROPIC_MODEL", "claude-haiku-4-5")

PROFILE_PATH = Path(__file__).parent / "config" / "profile.yaml"

def score_job(job_description: str, profile: dict | None = None) -> ScoreResult:
    """Score a single job posting against the candidate profile."""
    profile = profile or load_profile()
    client = Anthropic()  # reads ANTHROPIC_API_KEY from the environment

    response = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        system=[
            {
                "type": "text",
                "text": build_system_prompt(profile),
                "cache_control": {"type": "ephemeral"},
            }
        ],
        tools=[SCORE_TOOL],
        tool_choice={"type": "tool", "name": "submit_score"},
        messages=[
            {"role": "user", "content": f"Score this job posting:\n\n{job_description}"}
        ],
    )

    tool_use = next((b for b in response.content if b.type == "tool_use"), None)
    if tool_use is None:
        raise RuntimeError("Model did not return a tool_use block.")

    return ScoreResult(**tool_use.input)

def load_profile() -> dict:
    with open(PROFILE_PATH, "r") as f:
        return yaml.safe_load(f)
    
def build_system_prompt(profile: dict) -> str:
    tracks = "\n".join(
        f"- {name}: {', '.join(skills)}" for name, skills in profile["tracks"].items()
    )
    resumes = "\n".join(f"- {r['id']}: {r['emphasis']}" for r in profile["resumes"])
    hard = "\n".join(f"- {f}" for f in profile["hard_filters"])
    checklist = "\n".join(f"- {c}" for c in profile["review_checklist"])
    preferred = "\n".join(f"- {p}" for p in profile["preferred"])

    return f"""You are the Scorer Agent in a co-op application pipeline for {profile['name']}, a {profile['year']} studying {profile['major']} at {profile['university']}.

Candidate skill tracks:
{tracks}

Available resume files (choose one via resume_id):
{resumes}

HARD FILTERS — you can judge these from the listing. If a posting clearly VIOLATES any, set meets_hard_filters to false and fit_score to 1-2:
{hard}

REVIEW CHECKLIST — these usually CANNOT be determined from a short listing (pay, visa, hours). Do NOT lower the score or fail the posting because these are unstated. Instead, list each one you cannot confirm in the `to_verify` field, so the human checks it during review:
{checklist}

Preferred (nice-to-have, not dealbreakers):
{preferred}

Scoring guidance: score fit_score 1-10 on genuine SKILL and ROLE fit only — how well the role matches the candidate's tracks and level. Do NOT penalize fit_score for missing pay/visa/hours info; that is what to_verify is for. A strong skills match with unstated pay should still score high (7-9) with pay noted in to_verify. Be honest: a genuinely weak skills match is a 4-5, an unrelated role is 1-3. Call submit_score."""

def score_job(job_description: str, profile: dict | None = None) -> ScoreResult:
    """Score a single job posting against the candidate profile."""
    profile = profile or load_profile()
    client = Anthropic()

    response = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        system=[
            {
                "type": "text",
                "text": build_system_prompt(profile),
                "cache_control": {"type": "ephemeral"},
            }
        ],
        tools=[SCORE_TOOL],
        tool_choice={"type": "tool", "name": "submit_score"},
        messages=[
            {"role": "user", "content": f"Score this job posting:\n\n{job_description}"}
        ],
    )

    tool_use = next((b for b in response.content if b.type == "tool_use"), None)
    if tool_use is None:
        raise RuntimeError("Model did not return a tool_use block.")

    return ScoreResult(**tool_use.input)

SCORE_TOOL = {
    "name": "submit_score",
    "description": "Submit the fit score and reasoning for a co-op job posting.",
    "input_schema": {
        "type": "object",
        "properties": {
            "to_verify": {
                "type": "array",
                "items": {"type": "string"},
                "description": (
                    "Items from the review checklist that CANNOT be confirmed from the listing "
                    "and that the human should verify on the actual job posting (e.g. pay rate, "
                    "F-1/CPT sponsorship, weekly hours). These do NOT affect the score."
                ),
            },
            "fit_score": {
                "type": "integer",
                "minimum": 1,
                "maximum": 10,
                "description": "How well this role fits the candidate's skills and constraints, 1 (bad fit) to 10 (excellent fit).",
            },
            "reasoning": {
                "type": "string",
                "description": "2-4 sentences: what matches, what doesn't, and why the score landed where it did.",
            },
            "red_flags": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Dealbreakers found in the posting. Empty list if none.",
            },
            "meets_hard_filters": {
                "type": "boolean",
                "description": "False if ANY hard filter is violated, regardless of fit_score.",
            },
            "resume_id": {
                "type": "string",
                "enum": ["mobile", "general"],
                "description": "Which resume file best fits this posting.",
            },
        },
        "required": ["to_verify", "fit_score", "reasoning", "red_flags", "meets_hard_filters", "resume_id"],
    },
}

def main() -> None:
    load_dotenv()

    parser = argparse.ArgumentParser(description="Score a co-op job posting.")
    group = parser.add_mutually_exclusive_group()
    group.add_argument("--file", type=str, help="Path to a .txt file with the job description.")
    group.add_argument("--text", type=str, help="Job description passed inline.")
    args = parser.parse_args()

    if args.file:
        job_description = Path(args.file).read_text()
    elif args.text:
        job_description = args.text
    elif not sys.stdin.isatty():
        job_description = sys.stdin.read()
    else:
        parser.error("Provide --file, --text, or pipe text via stdin.")
        return

    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("ANTHROPIC_API_KEY not set — check your .env file.", file=sys.stderr)
        sys.exit(1)

    result = score_job(job_description)
    print(json.dumps(result.model_dump(), indent=2))


if __name__ == "__main__":
    main()