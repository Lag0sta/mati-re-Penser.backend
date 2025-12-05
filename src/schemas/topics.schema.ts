import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const newTopicSchema  = z.object({
    token: z.string().min(1, { message: "Le token est obligatoire" }),
    title: z.string().min(1, { message: "Le titre est obligatoire" }),
    description: z.string().min(1, { message: "La description est obligatoire" })
})

export const topicContentSchema = z.object({
    topic: z.string().min(1, { message: "Le sujet est obligatoire" })
})

export const editTopicSchema = z.object({
    token: z.string().min(1, { message: "Le token est obligatoire" }),
    title: z.string().min(1, { message: "Le titre est obligatoire" }),
    description: z.string().min(1, { message: "La description est obligatoire" }),
    id: z.string().regex(objectIdRegex, { message: "L'auteur doit être un ObjectId valide" }),
})

export const lockTopicSchema = z.object({
    token: z.string().min(1, { message: "Le token est obligatoire" }),
    id: z.string().regex(objectIdRegex, { message: "L'auteur doit être un ObjectId valide" }),
    isLocked: z.boolean()
})

