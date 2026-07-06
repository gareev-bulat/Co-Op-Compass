"""Tailor + Outreach crew: for a single job, suggest resume edits and draft outreach.

Sequential two-agent crew:
  Tailor  -> reads job + recommended resume -> specific edit suggestions
  Outreach -> reads job + company + Tailor's emphasis -> drafted connection note
Run on-demand per job, not in batch.
"""

import json

from crewai import Agent, Crew, Process, Task
from dotenv import load_dotenv

from resumes import load_resume
from schemas import TailorResult, OutreachResult

MODEL = "anthropic/claude-haiku-4-5"


def build_tailor_agent() -> Agent:
    return Agent(
        role="Resume Tailoring Specialist",
        goal="Suggest specific, actionable edits to make a resume fit a particular job posting.",
        backstory=(
            "You are a sharp technical resume coach. You give concrete, specific edits — "
            "'lead with the RESET project since this role is LLM-focused', 'add \"agentic AI\" "
            "to the skills line' — never vague advice like 'tailor your resume'. You work from "
            "the candidate's ACTUAL resume text and suggest realistic tweaks, never fabricating "
            "experience they don't have."
        ),
        llm=MODEL,
        verbose=True,
    )


def build_outreach_agent() -> Agent:
    return Agent(
        role="Outreach Writer",
        goal="Draft a short, specific, genuine LinkedIn connection note for a job application.",
        backstory=(
            "You write concise, authentic outreach — 2-4 sentences, specific to the company and "
            "role, referencing the candidate's most relevant work. No generic flattery, no "
            "buzzword salad, no fabrication. It should sound like a real motivated student, not a "
            "template."
        ),
        llm=MODEL,
        verbose=True,
    )


def build_tailor_task(agent: Agent, job: dict, resume_text: str, resume_id: str) -> Task:
    return Task(
        description=(
            f"Job posting:\nTitle: {job.get('title')}\nCompany: {job.get('company')}\n"
            f"Location: {job.get('location')}\nTerms: {job.get('terms')}\n\n"
            f"The candidate will use their '{resume_id}' resume:\n\n{resume_text}\n\n"
            f"Suggest 3-6 specific edits to better fit THIS posting. Only realistic tweaks "
            f"grounded in the resume's real content — reordering, keyword additions matching "
            f"actual skills, bullet emphasis. Do not invent experience."
        ),
        expected_output="Structured resume edits with a one-line emphasis angle.",
        agent=agent,
        output_pydantic=TailorResult,
    )


def build_outreach_task(agent: Agent, job: dict, tailor_task: Task) -> Task:
    return Task(
        description=(
            f"Job posting:\nTitle: {job.get('title')}\nCompany: {job.get('company')}\n\n"
            f"Using the emphasis angle from the resume tailoring, draft a 2-4 sentence LinkedIn "
            f"connection note to someone at {job.get('company')} about this role. Specific and "
            f"genuine, referencing the candidate's most relevant work for this posting."
        ),
        expected_output="A short, specific outreach message (2-4 sentences).",
        agent=agent,
        output_pydantic=OutreachResult,
        context=[tailor_task],  # <- Outreach reads Tailor's output
    )


def tailor_and_draft(job: dict, resume_id: str) -> dict:
    """Run the crew for one job. Returns {resume_id, edits, emphasis, outreach_message}."""
    load_dotenv()
    resume_text = load_resume(resume_id)
    if not resume_text:
        raise ValueError(f"No resume file found for id '{resume_id}'")

    tailor = build_tailor_agent()
    outreach = build_outreach_agent()
    tailor_task = build_tailor_task(tailor, job, resume_text, resume_id)
    outreach_task = build_outreach_task(outreach, job, tailor_task)

    crew = Crew(
        agents=[tailor, outreach],
        tasks=[tailor_task, outreach_task],
        process=Process.sequential,
        verbose=True,
    )
    crew.kickoff()

    tailor_out: TailorResult = tailor_task.output.pydantic
    outreach_out: OutreachResult = outreach_task.output.pydantic

    return {
        "resume_id": tailor_out.resume_id,
        "edits": tailor_out.edits,
        "emphasis": tailor_out.emphasis,
        "outreach_message": outreach_out.outreach_message,
    }


if __name__ == "__main__":
    sample_job = {
        "title": "LLM & Agentic AI R&D Intern",
        "company": "Bosch",
        "location": "Sunnyvale, CA",
        "terms": ["Fall 2026", "Winter 2026"],
    }
    result = tailor_and_draft(sample_job, "ai")
    print(json.dumps(result, indent=2))