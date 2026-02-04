-- Supabase schema for S.A.F.E

-- Enable uuid generation
create extension if not exists "pgcrypto" with schema extensions;

-- =========================
-- User profile (1 row per user)
-- =========================
create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,

  full_name text,
  title text,
  email text,
  phone text,
  organization text,
  registration_id text,
  location text,
  expertise text,
  experience text,
  onboarding_completed boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_profiles
  add column if not exists onboarding_completed boolean not null default false;

-- =========================
-- Buildings (many per user)
-- Stores the BuildingParams object as jsonb for flexibility
-- =========================
create table if not exists public.buildings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,

  name text not null default 'Untitled Building',
  building_params jsonb not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists buildings_user_id_idx on public.buildings (user_id);

-- =========================
-- Structure inputs history (captures each set of params saved/run)
-- =========================
create table if not exists public.structure_inputs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  building_id uuid references public.buildings (id) on delete set null,
  input_params jsonb not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists structure_inputs_user_id_idx on public.structure_inputs (user_id);
create index if not exists structure_inputs_building_id_idx on public.structure_inputs (building_id);

-- =========================
-- updated_at triggers
-- =========================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_user_profiles_updated_at on public.user_profiles;
create trigger set_user_profiles_updated_at
before update on public.user_profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_buildings_updated_at on public.buildings;
create trigger set_buildings_updated_at
before update on public.buildings
for each row
execute function public.set_updated_at();

-- =========================
-- Automatically create an empty profile row when a user signs up
-- =========================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  insert into public.user_profiles (user_id, email, onboarding_completed)
  values (new.id, new.email, false)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

alter function public.handle_new_user() owner to postgres;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- =========================
-- Row Level Security (RLS)
-- =========================
alter table public.user_profiles enable row level security;
alter table public.buildings enable row level security;
alter table public.structure_inputs enable row level security;

-- user_profiles policies

drop policy if exists "User can read own profile" on public.user_profiles;
create policy "User can read own profile"
on public.user_profiles
for select
using (auth.uid() = user_id);

drop policy if exists "User can insert own profile" on public.user_profiles;
create policy "User can insert own profile"
on public.user_profiles
for insert
with check (auth.uid() = user_id);

drop policy if exists "User can update own profile" on public.user_profiles;
create policy "User can update own profile"
on public.user_profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- buildings policies

drop policy if exists "User can read own buildings" on public.buildings;
create policy "User can read own buildings"
on public.buildings
for select
using (auth.uid() = user_id);

drop policy if exists "User can insert own buildings" on public.buildings;
create policy "User can insert own buildings"
on public.buildings
for insert
with check (auth.uid() = user_id);

drop policy if exists "User can update own buildings" on public.buildings;
create policy "User can update own buildings"
on public.buildings
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "User can delete own buildings" on public.buildings;
create policy "User can delete own buildings"
on public.buildings
for delete
using (auth.uid() = user_id);

-- structure_inputs policies

drop policy if exists "User can read own structure inputs" on public.structure_inputs;
create policy "User can read own structure inputs"
on public.structure_inputs
for select
using (auth.uid() = user_id);

drop policy if exists "User can insert own structure inputs" on public.structure_inputs;
create policy "User can insert own structure inputs"
on public.structure_inputs
for insert
with check (auth.uid() = user_id);

drop policy if exists "User can delete own structure inputs" on public.structure_inputs;
create policy "User can delete own structure inputs"
on public.structure_inputs
for delete
using (auth.uid() = user_id);
