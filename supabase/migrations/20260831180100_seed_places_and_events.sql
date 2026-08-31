-- Seed inicial: mesmos locais que hoje estão mockados no front-end,
-- agora como dados reais no banco, com coordenadas de São Paulo.

INSERT INTO public.places
  (id, name, category, description, image_url, latitude, longitude, address, neighborhood, city, hours, whatsapp, instagram, price, rating, reviews_count, tags, vibes, promo_text, is_sponsored)
VALUES
  (gen_random_uuid(), 'Lapidado Bar', 'Bar',
   'Coquetelaria autoral em um ambiente intimista, com drinks assinados pelo bartender Caio Souza e trilha sonora analógica.',
   'https://picsum.photos/seed/lapidado-bar/800/1000',
   -23.5558, -46.6896, 'R. Aspicuelta, 421 — Vila Madalena', 'Vila Madalena', 'São Paulo',
   'Ter–Dom · 18h–02h', '+55 11 99999-1234', '@lapidadobar', '$$', 4.8, 1243,
   ARRAY['Coquetelaria', 'Ambiente intimista'], ARRAY['romântico', 'casal', 'drinks', 'intimista'],
   '2x1 em drinks autorais até 20h', false),

  (gen_random_uuid(), 'Vinil Music Club', 'Música ao vivo',
   'Casa de shows independente com programação semanal de jazz, blues e MPB instrumental.',
   'https://picsum.photos/seed/vinil-music-club/800/1000',
   -23.5535, -46.6627, 'R. Augusta, 1508 — Consolação', 'Consolação', 'São Paulo',
   'Qua–Sáb · 20h–03h', '+55 11 99988-7766', '@vinilmusicclub', '$$$', 4.7, 892,
   ARRAY['Jazz', 'Blues', 'Show ao vivo'], ARRAY['música', 'show', 'amigos'],
   NULL, true),

  (gen_random_uuid(), 'Fogo & Lenha', 'Restaurante',
   'Cozinha brasileira contemporânea no fogo de chão, com carta de vinhos naturais selecionada pela sommelier Marina Reis.',
   'https://picsum.photos/seed/fogo-e-lenha/800/1000',
   -23.5651, -46.6820, 'R. Joaquim Antunes, 204 — Pinheiros', 'Pinheiros', 'São Paulo',
   'Ter–Dom · 19h–00h', '+55 11 98877-6655', '@fogoelenha', '$$$', 4.9, 2104,
   ARRAY['Cozinha de fogo', 'Vinhos naturais'], ARRAY['romântico', 'casal', 'vinho', 'jantar'],
   NULL, false),

  (gen_random_uuid(), 'Sol Rooftop', 'Bar',
   'Rooftop com vista 360º da cidade, especializado em chopes artesanais e petiscos compartilháveis.',
   'https://picsum.photos/seed/sol-rooftop/800/1000',
   -23.5615, -46.6558, 'Av. Paulista, 2073 — 22º andar', 'Bela Vista', 'São Paulo',
   'Seg–Dom · 17h–01h', '+55 11 91234-5678', '@solrooftop', '$$', 4.6, 1567,
   ARRAY['Rooftop', 'Happy Hour'], ARRAY['happy hour', 'amigos', 'rooftop', 'chope'],
   'Happy Hour 17h–20h · chope pela metade', false),

  (gen_random_uuid(), 'Neon Underground', 'Festa',
   'Pista subterrânea com line-up internacional de house e techno. Open bar até meia-noite às sextas.',
   'https://picsum.photos/seed/neon-underground/800/1000',
   -23.5673, -46.6912, 'R. dos Pinheiros, 612 — Pinheiros', 'Pinheiros', 'São Paulo',
   'Sex–Sáb · 23h–06h', '+55 11 95555-2222', '@neonunderground', '$$$', 4.5, 980,
   ARRAY['House', 'Techno', 'Open Bar'], ARRAY['festa', 'balada', 'amigos', 'música'],
   NULL, false),

  (gen_random_uuid(), 'Morro Café', 'Café',
   'Café de origem com grãos torrados na casa e brunch servido o dia inteiro.',
   'https://picsum.photos/seed/morro-cafe/800/1000',
   -23.5545, -46.6910, 'R. Harmonia, 88 — Vila Madalena', 'Vila Madalena', 'São Paulo',
   'Seg–Dom · 08h–20h', '+55 11 97777-3333', '@morrocafe', '$', 4.9, 3450,
   ARRAY['Especialidade', 'Brunch'], ARRAY['café', 'sozinho', 'trabalhar', 'brunch'],
   NULL, false),

  (gen_random_uuid(), 'Tora Burger', 'Gastronomia',
   'Smash burgers de carne maturada e mais de 30 rótulos de cerveja artesanal.',
   'https://picsum.photos/seed/tora-burger/800/1000',
   -23.5679, -46.6885, 'R. Fradique Coutinho, 1402', 'Pinheiros', 'São Paulo',
   'Ter–Dom · 18h–00h', '+55 11 96666-1111', '@toraburger', '$$', 4.7, 2890,
   ARRAY['Burger', 'Cerveja artesanal'], ARRAY['amigos', 'burger', 'cerveja', 'gastronomia'],
   'Combo burger + chope por R$ 49', false),

  (gen_random_uuid(), 'Aurora After Hours', 'After',
   'O point oficial de quem não quer que a noite acabe: pista envolvente, sunrise sets e café da manhã na saída.',
   'https://picsum.photos/seed/aurora-after/800/1000',
   -23.5410, -46.6335, 'R. Mateus Leme, 1250 — Centro', 'Centro', 'São Paulo',
   'Sáb–Dom · 04h–12h', '+55 11 94444-8888', '@auroraafterhours', '$$', 4.6, 754,
   ARRAY['Sunrise set', 'Madrugada'], ARRAY['after', 'balada', 'madrugada', 'música'],
   'Entrada free com pulseira de festa parceira', false);

