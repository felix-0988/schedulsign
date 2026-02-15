import { google } from "googleapis"
import prisma from "../prisma"
import { getGoogleOAuth2Client } from "./google"

/**
 * Represents a calendar event fetched from an external calendar provider.
 * Used as the common format across Google Calendar and Outlook integrations
 * for the multi-calendar conflict detection system.
 */
export interface CalendarEvent {
  /** Event start time in UTC */
  start: Date
  /** Event end time in UTC */
  end: Date
  /** The calendar ID within the provider (e.g., "primary" for Google) */
  calendarId: string
  /** The calendar provider identifier ("GOOGLE" or "OUTLOOK") */
  provider: string
  /** Optional event title/summary for display purposes */
  summary?: string
}

/**
 * Refreshes a Google OAuth2 access token using the stored refresh token.
 *
 * This is called automatically when a token has expired or when the Google API
 * returns a 401 error. The caller is responsible for persisting the new tokens
 * to the database.
 *
 * @param refreshToken - The OAuth2 refresh token stored for the calendar connection
 * @returns An object containing the new access token and its expiration date
 * @throws Will throw if the refresh token is invalid or revoked by the user
 *
 * @example
 * ```ts
 * const refreshed = await refreshGoogleToken(connection.refreshToken)
 * // Persist the new tokens
 * await prisma.calendarConnection.update({
 *   where: { id: connection.id },
 *   data: { accessToken: refreshed.accessToken, expiresAt: refreshed.expiresAt },
 * })
 * ```
 */
export async function refreshGoogleToken(
  refreshToken: string
): Promise<{ accessToken: string; expiresAt: Date }> {
  const oauth2Client = getGoogleOAuth2Client()
  oauth2Client.setCredentials({ refresh_token: refreshToken })

  const { credentials } = await oauth2Client.refreshAccessToken()

  return {
    accessToken: credentials.access_token!,
    expiresAt: new Date(credentials.expiry_date!),
  }
}

/**
 * Fetches events from a Google Calendar for a given date range.
 *
 * Paginates through all results (up to 250 events per page) and automatically
 * retries once with a refreshed token if the API returns a 401 Unauthorized error.
 *
 * Events are filtered to exclude:
 * - Cancelled events
 * - All-day events (no specific dateTime)
 * - Events marked as "transparent" (shown as free)
 *
 * @param accessToken - The current OAuth2 access token
 * @param refreshToken - The OAuth2 refresh token for automatic retry on 401 errors
 * @param startDate - Start of the date range to query (inclusive)
 * @param endDate - End of the date range to query (exclusive)
 * @returns Array of {@link CalendarEvent} objects, or an empty array on failure
 *
 * @example
 * ```ts
 * const events = await fetchGoogleCalendarEvents(
 *   connection.accessToken,
 *   connection.refreshToken,
 *   new Date("2026-02-01"),
 *   new Date("2026-02-28")
 * )
 * console.log(`Found ${events.length} busy events`)
 * ```
 */
export async function fetchGoogleCalendarEvents(
  accessToken: string,
  refreshToken: string | null,
  startDate: Date,
  endDate: Date
): Promise<CalendarEvent[]> {
  const oauth2Client = getGoogleOAuth2Client()
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  })

  const calendar = google.calendar({ version: "v3", auth: oauth2Client })

  let allEvents: CalendarEvent[] = []
  let pageToken: string | undefined

  try {
    do {
      const res = await calendar.events.list({
        calendarId: "primary",
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: true,
        orderBy: "startTime",
        maxResults: 250,
        pageToken,
      })

      const items = res.data.items || []

      for (const item of items) {
        // Skip cancelled events
        if (item.status === "cancelled") continue
        // Skip all-day events with no specific time
        if (!item.start?.dateTime || !item.end?.dateTime) continue
        // Skip events marked as free/transparent
        if (item.transparency === "transparent") continue

        allEvents.push({
          start: new Date(item.start.dateTime),
          end: new Date(item.end.dateTime),
          calendarId: "primary",
          provider: "GOOGLE",
          summary: item.summary || undefined,
        })
      }

      pageToken = res.data.nextPageToken || undefined
    } while (pageToken)

    return allEvents
  } catch (error: any) {
    // Handle token expiry - attempt one refresh
    if (error?.code === 401 && refreshToken) {
      try {
        const refreshed = await refreshGoogleToken(refreshToken)
        oauth2Client.setCredentials({
          access_token: refreshed.accessToken,
          refresh_token: refreshToken,
        })

        const retryCalendar = google.calendar({ version: "v3", auth: oauth2Client })
        const res = await retryCalendar.events.list({
          calendarId: "primary",
          timeMin: startDate.toISOString(),
          timeMax: endDate.toISOString(),
          singleEvents: true,
          orderBy: "startTime",
          maxResults: 250,
        })

        const items = res.data.items || []
        return items
          .filter(
            (item) =>
              item.status !== "cancelled" &&
              item.start?.dateTime &&
              item.end?.dateTime &&
              item.transparency !== "transparent"
          )
          .map((item) => ({
            start: new Date(item.start!.dateTime!),
            end: new Date(item.end!.dateTime!),
            calendarId: "primary",
            provider: "GOOGLE" as const,
            summary: item.summary || undefined,
          }))
      } catch (refreshError) {
        console.error("Google Calendar token refresh failed:", refreshError)
        return []
      }
    }

    console.error("Google Calendar fetch events error:", error)
    return []
  }
}

/**
 * Fetches Google Calendar events for a specific CalendarConnection record.
 *
 * This is a convenience wrapper around {@link fetchGoogleCalendarEvents} that
 * looks up the connection details from the database by ID and handles token
 * refresh persistence automatically. Use this when you have a connection ID
 * but not the raw tokens.
 *
 * @param connectionId - The database ID of the CalendarConnection record
 * @param startDate - Start of the date range to query (inclusive)
 * @param endDate - End of the date range to query (exclusive)
 * @returns Array of {@link CalendarEvent} objects, or empty array if connection
 *          is not found, not a Google provider, or token refresh fails
 *
 * @example
 * ```ts
 * const events = await fetchGoogleCalendarEventsByConnectionId(
 *   "clx1abc123",
 *   new Date("2026-02-01"),
 *   new Date("2026-02-28")
 * )
 * ```
 */
export async function fetchGoogleCalendarEventsByConnectionId(
  connectionId: string,
  startDate: Date,
  endDate: Date
): Promise<CalendarEvent[]> {
  const connection = await prisma.calendarConnection.findUnique({
    where: { id: connectionId },
  })

  if (!connection || connection.provider !== "GOOGLE") return []

  // Check if token is expired and refresh proactively
  if (connection.expiresAt && connection.expiresAt < new Date() && connection.refreshToken) {
    try {
      const refreshed = await refreshGoogleToken(connection.refreshToken)
      await prisma.calendarConnection.update({
        where: { id: connection.id },
        data: {
          accessToken: refreshed.accessToken,
          expiresAt: refreshed.expiresAt,
        },
      })
      connection.accessToken = refreshed.accessToken
    } catch (error) {
      console.error(`Failed to refresh token for connection ${connectionId}:`, error)
      return []
    }
  }

  return fetchGoogleCalendarEvents(
    connection.accessToken,
    connection.refreshToken,
    startDate,
    endDate
  )
}
