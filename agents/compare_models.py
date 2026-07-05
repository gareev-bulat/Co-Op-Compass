"""Compare Scorer output across models on the same jobs, to decide if a cheaper model holds up."""

import os

from dotenv import load_dotenv

from scorer_agent import load_profile, score_job
from simplify import load_simplify_jobs


def compare(n: int = 8) -> None:
    load_dotenv()
    profile = load_profile()
    jobs = load_simplify_jobs()[:n]

    models = ["claude-sonnet-5", "claude-haiku-4-5"]

    print(f"Comparing {len(models)} models on {len(jobs)} jobs\n")
    print(f"{'Job':<45} " + " ".join(f"{m.split('-')[1]:>8}" for m in models))
    print("-" * 70)

    for job in jobs:
        text = (
            f"{job.get('title','')} at {job.get('company','')} ({job.get('location','')})\n"
            f"Cycle terms: {job.get('terms', [])}\n"
        )
        row = f"{job.get('title','?')[:44]:<45} "
        details = []
        for model in models:
            os.environ["ANTHROPIC_MODEL"] = model
            try:
                r = score_job(text, profile)
                flag = "✓" if r.meets_hard_filters else "✗"
                row += f"{flag}{r.fit_score:>2}/10 "
                details.append((model, r))
            except Exception as e:
                row += f"  ERR   "
                details.append((model, None))
        print(row)

    print("\nRun again with different jobs by changing n, or inspect full reasoning per model as needed.")


if __name__ == "__main__":
    compare(n=20)