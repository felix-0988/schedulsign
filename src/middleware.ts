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

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const { pathname } = request.nextUrl

  if (isPublicRoute(pathname) || isPublicDynamicRoute(pathname)) {
    return response
  }

  try {
    const authenticated = await runWithAmplifyServerContext({
      nextServerContext: { cookies: () => request.cookies },
      operation: async (contextSpec) => {
        const session = await fetchAuthSession(contextSpec)
        return session.tokens !== undefined
      },
    })

    if (authenticated) {
      return response
    }
  } catch {
    // Auth check failed, redirect to login
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
