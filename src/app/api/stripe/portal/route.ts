import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createPortalSession } from "@/lib/stripe"
import prisma from "@/lib/prisma"

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: (session.user as any).id } })
  if (!user?.stripeCustomerId) return NextResponse.json({ error: "No subscription" }, { status: 400 })

  const portalSession = await createPortalSession(user.stripeCustomerId)
  return NextResponse.json({ url: portalSession.url })
}
