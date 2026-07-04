"""Shared structured-output schemas"""

from typing import Literal

from pydantic import BaseModel, Field


class ScoreResult(BaseModel):
    """Output of the Scorer Agent for a single job posting."""

    fit_score: int = Field(ge=1, le=10)
    reasoning: str
    red_flags: list[str]
    meets_hard_filters: bool
    resume_id: Literal["mobile", "general"]
