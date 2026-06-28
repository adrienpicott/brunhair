-- BRUNAIR · 02 — Produits, interventions, routines (perso, owner-scoped)
-- A executer APRES 01.

begin;
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null, brand text, category text, form text,
  in_use boolean not null default true, notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
drop trigger if exists trg_products_updated on public.products;
create trigger trg_products_updated before update on public.products for each row execute function public.set_updated_at();
alter table public.products enable row level security;
drop policy if exists products_owner on public.products;
create policy products_owner on public.products for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create table if not exists public.product_actives (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  active_id uuid not null references public.actives(id) on delete restrict,
  concentration numeric, unit text, created_at timestamptz not null default now()
);
alter table public.product_actives enable row level security;
drop policy if exists product_actives_owner on public.product_actives;
create policy product_actives_owner on public.product_actives for all to authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.products p where p.id = product_id and p.user_id = auth.uid()));
create table if not exists public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null, vendor text, price numeric, currency text default 'EUR', url text, category text, notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
drop trigger if exists trg_shopping_updated on public.shopping_items;
create trigger trg_shopping_updated before update on public.shopping_items for each row execute function public.set_updated_at();
alter table public.shopping_items enable row level security;
drop policy if exists shopping_owner on public.shopping_items;
create policy shopping_owner on public.shopping_items for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create table if not exists public.interventions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  log_date date not null, time_of_day text, zone text, amount text, notes text,
  created_at timestamptz not null default now()
);
alter table public.interventions enable row level security;
drop policy if exists interventions_owner on public.interventions;
create policy interventions_owner on public.interventions for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create index if not exists idx_interventions_user_date on public.interventions(user_id, log_date);
create table if not exists public.routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null, frequency text, in_use boolean not null default true, notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
drop trigger if exists trg_routines_updated on public.routines;
create trigger trg_routines_updated before update on public.routines for each row execute function public.set_updated_at();
alter table public.routines enable row level security;
drop policy if exists routines_owner on public.routines;
create policy routines_owner on public.routines for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create table if not exists public.routine_steps (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.routines(id) on delete cascade,
  ordre integer not null default 1, product_id uuid references public.products(id) on delete set null,
  instruction text, created_at timestamptz not null default now()
);
alter table public.routine_steps enable row level security;
drop policy if exists routine_steps_owner on public.routine_steps;
create policy routine_steps_owner on public.routine_steps for all to authenticated
  using (exists (select 1 from public.routines r where r.id = routine_id and r.user_id = auth.uid()))
  with check (exists (select 1 from public.routines r where r.id = routine_id and r.user_id = auth.uid()));
create table if not exists public.routine_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  routine_id uuid references public.routines(id) on delete set null,
  log_date date not null, completed boolean not null default true, notes text,
  created_at timestamptz not null default now()
);
alter table public.routine_logs enable row level security;
drop policy if exists routine_logs_owner on public.routine_logs;
create policy routine_logs_owner on public.routine_logs for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create index if not exists idx_routine_logs_user_date on public.routine_logs(user_id, log_date);
commit;
