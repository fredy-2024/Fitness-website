import { z } from "zod"

const emailSchema = z
    .string()
    .trim()
    .email()
    .max(254)
    .transform((email) => email.toLowerCase())

export const passwordSchema = z
    .string()
    .min(8)
    .max(72)
    .refine((password) => Buffer.byteLength(password, "utf8") <= 72)

export const credentialsSchema = z.object({
    email: emailSchema,
    password: z.string().min(1).max(1024),
})

export const registerSchema = credentialsSchema.extend({
    password: passwordSchema,
    name: z.string().trim().min(2).max(100),
})
