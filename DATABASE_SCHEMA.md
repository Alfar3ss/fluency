# Database Schema - Fluency Platform Admin System

This document provides the exact SQL to set up all required tables for the admin system.

## SQL Migration Scripts

### 1. Admin Users Table

```sql
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_admin_user_id ON admin_users(user_id);
CREATE INDEX idx_admin_email ON admin_users(email);
```

### 2. Teacher Users Table

```sql
CREATE TABLE IF NOT EXISTS teacher_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  languages_taught TEXT,
  hourly_rate DECIMAL(10, 2) DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_teacher_user_id ON teacher_users(user_id);
CREATE INDEX idx_teacher_email ON teacher_users(email);
CREATE INDEX idx_teacher_verified ON teacher_users(is_verified);
```

### 3. Classes Table

```sql
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  language TEXT NOT NULL,
  level TEXT NOT NULL,
  teacher_id UUID REFERENCES teacher_users(id) ON DELETE SET NULL,
  schedule TEXT,
  max_students INTEGER DEFAULT 20,
  sessions_completed INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Archived')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_class_teacher_id ON classes(teacher_id);
CREATE INDEX idx_class_status ON classes(status);
CREATE INDEX idx_class_language_level ON classes(language, level);
```

### 4. Student Users Table

```sql
CREATE TABLE IF NOT EXISTS student_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  language TEXT,
  level TEXT,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'Waiting' CHECK (status IN ('Assigned', 'Waiting', 'Inactive')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_student_user_id ON student_users(user_id);
CREATE INDEX idx_student_email ON student_users(email);
CREATE INDEX idx_student_class_id ON student_users(class_id);
CREATE INDEX idx_student_status ON student_users(status);
```

### 5. Attendance Table (CRITICAL)

```sql
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES student_users(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  present BOOLEAN NOT NULL,
  marked_by TEXT, -- admin email
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(class_id, student_id, session_date)
);

CREATE INDEX idx_attendance_student_id ON attendance(student_id);
CREATE INDEX idx_attendance_class_id ON attendance(class_id);
CREATE INDEX idx_attendance_session_date ON attendance(session_date);
CREATE INDEX idx_attendance_present ON attendance(present);
CREATE INDEX idx_attendance_class_date ON attendance(class_id, session_date);
```

### 6. Payments Table (Optional - for audit trail)

```sql
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES student_users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  sessions_count INTEGER NOT NULL DEFAULT 8,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Paid', 'Cancelled')),
  confirmed_at TIMESTAMP,
  confirmed_by TEXT, -- admin email
  paid_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payment_student_id ON payments(student_id);
CREATE INDEX idx_payment_status ON payments(status);
CREATE INDEX idx_payment_created_at ON payments(created_at);
```

### 7. Payment Tracking View (Optional - for easy queries)

```sql
CREATE OR REPLACE VIEW student_payment_status AS
SELECT 
  s.id as student_id,
  s.full_name,
  s.email,
  c.name as class_name,
  COALESCE(COUNT(CASE WHEN a.present = TRUE THEN 1 END), 0) as sessions_attended,
  COALESCE(COUNT(CASE WHEN a.present = TRUE THEN 1 END), 0) % 8 as sessions_in_current_cycle,
  CASE 
    WHEN COALESCE(COUNT(CASE WHEN a.present = TRUE THEN 1 END), 0) >= 8 THEN 'Due'
    WHEN COALESCE(COUNT(CASE WHEN a.present = TRUE THEN 1 END), 0) >= 6 THEN 'Upcoming'
    ELSE 'Current'
  END as payment_status
FROM student_users s
LEFT JOIN classes c ON s.class_id = c.id
LEFT JOIN attendance a ON s.id = a.student_id
GROUP BY s.id, s.full_name, s.email, c.name;
```

## How to Apply Migrations

### Option 1: Supabase Dashboard SQL Editor
1. Go to Supabase Dashboard
2. Select your project
3. Go to "SQL Editor"
4. Click "New Query"
5. Paste each SQL block above
6. Click "Run"

### Option 2: Supabase CLI
```bash
supabase db push
```

### Option 3: Direct Connection
```bash
psql postgresql://[user]:[password]@[host]:5432/[database] < migrations.sql
```

## Key Design Decisions

