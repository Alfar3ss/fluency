-- Create attendance table
create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.student_users(user_id) on delete cascade,
  session_date date not null,
  status text not null check (status in ('present', 'absent', 'late')),
  notes text,
  marked_by uuid references public.admin_users(user_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint attendance_unique_record unique (class_id, student_id, session_date)
);

-- Create indexes for performance
create index if not exists attendance_class_id_idx on public.attendance(class_id);
create index if not exists attendance_student_id_idx on public.attendance(student_id);
create index if not exists attendance_session_date_idx on public.attendance(session_date);
create index if not exists attendance_status_idx on public.attendance(status);
create index if not exists attendance_class_date_idx on public.attendance(class_id, session_date);

-- Composite index for common queries (class + date + status)
create index if not exists attendance_class_date_status_idx on public.attendance(class_id, session_date, status);

-- Enable RLS
alter table public.attendance enable row level security;

-- RLS Policy: Allow admins full access
create policy "Allow admins full access to attendance"
  on public.attendance for all
  using (
    exists (
      select 1 from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

-- RLS Policy: Teachers can view attendance for their classes
create policy "Teachers can view their class attendance"
  on public.attendance for select
  using (
    exists (
      select 1 from public.classes
      where classes.id = attendance.class_id
      and classes.teacher_id = auth.uid()
    )
  );

-- RLS Policy: Students can view their own attendance
create policy "Students can view their own attendance"
  on public.attendance for select
  using (auth.uid() = student_id);

-- Trigger to update updated_at timestamp
create or replace function update_attendance_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_attendance_timestamp
  before update on public.attendance
  for each row
  execute function update_attendance_updated_at();

-- Analyze table for query optimization
analyze public.attendance;
