import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createCheckoutSession } from "@/lib/stripe"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { priceId } = await req.json()
  const checkoutSession = await createCheckoutSession(
    (session.user as any).id,
    session.user.email,
    priceId
  )

  return NextResponse.json({ url: checkoutSession.url })
}
