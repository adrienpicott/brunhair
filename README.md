# Brunair — Personal Hair Lab

Next.js 14 + Supabase (real auth + RLS) + Tailwind + Framer Motion.
App language: English. Private, 2-user, health-data app.

## Setup
1. Create a Supabase project named `brunair`.
2. Run the SQL files in `supabase/` in order (01 → 04) in the SQL Editor.
3. Create users in Authentication > Users (no public sign-up).
4. Copy `.env.example` to `.env.local` and fill in URL + anon key.
5. `npm install` then `npm run dev`.

See `GUIDE_DEPLOIEMENT.md` for the full step-by-step (FR).
