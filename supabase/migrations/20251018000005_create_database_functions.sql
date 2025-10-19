-- Step 5: Database Functions (RPC)
-- This script creates the custom functions needed for application business logic,
-- such as assigning sales agents and securely fetching data for the CRM.

-- Function to find the next available sales agent in a round-robin fashion.
CREATE OR REPLACE FUNCTION public.get_next_sales_agent()
RETURNS uuid AS $$
DECLARE
  next_agent_id uuid;
BEGIN
  -- Find the sales agent who was assigned a lead the longest time ago.
  SELECT id INTO next_agent_id
  FROM public.profiles
  WHERE role = 'sales'
  ORDER BY last_assigned_at ASC NULLS FIRST
  LIMIT 1;

  RETURN next_agent_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
COMMENT ON FUNCTION public.get_next_sales_agent() IS 'Finds the next sales agent to assign a lead to.';

-- Function to assign a sales agent to a specific user.
CREATE OR REPLACE FUNCTION public.assign_advisor_to_user(p_user_id uuid)
RETURNS uuid AS $$
DECLARE
  agent_id uuid;
BEGIN
  -- Get the next available agent.
  agent_id := public.get_next_sales_agent();

  IF agent_id IS NOT NULL THEN
    -- Assign the agent to the user.
    UPDATE public.profiles
    SET asesor_asignado_id = agent_id
    WHERE id = p_user_id;

    -- Update the agent's last_assigned_at timestamp to now.
    UPDATE public.profiles
    SET last_assigned_at = now()
    WHERE id = agent_id;
  END IF;

  RETURN agent_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
COMMENT ON FUNCTION public.assign_advisor_to_user(uuid) IS 'Assigns the next available sales agent to a given user.';

-- Function to securely fetch a client's profile for the CRM.
-- Enforces access control on the backend.
CREATE OR REPLACE FUNCTION public.get_secure_client_profile(p_client_id uuid)
RETURNS SETOF public.profiles AS $$
DECLARE
  caller_role public.user_role;
  caller_id uuid;
BEGIN
  caller_id := auth.uid();
  caller_role := public.get_my_role();

  -- Admins can view any profile.
  -- Sales agents can only view profiles of users who have authorized them.
  RETURN QUERY
  SELECT * FROM public.profiles p
  WHERE p.id = p_client_id
    AND (
      caller_role = 'admin'
      OR (
        caller_role = 'sales'
        AND p.asesor_asignado_id = caller_id
        AND p.asesor_autorizado_acceso = TRUE
      )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
COMMENT ON FUNCTION public.get_secure_client_profile(uuid) IS 'Securely fetches a client profile, enforcing staff access rules.';

-- Function to get a list of leads for the admin/sales dashboard.
CREATE OR REPLACE FUNCTION public.get_leads_for_dashboard()
RETURNS TABLE(
  id uuid,
  first_name text,
  last_name text,
  email text,
  phone text,
  last_application_status text,
  created_at timestamptz
) AS $$
BEGIN
  -- Ensure only authorized staff can call this function.
  IF public.get_my_role() NOT IN ('admin', 'sales') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.first_name,
    p.last_name,
    p.email,
    p.phone,
    (
      SELECT fa.status
      FROM public.financing_applications fa
      WHERE fa.user_id = p.id
      ORDER BY fa.created_at DESC
      LIMIT 1
    ) AS last_application_status,
    p.created_at
  FROM public.profiles p
  WHERE p.role = 'user'
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
COMMENT ON FUNCTION public.get_leads_for_dashboard() IS 'Returns a list of leads for the staff dashboard.';
