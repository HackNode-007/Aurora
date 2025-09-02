import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "@/lib/prisma"
import bcrypt from "bcrypt"

export const runtime = "nodejs"

const handler = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        // Google OAuth
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),

        // Email + Password login
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                })

                if (!user || !user.password) return null

                const isValid = await bcrypt.compare(credentials.password, user.password)
                if (!isValid) return null

                return user
            },
        }),
    ],
    session: {
        maxAge: 7 * 24 * 60 * 60,
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            // Attach user id and profileCompleted to JWT
            if (user) {
                token.id = (user as any).id
                token.profileCompleted = (user as any).profileCompleted ?? false
            } else if (token?.sub) {
                // Keep token.id and refresh profileCompleted if it's missing or false
                try {
                    const dbUser = await prisma.user.findUnique({ where: { id: token.sub } })
                    token.profileCompleted = dbUser?.profileCompleted ?? false
                    token.id = token.id ?? dbUser?.id
                } catch {}
            }
            return token
        },
        async session({ session, token }) {
            if (token) {
                ;(session.user as any).id = token.id as string
                ;(session.user as any).profileCompleted = (token as any).profileCompleted ?? false
            }
            return session
        },
    },
    pages: {
        signIn: "/auth/login",
        error: "/auth/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
