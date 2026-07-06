"""Shared structured-output schemas"""

from pydantic import BaseModel, Field


class ScoreResult(BaseModel):
    """Output of the Scorer Agent for a single job posting."""
    fit_score: int = Field(ge=1, le=10)
    reasoning: str
    resume_id: str
    meets_hard_filters: bool = False
    red_flags: list[str] = []
    to_verify: list[str] = []

class JobPosting(BaseModel):
    """One job posting as returned by the Finder Agent."""
    id: str
    title: str
    company: str | None = None
    location: str | None = None
    salary_min: float | None = None
    salary_max: float | None = None
    description: str | None = None
    url: str | None = None


class JobList(BaseModel):
    """Wrapper so CrewAI can enforce a list of postings."""
    jobs: list[JobPosting]


class TailorResult(BaseModel):
    """Output of the Tailor Agent — resume edit suggestions for one job."""
    resume_id: str
    edits: list[str]          # specific, actionable resume tweaks
    emphasis: str              # one-line: what angle to lead with


class OutreachResult(BaseModel):
    """Output of the Outreach Agent — a drafted connection note."""
    outreach_message: str
