// Zoom meeting creation via Server-to-Server OAuth
export async function createZoomMeeting(data: {
  topic: string
  startTime: Date
  duration: number
}) {
  try {
    // Get access token via Server-to-Server OAuth
    const tokenRes = await fetch("https://zoom.us/oauth/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
        ).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "account_credentials",
        account_id: process.env.ZOOM_ACCOUNT_ID!,
      }),
    })
    const { access_token } = await tokenRes.json()

    const res = await fetch("https://api.zoom.us/v2/users/me/meetings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic: data.topic,
        type: 2, // scheduled
        start_time: data.startTime.toISOString(),
        duration: data.duration,
        settings: {
          join_before_host: true,
          waiting_room: false,
        },
      }),
    })
    const meeting = await res.json()
    return { url: meeting.join_url, id: meeting.id?.toString() }
  } catch (error) {
    console.error("Zoom meeting creation error:", error)
    return null
  }
}
