
-- Partner profile table (one row per authenticated partner)
CREATE TABLE public.partner_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Bar',
  description TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  hours TEXT NOT NULL DEFAULT '',
  whatsapp TEXT NOT NULL DEFAULT '',
  instagram TEXT NOT NULL DEFAULT '',
  cover TEXT NOT NULL DEFAULT '',
  photos JSONB NOT NULL DEFAULT '[]'::jsonb,
  promos JSONB NOT NULL DEFAULT '[]'::jsonb,
  events JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_profiles TO authenticated;
GRANT ALL ON public.partner_profiles TO service_role;

ALTER TABLE public.partner_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partner can view own profile"
  ON public.partner_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Partner can insert own profile"
  ON public.partner_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Partner can update own profile"
  ON public.partner_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Partner can delete own profile"
  ON public.partner_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_partner_profiles_updated_at
  BEFORE UPDATE ON public.partner_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create partner profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_partner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.partner_profiles (user_id, name, category)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'business_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'business_category', 'Bar')
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_partner
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_partner();
