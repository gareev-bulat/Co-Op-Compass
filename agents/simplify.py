"""SimplifyJobs loader — fetches and filters the community internship listings.

Replaces Adzuna as the job source. The data is one big JSON file of curated
tech internship/co-op postings, updated hourly. We cache it to disk so we're
not re-downloading 15k+ entries on every run.
"""

import json
import os
import time

import requests

LISTINGS_URL = (
    "https://raw.githubusercontent.com/SimplifyJobs/"
    "Summer2026-Internships/dev/.github/scripts/listings.json"
)
CACHE_PATH = "listings_cache.json"
CACHE_MAX_AGE_SECONDS = 6 * 3600  # re-download if cache older than 6 hours

# Which cycle terms count as "my co-op window" (Sept 2026 – Mar 2027).
DEFAULT_TERMS = {"Fall 2026", "Winter 2026", "Spring 2027", "Winter 2027"}


def _fetch_raw() -> list[dict]:
    """Download listings.json, using a local cache to avoid repeated downloads."""
    if os.path.exists(CACHE_PATH):
        age = time.time() - os.path.getmtime(CACHE_PATH)
        if age < CACHE_MAX_AGE_SECONDS:
            with open(CACHE_PATH) as f:
                return json.load(f)

    resp = requests.get(LISTINGS_URL, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    with open(CACHE_PATH, "w") as f:
        json.dump(data, f)
    return data


def load_simplify_jobs(terms: set[str] | None = None) -> list[dict]:
    """Return active listings matching the given cycle terms, in pipeline shape."""
    terms = terms or DEFAULT_TERMS
    raw = _fetch_raw()

    jobs = []
    for r in raw:
        if not r.get("active"):
            continue
        if not r.get("is_visible", True):
            continue
        role_terms = set(r.get("terms", []))
        if terms and not (role_terms & terms):
            continue

        posted = r.get("date_posted")
        if posted:
            try:
                age_days = (datetime.datetime.now().timestamp() - float(posted)) / 86400
                if age_days > 30:   # skip anything older than 30 days
                    continue
            except (ValueError, TypeError):
                pass

        locations = r.get("locations", [])
        jobs.append({
            "id": r.get("id"),
            "title": r.get("title"),
            "company": r.get("company_name"),
            "location": ", ".join(locations) if locations else None,
            "salary_min": None,   # SimplifyJobs doesn't carry salary
            "salary_max": None,
            "description": None,  # no description field; title+company+terms carry the signal
            "terms": list(role_terms),
            "url": r.get("url"),
        })
    return jobs