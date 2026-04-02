import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const newBookInfoSchema = z.object({
    token: z.string().min(1, { message: "Le token est obligatoire" }),
    pseudo: z.string().min(1, { message: "Le token est obligatoire" }),
    titre: z.string().min(1, { message: "Le titre est obligatoire" }),
    text: z.string().min(1, { message: "Le texte est obligatoire" }),
})

export const editBookTextSchema = z.object({
    token: z.string().min(1, { message: "Le token est obligatoire" }),
    pseudo: z.string().min(1, { message: "Le token est obligatoire" }),
    titre: z.string().min(1, { message: "Le titre est obligatoire" }),
    text: z.string().min(1, { message: "Le texte est obligatoire" }),
    id: z.string().regex(objectIdRegex, { message: "L'auteur doit être un ObjectId valide" }),
})

export const editBookImgSchema = z.object({
    token: z.string().min(1, { message: "Le token est obligatoire" }),
    pseudo: z.string().min(1, { message: "Le token est obligatoire" }),
    img: z.string().min(1, { message: "Le token est obligatoire" }),
    id: z.string().regex(objectIdRegex, { message: "L'auteur doit être un ObjectId valide" }),
})

export const archiveStatusSchema = z.object({
    token: z.string().min(1, { message: "Le token est obligatoire" }),
    pseudo: z.string().min(1, { message: "Le token est obligatoire" }),
    id: z.string().regex(objectIdRegex, { message: "L'auteur doit être un ObjectId valide" }),
    isArchived: z.boolean()
})