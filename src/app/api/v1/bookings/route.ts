import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

async function authenticateApiKey(req: Request) {
  const auth = req.headers.get("Authorization")
  if (!auth?.startsWith("Bearer ")) return null
  const apiKey = auth.slice(7)
  return prisma.user.findUnique({ where: { id: apiKey } })
}

export async function GET(req: Request) {
  const user = await authenticateApiKey(req)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const url = new URL(req.url)
  const status = url.searchParams.get("status")
  const from = url.searchParams.get("from")
  const to = url.searchParams.get("to")

  const bookings = await prisma.booking.findMany({
    where: {
      userId: user.id,
      ...(status && { status: status as any }),
      ...(from && { startTime: { gte: new Date(from) } }),
      ...(to && { endTime: { lte: new Date(to) } }),
    },
    include: { eventType: { select: { title: true, slug: true } } },
    orderBy: { startTime: "desc" },
    take: 100,
  })
  return NextResponse.json({ data: bookings })
}
