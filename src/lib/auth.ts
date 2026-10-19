import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { credentialsSchema } from "@/lib/auth-validation"

const providers: NextAuthOptions["providers"] = [
    CredentialsProvider({
        name: "credentials",
        credentials: {
            email: { label: "Email", type: "email" },
            password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
            const parsedCredentials = credentialsSchema.safeParse(credentials)
            if (!parsedCredentials.success) {
                return null
            }

            const { email, password } = parsedCredentials.data
            const user = await prisma.user.findUnique({
                where: { email }
            })

            if (!user?.password) {
                return null
            }

            const isPasswordValid = await bcrypt.compare(password, user.password)
            if (!isPasswordValid) {
                return null
            }

            return {
                id: user.id,
                email: user.email!,
                name: user.name,
                role: user.role,
            }
        }
    })
]

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })
    )
}

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
    },
    pages: {
        signIn: "/login",
    },
    providers,
    callbacks: {
        async session({ token, session }) {
            if (token) {
                if (session.user) {
                    session.user.id = token.id as string
                    session.user.name = token.name
                    session.user.email = token.email
                    session.user.role = token.role as Role
                }
            }
            return session
        },
        async jwt({ token, user }) {
            if (user) {
                return {
                    ...token,
                    id: user.id,
                    role: user.role,
                }
            }
            return token
        }
    }
}