-- Eventos, ligados aos places acima pelo nome (via CTE) quando aplicável
WITH p AS (SELECT id, name FROM public.places)
INSERT INTO public.events
  (place_id, title, category, image_url, venue_name, starts_at, is_free, price_text, is_sponsored)
SELECT
  p.id, v.title, v.category, v.image_url, v.venue_name, v.starts_at, v.is_free, v.price_text, v.is_sponsored
FROM (VALUES
  ('Feira Noturna do Beco', 'Cultural', 'https://picsum.photos/seed/feira-noturna/800/1000', 'Beco do Batman — Vila Madalena', (CURRENT_DATE + TIME '19:00')::timestamptz, true, NULL::text, false, NULL::text),
  ('Marina Reis Trio · Jazz ao vivo', 'Música', 'https://picsum.photos/seed/jazz-trio/800/1000', 'Vinil Music Club', (CURRENT_DATE + TIME '21:00')::timestamptz, false, 'R$ 40', true, 'Vinil Music Club'),
  ('Sunset Sessions · DJ Lia', 'Música', 'https://picsum.photos/seed/sunset-sessions/800/1000', 'Sol Rooftop', (CURRENT_DATE + INTERVAL '1 day' + TIME '17:00')::timestamptz, true, NULL::text, false, 'Sol Rooftop'),
  ('Festival do Burger Artesanal', 'Gastronomia', 'https://picsum.photos/seed/festival-burger/800/1000', 'Praça Benedito Calixto', (CURRENT_DATE + INTERVAL '5 days' + TIME '12:00')::timestamptz, true, NULL::text, false, NULL::text),
  ('Noite House · open bar', 'Festa', 'https://picsum.photos/seed/noite-house/800/1000', 'Neon Underground', (CURRENT_DATE + INTERVAL '5 days' + TIME '23:00')::timestamptz, false, 'R$ 80', false, 'Neon Underground'),
  ('Sunrise After · Aurora', 'After', 'https://picsum.photos/seed/sunrise-after/800/1000', 'Aurora After Hours', (CURRENT_DATE + INTERVAL '6 days' + TIME '05:00')::timestamptz, false, 'R$ 60', false, 'Aurora After Hours')
) AS v(title, category, image_url, venue_name, starts_at, is_free, price_text, is_sponsored, place_name)
LEFT JOIN p ON p.name = v.place_name;
