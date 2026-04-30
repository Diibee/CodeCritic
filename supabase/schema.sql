-- CodeCritic Database Schema
-- Run this in your Supabase SQL Editor (supabase.com → your project → SQL Editor)

-- ===========================
-- PROFILES
-- Auto-created when a user signs up via Google
-- ===========================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ===========================
-- PROJECTS
-- ===========================
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text not null,
  tech_stack text[] default '{}',
  github_url text,
  demo_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.projects enable row level security;

create policy "Projects are viewable by everyone"
  on public.projects for select using (true);

create policy "Users can insert their own projects"
  on public.projects for insert with check (auth.uid() = user_id);

create policy "Users can update their own projects"
  on public.projects for update using (auth.uid() = user_id);

create policy "Users can delete their own projects"
  on public.projects for delete using (auth.uid() = user_id);

-- ===========================
-- REVIEWS
-- ===========================
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects on delete cascade not null,
  reviewer_id uuid references auth.users on delete cascade not null,
  rating int not null check (rating between 1 and 5),
  comment text not null,
  created_at timestamptz default now() not null,
  unique (project_id, reviewer_id)  -- one review per user per project
);

alter table public.reviews enable row level security;

create policy "Reviews are viewable by everyone"
  on public.reviews for select using (true);

create policy "Authenticated users can insert reviews"
  on public.reviews for insert with check (
    auth.uid() = reviewer_id and
    auth.uid() != (select user_id from public.projects where id = project_id)
  );

create policy "Users can update their own reviews"
  on public.reviews for update using (auth.uid() = reviewer_id);

create policy "Users can delete their own reviews"
  on public.reviews for delete using (auth.uid() = reviewer_id);
