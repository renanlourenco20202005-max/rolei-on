-- Perfis de parceiro são vitrines públicas: leitura anônima para o Guia Rolei e catálogo
GRANT SELECT ON public.partner_profiles TO anon;

CREATE POLICY "Public can view partner profiles"
ON public.partner_profiles
FOR SELECT
TO anon
USING (true);