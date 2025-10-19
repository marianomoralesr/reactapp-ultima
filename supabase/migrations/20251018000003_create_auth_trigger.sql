-- Step 3: Auth Trigger
-- This script creates the function and trigger to automatically create a user profile
-- in the public.profiles table when a new user signs up in the auth.users table.

-- Create the function to handle the new user creation.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, metadata)
  VALUES (
    NEW.id,
    NEW.email,
    -- Assign 'admin' role if the email matches the specified list, otherwise 'user'.
    CASE
        WHEN NEW.email IN ('marianomorales@outlook.com', 'mariano.morales@autostrefa.mx', 'genauservices@gmail.com')
        THEN 'admin'::public.user_role
        ELSE 'user'::public.user_role
    END,
    NEW.raw_user_meta_data
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a profile for a new user.';

-- Create the trigger to call the function after a new user is created.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
