import { NextRequest, NextResponse } from "next/server"
import { createAuthRouteHandlers } from "@/lib/amplify-server-utils"

// AMPLIFY_APP_ORIGIN is required by createAuthRouteHandlers but Amplify Hosting
// only passes NEXT_PUBLIC_* env vars to the SSR compute runtime. Set it from
// NEXT_PUBLIC_APP_URL which IS available at runtime.
if (!process.env.AMPLIFY_APP_ORIGIN && process.env.NEXT_PUBLIC_APP_URL) {
  process.env.AMPLIFY_APP_ORIGIN = process.env.NEXT_PUBLIC_APP_URL
}

let handler: ((req: NextRequest, context: any) => Promise<Response>) | null = null
let initError: string | null = null

try {
  handler = createAuthRouteHandlers({
    redirectOnSignInComplete: "/dashboard",
    redirectOnSignOutComplete: "/login",
  })
} catch (error) {
  initError = error instanceof Error ? `${error.name}: ${error.message}` : String(error)
  console.error("Failed to create auth route handlers:", error)
}

export async function GET(request: NextRequest, context: any) {
  if (!handler) {
    return NextResponse.json(
      {
        error: "Auth route handlers not initialized",
        initError,
        envCheck: {
          AMPLIFY_APP_ORIGIN: process.env.AMPLIFY_APP_ORIGIN ? "set" : "missing",
          NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ? "set" : "missing",
          NEXT_PUBLIC_COGNITO_DOMAIN: process.env.NEXT_PUBLIC_COGNITO_DOMAIN ? "set" : "missing",
          NEXT_PUBLIC_COGNITO_USER_POOL_ID: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ? "set" : "missing",
          NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID ? "set" : "missing",
        },
      },
      { status: 500 }
    )
  }

  try {
    return await handler(request, context)
  } catch (error) {
    return NextResponse.json(
      {
        error: "Auth handler failed",
        message: error instanceof Error ? error.message : String(error),
        name: error instanceof Error ? error.name : undefined,
      },
      { status: 500 }
    )
  }
}
