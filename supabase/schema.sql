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

-- role column: 'user' (default), 'staff', 'admin' — set manually via DB
alter table public.profiles add column if not exists role text default 'user' not null;

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

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
  is_public boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.projects enable row level security;

create policy "Projects are viewable by everyone"
  on public.projects for select using (
    is_public = true or auth.uid() = user_id
  );

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

-- ===========================
-- NOTIFICATIONS
-- ===========================
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  type text not null,
  message text not null,
  link text,
  read boolean default false not null,
  created_at timestamptz default now() not null
);

alter table public.notifications enable row level security;

create policy "Users can read own notifications"
  on public.notifications for select using (auth.uid() = user_id);

create policy "Users can update own notifications"
  on public.notifications for update using (auth.uid() = user_id);

create policy "Users can delete own notifications"
  on public.notifications for delete using (auth.uid() = user_id);

create policy "Service role can insert notifications"
  on public.notifications for insert with check (true);

-- ===========================
-- USER ACHIEVEMENTS
-- ===========================
create table if not exists public.user_achievements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  achievement_key text not null,
  unlocked_at timestamptz default now() not null,
  unique (user_id, achievement_key)
);

alter table public.user_achievements enable row level security;

create policy "Achievements are viewable by everyone"
  on public.user_achievements for select using (true);

create policy "Service role can insert achievements"
  on public.user_achievements for insert with check (true);

-- ===========================
-- SUBSCRIPTIONS
-- ===========================
create table if not exists public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'inactive',
  current_period_end timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.subscriptions enable row level security;

create policy "Users can read own subscription"
  on public.subscriptions for select using (auth.uid() = user_id);

-- ===========================
-- PROJECTS — extra columns
-- ===========================
alter table public.projects
  add column if not exists ai_review text,
  add column if not exists ai_review_at timestamptz,
  add column if not exists is_featured boolean default false not null;
