-- Check for and drop any existing triggers on auth.users
do $$
declare
  trigger_rec record;
begin
  for trigger_rec in 
    select trigger_name, event_object_table
    from information_schema.triggers
    where event_object_schema = 'auth' and event_object_table = 'users'
  loop
    execute format('drop trigger if exists %I on auth.users cascade', trigger_rec.trigger_name);
    raise notice 'Dropped trigger: %', trigger_rec.trigger_name;
  end loop;
end$$;

-- Drop common trigger functions that might exist
drop function if exists public.handle_new_user() cascade;
drop function if exists public.create_profile_for_user() cascade;
