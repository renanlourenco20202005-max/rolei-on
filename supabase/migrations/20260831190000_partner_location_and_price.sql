-- Localização do estabelecimento do parceiro (capturada via geolocalização
-- do navegador no momento do cadastro, já que o parceiro normalmente está
-- fisicamente no local ao preencher o perfil).
ALTER TABLE public.partner_profiles
  ADD COLUMN latitude DOUBLE PRECISION,
  ADD COLUMN longitude DOUBLE PRECISION,
  ADD COLUMN price TEXT NOT NULL DEFAULT '$$' CHECK (price IN ('$', '$$', '$$$', '$$$$'));

-- Garante no máximo 1 place público por parceiro (modelo atual: 1 parceiro = 1 local).
CREATE UNIQUE INDEX places_partner_id_unique ON public.places (partner_id) WHERE partner_id IS NOT NULL;
