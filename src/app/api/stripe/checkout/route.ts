import { NextResponse } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth"
import { createCheckoutSession } from "@/lib/stripe"

export async function POST(req: Request) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { priceId } = await req.json()
  const checkoutSession = await createCheckoutSession(user.id, user.email, priceId)

  return NextResponse.json({ url: checkoutSession.url })
}