### 1. Foreign Keys with Cascade Delete
- `teacher_users` → `classes`: SET NULL (preserve class history)
- `student_users` → `classes`: SET NULL (preserve enrollment history)
- `attendance` → both: CASCADE (delete old records cleanly)

### 2. Unique Constraints
- `attendance(class_id, student_id, session_date)`: Prevents duplicate attendance records
- `teacher_users(email)` & `student_users(email)`: Ensures email uniqueness
- `user_id` fields: Single auth user can only have one student/teacher account

### 3. Indexes for Performance
- `attendance(student_id)`: Frequent queries for student's attendance
- `attendance(class_id, session_date)`: Marking attendance queries
- `classes(teacher_id)`: Finding teacher's classes
- `student_users(class_id)`: Finding enrolled students

### 4. Check Constraints
- `status` fields limited to specific values (preventing typos)
- `present` must be boolean (no null values)

## Row-Level Security (RLS) Recommendations

If implementing RLS:

```sql
-- Admin can see everything
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin see all" ON admin_users FOR ALL USING (TRUE);

-- Students see only their records
ALTER TABLE student_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own data" ON student_users FOR SELECT 
  USING (auth.uid() = user_id);

-- Teachers see only their classes
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teachers see their classes" ON classes FOR SELECT
  USING (teacher_id IN (SELECT id FROM teacher_users WHERE user_id = auth.uid()));

-- Attendance visible to student/teacher/admin
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see relevant attendance" ON attendance FOR SELECT
  USING (
    student_id IN (SELECT id FROM student_users WHERE user_id = auth.uid())
    OR class_id IN (SELECT id FROM classes WHERE teacher_id IN (SELECT id FROM teacher_users WHERE user_id = auth.uid()))
    OR EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );
```

## Verification Checklist

After applying migrations, verify:

- [ ] `admin_users` table exists with sample admin account
- [ ] `teacher_users` table ready for teachers
- [ ] `student_users` table ready for students
- [ ] `classes` table created
- [ ] `attendance` table has UNIQUE constraint on (class_id, student_id, session_date)
- [ ] All indexes created
- [ ] Foreign key relationships working
- [ ] Cascade delete configured correctly

## Sample Data (Optional)

```sql
-- Insert test admin
INSERT INTO admin_users (user_id, email, role)
VALUES ('admin-uuid-here', 'admin@fluency.local', 'admin');

-- Insert test teacher
INSERT INTO teacher_users (user_id, full_name, email, languages_taught, hourly_rate, is_verified)
VALUES ('teacher-uuid-here', 'John Smith', 'john@fluency.local', 'Spanish, French', 25.00, TRUE);

-- Insert test class
INSERT INTO classes (name, language, level, teacher_id, schedule, max_students, status)
VALUES ('Spanish A1 Morning', 'Spanish', 'A1', 'teacher-uuid-here', 'Mon, Wed 10:00 AM', 15, 'Active');

-- Insert test student
INSERT INTO student_users (user_id, full_name, email, language, level, class_id, status)
VALUES ('student-uuid-here', 'Jane Doe', 'jane@fluency.local', 'Spanish', 'A1', 'class-uuid-here', 'Assigned');
```

## Performance Notes

- Attendance queries filter by `student_id` and `present=TRUE` frequently
- Session count queries use `COUNT(*)` - index on `(student_id, present)` helps
- Consider materialized view for payment status if queries slow down

## Migration Path from Old System

If migrating from existing database:

```sql
-- 1. Create new tables (using SQL above)
-- 2. Migrate data
INSERT INTO admin_users SELECT * FROM old_admin_users;
INSERT INTO teacher_users SELECT * FROM old_teachers;
INSERT INTO student_users SELECT * FROM old_students;
INSERT INTO classes SELECT * FROM old_classes;
INSERT INTO attendance SELECT * FROM old_attendance;

-- 3. Verify counts match
SELECT COUNT(*) FROM admin_users; -- should match old_admin_users
SELECT COUNT(*) FROM student_users; -- should match old_students

-- 4. Drop old tables
-- DROP TABLE old_admin_users, old_teachers, old_students, old_classes, old_attendance;
```

---

**Version**: 1.0
**Last Updated**: 2024
**Status**: Ready for Production
