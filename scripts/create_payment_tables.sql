-- Create student payments table
create table if not exists public.student_payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.student_users(user_id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  amount_paid decimal(10, 2) not null,
  sessions_purchased integer not null default 8,
  sessions_used integer not null default 0,
  payment_method text,
  payment_status text default 'completed',
  payment_date timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now()
);

-- Create teacher payments table
create table if not exists public.teacher_payments (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references public.teacher_users(user_id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  total_revenue decimal(10, 2) not null,
  commission_percentage decimal(5, 2) not null,
  amount_earned decimal(10, 2) not null,
  sessions_taught integer not null default 0,
  payment_status text default 'pending',
  payment_date timestamptz,
  payment_method text,
  notes text,
  created_at timestamptz not null default now()
);

-- Create indexes
create index if not exists student_payments_student_id_idx on public.student_payments(student_id);
create index if not exists student_payments_class_id_idx on public.student_payments(class_id);
create index if not exists student_payments_payment_date_idx on public.student_payments(payment_date);

create index if not exists teacher_payments_teacher_id_idx on public.teacher_payments(teacher_id);
create index if not exists teacher_payments_class_id_idx on public.teacher_payments(class_id);
create index if not exists teacher_payments_payment_status_idx on public.teacher_payments(payment_status);

-- Enable RLS
alter table public.student_payments enable row level security;
alter table public.teacher_payments enable row level security;

-- RLS Policies for admin access
create policy "Allow admins full access to student_payments"
  on public.student_payments for all
  using (
    exists (
      select 1 from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

create policy "Allow admins full access to teacher_payments"
  on public.teacher_payments for all
  using (
    exists (
      select 1 from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );
