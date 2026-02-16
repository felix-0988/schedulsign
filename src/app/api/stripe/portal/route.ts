import { NextResponse } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth"
import { createPortalSession } from "@/lib/stripe"

export async function POST() {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (!user.stripeCustomerId) return NextResponse.json({ error: "No subscription" }, { status: 400 })

  const portalSession = await createPortalSession(user.stripeCustomerId)
  return NextResponse.json({ url: portalSession.url })
}
