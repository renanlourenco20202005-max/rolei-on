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
  cover: z.string().max(2_000_000).default(""),
  photos: z.array(z.string().max(2_000_000)).max(12).default([]),
  promos: z.array(promoSchema).max(50).default([]),
  events: z.array(eventSchema).max(50).default([]),
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

export const savePartnerProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => profileSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("partner_profiles")
      .upsert(
        { ...data, user_id: userId },
        { onConflict: "user_id" },
      )
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });
