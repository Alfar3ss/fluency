-- Enable RLS on all main tables
alter table public.student_users enable row level security;
alter table public.teacher_users enable row level security;
alter table public.classes enable row level security;
alter table public.admin_users enable row level security;

-- Drop existing policies if any (to avoid conflicts)
drop policy if exists "Allow admins full access to student_users" on public.student_users;
drop policy if exists "Allow admins full access to teacher_users" on public.teacher_users;
drop policy if exists "Allow admins full access to classes" on public.classes;
drop policy if exists "Allow admins full access to admin_users" on public.admin_users;
drop policy if exists "Students can insert their own profile" on public.student_users;
drop policy if exists "Students can view their own profile" on public.student_users;
drop policy if exists "Students can update their own profile" on public.student_users;
drop policy if exists "Teachers can insert their own profile" on public.teacher_users;
drop policy if exists "Teachers can view their own profile" on public.teacher_users;
drop policy if exists "Teachers can update their own profile" on public.teacher_users;
drop policy if exists "Teachers can view their classes" on public.classes;

-- RLS Policies for student_users - Admin full access
create policy "Allow admins full access to student_users"
  on public.student_users for all
  using (
    exists (
      select 1 from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

-- RLS Policies for teacher_users - Admin full access
create policy "Allow admins full access to teacher_users"
  on public.teacher_users for all
  using (
    exists (
      select 1 from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

-- RLS Policies for classes - Admin full access
create policy "Allow admins full access to classes"
  on public.classes for all
  using (
    exists (
      select 1 from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

-- RLS Policies for admin_users - Admin full access
create policy "Allow admins full access to admin_users"
  on public.admin_users for all
  using (auth.uid() = user_id);

-- Optional: Add policies for students to view their own data
create policy "Students can insert their own profile"
  on public.student_users for insert
  with check (auth.uid() = user_id);

create policy "Students can view their own profile"
  on public.student_users for select
  using (auth.uid() = user_id);

create policy "Students can update their own profile"
  on public.student_users for update
  using (auth.uid() = user_id);

-- Optional: Add policies for teachers to view their own data
create policy "Teachers can insert their own profile"
  on public.teacher_users for insert
  with check (auth.uid() = user_id);

create policy "Teachers can view their own profile"
  on public.teacher_users for select
  using (auth.uid() = user_id);

create policy "Teachers can update their own profile"
  on public.teacher_users for update
  using (auth.uid() = user_id);

-- Optional: Teachers can view classes they teach
create policy "Teachers can view their classes"
  on public.classes for select
  using (teacher_id = auth.uid());

-- =====================================================
-- CRITICAL PERFORMANCE INDEXES
-- =====================================================

-- Index for faster RLS checks (CRITICAL - speeds up ALL admin queries)
create index if not exists admin_users_user_id_idx on public.admin_users(user_id);

-- Foreign key indexes (CRITICAL - without these, joins are SLOW)
create index if not exists student_users_class_id_idx on public.student_users(class_id);
create index if not exists classes_teacher_id_idx on public.classes(teacher_id);

-- Payment table indexes (CRITICAL for payment dashboard)
create index if not exists student_payments_student_id_idx on public.student_payments(student_id);
create index if not exists student_payments_class_id_idx on public.student_payments(class_id);
create index if not exists student_payments_payment_date_idx on public.student_payments(payment_date);
create index if not exists student_payments_payment_status_idx on public.student_payments(payment_status);

create index if not exists teacher_payments_teacher_id_idx on public.teacher_payments(teacher_id);
create index if not exists teacher_payments_class_id_idx on public.teacher_payments(class_id);
create index if not exists teacher_payments_payment_status_idx on public.teacher_payments(payment_status);
create index if not exists teacher_payments_payment_date_idx on public.teacher_payments(payment_date);

-- Composite indexes for common queries
create index if not exists classes_status_teacher_idx on public.classes(status, teacher_id);
create index if not exists student_users_email_lower_idx on public.student_users(lower(email));
create index if not exists teacher_users_email_lower_idx on public.teacher_users(lower(email));

-- IMPORTANT: Analyze tables after creating indexes
analyze public.student_users;
analyze public.teacher_users;
analyze public.classes;
analyze public.admin_users;
analyze public.student_payments;
analyze public.teacher_payments;
