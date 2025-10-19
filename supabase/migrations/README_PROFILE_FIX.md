# Profile Creation Fix - Database Migration

## Problem

The application was experiencing infinite RLS (Row Level Security) errors when trying to create user profiles:

```
Error: new row violates row-level security policy for table "profiles"
```

This happened because the client-side code (AuthContext.tsx) was trying to directly INSERT into the `profiles` table, but RLS policies prevented this for security reasons.

## Solution

This migration creates a **database trigger** that automatically creates profiles when new users sign up. The trigger runs with elevated privileges (`SECURITY DEFINER`) and bypasses RLS, which is the correct and secure way to handle profile creation.

## What This Migration Does

1. **Creates a trigger function** (`handle_new_user()`) that:
   - Runs automatically when a new user signs up via `auth.users`
   - Determines the user's role (admin for specific emails, user for everyone else)
   - Creates a profile in `public.profiles` with all necessary fields
   - Handles duplicate prevention with `ON CONFLICT DO NOTHING`

2. **Updates RLS policies** to:
   - Prevent direct client-side INSERT into profiles (security)
   - Allow users to SELECT and UPDATE their own profiles
   - Allow admins full access to all profiles
   - Allow sales staff to view all profiles

3. **Updates the client code** (AuthContext.tsx) to:
   - Remove all profile creation logic (now handled server-side)
   - Simply fetch profiles without trying to create them
   - Provide clear error messages if something goes wrong

## How to Apply This Migration

### Option 1: Using Supabase CLI (Recommended)

If you have the Supabase CLI installed and configured:

```bash
# Navigate to your project root
cd /Users/marianomorales/Downloads/ultima

# Apply the migration
supabase db push

# Or if you're using migrations
supabase migration up
```

### Option 2: Using Supabase Dashboard (Manual)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file: `supabase/migrations/20251015000002_fix_profile_creation_trigger.sql`
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click **Run**

### Option 3: Using psql (Direct Database Access)

If you have direct database access:

```bash
# Connect to your database
psql "your-connection-string"

# Run the migration
\i supabase/migrations/20251015000002_fix_profile_creation_trigger.sql
```

## Verification

After applying the migration, verify it worked:

### 1. Check the Trigger Exists

Run this SQL query in your Supabase SQL Editor:

```sql
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

You should see one row with the trigger information.

### 2. Check the Function Exists

```sql
SELECT
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';
```

You should see `security_type = 'DEFINER'`.

### 3. Test with a New User

1. Sign up a new test user in your application
2. Check the browser console - you should see:
   ```
   ✅ Profile loaded successfully
   ```
3. No more RLS policy violation errors!

### 4. Check Existing Users

For existing users who might not have profiles, you can manually trigger profile creation:

```sql
-- This will attempt to create profiles for any auth.users without profiles
INSERT INTO public.profiles (
    id, email, first_name, last_name, phone, role, metadata, created_at, updated_at
)
SELECT
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'first_name', SPLIT_PART(u.raw_user_meta_data->>'full_name', ' ', 1)),
    COALESCE(u.raw_user_meta_data->>'last_name', NULLIF(SUBSTRING(u.raw_user_meta_data->>'full_name' FROM POSITION(' ' IN u.raw_user_meta_data->>'full_name') + 1), '')),
    u.phone,
    CASE
        WHEN u.email IN ('marianomorales@outlook.com', 'mariano.morales@autostrefa.mx', 'genauservices@gmail.com')
        THEN 'admin'
        ELSE 'user'
    END,
    COALESCE(u.raw_user_meta_data, '{}'::jsonb),
    NOW(),
    NOW()
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
```

## Expected Behavior After Migration

### Before (Client-Side Creation)
```
❌ Profile creation failed due to RLS policy
❌ Error: new row violates row-level security policy
[Infinite loop of errors...]
```

### After (Trigger-Based Creation)
```
✅ Profile loaded successfully
```

Clean console, no errors, profiles created automatically on signup.

## Troubleshooting

### Issue: "Profile not found" persists after signup

**Solution**: The trigger might not have fired. Check:

```sql
-- Verify trigger is enabled
SELECT * FROM pg_trigger
WHERE tgname = 'on_auth_user_created';
```

If `tgenabled` is not 'O' (origin), enable it:

```sql
ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;
```

### Issue: RLS errors still appearing

**Solution**: The old RLS policies might still allow INSERT. Run:

```sql
-- Remove any policies that allow users to insert their own profiles
DROP POLICY IF EXISTS "profiles_user_insert_self" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON public.profiles;
```

### Issue: Admin users not being created with admin role

**Solution**: Update the admin emails list in the trigger function:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    user_role TEXT := 'user';
    admin_emails TEXT[] := ARRAY[
        'your-admin-email@example.com',
        'another-admin@example.com'
    ];
BEGIN
    -- ... rest of function
END;
$$;
```

## Files Modified

### Database
- `supabase/migrations/20251015000002_fix_profile_creation_trigger.sql` (NEW)

### Frontend
- `src/context/AuthContext.tsx` (MODIFIED)
  - Removed profile creation logic
  - Simplified error handling
  - Removed `profileCreationFailed` state

## Security Benefits

1. **RLS Properly Enforced**: Users can't create profiles for other users
2. **No Client-Side Bypass**: Profile creation happens server-side only
3. **Audit Trail**: All profile creations go through the trigger
4. **Role Protection**: Users can't escalate their own roles
5. **Atomic Operations**: Profile creation happens in the same transaction as user creation

## Rollback (If Needed)

If you need to rollback this migration:

```sql
-- Drop the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Re-enable client-side inserts (NOT RECOMMENDED)
CREATE POLICY "profiles_user_insert_self" ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);
```

Note: Rolling back is NOT recommended as it re-introduces the security vulnerability.

## Questions?

If you encounter issues:

1. Check the Supabase logs in your dashboard (Logs → Postgres Logs)
2. Look for trigger execution errors
3. Verify RLS policies with: `SELECT * FROM pg_policies WHERE tablename = 'profiles';`
4. Check auth.users vs profiles count:
   ```sql
   SELECT
       (SELECT COUNT(*) FROM auth.users) as users_count,
       (SELECT COUNT(*) FROM public.profiles) as profiles_count;
   ```

Both counts should match after the migration and backfill.
