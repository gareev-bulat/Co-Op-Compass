# 🧭 Co-Op Compass

A full-stack co-op application tracking platform built for Drexel students.
Track applications, visualize pipeline progress, and analyze trends.

---

## Screenshots
[add screenshots here]

---

## What it does
Students add their co-op applications and track them through a kanban pipeline — Applied, Interview, Waitlist, Offer, Rejected. The analytics page visualizes application trends and status breakdowns over time.

---

## Tech Stack
- Next.js 15 + TypeScript
- Tailwind CSS
- Supabase (PostgreSQL)
- Recharts
- Vercel (deployment)

---

## Features
- Kanban pipeline with real-time status updates
- Add applications with duplicate detection via external job IDs
- Search and filter applications by status
- Analytics dashboard with area chart and status breakdown
- Recent activity and upcoming deadlines on dashboard

---

## How to Run
1. Clone the repo
2. Create `.env.local`:
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
3. `npm install`
4. `npm run dev`
