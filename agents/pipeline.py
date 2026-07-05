"""Pipeline: Finder → Scorer. Finds jobs, scores each, returns ranked results."""

from dotenv import load_dotenv

from simplify import load_simplify_jobs
from scorer_agent import load_profile, score_job


def run_pipeline(min_score: int = 6) -> list[dict]:
    load_dotenv()
    profile = load_profile()

    print("Loading jobs from SimplifyJobs...")
    jobs = load_simplify_jobs()
    print(f"Loaded {len(jobs)} active cycle jobs. Scoring each...\n")

    scored = []
    for job in jobs[:25]:
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

        scored.append({**job, **result.model_dump()})
        flag = "✓" if result.meets_hard_filters else "✗"
        print(f"  {flag} [{result.fit_score}/10] {job.get('title','?')} @ {job.get('company','?')}")

    # Rank: passing hard filters first, then by score
    scored.sort(key=lambda j: (j["meets_hard_filters"], j["fit_score"]), reverse=True)

    strong = [j for j in scored if j["fit_score"] >= min_score and j["meets_hard_filters"]]
    print(f"\n{len(strong)} strong matches (score >= {min_score}, filters passed)")
    return scored


if __name__ == "__main__":
    results = run_pipeline()
    print("\n=== TOP RESULTS ===")
    for j in results[:5]:
        print(f"[{j['fit_score']}/10] {j['title']} @ {j['company']} — resume: {j['resume_id']}")
        print(f"    {j['reasoning']}\n")