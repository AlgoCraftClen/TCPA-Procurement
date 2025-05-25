-- Enable UUID extension
create extension if not exists "uuid-ossp" with schema extensions;

-- Enable Row Level Security
alter table if exists public.profiles enable row level security;
alter table if exists public.profile_fields enable row level security;
alter table if exists public.forms enable row level security;

-- Create profiles table
create table if not exists public.profiles (
  id uuid default extensions.uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  type text not null check (type in ('personal', 'company')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create profile_fields table
create table if not exists public.profile_fields (
  id uuid default extensions.uuid_generate_v4() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  value text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create forms table
create table if not exists public.forms (
  id uuid default extensions.uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text not null check (type in ('pdf', 'xlsx', 'docx')),
  size bigint,
  last_modified text not null,
  is_favorite boolean default false,
  tags text[],
  fields jsonb not null,
  thumbnail_url text,
  preview_url text,
  source text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a function to update the updated_at column
drop function if exists public.update_updated_at_column() cascade;
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create triggers to update updated_at
create trigger handle_updated_at_profiles
before update on public.profiles
for each row
execute procedure public.update_updated_at_column();

create trigger handle_updated_at_profile_fields
before update on public.profile_fields
for each row
execute procedure public.update_updated_at_column();

create trigger handle_updated_at_forms
before update on public.forms
for each row
execute procedure public.update_updated_at_column();

-- Create a function to create a profile with fields
create or replace function public.create_profile_with_fields(
  p_name text,
  p_type text,
  p_description text,
  p_fields jsonb[]
)
returns jsonb
language plpgsql
as $$
declare
  new_profile_id uuid;
  field_record jsonb;
  result jsonb;
begin
  -- Insert the new profile
  insert into public.profiles (name, type, description, user_id)
  values (p_name, p_type, p_description, auth.uid())
  returning id into new_profile_id;
  
  -- Insert each field
  foreach field_record in array p_fields
  loop
    insert into public.profile_fields (profile_id, name, value)
    values (
      new_profile_id,
      field_record->>'name',
      field_record->>'value'
    );
  end loop;
  
  -- Return the created profile with its fields
  select jsonb_build_object(
    'id', p.id,
    'name', p.name,
    'type', p.type,
    'description', p.description,
    'created_at', p.created_at,
    'updated_at', p.updated_at,
    'fields', (
      select jsonb_agg(jsonb_build_object(
        'id', pf.id,
        'name', pf.name,
        'value', pf.value,
        'created_at', pf.created_at,
        'updated_at', pf.updated_at
      ))
      from public.profile_fields pf
      where pf.profile_id = p.id
    )
  )
  into result
  from public.profiles p
  where p.id = new_profile_id;
  
  return result;
end;
$$;

-- Set up Row Level Security (RLS) policies
-- Profiles
create policy "Users can view their own profiles"
on public.profiles for select
using (auth.uid() = user_id);

create policy "Users can insert their own profiles"
on public.profiles for insert
with check (auth.uid() = user_id);

create policy "Users can update their own profiles"
on public.profiles for update
using (auth.uid() = user_id);

create policy "Users can delete their own profiles"
on public.profiles for delete
using (auth.uid() = user_id);

-- Profile Fields
create policy "Users can view their own profile fields"
on public.profile_fields for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = profile_id and p.user_id = auth.uid()
  )
);

create policy "Users can insert their own profile fields"
on public.profile_fields for insert
with check (
  exists (
    select 1 from public.profiles p
    where p.id = profile_id and p.user_id = auth.uid()
  )
);

create policy "Users can update their own profile fields"
on public.profile_fields for update
using (
  exists (
    select 1 from public.profiles p
    where p.id = profile_id and p.user_id = auth.uid()
  )
);

create policy "Users can delete their own profile fields"
on public.profile_fields for delete
using (
  exists (
    select 1 from public.profiles p
    where p.id = profile_id and p.user_id = auth.uid()
  )
);

-- Forms
create policy "Users can view their own forms"
on public.forms for select
using (auth.uid() = user_id);

create policy "Users can insert their own forms"
on public.forms for insert
with check (auth.uid() = user_id);

create policy "Users can update their own forms"
on public.forms for update
using (auth.uid() = user_id);

create policy "Users can delete their own forms"
on public.forms for delete
using (auth.uid() = user_id);
