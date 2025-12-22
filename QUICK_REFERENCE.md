# Quick Reference Guide - Admin System

## 🚀 Getting Started

### Prerequisites
- ✅ Supabase account and project created
- ✅ Admin login page already built (`/admin/page.tsx`)
- ✅ Auth system working
- ✅ Admin user in `admin_users` table

### Setup Steps

1. **Set up database schema**
   - Copy SQL from `DATABASE_SCHEMA.md`
   - Run in Supabase SQL Editor
   - Verify tables created

2. **Add test data**
   ```sql
   -- Create test admin account
   INSERT INTO admin_users (user_id, email, role)
   VALUES ('your-user-id', 'your-email@test.com', 'admin');
   ```

3. **Navigate to admin panel**
   - Go to `/admin` to login
   - Enter admin credentials
   - Click "Go to Dashboard"
   - Access all sub-pages from sidebar

## 📍 Page URLs

| Page | URL | Purpose |
|------|-----|---------|
| Dashboard | `/admin/home` | Overview, alerts, quick navigation |
| Students List | `/admin/home/students` | Manage all students |
| Student Detail | `/admin/home/students/[id]` | Individual student profile |
| Teachers List | `/admin/home/teachers` | Manage all teachers |
| Teacher Detail | `/admin/home/teachers/[id]` | Individual teacher profile |
| Classes List | `/admin/home/classes` | Manage all classes |
| Class Detail | `/admin/home/classes/[id]` | Individual class with students |
| Mark Attendance | `/admin/home/attendance` | Record session attendance |
| Payments | `/admin/home/payments` | View payment status |
| Payment Detail | `/admin/home/payments/[id]` | Individual student payment |

## 🔑 Key Features by Page

### `/admin/home/students`
- **Add Student**: Modal form captures full_name, email, language, level, class_id
- **Edit Student**: Inline form to update details
- **Delete Student**: One-click removal with confirmation
- **View Payment Status**: Color badges show Due/Upcoming/Current
- **Session Count**: Real-time from attendance records

### `/admin/home/attendance` ⭐ MOST IMPORTANT
- **Select Class**: Dropdown of active classes
- **Pick Session Date**: Calendar picker
- **Check Attendance**: Checkbox list of enrolled students
- **Save**: Upserts attendance records
- **Auto-calculates**: Session counts for payment tracking

### `/admin/home/payments`
- **View All**: Every student with payment status
- **Filter**: By status (Due/Upcoming/Current)
- **Search**: By name or email
- **Payment Status**:
  - 8+ sessions = "Due" (red)
  - 6-7 sessions = "Upcoming" (amber)
  - 0-5 sessions = "Current" (green)

### `/admin/home/classes`
- **Create Class**: Assign teacher, set capacity, schedule
- **Edit Class**: Update any field, change teacher
- **Capacity**: Visual progress bar, capacity warnings
- **Sessions**: Auto-increment based on attendance

### `/admin/home/teachers`
- **Add Teacher**: Set hourly rate, languages, email
- **Payment Due**: Auto-calculated (sessions × hourly_rate)
- **Classes Assigned**: Quick count of active classes
- **Verification**: Toggle verified status

## 🔄 Payment Workflow

```
1. Admin marks attendance in class
   ↓
2. Student's session count increments
   ↓
3. After 8 sessions → Payment status changes to "Due"
   ↓
4. Admin goes to Payments page
   ↓
5. Sees student with status "Due"
   ↓
6. Clicks "View Details"
   ↓
7. Clicks "Mark Payment Confirmed"
   ↓
8. Counter resets, cycle repeats
```

## 📊 Calculation Formulas

### Student Payment Status
```javascript
const sessions = attendance.filter(a => a.student_id === id && a.present).length;
const status = 
  sessions >= 8 ? "Due" :
  sessions >= 6 ? "Upcoming" :
  "Current";
```

### Teacher Payment Due
```javascript
const paid = hourly_rate * sessions_taught;
```

### Class Capacity
```javascript
const percent = (enrolled_students / max_students) * 100;
```

### Attendance Rate
```javascript
const rate = (present_count / total_count) * 100;
```

