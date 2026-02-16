import twilio from "twilio"

// Use placeholder values during build if not set
// The actual credentials will be provided at runtime
const accountSid = process.env.TWILIO_ACCOUNT_SID || "AC_placeholder_for_build"
const authToken = process.env.TWILIO_AUTH_TOKEN || "placeholder_token"
const twilioPhone = process.env.TWILIO_PHONE_NUMBER || "+10000000000"

const twilioClient = twilio(accountSid, authToken)

export async function sendSMS(to: string, message: string) {
  // Skip if using placeholder credentials
  if (accountSid === "AC_placeholder_for_build") {
    console.log("Twilio not configured - skipping SMS:", { to, message })
    return
  }

  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: twilioPhone,
      to,
    })
    return result
  } catch (error) {
    console.error("Failed to send SMS:", error)
    throw error
  }
}

export function bookingReminderSMS({
  eventTitle,
  dateTime,
  meetingUrl,
}: {
  eventTitle: string
  dateTime: string
  meetingUrl?: string
}) {
  let message = `Reminder: ${eventTitle} starts in 1 hour at ${dateTime}.`
  if (meetingUrl) {
    message += ` Join: ${meetingUrl}`
  }
  return message
}
