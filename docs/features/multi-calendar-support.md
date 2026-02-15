# Multi-Calendar Support

Connect multiple Google Calendar and Outlook accounts to SchedulSign and prevent double-booking across all of them.

## Overview

Multi-calendar support lets you:

- **Connect multiple calendars** from Google and Outlook (including personal and work accounts)
- **Check for conflicts across all calendars** so bookers only see times that are free on every calendar you choose
- **Choose which calendars check for conflicts** to control which schedules are considered when calculating availability
- **Set a primary calendar** where new booking events are created
- **Label calendars** with custom names for easy identification (e.g., "Work", "Personal")

## Connecting Calendars

### Google Calendar

1. Go to **Settings > Calendar Connections**
2. Click **Connect Google Calendar**
3. Sign in with your Google account and grant calendar permissions
4. The calendar appears in your connection list with the Google account email

### Outlook / Office 365

1. Go to **Settings > Calendar Connections**
2. Click **Connect Outlook Calendar**
3. Sign in with your Microsoft account and grant calendar permissions
4. The calendar appears in your connection list with the Outlook account email

You can connect multiple accounts from the same provider (e.g., two Google accounts) as long as they use different email addresses.

## Configuring Calendar Settings

Each connected calendar has three settings you can configure:

### Conflict Checking

**What it does:** When enabled, events on this calendar block availability slots on your booking pages.

**Default:** Enabled for all new connections.

**How to toggle:** Click the conflict checking toggle next to the calendar in Settings.

**Constraint:** At least one calendar must always have conflict checking enabled. If you try to disable it on the last calendar that has it on, you will see an error.

**Example use case:** You have a personal Google Calendar and a work Outlook calendar. Enable conflict checking on both so that a dentist appointment on your personal calendar also blocks that time on your booking page.

### Primary Calendar

**What it does:** When a booker schedules a meeting, the calendar event is created on your primary calendar.

**Default:** The first connected calendar is set as primary.

**How to change:** Click "Set as Primary" on the calendar you want. The previous primary is automatically demoted.

**Constraint:** Only one calendar can be primary at a time. If you disconnect the primary calendar, the oldest remaining calendar is automatically promoted.

### Custom Label

**What it does:** A display name shown in the Settings UI to help you identify calendars.

**Default:** No label (the email address is shown instead).

**How to set:** Click the edit icon next to the calendar name and type a custom label (e.g., "Work", "Side Project").

## How Conflict Detection Works

When a visitor opens your booking page, the availability engine:

1. Loads all your calendar connections where `checkConflicts` is enabled
2. Fetches events from each calendar in parallel (Google Calendar API and Microsoft Graph API)
3. Merges all busy events into a single list
4. Removes availability slots that overlap with any busy event (accounting for buffer times)

Results are cached for 5 minutes to reduce external API calls. The cache is automatically cleared when you modify calendar connection settings.

### What counts as a conflict

- Google Calendar: Events that are **not** cancelled, **not** all-day events, and **not** marked as "free" (transparent)
- Outlook: Events where `showAs` is **not** "free"

### What does NOT count as a conflict

- All-day events (no specific time)
- Events you have declined
- Events marked as "free" or "transparent"

## API Reference

### Update Calendar Connection

```
PATCH /api/calendar-connections/:id
```

**Authentication:** Required (session cookie)

**Request body:**

| Field | Type | Description |
|-------|------|-------------|
| `label` | `string` | Custom display name |
| `checkConflicts` | `boolean` | Toggle conflict checking |
| `isPrimary` | `boolean` | Set as primary calendar |

All fields are optional. Only include the fields you want to update.

**Response:** Updated `CalendarConnection` object.

**Example:**

```json
PATCH /api/calendar-connections/clx1abc123
{
  "label": "Work Calendar",
  "checkConflicts": true,
  "isPrimary": true
}
```

### Disconnect Calendar

```
DELETE /api/calendar-connections/:id
```

**Authentication:** Required (session cookie)

**Response:** `{ "success": true }`

**Constraints:**
- Cannot disconnect the last remaining calendar
- If the primary calendar is disconnected, the oldest remaining calendar becomes primary

## Troubleshooting

### "Cannot disable conflict checking on the only calendar with it enabled"

At least one calendar must check for conflicts. To disable conflict checking on this calendar, first enable it on another connected calendar.

### Calendar events are not showing as blocked

1. Check that the calendar has **conflict checking enabled** in Settings
2. Verify the events are not marked as "free" or "transparent" in the source calendar
3. All-day events without specific times do not block slots
4. Cached data may be up to 5 minutes old -- wait and refresh

### Token refresh errors in server logs

Calendar connections use OAuth tokens that expire periodically. The system automatically refreshes tokens, but if a refresh token is revoked (e.g., you changed your Google password or revoked app access), you will need to disconnect and reconnect the calendar.

### Availability shows incorrect times

1. Confirm your timezone is set correctly in **Settings > Profile**
2. Check that your availability rules (working hours) are correct in **Settings > Availability**
3. Verify connected calendars are showing the correct events in the source calendar app

## FAQ

**Q: How many calendars can I connect?**
A: There is no hard limit. You can connect as many Google and Outlook accounts as you need.

**Q: Can I connect two Google accounts?**
A: Yes. Each Google account (identified by email) counts as a separate connection.

**Q: Does SchedulSign write events to all my calendars?**
A: No. New booking events are only created on your **primary** calendar. Other calendars are only read for conflict checking.

**Q: What happens if one calendar API is down?**
A: The system uses `Promise.allSettled` to fetch from all calendars in parallel. If one provider fails, events from the other calendars are still used. The failed calendar is logged but does not block availability calculation.

**Q: How often is calendar data refreshed?**
A: Calendar events are cached for 5 minutes. After the cache expires, the next availability check fetches fresh data from all connected calendars.

**Q: Do I need to be on the Pro plan to use multi-calendar?**
A: Multi-calendar support is available on all plans, including the free plan.
