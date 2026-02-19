import { NextRequest, NextResponse } from "next/server"
import { createAuthRouteHandlers } from "@/lib/amplify-server-utils"

let handler: ((req: NextRequest, context: any) => Promise<NextResponse>) | null = null

try {
  handler = createAuthRouteHandlers({
    redirectOnSignInComplete: "/dashboard",
    redirectOnSignOutComplete: "/login",
  })
} catch (error) {
  console.error("Failed to create auth route handlers:", error)
}

export async function GET(request: NextRequest, context: any) {
  if (!handler) {
    return NextResponse.json(
      {
        error: "Auth route handlers not initialized",
        origin: process.env.AMPLIFY_APP_ORIGIN ? "set" : "missing",
        appUrl: process.env.NEXT_PUBLIC_APP_URL ? "set" : "missing",
      },
      { status: 500 }
    )
  }

  try {
    return await handler(request, context)
  } catch (error) {
    console.error("Auth route handler error:", error)
    return NextResponse.json(
      {
        error: "Auth handler failed",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
