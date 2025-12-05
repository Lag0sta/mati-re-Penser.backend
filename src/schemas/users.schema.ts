import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const signUpSchema  = z.object({
    pseudo: z.string().min(1, { message: "Le pseudo est obligatoire" }),
    name: z.string().min(1, { message: "Le nom est obligatoire" }),
    surname: z.string().min(1, { message: "Le prenom est obligatoire" }),
    email: z.email({ message: "L'email est obligatoire" }),
    password: z.string().min(1, { message: "Le mot de passe est obligatoire" }),
    confirmPassword: z.string().min(1, { message: "Le mot de passe est obligatoire" }),
})

export const avatarSchema = z.object({
    avatar: z.string().min(1, { message: "L'avatar est obligatoire" }),
    token: z.string().min(1, { message: "Le token est obligatoire" }),
})