-- This is a consolidated migration file to set up the initial schema.

-- Set statement timeout to 0 to prevent timeouts during long migrations.
SET statement_timeout = 0;

-- 1. ENUMERATIONS
CREATE TYPE public.user_role AS ENUM ('user', 'admin', 'sales');

-- 2. PROFILES TABLE (linked to auth.users)
CREATE TABLE public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_at timestamptz DEFAULT now(),
    role public.user_role DEFAULT 'user',
    first_name text,
    last_name text,
    mother_last_name text,
    email text UNIQUE,
    phone text UNIQUE,
    birth_date date,
    homoclave text,
    fiscal_situation text,
    civil_status text,
    gender text,
    how_did_you_know text,
    address text,
    colony text,
    city text,
    state text,
    zip_code text,
    rfc text,
    contactado boolean DEFAULT false,
    asesor_asignado uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    source text,
    tags text[],
    has_completed_onboarding boolean DEFAULT false,
    picture_url text,
    asesor_autorizado_acceso boolean DEFAULT false,
    asesor_asignado_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    last_assigned_at timestamptz,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- 3. INVENTARIO_CACHE TABLE
CREATE TABLE public.inventario_cache (
    id bigint NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    precio numeric,
    enganche_minimo numeric,
    plazomax numeric,
    pagomensual numeric,
    original_id uuid,
    autoano numeric,
    rezago boolean,
    consigna boolean,
    promociones jsonb,
    separado boolean,
    kilometraje_compra numeric,
    kilometraje_sucursal numeric,
    vendido boolean,
    rfdm jsonb,
    fotosexterior jsonb,
    fotosinterior jsonb,
    ingreso_inventario timestamp with time zone,
    oferta numeric,
    numero_duenos numeric,
    con_oferta boolean,
    last_synced_at timestamp with time zone,
    mensualidad_recomendada numeric,
    mensualidad_minima numeric,
    autocilindros numeric,
    enganche_con_bono numeric,
    fotos_interior_url jsonb,
    fotos_exterior_url jsonb,
    "data" jsonb,
    "viewCount" integer,
    viewcount integer,
    reel_url text,
    sucursalid text,
    ubicacion text,
    sucursal text,
    descripcion text,
    tipo_de_combustible text,
    slug text,
    vin text,
    autogarantia text,
    thumbnail_webp text,
    liga_boton_con_whatsapp text,
    ordencompra text,
    foto_url text,
    additional_image_link text,
    ordenstatus text,
    description text,
    garantia text,
    feature_image text,
    record_id text,
    fotos_interior text,
    video_url text,
    factura text,
    title text,
    fotos_exterior text,
    titulometa text,
    clasificacionid text,
    featured_image_webp text,
    thumbnail text,
    internal_label text,
    custom_label_1 text,
    transmision text,
    autocombustible text,
    marca text,
    modelo text,
    enganche_recomendado text,
    autokilometraje text,
    combustible text,
    ligawp text,
    formulafinanciamiento text,
    feature_image_url text,
    autotransmision text,
    automotor text
);

-- 4. OTHER TABLES
CREATE TABLE public.agent_assignment_state (
    id int PRIMARY KEY DEFAULT 1,
    last_assigned_index int DEFAULT 0
);

CREATE TABLE public.financing_applications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status text NOT NULL DEFAULT 'draft',
    car_info jsonb,
    personal_info_snapshot jsonb,
    application_data jsonb,
    selected_banks text[],
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 5. HELPER FUNCTIONS & TRIGGERS
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, phone, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.phone,
    'user'
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_assignment_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventario_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financing_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL USING (get_my_role() = 'admin');
CREATE POLICY "profiles_sales_select" ON public.profiles FOR SELECT USING (get_my_role() = 'sales');
CREATE POLICY "profiles_user_select_self" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_user_update_self" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "agent_assignment_state_admin_all" ON public.agent_assignment_state FOR ALL USING (get_my_role() = 'admin');
CREATE POLICY "Enable read access for all users" ON public.inventario_cache FOR SELECT USING (true);
GRANT SELECT ON TABLE public.inventario_cache TO anon;

-- Policies for storage.objects table
CREATE POLICY "Admins/Sales can view all documents" ON storage.objects FOR SELECT USING (get_my_role() IN ('admin', 'sales'));
CREATE POLICY "Admins/Sales can view all CVs" ON storage.objects FOR SELECT USING (get_my_role() IN ('admin', 'sales'));

-- 7. INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_asesor_asignado_id ON public.profiles(asesor_asignado_id) WHERE asesor_asignado_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_created_at_desc ON public.profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Users can upload profile pictures
CREATE POLICY "Authenticated users can upload profile pictures" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'profile-pictures');
