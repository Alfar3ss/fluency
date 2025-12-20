-- Create teacher_users table
create table if not exists public.teacher_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  bio text,
  languages_taught text[] default '{}',
  experience_years integer,
  qualifications text,
  hourly_rate decimal(10,2),
  availability text,
  timezone text,
  avatar_url text,
  is_verified boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create index for email lookups
create index if not exists teacher_users_email_idx on public.teacher_users (lower(email));

-- Create index for verified teachers
create index if not exists teacher_users_verified_idx on public.teacher_users (is_verified);