## 🔒 Access Control

All pages check:

```javascript
// 1. Session exists
const session = await supabase.auth.getSession();

// 2. User is admin
const admin = await supabase
  .from("admin_users")
  .select("*")
  .eq("user_id", session.user.id)
  .single();

// If checks fail → redirect to /admin login
```

## 💾 Data Flow

```
Auth (Supabase)
    ↓
Admin Verification (admin_users table)
    ↓
Query Students/Teachers/Classes
    ↓
Mark Attendance (attendance table)
    ↓
Auto-calculate Session Counts
    ↓
Update Payment Status (derived, not stored)
    ↓
Show Alerts & Summaries
```

## 🎯 Common Tasks

### Add a New Student
1. Go to `/admin/home/students`
2. Click "➕ Add Student"
3. Fill form: name, email, language, level
4. Select class (optional)
5. Click "Create Student"
6. Auto-password sent to email

### Mark Attendance for a Class
1. Go to `/admin/home/attendance`
2. Select class from dropdown
3. Pick session date
4. Check students who were present
5. Click "✓ Save Attendance"
6. Student's session count increments

### Confirm a Payment
1. Go to `/admin/home/payments`
2. Filter by "Due"
3. Click "View Details" on student
4. Click "✓ Mark Payment Confirmed"
5. Session counter resets to 0
6. Ready for next 8-session cycle

### Create a New Class
1. Go to `/admin/home/classes`
2. Click "➕ Create Class"
3. Fill: name, language, level, teacher
4. Set max students and schedule
5. Click "Create Class"
6. Add students by editing each student

### Assign Teacher to Class
1. Go to `/admin/home/classes`
2. Click "Edit" on class
3. Change "Teacher" dropdown
4. Click "Save Changes"
5. All attendance now tracked to new teacher

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't login to admin | Check admin_users table has your user_id |
| Students not showing | Verify student_users table has data |
| No attendance records | Make sure attendance table exists and is empty initially |
| Payment status not updating | Check attendance.present = true (not false) |
| Missing teacher in dropdown | Make sure teacher_users.is_verified = true |
| Can't mark attendance | Select both class AND session date |

## 📈 Performance Tips

- **Large classes**: Use pagination on students list (showing 10 per page)
- **Many attendance records**: Filter by date range in detail view
- **Slow queries**: Check Supabase query performance tab
- **Real-time updates**: Refresh page to see latest data

## 🎓 Example Scenario

```
Step 1: Create Class "Spanish A1"
- Teacher: John Smith
- Max: 20 students
- Schedule: Mon, Wed 10:00 AM

Step 2: Add Students
- Jane Doe → class_id = Spanish A1
- Bob Smith → class_id = Spanish A1
- Alice Johnson → class_id = Spanish A1

Step 3: First Session (Monday)
- Go to Attendance page
- Select "Spanish A1"
- Pick today's date
- Check: Jane (present), Bob (present), Alice (absent)
- Click "Save Attendance"
→ Jane: 1 session, Bob: 1 session, Alice: 0 sessions

Step 4: Continue for 7 more sessions
- Repeat Step 3, seven more times
- Each time, session counts increment

Step 5: After 8th Session
- Go to Payments page
- See Jane & Bob with status "Due"
- See Alice with status "Current" (0 sessions)

Step 6: Confirm Payments
- Click Jane → "View Details"
- See all 8 attendance records
- Click "Mark Payment Confirmed"
- Jane's counter resets to 0
- Ready for next payment cycle

Step 7: Payment to Teacher
- Go to Teachers page
- See John Smith with "Sessions Taught: 8"
- Payment due = 8 × $25/hr = $200
```

## 📞 Support

For issues or questions:
1. Check DATABASE_SCHEMA.md for table structure
2. Review ADMIN_SYSTEM_SUMMARY.md for feature overview
3. Verify Supabase tables have correct columns
4. Check browser console for error messages

---

**Quick Links**:
- [Admin System Summary](./ADMIN_SYSTEM_SUMMARY.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [Supabase Dashboard](https://app.supabase.com)

**Status**: ✅ Ready to Use
**Version**: 1.0
