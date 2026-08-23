# Testing Guide - Dental Clinic Management System

## Pre-Testing Checklist

### 1. Environment Setup
- [ ] Create `.env` file in project root with:
  ```
  VITE_SUPABASE_URL=https://mvwvnxoweiiwshfzjdcc.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12d3ZueG93ZWlpd3NoZnpqZGNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MTM0NzUsImV4cCI6MjA4MDA4OTQ3NX0._LGQDyUnVRj7BzJqjdffMdE2woTugA4lQTNJ7OHEVZY
  ```

### 2. Database Migrations
- [ ] Run `20251201175219_complete_dental_system_setup.sql` on Supabase
- [ ] Run `20251201180000_fix_staff_creation_and_rls.sql` on Supabase
- [ ] Create admin user (if not exists):
  ```sql
  DO $$
  DECLARE
    admin_id uuid;
  BEGIN
    admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, created_at, updated_at
    ) VALUES (
      admin_id, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated',
      'authenticated', 'admin@clinic.com', crypt('admin123', gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}', '{}', false,
      now(), now()
    );
    INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
    VALUES (admin_id, 'admin@clinic.com', 'Clinic Admin', 'admin', now(), now());
  END $$;
  ```

## Testing Steps

### Test 1: Login
1. Open the application in browser (usually http://localhost:5173)
2. Enter credentials:
   - Email: `admin@clinic.com`
   - Password: `admin123`
3. Click "Sign In"
4. **Expected:** Should successfully log in and redirect to dashboard

### Test 2: Create Staff Member (FIXED ISSUE)
1. Navigate to "Staff Management" from the sidebar
2. Click "Add Staff" button
3. Fill in the form:
   - Full Name: `Dr. John Doe`
   - Email: `doctor@clinic.com`
   - Password: `doctor123`
   - Phone: `123-456-7890`
   - Role: `Doctor`
4. Click "Add Staff"
5. **Expected:** 
   - ✅ Staff member created successfully
   - ✅ No "Signups not allowed" error
   - ✅ New staff appears in the staff list

### Test 3: Create Patient (FIXED ISSUE)
1. Navigate to "Patient Management" from the sidebar
2. Click "Add Patient" button
3. Fill in the form:
   - Full Name: `Jane Smith`
   - Phone: `555-1234`
   - Date of Birth: `1990-01-15` (optional)
   - Address: `123 Main St` (optional)
   - Notes: `Regular checkup patient` (optional)
4. Click "Add Patient"
5. **Expected:**
   - ✅ Patient created successfully
   - ✅ No RLS policy violation error
   - ✅ New patient appears in the patient list

### Test 4: Verify Staff List
1. Go to Staff Management
2. **Expected:** Should see:
   - Admin user (admin@clinic.com)
   - Any newly created staff members

### Test 5: Verify Patient List
1. Go to Patient Management
2. **Expected:** Should see:
   - Any newly created patients
   - Search functionality works

## Common Issues & Solutions

### Issue: "Signups not allowed"
- **Solution:** Make sure you've run the migration `20251201180000_fix_staff_creation_and_rls.sql`
- The `create_staff_member()` function should be available

### Issue: "RLS policy violation"
- **Solution:** 
  1. Verify you're logged in as admin or receptionist
  2. Check that the migration updated the RLS policies
  3. Verify `auth.uid()` is working (check browser console)

### Issue: Environment variables not loading
- **Solution:**
  1. Make sure `.env` file is in the project root
  2. Restart the dev server after creating `.env`
  3. Check browser console for Supabase connection errors

### Issue: Cannot connect to Supabase
- **Solution:**
  1. Verify the Supabase URL is correct
  2. Check your internet connection
  3. Verify the anon key is correct
  4. Check Supabase dashboard to ensure instance is active

## Browser Console Checks

Open browser DevTools (F12) and check:
- ✅ No red errors in Console tab
- ✅ Network tab shows successful requests to Supabase
- ✅ No CORS errors
- ✅ Authentication requests return 200 status

## Success Criteria

All tests pass if:
- ✅ Login works without errors
- ✅ Staff creation works without "Signups not allowed" error
- ✅ Patient creation works without RLS policy errors
- ✅ Data persists (refresh page, data should still be there)
- ✅ No console errors in browser DevTools

## Next Steps After Testing

If all tests pass:
1. Create additional staff members (doctors, receptionists)
2. Create more patients
3. Test appointment scheduling
4. Test payment recording
5. Test medical history management

If tests fail:
1. Check browser console for specific error messages
2. Verify all migrations were run successfully
3. Check Supabase dashboard for any errors
4. Review the error message and refer to FIXES_APPLIED.md

