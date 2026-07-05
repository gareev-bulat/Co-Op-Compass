"""CrewAI tool wrapper around the Adzuna search function."""

from typing import Type

from crewai.tools import BaseTool
from pydantic import BaseModel, Field

from adzuna import search_adzuna


class AdzunaSearchInput(BaseModel):
    """Input schema the agent must fill in to call the search tool."""

    what: str = Field(..., description="Keywords to search, e.g. 'software engineer intern' or 'full stack co-op'.")
    results_per_page: int = Field(10, description="How many results to return (max 20).")
    what_exclude: str | None = Field(None, description="Keywords to exclude, e.g. 'senior clearance'.")


class AdzunaSearchTool(BaseTool):
    name: str = "search_adzuna"
    description: str = (
        "Search US job postings by keyword. Returns a list of jobs with title, company, "
        "location, salary, a short description snippet, and a URL. Call this multiple times "
        "with different keywords to find a broad set of relevant co-op/internship postings."
    )
    args_schema: Type[BaseModel] = AdzunaSearchInput

    def _run(self, what: str, results_per_page: int = 10, what_exclude: str | None = None) -> str:
        import json

        jobs = search_adzuna(
            what=what,
            results_per_page=min(results_per_page, 20),
            what_exclude=what_exclude,
        )
        return json.dumps(jobs, indent=2)