import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const promoSchema = z.object({
  id: z.string().min(1).max(64),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).default(""),
  validUntil: z.string().trim().max(40).default(""),
  active: z.boolean(),
});

const eventSchema = z.object({
  id: z.string().min(1).max(64),
  title: z.string().trim().min(1).max(120),
  date: z.string().trim().max(60).default(""),
  free: z.boolean(),
  price: z.string().trim().max(40).optional().default(""),
  description: z.string().trim().max(500).default(""),
});

const profileSchema = z.object({
  name: z.string().trim().max(120).default(""),
  category: z.string().trim().max(60).default("Bar"),
  description: z.string().trim().max(800).default(""),
  address: z.string().trim().max(200).default(""),
  hours: z.string().trim().max(120).default(""),
  whatsapp: z.string().trim().max(40).default(""),
  instagram: z.string().trim().max(60).default(""),
  price: z.enum(["$", "$$", "$$$", "$$$$"]).default("$$"),
  cover: z.string().max(2_000_000).default(""),
  photos: z.array(z.string().max(2_000_000)).max(12).default([]),
  promos: z.array(promoSchema).max(50).default([]),
  events: z.array(eventSchema).max(50).default([]),
  latitude: z.number().min(-90).max(90).nullable().default(null),
  longitude: z.number().min(-180).max(180).nullable().default(null),
});

export type PartnerProfileInput = z.infer<typeof profileSchema>;

export const getPartnerProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("partner_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

// Converte uma data/hora livre digitada pelo parceiro (ex: "Sex 23h") num
// timestamp real. Sem um datepicker dedicado ainda, tentamos interpretar o
// texto; se não der, usamos "daqui a 1 dia" como estimativa razoável, só
// para o evento não ficar sem starts_at (campo obrigatório na tabela).
function parseEventDate(raw: string): string {
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  const fallback = new Date();
  fallback.setDate(fallback.getDate() + 1);
  return fallback.toISOString();
}

export const savePartnerProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => profileSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: row, error } = await supabase
      .from("partner_profiles")
      .upsert(
        {
          name: data.name,
          category: data.category,
          description: data.description,
          address: data.address,
          hours: data.hours,
          whatsapp: data.whatsapp,
          instagram: data.instagram,
          price: data.price,
          cover: data.cover,
          photos: data.photos,
          promos: data.promos,
          events: data.events,
          latitude: data.latitude,
          longitude: data.longitude,
          user_id: userId,
        },
        { onConflict: "user_id" },
      )
      .select()
      .single();
    if (error) throw new Error(error.message);

    // Só publicamos no catálogo público (places/events) quando o parceiro
    // já capturou a localização — sem isso o local não é "achável" no app.
    if (data.latitude !== null && data.longitude !== null && data.name.trim()) {
      const activePromo = data.promos.find((p) => p.active);
      const { data: placeRow, error: placeError } = await supabase
        .from("places")
        .upsert(
          {
            partner_id: row.id,
            name: data.name,
            category: data.category,
            description: data.description,
            image_url: data.cover,
            photos: data.photos,
            latitude: data.latitude,
            longitude: data.longitude,
            address: data.address,
            hours: data.hours,
            whatsapp: data.whatsapp,
            instagram: data.instagram,
            price: data.price,
            promo_text: activePromo ? activePromo.title : null,
            is_published: true,
          },
          { onConflict: "partner_id" },
        )
        .select()
        .single();
      if (placeError) throw new Error(placeError.message);

      // Eventos: substitui o conjunto publicado pelo estado atual do parceiro.
      await supabase.from("events").delete().eq("partner_id", row.id);
      if (data.events.length > 0) {
        const { error: eventsError } = await supabase.from("events").insert(
          data.events.map((e) => ({
            id: e.id,
            partner_id: row.id,
            place_id: placeRow.id,
            title: e.title,
            description: e.description,
            venue_name: data.name,
            starts_at: parseEventDate(e.date),
            is_free: e.free,
            price_text: e.free ? null : e.price || null,
            is_published: true,
          })),
        );
        if (eventsError) throw new Error(eventsError.message);
      }
    }

    return row;
  });
