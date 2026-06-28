-- BRUNAIR · 01 — Fondation + tables de reference partagees
-- A executer EN PREMIER dans le SQL Editor Supabase.

begin;
create extension if not exists pgcrypto;
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create table if not exists public.actives (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  category text,
  evidence_level text check (evidence_level in ('strong','moderate','limited','marketing','unknown')) default 'unknown',
  mechanism text, notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_actives_updated on public.actives;
create trigger trg_actives_updated before update on public.actives for each row execute function public.set_updated_at();
alter table public.actives enable row level security;
drop policy if exists actives_all_auth on public.actives;
create policy actives_all_auth on public.actives for all to authenticated using (true) with check (true);
create table if not exists public.knowledge_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null, slug text unique not null, category text, body text, source_url text,
  evidence_level text check (evidence_level in ('strong','moderate','limited','marketing','unknown')) default 'unknown',
  tags text[], created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
drop trigger if exists trg_knowledge_updated on public.knowledge_articles;
create trigger trg_knowledge_updated before update on public.knowledge_articles for each row execute function public.set_updated_at();
alter table public.knowledge_articles enable row level security;
drop policy if exists knowledge_all_auth on public.knowledge_articles;
create policy knowledge_all_auth on public.knowledge_articles for all to authenticated using (true) with check (true);
commit;
