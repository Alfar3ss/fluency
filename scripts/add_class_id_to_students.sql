-- Adds class_id to student_users for class assignments
alter table public.student_users
  add column if not exists class_id bigint references public.classes(id) on delete set null;

create index if not exists student_users_class_id_idx on public.student_users (class_id);
