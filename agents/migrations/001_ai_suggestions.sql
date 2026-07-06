-- AI Suggestions table: high-churn output of the scoring pipeline.
-- Kept separate from `applications` (curated, human-committed) so the
-- automation layer can write freely without touching your real applications.

create table if not exists ai_suggestions (
  -- Use the SimplifyJobs listing id as the primary key so re-running the
  -- pipeline UPSERTs (updates existing) instead of creating duplicates.
  external_job_id text primary key,

  -- Job facts (from SimplifyJobs)
  title          text not null,
  company        text,
  location       text,
  url            text,
  terms          text[],           -- e.g. {'Fall 2026','Winter 2026'}

  -- Scorer output
  fit_score          integer not null check (fit_score between 1 and 10),
  reasoning          text,
  meets_hard_filters boolean not null default false,
  resume_id          text check (resume_id in ('mobile','general')),
  red_flags          text[] default '{}',
  to_verify          text[] default '{}',

  -- Review workflow state
  review_status  text not null default 'pending'
                   check (review_status in ('pending','submitted','rejected')),

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Index for the common query: show pending suggestions, best first.
create index if not exists ai_suggestions_review_score_idx
  on ai_suggestions (review_status, fit_score desc);