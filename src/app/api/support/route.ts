import { NextResponse } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth"

const TINYDESK_URL = process.env.TINYDESK_URL || "https://tinydesk.zenithstudio.app"

export async function POST(req: Request) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { subject, message, category } = await req.json()

  if (!subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Subject and message are required" }, { status: 400 })
  }

  const body = category
    ? `[${category}]\n\n${message}`
    : message

  try {
    const res = await fetch(`${TINYDESK_URL}/api/tickets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productSlug: "tinycal",
        submitterEmail: user.email,
        submitterName: user.name || undefined,
        subject,
        body,
      }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      console.error("TinyDesk ticket creation failed:", res.status, data)
      return NextResponse.json(
        { error: "Failed to submit support ticket" },
        { status: 502 }
      )
    }

    const ticket = await res.json()

    return NextResponse.json({
      ok: true,
      ticketId: ticket.publicId,
      trackingUrl: `${TINYDESK_URL}/ticket/${ticket.publicId}`,
    })
  } catch (e) {
    console.error("Support ticket submission failed:", e)
    return NextResponse.json({ error: "Failed to submit support ticket" }, { status: 500 })
  }
}
