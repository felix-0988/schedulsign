import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { generateSlug } from "@/lib/utils"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const eventTypes = await prisma.eventType.findMany({
    where: { userId: (session.user as any).id },
    include: { questions: { orderBy: { order: "asc" } }, _count: { select: { bookings: true } } },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(eventTypes)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = (session.user as any).id
  const body = await req.json()

  // Check plan limits
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (user?.plan === "FREE") {
    const count = await prisma.eventType.count({ where: { userId } })
    if (count >= 1) {
      return NextResponse.json({ error: "Free plan limited to 1 event type. Upgrade to Pro." }, { status: 403 })
    }
  }

  const slug = generateSlug(body.title)
  const eventType = await prisma.eventType.create({
    data: {
      userId,
      title: body.title,
      slug,
      description: body.description,
      duration: body.duration || 30,
      location: body.location || "GOOGLE_MEET",
      customLocation: body.customLocation,
      color: body.color,
      bufferBefore: body.bufferBefore || 0,
      bufferAfter: body.bufferAfter || 0,
      dailyLimit: body.dailyLimit,
      weeklyLimit: body.weeklyLimit,
      minNotice: body.minNotice || 120,
      maxFutureDays: body.maxFutureDays || 60,
      requirePayment: body.requirePayment || false,
      price: body.price,
      currency: body.currency || "usd",
      isCollective: body.isCollective || false,
      collectiveMembers: body.collectiveMembers || [],
      questions: body.questions?.length ? {
        create: body.questions.map((q: any, i: number) => ({
          label: q.label,
          type: q.type || "TEXT",
          required: q.required || false,
          options: q.options || [],
          order: i,
        })),
      } : undefined,
    },
    include: { questions: true },
  })

  return NextResponse.json(eventType)
}
