import twilio from "twilio"

const PLACEHOLDER_SID = "AC00000000000000000000000000000000"
const PLACEHOLDER_TOKEN = "00000000000000000000000000000000"

// Only use real credentials if they look valid (start with "AC")
const rawSid = process.env.TWILIO_ACCOUNT_SID || ""
const accountSid = rawSid.startsWith("AC") ? rawSid : PLACEHOLDER_SID
const authToken = rawSid.startsWith("AC") ? (process.env.TWILIO_AUTH_TOKEN || PLACEHOLDER_TOKEN) : PLACEHOLDER_TOKEN
const twilioPhone = process.env.TWILIO_PHONE_NUMBER || "+10000000000"

const twilioClient = twilio(accountSid, authToken)

export async function sendSMS(to: string, message: string) {
  // Skip if using placeholder credentials
  if (accountSid === PLACEHOLDER_SID) {
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
