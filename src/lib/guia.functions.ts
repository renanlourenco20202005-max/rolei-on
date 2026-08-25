import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { askGuiaAI, type GuiaSuggestion } from "@/lib/guia.server";

const inputSchema = z.object({
  message: z.string().trim().min(2).max(300),
  prefs: z
    .object({
      company: z.array(z.string()).max(8).optional(),
      likes: z.array(z.string()).max(12).optional(),
      budget: z.string().max(40).optional(),
    })
    .optional(),
});

export type { GuiaSuggestion };

export const askGuia = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }): Promise<{ suggestions: GuiaSuggestion[] }> => {
    const suggestions = await askGuiaAI(data.message, data.prefs ?? {});
    return { suggestions };
  });
