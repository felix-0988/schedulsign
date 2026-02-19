import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const response = NextResponse.json({ ok: true })

  for (const [name] of request.cookies) {
    if (
      name.startsWith("CognitoIdentityServiceProvider.") ||
      name.startsWith("com.amplify.server_auth.")
    ) {
      response.cookies.set(name, "", {
        maxAge: 0,
        httpOnly: true,
        path: "/",
      })
    }
  }

  return response
}
