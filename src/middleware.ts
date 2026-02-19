import { NextRequest, NextResponse } from "next/server"

// Auth protection is handled client-side in dashboard/layout.tsx
// (matching the VeloQuoteApp pattern). Server-side middleware cannot
// reliably read Cognito tokens set by the client-side Amplify SDK,
// especially after OAuth redirects where tokens are exchanged async.

export async function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
}
