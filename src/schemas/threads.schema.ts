import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const newCommentSchema = z.object({
    token: z.string().min(1, { message: "Le token est obligatoire" }),
    title: z.string().min(1, { message: "Le titre est obligatoire" }),
    text: z.string().min(1, { message: "Le texte est obligatoire" }),
    quote: z.array(z.string().regex(objectIdRegex, { message: "Chaque quote doit être un ObjectId valide" })).optional(),
})

export const editCommentSchema = z.object({
    token: z.string().min(1, { message: "Le token est obligatoire" }),
    text: z.string().min(1, { message: "Le texte est obligatoire" }),
    id: z.string().regex(objectIdRegex, { message: "L'auteur doit être un ObjectId valide" }),
})

export const deleteCommentSchema = z.object({
    token: z.string().min(1, { message: "Le token est obligatoire" }),
    id: z.string().regex(objectIdRegex, { message: "L'auteur doit être un ObjectId valide" }),

})

