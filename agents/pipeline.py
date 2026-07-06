"""Pipeline: Finder → Scorer. Finds jobs, scores each, returns ranked results."""

from dotenv import load_dotenv

from simplify import load_simplify_jobs
from scorer_agent import load_profile, score_job
from score_cache import load_cache, save_cache
from supabase_writer import write_suggestions
from tailor_crew import tailor_and_draft


def run_pipeline(min_score: int = 6, limit: int | None = None, write_to_db: bool = True) -> list[dict]:
    load_dotenv()
    profile = load_profile()

    print("Loading jobs from SimplifyJobs...")
    jobs = load_simplify_jobs()
    if limit:
        jobs = jobs[:limit]
    print(f"Loaded {len(jobs)} active cycle jobs.\n")

    cache = load_cache()
    scored = []
    api_calls = 0

    for job in jobs:
        job_id = job.get("id")
        if job_id in cache:
            result_dict = cache[job_id]          # cache hit — no API call
        else:
            text = (
                f"{job.get('title','')} at {job.get('company','')} ({job.get('location','')})\n"
                f"Cycle terms: {job.get('terms', [])}\n"
                f"{job.get('description','') or ''}"
            )
            try:
                result = score_job(text, profile)
            except Exception as e:
                print(f"  skip {job.get('title','?')}: {e}")
                continue
            result_dict = result.model_dump()
            cache[job_id] = result_dict          # store for next run
            api_calls += 1

        scored.append({**job, **result_dict})
        flag = "✓" if result_dict["meets_hard_filters"] else "✗"
        print(f"  {flag} [{result_dict['fit_score']}/10] {job.get('title','?')} @ {job.get('company','?')}")

    save_cache(cache)
    print(f"\n{api_calls} new API calls ({len(scored) - api_calls} from cache)")

    scored.sort(key=lambda j: (j["meets_hard_filters"], j["fit_score"]), reverse=True)
    # Tailor only strong matches (score >= threshold AND passes hard filters)
    tailor_threshold = 6
    for job in scored:
        if job["fit_score"] >= tailor_threshold and job["meets_hard_filters"]:
            try:
                crew_out = tailor_and_draft(job, job["resume_id"])
                job["resume_edits"] = crew_out["edits"]
                job["tailor_emphasis"] = crew_out["emphasis"]
                job["outreach_message"] = crew_out["outreach_message"]
                print(f"  ✎ tailored: {job['title']}")
            except Exception as e:
                print(f"  [warn] tailoring failed for {job.get('title')}: {e}")
    strong = [j for j in scored if j["fit_score"] >= min_score and j["meets_hard_filters"]]
    print(f"{len(strong)} strong matches (score >= {min_score}, filters passed)")
    if write_to_db:
        try:
            n = write_suggestions(scored)
            print(f"Wrote {n} suggestions to Supabase.")
        except Exception as e:
            print(f"[warn] failed to write to Supabase: {e}")

    return scored


if __name__ == "__main__":
    results = run_pipeline(limit=10)
    print("\n=== TOP RESULTS ===")
    for j in results[:5]:
        print(f"[{j['fit_score']}/10] {j['title']} @ {j['company']} — resume: {j['resume_id']}")
        print(f"    {j['reasoning']}")
        if j.get('to_verify'):
            print(f"    ⚠️ verify: {', '.join(j['to_verify'])}")
        print()