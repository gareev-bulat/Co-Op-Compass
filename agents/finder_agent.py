"""Finder Agent — autonomously searches Adzuna for relevant co-op postings."""

import json

from crewai import Agent, Crew, Process, Task
from dotenv import load_dotenv

from finder_tool import AdzunaSearchTool
from scorer_agent import load_profile
from schemas import JobList

MODEL = "anthropic/claude-sonnet-5"


def build_finder(profile: dict) -> Agent:
    tracks = ", ".join(profile["tracks"].keys())
    return Agent(
        role="Co-op Job Finder",
        goal=(
            f"Find a broad, relevant set of US software co-op/internship postings matching "
            f"the candidate's tracks ({tracks}). Search several times with different keyword "
            f"angles to get good coverage before finishing."
        ),
        backstory=(
            "You are a persistent, resourceful job sourcer. You know that one search is never "
            "enough — you try multiple keyword combinations (mobile, full-stack, AI, general SWE) "
            "to surface a diverse set of postings. You do not filter or score jobs yourself; you "
            "cast a wide net and return everything you find for a separate scorer to evaluate."
        ),
        tools=[AdzunaSearchTool()],
        llm=MODEL,
        max_iter=8,
        verbose=True,
    )


def build_find_task(agent: Agent) -> Task:
    return Task(
        description=(
            "Search for US software engineering co-op and internship postings suitable for a "
            "sophomore. Run at least 3 different searches covering different angles: general SWE, "
            "full-stack/web, mobile, and AI/ML roles. Combine all results into one deduplicated list."
        ),
        expected_output=(
            "A JSON array of job objects, each with: id, title, company, location, salary_min, "
            "salary_max, description, url. Deduplicate by id. Return ONLY the JSON array."
        ),
        agent=agent,
        output_pydantic=JobList,
    )


def find_jobs(profile: dict | None = None) -> list[dict]:
    load_dotenv()
    profile = profile or load_profile()
    agent = build_finder(profile)
    task = build_find_task(agent)
    crew = Crew(agents=[agent], tasks=[task], process=Process.sequential, verbose=True)
    result = crew.kickoff()

    if result.pydantic is None:
        print("[warn] structured output failed; falling back to raw text")
        return []
    return [job.model_dump() for job in result.pydantic.jobs]


if __name__ == "__main__":
    output = find_jobs()
    print("\n\n=== FINDER OUTPUT ===")
    print(output)