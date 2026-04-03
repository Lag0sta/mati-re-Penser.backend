import { z } from "zod";
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const newReviewSchema = z.object({
    book: z.string().regex(objectIdRegex, { message: "L'auteur doit être un ObjectId valide" }),
    name: z.string().min(1, { message: "Le nom est obligatoire" }),
    title: z.string().min(1, { message: "Le titre est obligatoire" }),
    text: z.string().min(1, { message: "Le texte est obligatoire" }),
    rating: z.number().min(1, { message: "La note est obligatoire" }),
}) 

export const reviewsSchema = z.object({
    id: z.string().regex(objectIdRegex, { message: "L'auteur doit être un ObjectId valide" }),

})