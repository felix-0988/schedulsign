import { cookies } from "next/headers"
import { getCurrentUser, fetchAuthSession } from "aws-amplify/auth/server"
import { runWithAmplifyServerContext } from "./amplify-server-utils"
import prisma from "./prisma"

export async function getAuthenticatedUser() {
  try {
    const cookieStore = await cookies()

    const cognitoUser = await runWithAmplifyServerContext({
      nextServerContext: { cookies: () => cookieStore },
      operation: (contextSpec) => getCurrentUser(contextSpec),
    })

    let user = await prisma.user.findUnique({
      where: { cognitoId: cognitoUser.userId },
    })

    // Auto-provision: create DB record for first-time OAuth users
    if (!user) {
      const session = await runWithAmplifyServerContext({
        nextServerContext: { cookies: () => cookieStore },
        operation: (contextSpec) => fetchAuthSession(contextSpec),
      })

      const idToken = session.tokens?.idToken
      const email = idToken?.payload?.email as string | undefined

      if (email) {
        // Check if a user with this email already exists (e.g. signed up with password)
        const existingUser = await prisma.user.findUnique({ where: { email } })

        if (existingUser) {
          // Link existing user to this Cognito identity
          user = await prisma.user.update({
            where: { id: existingUser.id },
            data: { cognitoId: cognitoUser.userId },
          })
        } else {
          // Create new user from OAuth profile
          const name = idToken?.payload?.name as string | undefined
          const baseSlug = email.split("@")[0].replace(/[^a-z0-9]/gi, "").toLowerCase()
          user = await prisma.user.create({
            data: {
              cognitoId: cognitoUser.userId,
              email,
              name: name || email.split("@")[0],
              slug: baseSlug,
              emailVerified: new Date(),
            },
          })
        }
      }
    }

    return user || null
  } catch {
    return null
  }
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies()

    await runWithAmplifyServerContext({
      nextServerContext: { cookies: () => cookieStore },
      operation: (contextSpec) => getCurrentUser(contextSpec),
    })

    return true
  } catch {
    return false
  }
}
