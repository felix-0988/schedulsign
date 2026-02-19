import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getCurrentUser, fetchAuthSession } from "aws-amplify/auth/server"
import { runWithAmplifyServerContext } from "@/lib/amplify-server-utils"

export async function GET() {
  const debug: Record<string, unknown> = {}

  try {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()

    // List cookie names (not values) that are Cognito-related
    const cognitoCookies = allCookies
      .filter((c) => c.name.includes("Cognito") || c.name.includes("amplify"))
      .map((c) => ({
        name: c.name,
        valueLength: c.value.length,
        valuePreview: c.value.substring(0, 20) + "...",
      }))

    debug.cognitoCookieCount = cognitoCookies.length
    debug.cognitoCookies = cognitoCookies

    // Check for specific expected cookies
    const clientId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID
    debug.clientId = clientId ? `${clientId.substring(0, 8)}...` : "NOT SET"
    debug.userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID
      ? `${process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID.substring(0, 15)}...`
      : "NOT SET"

    if (clientId) {
      const lastAuthUser = cookieStore.get(
        `CognitoIdentityServiceProvider.${clientId}.LastAuthUser`
      )
      debug.lastAuthUser = lastAuthUser?.value || "NOT FOUND"

      if (lastAuthUser?.value) {
        const username = lastAuthUser.value
        const accessToken = cookieStore.get(
          `CognitoIdentityServiceProvider.${clientId}.${username}.accessToken`
        )
        const idToken = cookieStore.get(
          `CognitoIdentityServiceProvider.${clientId}.${username}.idToken`
        )
        const refreshToken = cookieStore.get(
          `CognitoIdentityServiceProvider.${clientId}.${username}.refreshToken`
        )

        debug.hasAccessToken = !!accessToken?.value
        debug.accessTokenLength = accessToken?.value?.length || 0
        debug.hasIdToken = !!idToken?.value
        debug.idTokenLength = idToken?.value?.length || 0
        debug.hasRefreshToken = !!refreshToken?.value
        debug.refreshTokenLength = refreshToken?.value?.length || 0

        // Try to decode the access token JWT header (not verify, just decode)
        if (accessToken?.value) {
          try {
            const parts = accessToken.value.split(".")
            debug.accessTokenParts = parts.length
            if (parts.length === 3) {
              const header = JSON.parse(
                Buffer.from(parts[0], "base64url").toString()
              )
              const payload = JSON.parse(
                Buffer.from(parts[1], "base64url").toString()
              )
              debug.accessTokenHeader = header
              debug.accessTokenClaims = {
                sub: payload.sub,
                iss: payload.iss,
                client_id: payload.client_id,
                token_use: payload.token_use,
                exp: payload.exp,
                iat: payload.iat,
                nowUnix: Math.floor(Date.now() / 1000),
                isExpired: payload.exp < Math.floor(Date.now() / 1000),
              }
            }
          } catch (e) {
            debug.accessTokenDecodeError = String(e)
          }
        }
      }
    }

    // Try Amplify server-side auth
    try {
      const user = await runWithAmplifyServerContext({
        nextServerContext: { cookies: () => cookieStore },
        operation: (contextSpec) => getCurrentUser(contextSpec),
      })
      debug.amplifyGetCurrentUser = { success: true, userId: user.userId, username: user.username }
    } catch (e) {
      debug.amplifyGetCurrentUser = { success: false, error: String(e) }
    }

    // Try fetchAuthSession
    try {
      const session = await runWithAmplifyServerContext({
        nextServerContext: { cookies: () => cookieStore },
        operation: (contextSpec) => fetchAuthSession(contextSpec),
      })
      debug.amplifyFetchAuthSession = {
        success: true,
        hasAccessToken: !!session.tokens?.accessToken,
        hasIdToken: !!session.tokens?.idToken,
      }
    } catch (e) {
      debug.amplifyFetchAuthSession = { success: false, error: String(e) }
    }
  } catch (e) {
    debug.topLevelError = String(e)
  }

  return NextResponse.json(debug, { status: 200 })
}
