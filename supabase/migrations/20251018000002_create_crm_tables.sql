-- Step 2: CRM & Lead Management Tables
-- This script creates the tables required for the CRM and lead management functionality.

-- Create the lead_tags table to define tags that can be applied to leads.
CREATE TABLE IF NOT EXISTS public.lead_tags (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tag_name text NOT NULL UNIQUE,
    color text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);
COMMENT ON TABLE public.lead_tags IS 'Defines tags that can be applied to leads (user profiles).';

-- Create the lead_tag_associations table to link tags to user profiles.
CREATE TABLE IF NOT EXISTS public.lead_tag_associations (
    lead_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tag_id uuid NOT NULL REFERENCES public.lead_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (lead_id, tag_id)
);
COMMENT ON TABLE public.lead_tag_associations IS 'Associates tags with specific leads.';

-- Create the lead_reminders table for agents to set follow-up reminders.
CREATE TABLE IF NOT EXISTS public.lead_reminders (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    agent_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    reminder_text text NOT NULL,
    reminder_date timestamp with time zone NOT NULL,
    is_completed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);
COMMENT ON TABLE public.lead_reminders IS 'Stores follow-up reminders for leads.';
