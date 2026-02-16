import { cookies } from "next/headers"
import { getCurrentUser } from "aws-amplify/auth/server"
import { runWithAmplifyServerContext } from "./amplify-server-utils"
import prisma from "./prisma"

export async function getAuthenticatedUser() {
  const cookieStore = await cookies()

  const cognitoUser = await runWithAmplifyServerContext({
    nextServerContext: { cookies: () => cookieStore },
    operation: (contextSpec) => getCurrentUser(contextSpec),
  })

  const user = await prisma.user.findUnique({
    where: { cognitoId: cognitoUser.userId },
  })

  if (!user) {
    return null
  }

  return user
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
