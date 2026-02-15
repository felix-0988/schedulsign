import twilio from "twilio"

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function sendSMS(to: string, body: string) {
  try {
    await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    })
  } catch (error) {
    console.error("Failed to send SMS:", error)
  }
}

export function bookingReminderSMS(data: {
  eventTitle: string
  dateTime: string
  meetingUrl?: string
}) {
  let msg = `Reminder: ${data.eventTitle} at ${data.dateTime}.`
  if (data.meetingUrl) msg += ` Join: ${data.meetingUrl}`
  return msg
}
