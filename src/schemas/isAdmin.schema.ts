import { z } from "zod";

export const requireAdminSchema  = z.object({
    token: z.string().min(1, { message: "Le token est obligatoire" }),
})
