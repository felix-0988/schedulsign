import { type NextRequest } from "next/server"
import { createAuthRouteHandlers } from "@/lib/amplify-server-utils"

const authHandler = createAuthRouteHandlers({
  redirectOnSignInComplete: "/dashboard",
  redirectOnSignOutComplete: "/login",
})

/**
 * Wrap the Amplify auth handler to strip HttpOnly from Cognito cookies.
 *
 * createAuthRouteHandlers sets CognitoIdentityServiceProvider.* cookies as
 * HttpOnly. The client-side Amplify SDK (configured with ssr: true) reads
 * these same cookies from document.cookie and needs them to be non-HttpOnly.
 * If they're HttpOnly the SDK can't read them and calls cognito-idp with
 * missing/bad data → POST cognito-idp 400.
 *
 * We intercept the response and rewrite each Set-Cookie header to remove
 * the HttpOnly flag for Cognito cookies.
 */
export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  // createAuthRouteHandlers returns a handler function — call it
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

  // Rewrite Set-Cookie headers: strip HttpOnly from Cognito cookies
  for (const cookieHeader of setCookieHeaders) {
    if (cookieHeader.includes("CognitoIdentityServiceProvider.")) {
      // Remove HttpOnly flag (case-insensitive)
      const modified = cookieHeader.replace(/;\s*httponly/gi, "")
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
