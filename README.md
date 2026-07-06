# Co-Op Compass

A full-stack co-op application tracking platform built for Drexel students —
extended with an **AI agent layer** that autonomously finds, scores, and tailors
co-op opportunities.

Track applications, visualize pipeline progress, analyze trends, and review a
ranked shortlist of AI-sourced roles — with a human deciding on every one.

## Screenshots

<img width="1710" height="986" alt="Screenshot 2026-05-12 at 6 47 45 PM" src="https://github.com/user-attachments/assets/631a7109-a1f2-47fc-aca3-fefdfb2cfb59" />

## What it does

Students add their co-op applications and track them through a kanban pipeline —
Applied, Interview, Waitlist, Offer, Rejected. The analytics page visualizes
application trends and status breakdowns over time.

On top of this, an **AI agent pipeline** (in `/agents`) autonomously discovers
tech co-op postings, scores each for fit, tailors a resume recommendation and
outreach draft for strong matches, and surfaces them in an **"AI Suggested"** view.
The user reviews each one and either tracks it as an application or rejects it —
the agents find and prepare, the human decides.

## Tech Stack

**Application**
- Next.js 16 + React 19 + TypeScript
- Tailwind CSS
- Supabase (PostgreSQL)
- Recharts
- Vercel (deployment)

**AI agent layer (`/agents`, Python)**
- CrewAI — multi-agent orchestration (resume tailoring + outreach)
- Claude API (Haiku) — job scoring, tailoring, outreach drafting
- Pydantic — structured-output validation
- SimplifyJobs listings — job source
- Supabase — shared backend between the pipeline and the app

## Features

**Tracker**
- Kanban pipeline with real-time status updates
- Add applications with duplicate detection via external job IDs
- Search and filter applications by status
- Analytics dashboard with area chart and status breakdown
- Recent activity and upcoming deadlines on dashboard

**AI agent layer**
- Autonomous job discovery from cycle-relevant tech internship listings
- LLM scoring (1-10) with reasoning and automatic red-flag detection
- Hard filters split from a "verify before applying" checklist — the model gates
  on what it can judge (role, cycle, seniority), and flags what it can't (pay, visa)
  for human review
- Content-driven resume selection across multiple resume versions
- A sequential CrewAI crew that suggests specific resume edits and drafts a
  tailored outreach message for strong matches
- One-click "Track as Applied" graduates an AI suggestion into the real tracker

## Design decisions

A few choices worth calling out:

- **Workflow, not autonomous agents.** The pipeline is a prompt-chaining workflow
  with a gating step — predictable and debuggable — rather than a model deciding its
  own control flow. Autonomy was added only where the problem genuinely called for it.
- **Structured output over prompt-and-parse.** Every LLM call uses forced tool-use
  validated by Pydantic, with CHECK constraints in Postgres as a second layer.
- **Resumes are data, not code.** The valid resume set is derived at runtime from a
  folder of markdown files; adding a resume needs no code change.
- **Model chosen by benchmark.** Haiku was selected over Sonnet after a side-by-side
  comparison on real jobs showed near-identical scoring at ~3x lower cost.
- **Cost engineering.** Result caching, prompt caching, and gating the expensive
  tailoring crew to only strong matches keep runs cheap.

## How to Run

### App

1. Clone the repo
2. Create `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```
3. `npm install`
4. `npm run dev`

### AI agent pipeline

1. `cd agents`
2. Create a virtual environment and install dependencies:
   ```
   uv venv --python 3.12
   source .venv/bin/activate
   uv pip install -r requirements.txt
   ```
3. Create `agents/.env`:
   ```
   ANTHROPIC_API_KEY=your_key
   ANTHROPIC_MODEL=claude-haiku-4-5
   SUPABASE_URL=your_url
   SUPABASE_KEY=your_key
   ```
4. Add your resume versions as markdown files in `agents/resumes/`
   (e.g. general.md, ai.md, systems.md)
5. Run the pipeline: `python pipeline.py`

Scored suggestions are written to Supabase and appear in the app's
"AI Suggested" view for review.
