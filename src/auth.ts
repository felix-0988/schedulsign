import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import prisma from '@/lib/prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile?.email) {
        try {
          let user = await prisma.user.findUnique({
            where: { email: profile.email },
          })
          if (!user) {
            const baseSlug = profile.email
              .split('@')[0]
              .replace(/[^a-z0-9]/gi, '')
              .toLowerCase()
            user = await prisma.user.create({
              data: {
                email: profile.email,
                name: profile.name ?? null,
                image: (profile as any).picture ?? null,
                slug: baseSlug,
              },
            })
          }
          token.userId = user.id
        } catch (error: any) {
          // Don't throw - log and continue with a fallback so we can see the error
          console.error('[auth] JWT callback error:', error)
          token.dbError = JSON.stringify({
            message: error?.message,
            code: error?.code,
            meta: error?.meta,
          })
          // Still set a temp ID so login succeeds but we can diagnose
          token.userId = "db-error-fallback"
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId as string
      }
      return session
    },
  },
  debug: true,
  logger: {
    error(code, ...message) {
      console.error('[auth][error]', code, JSON.stringify(message))
      // Store error for debug endpoint retrieval
      ;(globalThis as any).__lastAuthError = {
        timestamp: new Date().toISOString(),
        code,
        message: JSON.stringify(message),
      }
    },
    warn(code, ...message) {
      console.warn('[auth][warn]', code, ...message)
    },
    debug(code, ...message) {
      console.log('[auth][debug]', code, ...message)
      // Store last 5 debug messages
      if (!(globalThis as any).__authDebugLog) (globalThis as any).__authDebugLog = []
      ;(globalThis as any).__authDebugLog.push({
        timestamp: new Date().toISOString(),
        code,
        message: message.map((m: any) => typeof m === 'object' ? JSON.stringify(m) : String(m)).join(' '),
      })
      if ((globalThis as any).__authDebugLog.length > 10) (globalThis as any).__authDebugLog.shift()
    },
  },
  pages: {
    signIn: '/login',
  },
})
