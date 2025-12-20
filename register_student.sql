-- Create student_users table
create table if not exists public.student_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  native_language text,
  target_languages text[] default '{}',
  skill_level text,
  learning_goals text,
  timezone text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create index for email lookups
create index if not exists student_users_email_idx on public.student_users (lower(email));

-- Create avatars storage bucket
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;
