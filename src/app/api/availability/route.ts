import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const availability = await prisma.availability.findMany({
    where: { userId: (session.user as any).id },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  })
  return NextResponse.json(availability)
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = (session.user as any).id
  const { rules } = await req.json()

  // Delete existing and recreate
  await prisma.availability.deleteMany({ where: { userId } })
  
  if (rules?.length) {
    await prisma.availability.createMany({
      data: rules.map((r: any) => ({
        userId,
        dayOfWeek: r.dayOfWeek,
        date: r.date ? new Date(r.date) : null,
        startTime: r.startTime,
        endTime: r.endTime,
        enabled: r.enabled ?? true,
      })),
    })
  }

  const updated = await prisma.availability.findMany({
    where: { userId },
    orderBy: [{ dayOfWeek: "asc" }],
  })
  return NextResponse.json(updated)
}
