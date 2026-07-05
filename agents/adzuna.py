"""Thin wrapper around the Adzuna job search API."""

import os

import requests

BASE_URL = "https://api.adzuna.com/v1/api/jobs/us/search"


def search_adzuna(
    what: str,
    results_per_page: int = 10,
    max_days_old: int = 30,
    salary_min: int | None = None,
    what_exclude: str | None = None,
) -> list[dict]:
    """Run one Adzuna search and return a list of simplified job dicts."""
    app_id = os.environ.get("ADZUNA_APP_ID")
    app_key = os.environ.get("ADZUNA_APP_KEY")
    if not app_id or not app_key:
        raise RuntimeError("ADZUNA_APP_ID / ADZUNA_APP_KEY not set in environment.")

    params = {
        "app_id": app_id,
        "app_key": app_key,
        "results_per_page": results_per_page,
        "what": what,
        "max_days_old": max_days_old,
        "content-type": "application/json",
    }
    if salary_min is not None:
        params["salary_min"] = salary_min
    if what_exclude is not None:
        params["what_exclude"] = what_exclude

    response = requests.get(f"{BASE_URL}/1", params=params, timeout=30)
    response.raise_for_status()
    data = response.json()

    jobs = []
    for r in data.get("results", []):
        jobs.append({
            "id": r.get("id"),
            "title": r.get("title"),
            "company": r.get("company", {}).get("display_name"),
            "location": r.get("location", {}).get("display_name"),
            "salary_min": r.get("salary_min"),
            "salary_max": r.get("salary_max"),
            "description": r.get("description"),  # note: Adzuna gives a SNIPPET only
            "url": r.get("redirect_url"),
        })
    return jobs