-- Step 4: Row Level Security (RLS) Policies
-- This script enables RLS and creates policies to secure all application data,
-- ensuring users can only access their own information while allowing staff appropriate access.

-- Helper function to get the current user's role from their profile.
-- This is more efficient than joining tables in every policy.
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.user_role AS $$
DECLARE
  user_role public.user_role;
BEGIN
  -- Select the role of the currently authenticated user.
  SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
COMMENT ON FUNCTION public.get_my_role() IS 'Returns the role of the currently authenticated user.';

-- 1. PROFILES TABLE
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- Users should be able to see their own profile.
CREATE POLICY "Users can view their own profile." ON public.profiles
  FOR SELECT USING (auth.uid() = id);
-- Users should be able to update their own profile.
CREATE POLICY "Users can update their own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
-- Admins and sales staff should have full access to all profiles.
CREATE POLICY "Admins and sales can manage all profiles." ON public.profiles
  FOR ALL USING (get_my_role() IN ('admin', 'sales'));

-- 2. FINANCING APPLICATIONS TABLE
ALTER TABLE public.financing_applications ENABLE ROW LEVEL SECURITY;
-- Users can perform all actions on their own applications.
CREATE POLICY "Users can manage their own applications." ON public.financing_applications
  FOR ALL USING (auth.uid() = user_id);
-- Admins and sales staff can view all applications.
CREATE POLICY "Admins and sales can view all applications." ON public.financing_applications
  FOR SELECT USING (get_my_role() IN ('admin', 'sales'));

-- 3. UPLOADED DOCUMENTS TABLE
ALTER TABLE public.uploaded_documents ENABLE ROW LEVEL SECURITY;
-- Users can manage their own documents.
CREATE POLICY "Users can manage their own documents." ON public.uploaded_documents
  FOR ALL USING (auth.uid() = user_id);
-- Admins and sales staff can view all documents.
CREATE POLICY "Admins and sales can view all documents." ON public.uploaded_documents
  FOR SELECT USING (get_my_role() IN ('admin', 'sales'));

-- 4. BANK PROFILES TABLE
ALTER TABLE public.bank_profiles ENABLE ROW LEVEL SECURITY;
-- Users can manage their own bank profile.
CREATE POLICY "Users can manage their own bank profile." ON public.bank_profiles
  FOR ALL USING (auth.uid() = user_id);
-- Admins and sales staff can view all bank profiles.
CREATE POLICY "Admins and sales can view all bank profiles." ON public.bank_profiles
  FOR SELECT USING (get_my_role() IN ('admin', 'sales'));

-- 5. LEAD TAGS TABLE
ALTER TABLE public.lead_tags ENABLE ROW LEVEL SECURITY;
-- Only admins and sales staff can manage lead tags.
CREATE POLICY "Admins and sales can manage lead tags." ON public.lead_tags
  FOR ALL USING (get_my_role() IN ('admin', 'sales'));

-- 6. LEAD TAG ASSOCIATIONS TABLE
ALTER TABLE public.lead_tag_associations ENABLE ROW LEVEL SECURITY;
-- Only admins and sales staff can manage lead tag associations.
CREATE POLICY "Admins and sales can manage lead tag associations." ON public.lead_tag_associations
  FOR ALL USING (get_my_role() IN ('admin', 'sales'));

-- 7. LEAD REMINDERS TABLE
ALTER TABLE public.lead_reminders ENABLE ROW LEVEL SECURITY;
-- Only admins and sales staff can manage lead reminders.
CREATE POLICY "Admins and sales can manage lead reminders." ON public.lead_reminders
  FOR ALL USING (get_my_role() IN ('admin', 'sales'));
