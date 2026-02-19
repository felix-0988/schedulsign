import { NextRequest, NextResponse } from "next/server"
import { fetchAuthSession } from "aws-amplify/auth/server"
import { runWithAmplifyServerContext } from "@/lib/amplify-server-utils"

const publicRoutes = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/api/webhooks",
  "/api/availability",
  "/api/bookings",
  "/api/stripe/webhook",
]

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => {
    if (pathname === route) return true
    if (pathname.startsWith(route + "/")) return true
    return false
  })
}

// Public dynamic routes: /:username, /book/*, /cancel/*, /reschedule/*
function isPublicDynamicRoute(pathname: string): boolean {
  if (pathname.startsWith("/book/")) return true
  if (pathname.startsWith("/cancel/")) return true
  if (pathname.startsWith("/reschedule/")) return true
  // Single-segment paths like /:username (but not /dashboard, /api, etc.)
  const segments = pathname.split("/").filter(Boolean)
  if (
    segments.length === 1 &&
    !["dashboard", "api", "login", "signup", "forgot-password", "_next"].includes(segments[0])
  ) {
    return true
  }
  return false
}

// Check for Cognito auth cookies directly (works reliably after OAuth)
function hasCognitoCookies(request: NextRequest): boolean {
  const clientId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID
  if (!clientId) return false

  const lastAuthUser = request.cookies.get(
    `CognitoIdentityServiceProvider.${clientId}.LastAuthUser`
  )
  if (!lastAuthUser?.value) return false

  // Also verify that an idToken cookie exists for this user
  const idToken = request.cookies.get(
    `CognitoIdentityServiceProvider.${clientId}.${lastAuthUser.value}.idToken`
  )
  return !!idToken?.value
}

// Clear stale HttpOnly cookies left by the old server-side auth approach.
// The client SDK can't see or clear HttpOnly cookies, so middleware does it.
function clearStaleServerAuthCookies(request: NextRequest, response: NextResponse) {
  for (const [name] of request.cookies) {
    if (name.startsWith("com.amplify.server_auth.")) {
      response.cookies.set(name, "", { maxAge: 0, httpOnly: true, path: "/" })
    }
  }
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const { pathname } = request.nextUrl

  // Always clear stale server-auth cookies (from the old createAuthRouteHandlers approach)
  clearStaleServerAuthCookies(request, response)

  if (isPublicRoute(pathname) || isPublicDynamicRoute(pathname)) {
    return response
  }

  // API routes handle their own auth via getAuthenticatedUser()
  // No need for middleware to check - avoids HTML redirect for JSON endpoints
  if (pathname.startsWith("/api/")) {
    return response
  }

  // Primary check: look for Cognito auth cookies directly
  // This works reliably after OAuth signInWithRedirect (no race condition)
  if (hasCognitoCookies(request)) {
    return response
  }

  // Fallback: try Amplify server-side session check
  try {
    const authenticated = await runWithAmplifyServerContext({
      nextServerContext: { request, response },
      operation: async (contextSpec) => {
        const session = await fetchAuthSession(contextSpec)
        return (
          session.tokens?.accessToken !== undefined &&
          session.tokens?.idToken !== undefined
        )
      },
    })

    if (authenticated) {
      return response
    }
  } catch {
    // Auth check failed, treat as unauthenticated
  }

  const loginUrl = new URL("/login", request.url)
  loginUrl.searchParams.set("redirect", pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
