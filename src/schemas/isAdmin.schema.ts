import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const requireAdminSchema  = z.object({
    token: z.string().min(1, { message: "Le token est obligatoire" }),
})
