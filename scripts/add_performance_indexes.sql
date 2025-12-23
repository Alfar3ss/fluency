-- Performance indexes for faster queries
-- Run this in your Supabase SQL Editor

-- Index on student_users.class_id for faster class student lookups
CREATE INDEX IF NOT EXISTS idx_student_users_class_id 
ON student_users(class_id);

-- Index on student_users for unassigned students (class_id is null)
CREATE INDEX IF NOT EXISTS idx_student_users_no_class 
ON student_users(class_id) 
WHERE class_id IS NULL;

-- Index on admin_users.user_id for faster admin checks
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id 
ON admin_users(user_id);

-- Index on teacher_users.user_id for faster teacher lookups
CREATE INDEX IF NOT EXISTS idx_teacher_users_user_id 
ON teacher_users(user_id);

-- Index on classes for faster filtering and sorting
CREATE INDEX IF NOT EXISTS idx_classes_status 
ON classes(status);

CREATE INDEX IF NOT EXISTS idx_classes_created_at 
ON classes(created_at DESC);

-- Composite index for student searches
CREATE INDEX IF NOT EXISTS idx_student_users_search 
ON student_users(full_name, email);

-- Analyze tables to update statistics for query planner
ANALYZE student_users;
ANALYZE classes;
ANALYZE admin_users;
ANALYZE teacher_users;
