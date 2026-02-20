import { type NextRequest } from "next/server"
import { createAuthRouteHandlers } from "@/lib/amplify-server-utils"

const authHandler = createAuthRouteHandlers({
  redirectOnSignInComplete: "/dashboard",
  redirectOnSignOutComplete: "/login",
})

/**
 * Wrap the Amplify auth handler to fix Cognito cookie attributes.
 *
 * createAuthRouteHandlers sets CognitoIdentityServiceProvider.* cookies as
 * HttpOnly with SameSite=strict. Two problems:
 *
 * 1. HttpOnly: The client-side Amplify SDK (ssr: true) needs to read these
 *    cookies from document.cookie. HttpOnly prevents that.
 *
 * 2. SameSite=strict: After the OAuth redirect chain (Cognito → callback →
 *    dashboard), fetch() calls from the dashboard page may not include
 *    SameSite=strict cookies because the browser's "site for cookies" context
 *    still considers it a cross-site flow. SameSite=lax fixes this.
 *
 * We intercept the response and rewrite Set-Cookie headers for Cognito cookies
 * to remove HttpOnly and change SameSite from strict to lax.
 */
export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const response = await (authHandler as (req: NextRequest, ctx: { params: Promise<{ slug: string }> }) => Promise<Response | undefined>)(request, context)

  if (!response) {
    return new Response("Internal Server Error", { status: 500 })
  }

  // Get all Set-Cookie headers from the response
  const setCookieHeaders = response.headers.getSetCookie()
  if (!setCookieHeaders || setCookieHeaders.length === 0) {
    return response
  }

  // Build a new response with modified Set-Cookie headers
  const newHeaders = new Headers()
  // Copy all non-Set-Cookie headers
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "set-cookie") {
      newHeaders.append(key, value)
    }
  })

  // Rewrite Set-Cookie headers for Cognito cookies:
  // - Remove HttpOnly (so client SDK can read from document.cookie)
  // - Change SameSite=strict to SameSite=lax (so cookies are sent on
  //   fetch() calls after the OAuth redirect chain)
  for (const cookieHeader of setCookieHeaders) {
    if (cookieHeader.includes("CognitoIdentityServiceProvider.")) {
      const modified = cookieHeader
        .replace(/;\s*httponly/gi, "")
        .replace(/SameSite=strict/gi, "SameSite=lax")
      newHeaders.append("Set-Cookie", modified)
    } else {
      newHeaders.append("Set-Cookie", cookieHeader)
    }
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  })
}
