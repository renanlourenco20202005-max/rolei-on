import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const favSchema = z.object({
  kind: z.enum(["places", "events"]),
  itemId: z.string().min(1).max(128),
  saved: z.boolean(),
});

export const listFavorites = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("favorites")
      .select("kind, item_id")
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    const places: string[] = [];
    const events: string[] = [];
    for (const row of data ?? []) {
      if (row.kind === "places") places.push(row.item_id);
      else if (row.kind === "events") events.push(row.item_id);
    }
    return { places, events };
  });

export const setFavorite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => favSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (data.saved) {
      const { error } = await supabase
        .from("favorites")
        .upsert({ user_id: userId, kind: data.kind, item_id: data.itemId }, { onConflict: "user_id,kind,item_id" });
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("kind", data.kind)
        .eq("item_id", data.itemId);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });
