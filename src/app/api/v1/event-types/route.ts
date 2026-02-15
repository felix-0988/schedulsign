import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// Public REST API - requires API key (user's ID for now, can add proper API keys later)
async function authenticateApiKey(req: Request) {
  const auth = req.headers.get("Authorization")
  if (!auth?.startsWith("Bearer ")) return null
  const apiKey = auth.slice(7)
  const user = await prisma.user.findUnique({ where: { id: apiKey } })
  return user
}

export async function GET(req: Request) {
  const user = await authenticateApiKey(req)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const eventTypes = await prisma.eventType.findMany({
    where: { userId: user.id },
    include: { questions: true, _count: { select: { bookings: true } } },
  })
  return NextResponse.json({ data: eventTypes })
}

export async function POST(req: Request) {
  const user = await authenticateApiKey(req)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const eventType = await prisma.eventType.create({
    data: {
      userId: user.id,
      title: body.title,
      slug: body.slug || body.title.toLowerCase().replace(/\s+/g, "-"),
      description: body.description,
      duration: body.duration || 30,
      location: body.location || "GOOGLE_MEET",
    },
  })
  return NextResponse.json({ data: eventType }, { status: 201 })
}
