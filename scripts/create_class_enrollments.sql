-- Create table to track student enrollments per class
create table if not exists class_enrollments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references classes(id) on delete cascade,
  student_id uuid references student_users(user_id) on delete cascade,
  status text default 'active' check (status in ('active', 'inactive', 'withdrawn')),
  enrolled_at timestamptz default now(),
  unenrolled_at timestamptz,
  unique (class_id, student_id)
);

-- Helpful indexes
create index if not exists class_enrollments_class_id_idx on class_enrollments (class_id);
create index if not exists class_enrollments_student_id_idx on class_enrollments (student_id);

-- Backfill from existing student_users.class_id values
insert into class_enrollments (class_id, student_id, status, enrolled_at)
select class_id, user_id, 'active', coalesce(created_at, now())
from student_users
where class_id is not null
on conflict (class_id, student_id) do nothing;

-- Recompute class sizes based on active enrollments
update classes c
set current_students = coalesce(sub.count_active, 0)
from (
  select class_id, count(*) as count_active
  from class_enrollments
  where status = 'active'
  group by class_id
) sub
where c.id = sub.class_id;
