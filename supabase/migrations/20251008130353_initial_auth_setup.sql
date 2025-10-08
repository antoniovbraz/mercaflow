-- Initial auth setup following Supabase best practices
-- Based on: https://supabase.com/docs/guides/auth/managing-user-data

-- Create profiles table exactly as recommended by Supabase docs
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  first_name text,
  last_name text,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  primary key (id)
);

-- Enable RLS on profiles table
alter table public.profiles enable row level security;

-- Create policies following the official pattern
-- Users can view their own profile
create policy "Users can view own profile." on profiles
  for select using (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Function to handle new user signup
-- This follows the exact pattern from Supabase docs
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  );
  return new;
end;
$$;

-- Trigger to automatically create profile on user signup
-- This is the exact trigger from Supabase documentation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Add updated_at trigger to profiles
create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- Create indexes for performance
create index profiles_id_idx on public.profiles (id);
