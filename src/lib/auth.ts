import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import prisma from "./prisma"

// Only include OAuth providers if credentials are properly configured
const providers = [
  CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) return null

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null

        return { id: user.id, email: user.email, name: user.name, image: user.image }
      },
    }),
]

// Add Google OAuth if credentials are configured (not placeholder)
if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CLIENT_ID !== "PLACEHOLDER"
) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/calendar",
          access_type: "offline",
          prompt: "consent",
        },
      },
    })
  )
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login", // Redirect errors to login page
  },
  providers,
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
      }
      if (account?.provider === "google" && account.access_token) {
        // Save Google tokens for calendar access
        await prisma.calendarConnection.upsert({
          where: {
            userId_provider_email: {
              userId: token.id as string,
              provider: "GOOGLE",
              email: token.email!,
            },
          },
          update: {
            accessToken: account.access_token,
            refreshToken: account.refresh_token || undefined,
            expiresAt: account.expires_at ? new Date(account.expires_at * 1000) : undefined,
          },
          create: {
            userId: token.id as string,
            provider: "GOOGLE",
            accessToken: account.access_token,
            refreshToken: account.refresh_token || undefined,
            expiresAt: account.expires_at ? new Date(account.expires_at * 1000) : undefined,
            email: token.email!,
            isPrimary: true,
          },
        })
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
      }
      return session
    },
  },
}
