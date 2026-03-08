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
          ;(globalThis as any).__jwtCallbackResult = {
            timestamp: new Date().toISOString(),
            status: 'success',
            userId: user.id,
            email: profile.email,
          }
        } catch (error: any) {
          ;(globalThis as any).__jwtCallbackResult = {
            timestamp: new Date().toISOString(),
            status: 'error',
            errorMessage: error?.message ?? String(error),
            errorName: error?.name,
            errorCode: error?.code,
            errorMeta: error?.meta ? JSON.stringify(error.meta) : undefined,
            errorStack: error?.stack?.split('\n').slice(0, 5).join('\n'),
          }
          console.error('[auth] JWT callback error:', error)
          throw error
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
