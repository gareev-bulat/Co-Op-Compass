"""Writes scored job results into the Supabase ai_suggestions table."""

import os

from dotenv import load_dotenv
from supabase import create_client, Client


def get_client() -> Client:
    load_dotenv()
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    if not url or not key:
        raise RuntimeError("SUPABASE_URL / SUPABASE_KEY not set in .env")
    return create_client(url, key)


def to_row(job: dict) -> dict:
    """Map a scored pipeline job dict to an ai_suggestions table row."""
    return {
        "external_job_id": job["id"],
        "title": job.get("title"),
        "company": job.get("company"),
        "location": job.get("location"),
        "url": job.get("url"),
        "terms": job.get("terms", []),
        "fit_score": job["fit_score"],
        "reasoning": job.get("reasoning"),
        "meets_hard_filters": job["meets_hard_filters"],
        "resume_id": job.get("resume_id"),
        "red_flags": job.get("red_flags", []),
        "to_verify": job.get("to_verify", []),
        # review_status intentionally omitted — DB defaults to 'pending'
        # so we don't overwrite a human's submitted/rejected decision on re-runs.
    }


def write_suggestions(scored: list[dict]) -> int:
    """Upsert scored jobs into ai_suggestions. Returns count written."""
    client = get_client()
    rows = [to_row(j) for j in scored]
    if not rows:
        return 0
    # Upsert on the primary key (external_job_id): new jobs inserted,
    # already-seen jobs updated in place — no duplicates.
    client.table("ai_suggestions").upsert(rows).execute()
    return len(rows)