import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const visitSchema = z.object({
  kind: z.enum(["places", "events"]),
  itemId: z.string().min(1).max(128),
});

export const recordVisit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => visitSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // Re-register: remove previous entry for the same item so it bubbles to the top
    await supabase
      .from("visit_history")
      .delete()
      .eq("user_id", userId)
      .eq("kind", data.kind)
      .eq("item_id", data.itemId);
    const { error } = await supabase
      .from("visit_history")
      .insert({ user_id: userId, kind: data.kind, item_id: data.itemId });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("visit_history")
      .select("kind, item_id, visited_at")
      .eq("user_id", context.userId)
      .order("visited_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({ kind: r.kind as "places" | "events", itemId: r.item_id, visitedAt: r.visited_at }));
  });

export const clearHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase
      .from("visit_history")
      .delete()
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
