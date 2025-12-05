import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const signInSchema  = z.object({
    email: z.email({ message: "L'email est obligatoire" }),
    password: z.string().min(1, { message: "Le mot de passe est obligatoire" }),
})

export const  authSchema  = z.object({
    token: z.string().min(1, { message: "Le token est obligatoire" }),
    password: z.string().min(1, { message: "Le mot de passe est obligatoire" }),
})

export const logoutSchema  = z.object({
    token: z.string().min(1, { message: "Le token est obligatoire" }),
    id: z.string().regex(objectIdRegex, { message: "L'auteur doit être un ObjectId valide" }),
})