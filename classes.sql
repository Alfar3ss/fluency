create table public.classes (
  id uuid not null default gen_random_uuid (),
  name text not null,
  language text not null,
  level text not null,
  schedule text null,
  max_students integer null default 10,
  current_students integer null default 0,
  status text null default 'Active'::text,
  teacher_id uuid null,
  teacher_name text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint classes_pkey primary key (id),
  constraint classes_teacher_id_fkey foreign KEY (teacher_id) references teacher_users (user_id) on delete set null
) TABLESPACE pg_default;

create index IF not exists idx_classes_teacher_id on public.classes using btree (teacher_id) TABLESPACE pg_default;

create index IF not exists idx_classes_language_level on public.classes using btree (language, level) TABLESPACE pg_default;

create index IF not exists idx_classes_status on public.classes using btree (status) TABLESPACE pg_default;

create trigger update_classes_updated_at BEFORE
update on classes for EACH row
execute FUNCTION update_updated_at_column ();