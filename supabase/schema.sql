-- Supabase schema for TITA MVP
-- Enable required extensions
create extension if not exists pgcrypto with schema extensions;

-- Onboarding answers
create table if not exists public.onboarding_answers (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now()
);

-- Recommendations history (stores 3+ items per run)
create table if not exists public.recommendations (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  items jsonb not null,
  created_at timestamptz not null default now()
);

-- Progress per resource
create table if not exists public.progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  resource_id text not null,
  done boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, resource_id)
);

-- Badges claimed
create table if not exists public.badges (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  tx_hash text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- RLS policies
alter table public.onboarding_answers enable row level security;
alter table public.recommendations enable row level security;
alter table public.progress enable row level security;
alter table public.badges enable row level security;

-- Owner-only access policies
create policy if not exists "onboarding_answers_owner"
  on public.onboarding_answers for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "recommendations_owner"
  on public.recommendations for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "progress_owner"
  on public.progress for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "badges_owner"
  on public.badges for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
