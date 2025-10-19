-- Step 1: Enums & Core Tables
-- This script creates the necessary user roles and the core tables for managing user profiles and applications.

-- Create a custom type for user roles to ensure data consistency.
CREATE TYPE public.user_role AS ENUM (
    'user',
    'admin',
    'sales'
);

-- Create the profiles table to store user information.
-- This table is linked to the auth.users table and will be populated automatically by a trigger.
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_at timestamp with time zone,
    email character varying(255) UNIQUE,
    first_name character varying(255),
    last_name character varying(255),
    phone character varying(255),
    role user_role DEFAULT 'user'::user_role,
    picture_url text,
    mother_last_name character varying(255),
    birth_date date,
    homoclave character varying(3),
    rfc character varying(13),
    fiscal_situation character varying(255),
    civil_status character varying(255),
    gender character varying(255),
    how_did_you_know text,
    address text,
    colony text,
    city text,
    state text,
    zip_code character varying(5),
    asesor_autorizado_acceso boolean DEFAULT false,
    asesor_asignado_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    last_assigned_at timestamp with time zone DEFAULT now(),
    metadata jsonb
);
COMMENT ON TABLE public.profiles IS 'Stores public user profile information.';

-- Create the financing_applications table to store user loan applications.
CREATE TABLE IF NOT EXISTS public.financing_applications (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    status character varying(255) DEFAULT 'draft'::character varying,
    application_data jsonb,
    personal_info_snapshot jsonb,
    car_info jsonb,
    selected_banks text[],
    documents_pending boolean DEFAULT true
);
COMMENT ON TABLE public.financing_applications IS 'Stores user financing applications.';

-- Create the uploaded_documents table to store information about user-uploaded files.
CREATE TABLE IF NOT EXISTS public.uploaded_documents (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    application_id uuid REFERENCES public.financing_applications(id) ON DELETE CASCADE,
    file_name text NOT NULL,
    file_path text NOT NULL,
    document_type character varying(255),
    created_at timestamp with time zone DEFAULT now()
);
COMMENT ON TABLE public.uploaded_documents IS 'Tracks documents uploaded by users.';

-- Create the bank_profiles table to store user bank profiling information.
CREATE TABLE IF NOT EXISTS public.bank_profiles (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_complete boolean DEFAULT false,
    respuestas jsonb,
    banco_recomendado text,
    banco_segunda_opcion text
);
COMMENT ON TABLE public.bank_profiles IS 'Stores user bank profiling survey results.';
