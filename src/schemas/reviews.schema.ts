import { z } from "zod";

export const newReviewSchema  = z.object({
    name: z.string().min(1, { message: "Le nom est obligatoire" }),
    title: z.string().min(1, { message: "Le titre est obligatoire" }),
    text: z.string().min(1, { message: "Le texte est obligatoire" }),
    rating: z.number().min(1, { message: "La note est obligatoire" }),
}) 
