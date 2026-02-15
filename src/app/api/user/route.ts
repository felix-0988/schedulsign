import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    select: {
      id: true, name: true, email: true, image: true, timezone: true,
      plan: true, slug: true, brandColor: true, brandLogo: true,
      stripeCurrentPeriodEnd: true,
      calendarConnections: {
        select: {
          id: true, provider: true, email: true,
          isPrimary: true, checkConflicts: true, label: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  })
  return NextResponse.json(user)
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const user = await prisma.user.update({
    where: { id: (session.user as any).id },
    data: {
      name: body.name,
      timezone: body.timezone,
      slug: body.slug,
      brandColor: body.brandColor,
      brandLogo: body.brandLogo,
    },
  })
  return NextResponse.json(user)
}
