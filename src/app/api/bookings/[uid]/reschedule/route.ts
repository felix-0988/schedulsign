import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { triggerWebhooks } from "@/lib/webhooks"

export async function POST(req: Request, { params }: { params: { uid: string } }) {
  const { newStartTime } = await req.json()

  const booking = await prisma.booking.findUnique({
    where: { uid: params.uid },
    include: { eventType: true },
  })
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const start = new Date(newStartTime)
  const end = new Date(start.getTime() + booking.eventType.duration * 60000)

  // Mark old as rescheduled, create new
  const newBooking = await prisma.booking.create({
    data: {
      eventTypeId: booking.eventTypeId,
      userId: booking.userId,
      title: booking.title,
      startTime: start,
      endTime: end,
      bookerName: booking.bookerName,
      bookerEmail: booking.bookerEmail,
      bookerTimezone: booking.bookerTimezone,
      bookerPhone: booking.bookerPhone,
      location: booking.location,
      answers: booking.answers as any,
      status: "CONFIRMED",
      rescheduleUid: booking.uid,
    },
  })

  await prisma.booking.update({
    where: { uid: params.uid },
    data: { status: "RESCHEDULED" },
  })

  await triggerWebhooks(booking.userId, "booking.rescheduled", { old: booking, new: newBooking })

  return NextResponse.json(newBooking)
}
