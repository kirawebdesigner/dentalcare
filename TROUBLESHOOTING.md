# Troubleshooting Guide

For architecture details, see [FIXES_APPLIED.md](./FIXES_APPLIED.md).  
For initial setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md).

## Quick Diagnostics

### Step 1: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for:
   - ✅ `🔗 Supabase URL: https://your-project.supabase.co`
   - ✅ `🔑 Supabase Key: Set`
   - ❌ Any red error messages

### Step 2: Verify Environment Variables
Check that `.env` file exists in project root with:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Step 3: Verify Dev Server
Check terminal where you ran `npm run dev`:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

## Common Issues

### Issue: Blank Page
**Solutions:**
1. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Check browser console for specific errors
4. Verify `.env` file exists with correct values
5. Restart dev server: Stop (Ctrl+C) and run `npm run dev` again

### Issue: "Cannot connect to Supabase"
**Solutions:**
1. Verify `.env` file has correct credentials
2. Check Supabase instance is active
3. Verify network connection
4. Check browser console for specific error messages

### Issue: "Invalid email or password"
**Solutions:**
1. Verify you're using the correct admin credentials:
   - Email: `your-admin-email@example.com`
   - Password: `use-a-unique-password`
2. Check that the migration has been run successfully
3. Verify the admin user exists in the database

### Issue: "Row-level security policy violation"
**Solutions:**
1. Ensure the comprehensive migration (`20251206000000_complete_system_reset.sql`) has been run
2. Verify RLS policies are enabled on all tables
3. Check that user is properly authenticated (check `auth.uid()`)
4. Verify user role in `profiles` table matches expected role

### Issue: "Cannot create staff member"
**Solutions:**
1. Verify you're logged in as admin
2. Check that `the create-staff Edge Function` function exists in database
3. Verify RLS policies allow admin to create staff
4. Check browser console for specific error messages

### Issue: JavaScript/TypeScript Errors
**Solutions:**
1. Check exact error message in browser console
2. Ensure all dependencies are installed: `npm install`
3. Try clearing node_modules and reinstalling:
   ```bash
   Remove-Item -Recurse -Force node_modules, package-lock.json
   npm install
   ```
4. Restart dev server

### Issue: "Cannot find module" errors
**Solutions:**
1. Run `npm install` to ensure all dependencies are installed
2. Restart dev server
3. Check that all import paths are correct
4. Verify TypeScript configuration

## Database Issues

### Issue: Migration fails
**Solutions:**
1. Check Supabase Dashboard for error messages
2. Verify you have proper database permissions
3. Ensure no conflicting migrations exist
4. Try running the comprehensive migration (`20251206000000_complete_system_reset.sql`) in Supabase SQL Editor

### Issue: Tables don't exist
**Solutions:**
1. Verify migration has been run successfully
2. Check Supabase Dashboard → Table Editor
3. Re-run the comprehensive migration if needed

### Issue: RLS policies not working
**Solutions:**
1. Verify RLS is enabled on all tables
2. Check that policies reference `auth.uid()` correctly
3. Ensure user is authenticated before accessing data
4. Verify user role in `profiles` table

## Development Server Issues

### Issue: Dev server won't start
**Solutions:**
1. Check if port 5173 is already in use
2. Kill existing node processes if needed:
   ```powershell
   Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force
   ```
3. Try a different port: `npm run dev -- --port 3000`

### Issue: Changes not reflecting
**Solutions:**
1. Hard refresh browser (Ctrl+Shift+R)
2. Clear browser cache
3. Restart dev server
4. Check for build errors in terminal

## Debug Commands

```powershell
# Check if dev server is running
netstat -ano | findstr :5173

# Kill all node processes (if needed)
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force

# Restart dev server
npm run dev

# Check TypeScript errors
npm run typecheck

# Verify dependencies
npm list --depth=0

# Clear and reinstall dependencies
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```

## Getting Help

If issues persist:
1. **Check browser console** - Share exact error messages
2. **Check terminal output** - Look for build/compilation errors
3. **Verify setup** - Ensure migration has been run and `.env` file exists
4. **Check Supabase Dashboard** - Verify database state and connection

## Verification Checklist

After setup, verify:
- [ ] Browser console shows Supabase connection info
- [ ] No red errors in console
- [ ] Login page appears (not blank)
- [ ] Can login with admin credentials
- [ ] Dashboard loads after login
- [ ] Can create staff members (admin)
- [ ] Can create patients (admin/receptionist)
- [ ] Can schedule appointments
- [ ] RLS policies enforce role-based access
