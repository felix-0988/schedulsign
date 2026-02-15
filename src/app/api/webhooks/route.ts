import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import crypto from "crypto"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const webhooks = await prisma.webhook.findMany({
    where: { userId: (session.user as any).id },
  })
  return NextResponse.json(webhooks)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { url, events } = await req.json()
  const webhook = await prisma.webhook.create({
    data: {
      userId: (session.user as any).id,
      url,
      events: events || ["booking.created", "booking.cancelled", "booking.rescheduled"],
      secret: crypto.randomBytes(32).toString("hex"),
    },
  })
  return NextResponse.json(webhook)
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await req.json()
  await prisma.webhook.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
