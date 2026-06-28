-- BRUNAIR · 03 — Journaux quotidiens (cycle, supplements, nutrition, biometrie, evenements, chute, cuir chevelu)
-- A executer APRES 02.

begin;
create table if not exists public.cycle_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null, type text not null, flow text, symptoms text[], notes text,
  created_at timestamptz not null default now()
);
alter table public.cycle_events enable row level security;
drop policy if exists cycle_owner on public.cycle_events;
create policy cycle_owner on public.cycle_events for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create index if not exists idx_cycle_user_date on public.cycle_events(user_id, log_date);
create table if not exists public.supplements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null, type text, dose text, start_date date, end_date date,
  in_use boolean not null default true, notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
drop trigger if exists trg_supplements_updated on public.supplements;
create trigger trg_supplements_updated before update on public.supplements for each row execute function public.set_updated_at();
alter table public.supplements enable row level security;
drop policy if exists supplements_owner on public.supplements;
create policy supplements_owner on public.supplements for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create table if not exists public.nutrition_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null, calories numeric, protein_g numeric, iron_mg numeric, zinc_mg numeric,
  vit_d_iu numeric, omega3_mg numeric, biotin_ug numeric, screenshot_path text, notes text,
  created_at timestamptz not null default now()
);
alter table public.nutrition_logs enable row level security;
drop policy if exists nutrition_owner on public.nutrition_logs;
create policy nutrition_owner on public.nutrition_logs for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create index if not exists idx_nutrition_user_date on public.nutrition_logs(user_id, log_date);
create table if not exists public.biometrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null, sleep_hours numeric, sleep_quality integer, resting_hr integer, hrv integer,
  stress_level integer, steps integer, screenshot_path text, notes text,
  created_at timestamptz not null default now()
);
alter table public.biometrics enable row level security;
drop policy if exists biometrics_owner on public.biometrics;
create policy biometrics_owner on public.biometrics for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create index if not exists idx_biometrics_user_date on public.biometrics(user_id, log_date);
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null, category text, description text, severity integer, notes text,
  created_at timestamptz not null default now()
);
alter table public.events enable row level security;
drop policy if exists events_owner on public.events;
create policy events_owner on public.events for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create index if not exists idx_events_user_date on public.events(user_id, log_date);
create table if not exists public.shedding_counts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null, method text, count integer, notes text,
  created_at timestamptz not null default now()
);
alter table public.shedding_counts enable row level security;
drop policy if exists shedding_owner on public.shedding_counts;
create policy shedding_owner on public.shedding_counts for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create index if not exists idx_shedding_user_date on public.shedding_counts(user_id, log_date);
create table if not exists public.scalp_states (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null, oiliness integer, itch integer, dandruff integer, redness integer, notes text,
  created_at timestamptz not null default now()
);
alter table public.scalp_states enable row level security;
drop policy if exists scalp_owner on public.scalp_states;
create policy scalp_owner on public.scalp_states for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create index if not exists idx_scalp_user_date on public.scalp_states(user_id, log_date);
commit;
