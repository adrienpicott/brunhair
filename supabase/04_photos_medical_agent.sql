-- BRUNAIR · 04 — Photos, bilans medicaux, sorties agent AL, bucket Storage prive
-- A executer APRES 03. Derniere brique SQL.

begin;
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null, zone text, storage_path text not null, conditions jsonb, notes text,
  created_at timestamptz not null default now()
);
alter table public.photos enable row level security;
drop policy if exists photos_owner on public.photos;
create policy photos_owner on public.photos for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create index if not exists idx_photos_user_date on public.photos(user_id, log_date);
create table if not exists public.blood_panels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  panel_date date not null, lab_name text, report_path text, notes text,
  created_at timestamptz not null default now()
);
alter table public.blood_panels enable row level security;
drop policy if exists blood_panels_owner on public.blood_panels;
create policy blood_panels_owner on public.blood_panels for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create table if not exists public.blood_markers (
  id uuid primary key default gen_random_uuid(),
  panel_id uuid not null references public.blood_panels(id) on delete cascade,
  marker text not null, value numeric, unit text, ref_low numeric, ref_high numeric, flag text,
  created_at timestamptz not null default now()
);
alter table public.blood_markers enable row level security;
drop policy if exists blood_markers_owner on public.blood_markers;
create policy blood_markers_owner on public.blood_markers for all to authenticated
  using (exists (select 1 from public.blood_panels b where b.id = panel_id and b.user_id = auth.uid()))
  with check (exists (select 1 from public.blood_panels b where b.id = panel_id and b.user_id = auth.uid()));
create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text, input_summary text, output text, model text,
  created_at timestamptz not null default now()
);
alter table public.analyses enable row level security;
drop policy if exists analyses_owner on public.analyses;
create policy analyses_owner on public.analyses for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create table if not exists public.conclusions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  version integer not null default 1, content text,
  updated_at timestamptz not null default now(), created_at timestamptz not null default now()
);
drop trigger if exists trg_conclusions_updated on public.conclusions;
create trigger trg_conclusions_updated before update on public.conclusions for each row execute function public.set_updated_at();
alter table public.conclusions enable row level security;
drop policy if exists conclusions_owner on public.conclusions;
create policy conclusions_owner on public.conclusions for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
insert into storage.buckets (id, name, public) values ('media', 'media', false) on conflict (id) do nothing;
drop policy if exists media_owner_select on storage.objects;
create policy media_owner_select on storage.objects for select to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists media_owner_insert on storage.objects;
create policy media_owner_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists media_owner_update on storage.objects;
create policy media_owner_update on storage.objects for update to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists media_owner_delete on storage.objects;
create policy media_owner_delete on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
commit;
