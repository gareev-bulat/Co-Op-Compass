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

MODEL = os.environ.get("ANTHROPIC_MODEL", "claude-sonnet-5")

PROFILE_PATH = Path(__file__).parent / "config" / "profile.yaml"

def score_job(job_description: str, profile: dict | None = None) -> ScoreResult:
    """Score a single job posting against the candidate profile."""
    profile = profile or load_profile()
    client = Anthropic()  # reads ANTHROPIC_API_KEY from the environment

    response = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        system=build_system_prompt(profile),
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
        f"- {name}: {', '.join(skills)}"
        for name, skills in profile["tracks"].items()
    )
    filters = "\n".join(f"- {f}" for f in profile["hard_filters"])
    preferred = "\n".join(f"- {p}" for p in profile["preferred"])
    resumes = "\n".join(
        f"- {r['id']}: {r['emphasis']}" for r in profile["resumes"]
    )

    return f"""You are the Scorer Agent in a co-op application pipeline for {profile['name']}, a {profile['year']} studying {profile['major']} at {profile['university']}.

Candidate skill tracks:
{tracks}

Available resume files (choose one via resume_id):
{resumes}

Hard filters — if a posting violates ANY of these, set meets_hard_filters to false and fit_score to 1-2, regardless of how well the skills match:
{filters}

Preferred (nice-to-have, NOT dealbreakers — their absence should not tank the score):
{preferred}

Score every posting 1-10 on genuine skill and role fit, separately from the hard filters. Be honest and specific — this feeds a human's go/no-go decision, so do not inflate scores to be encouraging. A mediocre-fit role should score 4-5, not 7. Call the submit_score tool with your assessment."""

def score_job(job_description: str, profile: dict | None = None) -> ScoreResult:
    """Score a single job posting against the candidate profile."""
    profile = profile or load_profile()
    client = Anthropic()

    response = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        system=build_system_prompt(profile),
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
        "required": ["fit_score", "reasoning", "red_flags", "meets_hard_filters", "resume_id"],
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