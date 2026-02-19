import { NextResponse } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth"
import { getOutlookAuthUrl } from "@/lib/calendar/outlook"

export async function GET() {
  const user = await getAuthenticatedUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return NextResponse.redirect(getOutlookAuthUrl())
}
