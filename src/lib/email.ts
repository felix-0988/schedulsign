import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: `email-smtp.${process.env.SES_REGION}.amazonaws.com`,
  port: 465,
  secure: true,
  auth: {
    user: process.env.SES_ACCESS_KEY,
    pass: process.env.SES_SECRET_KEY,
  },
})

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    await transporter.sendMail({
      from: `${process.env.NEXT_PUBLIC_APP_NAME} <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    })
  } catch (error) {
    console.error("Failed to send email:", error)
    throw error
  }
}

export function bookingConfirmationEmail(data: {
  bookerName: string
  hostName: string
  eventTitle: string
  dateTime: string
  timezone: string
  location: string
  meetingUrl?: string
  rescheduleUrl: string
  cancelUrl: string
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a1a;">
  <div style="border-bottom: 3px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px;">
    <h1 style="margin: 0; font-size: 20px; color: #2563eb;">Booking Confirmed ✓</h1>
  </div>
  <p>Hi ${data.bookerName},</p>
  <p>Your meeting with <strong>${data.hostName}</strong> has been confirmed.</p>
  <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin: 20px 0;">
    <p style="margin: 4px 0;"><strong>${data.eventTitle}</strong></p>
    <p style="margin: 4px 0;">📅 ${data.dateTime}</p>
    <p style="margin: 4px 0;">🌍 ${data.timezone}</p>
    <p style="margin: 4px 0;">📍 ${data.location}</p>
    ${data.meetingUrl ? `<p style="margin: 8px 0;"><a href="${data.meetingUrl}" style="background: #2563eb; color: white; padding: 8px 16px; border-radius: 4px; text-decoration: none; display: inline-block;">Join Meeting</a></p>` : ''}
  </div>
  <p style="font-size: 14px; color: #666;">
    <a href="${data.rescheduleUrl}">Reschedule</a> · <a href="${data.cancelUrl}">Cancel</a>
  </p>
</body>
</html>`
}

export function bookingReminderEmail(data: {
  name: string
  eventTitle: string
  dateTime: string
  meetingUrl?: string
}) {
  return `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2>Reminder: ${data.eventTitle}</h2>
  <p>Hi ${data.name}, your meeting is coming up:</p>
  <p><strong>${data.dateTime}</strong></p>
  ${data.meetingUrl ? `<p><a href="${data.meetingUrl}" style="background: #2563eb; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none;">Join Meeting</a></p>` : ''}
</body>
</html>`
}

export function bookingCancelledEmail(data: {
  name: string
  eventTitle: string
  dateTime: string
  reason?: string
}) {
  return `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2>Booking Cancelled</h2>
  <p>Hi ${data.name}, the following meeting has been cancelled:</p>
  <p><strong>${data.eventTitle}</strong> — ${data.dateTime}</p>
  ${data.reason ? `<p>Reason: ${data.reason}</p>` : ''}
</body>
</html>`
}
