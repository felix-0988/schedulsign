import { NextResponse } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth"

export async function GET() {
  const user = await getAuthenticatedUser()
  if (!user) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL!))
  }

  // Build Google OAuth URL
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile https://www.googleapis.com/auth/calendar",
    access_type: "offline",
    prompt: "consent",
    state: user.id, // Pass user ID in state
  })

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
}
