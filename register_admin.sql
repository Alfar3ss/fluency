-- Create admin_users table
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  role text default 'admin',
  permissions text[] default ARRAY['read', 'write', 'delete', 'manage_users'],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create index for email lookups
create index if not exists admin_users_email_idx on public.admin_users (lower(email));

-- INSTRUCTIONS TO CREATE ADMIN USER:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add User" 
-- 3. Email: admin@fluency.com
-- 4. Password: admin
-- 5. Copy the user_id after creation
-- 6. Replace the UUID below with that user_id and run the INSERT

-- Insert admin profile (replace the UUID with actual user_id from auth.users)
-- Query to find your actual user_id:
-- SELECT id, email FROM auth.users WHERE email = 'manager@fc.center';
-- Copy the 'id' value and replace it below.

insert into public.admin_users (
  user_id,
  full_name,
  email,
  role,
  permissions
) values (
  'PASTE_YOUR_REAL_USER_ID_HERE'::uuid,
  'Khalid Louir',
  'manager@fc.center',
  'super_admin',
  ARRAY['read', 'write', 'delete', 'manage_users', 'manage_teachers', 'manage_students', 'view_analytics']
) on conflict (user_id) do nothing;

-- Query to get user_id after creating auth user:
-- SELECT id, email FROM auth.users WHERE email = 'admin@fluency.com';
