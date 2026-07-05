"""Local cache of scored jobs, keyed by job id, to avoid re-scoring on re-runs."""

import json
import os

CACHE_PATH = "score_cache.json"


def load_cache() -> dict:
    """Return the id→score dict, or empty if no cache yet."""
    if not os.path.exists(CACHE_PATH):
        return {}
    try:
        with open(CACHE_PATH) as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return {}


def save_cache(cache: dict) -> None:
    """Write the cache atomically so a crash mid-write can't corrupt it."""
    tmp = CACHE_PATH + ".tmp"
    with open(tmp, "w") as f:
        json.dump(cache, f, indent=2)
    os.replace(tmp, CACHE_PATH)   # atomic on the same filesystem