import crypto from "crypto"
import prisma from "./prisma"

export async function triggerWebhooks(userId: string, event: string, data: any) {
  const webhooks = await prisma.webhook.findMany({
    where: { userId, active: true, events: { has: event } },
  })

  for (const webhook of webhooks) {
    const payload = JSON.stringify({ event, data, timestamp: new Date().toISOString() })
    const signature = crypto
      .createHmac("sha256", webhook.secret)
      .update(payload)
      .digest("hex")

    try {
      await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Signature": signature,
        },
        body: payload,
      })
    } catch (error) {
      console.error(`Webhook ${webhook.id} failed:`, error)
    }
  }
}
