"""Dynamic resume loading. The resumes/ folder is the source of truth:
each .md file is a resume, its filename (without extension) is the resume_id.
Add a file, it becomes a valid option — no code changes needed.
"""

from pathlib import Path

RESUMES_DIR = Path(__file__).parent / "resumes"


def available_resume_ids() -> list[str]:
    """List valid resume ids = the .md filenames in resumes/."""
    if not RESUMES_DIR.exists():
        return []
    return sorted(p.stem for p in RESUMES_DIR.glob("*.md"))


def load_resume(resume_id: str) -> str:
    """Return the full text of one resume, or '' if it doesn't exist."""
    path = RESUMES_DIR / f"{resume_id}.md"
    return path.read_text() if path.exists() else ""


def load_all_resumes() -> dict[str, str]:
    """Return {resume_id: full_text} for every resume file."""
    return {rid: load_resume(rid) for rid in available_resume_ids()}