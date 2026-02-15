# SchedulSign Wireframes

Low-fidelity wireframes for all key screens. Focus is on layout, content hierarchy, and information architecture. Visual design details are covered in the design system and UI specifications.

---

## 1. Public Pages

### 1.1 Landing Page

```
+------------------------------------------------------------------+
| [Logo: SchedulSign]                     [Log in]  [Get Started]  |
+------------------------------------------------------------------+
|                                                                    |
|          [Badge: Replace Calendly + DocuSign for $5/mo]           |
|                                                                    |
|              Schedule meetings. Get documents signed.              |
|                       One platform.                                |
|                                                                    |
|    Stop paying $30/mo for two tools. SchedulSign combines          |
|    professional scheduling and e-signatures in one platform.       |
|                                                                    |
|           [Start Free  ->]     [See Features]                      |
|          No credit card required - Free plan available             |
|                                                                    |
+------------------------------------------------------------------+
| TRUSTED BY: Consultants - Coaches - Agencies - Freelancers        |
+------------------------------------------------------------------+
|                                                                    |
|        Two powerful tools. One simple price.                       |
|                                                                    |
|  +----------------------------+  +----------------------------+   |
|  | [Calendar Icon]            |  | [Signature Icon]           |   |
|  | Smart Scheduling           |  | E-Signatures               |   |
|  |                            |  |                            |   |
|  | Professional booking pages |  | Upload documents, place    |   |
|  | with calendar sync...      |  | signature fields, send...  |   |
|  |                            |  |                            |   |
|  | * Shareable booking links  |  | * Upload PDF, Word, image  |   |
|  | * Google & Outlook sync    |  | * Drag-and-drop fields     |   |
|  | * Zoom & Meet auto-links   |  | * Draw/type/upload sig     |   |
|  | * Custom availability      |  | * Sequential signing       |   |
|  | * Email & SMS reminders    |  | * Reusable templates       |   |
|  | * Payment collection       |  | * Audit trail              |   |
|  | * Website embed            |  | * Email reminders          |   |
|  | * Collective scheduling    |  | * Mobile-friendly signing  |   |
|  +----------------------------+  +----------------------------+   |
|                                                                    |
+------------------------------------------------------------------+
|                       How it works                                 |
|                                                                    |
|     (1)                    (2)                    (3)              |
|  Create your           Share your           Get booked &          |
|  event types           booking link         send contracts        |
|                                                                    |
+------------------------------------------------------------------+
|                    Simple, honest pricing                          |
|                                                                    |
|  +----------------------------+  +----------------------------+   |
|  | Free                       |  | Pro           MOST POPULAR |   |
|  | $0 forever                 |  | $5/mo or $48/yr            |   |
|  |                            |  |                            |   |
|  | * 1 event type             |  | * Unlimited event types    |   |
|  | * 3 signature sends/mo     |  | * Unlimited signatures     |   |
|  | * Basic scheduling         |  | * Custom branding          |   |
|  | * Google Calendar sync     |  | * All integrations         |   |
|  |                            |  | * SMS reminders            |   |
|  | [Get Started]              |  | * Payment collection       |   |
|  |                            |  | * Webhooks & API           |   |
|  +----------------------------+  | * Priority support         |   |
|                                  |                            |   |
|                                  | [Start Free Trial]         |   |
|                                  +----------------------------+   |
|                                                                    |
+------------------------------------------------------------------+
|              Ready to simplify your workflow?                       |
|  Join thousands who schedule and sign with SchedulSign.            |
|                    [Get Started Free ->]                           |
+------------------------------------------------------------------+
| (c) 2026 SchedulSign     Privacy  Terms  Support                  |
+------------------------------------------------------------------+
```

**Key layout decisions:**
- Sticky top nav with logo left, auth actions right
- Hero section: centered, badge above headline, dual CTA buttons
- Social proof bar: thin divider section with target audience segments
- Features: 2-column card grid, icon + title + description + checklist
- How it works: 3-step horizontal flow with numbered circles
- Pricing: 2-column cards, "Most Popular" badge on Pro
- Final CTA: full-width colored background section
- Footer: minimal, copyright left, links right

---

### 1.2 Login Page

```
+------------------------------------------------------------------+
|                                                                    |
|                        [SchedulSign Logo]                          |
|                                                                    |
|                        Welcome back                                |
|                     Sign in to your account                        |
|                                                                    |
|              +-------------------------------+                     |
|              |                               |                     |
|              | [Google Icon] Continue with    |                     |
|              |              Google            |                     |
|              |                               |                     |
|              | -----------or-----------       |                     |
|              |                               |                     |
|              | Email                          |                     |
|              | [________________________]     |                     |
|              |                               |                     |
|              | Password                       |                     |
|              | [________________________]     |                     |
|              |                               |                     |
|              | [       Sign in          ]     |                     |
|              |                               |                     |
|              +-------------------------------+                     |
|                                                                    |
|              Don't have an account? Sign up                        |
|                                                                    |
+------------------------------------------------------------------+
```

**Key layout decisions:**
- Centered card layout on gray background
- Logo above card links back to landing page
- Google OAuth button prominent at top (social login preferred)
- Horizontal divider with "or" for email/password fallback
- Error state: red alert bar appears above email field
- Link to signup at bottom outside the card

---

### 1.3 Signup Page

```
+------------------------------------------------------------------+
|                                                                    |
|                        [SchedulSign Logo]                          |
|                                                                    |
|                     Create your account                            |
|              Get started for free - no credit card needed          |
|                                                                    |
|              +-------------------------------+                     |
|              |                               |                     |
|              | [Google Icon] Sign up with     |                     |
|              |              Google            |                     |
|              |                               |                     |
|              | -----------or-----------       |                     |
|              |                               |                     |
|              | Full Name                      |                     |
|              | [________________________]     |                     |
|              |                               |                     |
|              | Email                          |                     |
|              | [________________________]     |                     |
|              |                               |                     |
|              | Password                       |                     |
|              | [________________________]     |                     |
|              |  At least 8 characters         |                     |
|              |                               |                     |
|              | [    Create account      ]     |                     |
|              |                               |                     |
|              +-------------------------------+                     |
|                                                                    |
|              Already have an account? Sign in                      |
|                                                                    |
+------------------------------------------------------------------+
```

**Key layout decisions:**
- Same centered card layout as login for consistency
- Additional "Full Name" field above email
- Password hint text below field
- Reassuring subtitle about free/no credit card

---

### 1.4 Public User Booking Page (Event Type Selection)

```
+------------------------------------------------------------------+
|                                                                    |
|                    [User Avatar / Initial]                         |
|                       John Smith                                   |
|                  Select an event to book                           |
|                                                                    |
|              +-------------------------------+                     |
|              | |  30 Minute Meeting           |                     |
|              | |  Quick intro call             |                     |
|              | |  [Clock] 30 min               |                     |
|              +-------------------------------+                     |
|                                                                    |
|              +-------------------------------+                     |
|              | |  60 Minute Consultation       |                     |
|              | |  In-depth strategy session     |                     |
|              | |  [Clock] 1h                    |                     |
|              +-------------------------------+                     |
|                                                                    |
|              +-------------------------------+                     |
|              | |  15 Min Quick Chat            |                     |
|              | |  [Clock] 15 min               |                     |
|              +-------------------------------+                     |
|                                                                    |
|               Powered by SchedulSign                               |
|                                                                    |
+------------------------------------------------------------------+
```

**Key layout decisions:**
- Centered narrow layout (max-w-lg)
- User avatar/initial with brand color at top
- Event type cards stacked vertically
- Left color bar on each card for event type identification
- Duration shown with clock icon
- "Powered by" branding at bottom

---

### 1.5 Booking Widget (Calendar + Time Selection)

```
+------------------------------------------------------------------+
|                                                                    |
|  +-------------------------------+-------------------------------+|
|  |                               |                               ||
|  | [Avatar]                      |  < February 2026 >            ||
|  | John Smith                    |                               ||
|  | 30 Minute Meeting             |  Su Mo Tu We Th Fr Sa         ||
|  |                               |   1  2  3  4  5  6  7         ||
|  | A quick intro call to         |   8  9 10 11 12 13 [14]       ||
|  | discuss your project.         |  15 16 17 18 19 20 21         ||
|  |                               |  22 23 24 25 26 27 28         ||
|  | [Clock] 30 min                |                               ||
|  | [Globe] Google Meet           |  +--Time Slots--+             ||
|  |                               |  | Sat, Feb 14  |             ||
|  | [Timezone Selector v]         |  |              |             ||
|  |                               |  | [10:00 AM]   |             ||
|  |                               |  | [10:30 AM]   |             ||
|  |                               |  | [*11:00 AM*] |             ||
|  |                               |  | [Confirm ->] |             ||
|  |                               |  | [11:30 AM]   |             ||
|  |                               |  | [12:00 PM]   |             ||
|  |                               |  +--------------+             ||
|  +-------------------------------+-------------------------------+|
|                                                                    |
+------------------------------------------------------------------+
```

**Key layout decisions:**
- Two-panel layout: event info (left), calendar+slots (right)
- Left panel: avatar, host name, event title (brand color), description, duration, location, timezone selector
- Right panel splits into calendar grid and time slot list
- Calendar: month navigation at top, 7-column grid, selected date highlighted with brand color
- Time slots: scrollable list, selected slot shows "Confirm ->" text
- On click "Confirm ->", transitions to booking form step
- Mobile: stacks vertically (event info on top, calendar below)

---

### 1.6 Booking Form (Details Entry)

```
+------------------------------------------------------------------+
|                                                                    |
|  +-------------------------------+-------------------------------+|
|  |                               |                               ||
|  | [Avatar]                      |  <- Back                      ||
|  | John Smith                    |                               ||
|  | 30 Minute Meeting             |  Enter your details           ||
|  |                               |  Sat, Feb 14 - 11:00 AM (ET) ||
|  | [Clock] 30 min                |                               ||
|  | [Globe] Google Meet           |  Name *                       ||
|  |                               |  [________________________]   ||
|  |                               |                               ||
|  |                               |  Email *                      ||
|  |                               |  [________________________]   ||
|  |                               |                               ||
|  |                               |  Phone                        ||
|  |                               |  [________________________]   ||
|  |                               |                               ||
|  |                               |  [Custom Question 1]          ||
|  |                               |  [________________________]   ||
|  |                               |                               ||
|  |                               |  [   Confirm Booking    ]     ||
|  |                               |                               ||
|  +-------------------------------+-------------------------------+|
|                                                                    |
+------------------------------------------------------------------+
```

**Key layout decisions:**
- Same two-panel layout as calendar view for continuity
- Left panel unchanged (event info)
- Right panel: back button, section title, selected time summary, form fields
- Required fields marked with asterisk
- Custom questions rendered dynamically based on event type config
- CTA button uses brand color; if payment required, shows "Book & Pay USD $50"

---

### 1.7 Booking Confirmation

```
+------------------------------------------------------------------+
|                                                                    |
|              +-------------------------------+                     |
|              |                               |                     |
|              |        [Green Checkmark]       |                     |
|              |                               |                     |
|              |      Booking Confirmed!        |                     |
|              |  You're all set. A confirmation |                    |
|              |  email has been sent.           |                     |
|              |                               |                     |
|              | +---------------------------+ |                     |
|              | | 30 Minute Meeting          | |                     |
|              | | Sat, February 14, 2026     | |                     |
|              | | 11:00 AM (America/New_York)| |                     |
|              | | Host: John Smith           | |                     |
|              | |                           | |                     |
|              | | [Join Meeting]             | |                     |
|              | +---------------------------+ |                     |
|              |                               |                     |
|              |  [Reschedule]    [Cancel]      |                     |
|              |                               |                     |
|              |  Powered by SchedulSign        |                     |
|              +-------------------------------+                     |
|                                                                    |
+------------------------------------------------------------------+
```

**Key layout decisions:**
- Centered card layout (max-w-md)
- Success icon (green circle + checkmark) at top
- Booking details in gray summary box
- Meeting link button (if virtual meeting)
- Reschedule/Cancel links below
- "Powered by" branding at bottom

---

### 1.8 Cancel Booking Page

```
+------------------------------------------------------------------+
|                                                                    |
|              +-------------------------------+                     |
|              |                               |                     |
|              |        Cancel Booking          |                     |
|              |  Are you sure you want to      |                     |
|              |  cancel this booking?           |                    |
|              |                               |                     |
|              |  Reason (optional)             |                     |
|              |  [                         ]   |                     |
|              |  [                         ]   |                     |
|              |  [                         ]   |                     |
|              |                               |                     |
|              |  [Go back]  [Cancel Booking]   |                     |
|              |                               |                     |
|              +-------------------------------+                     |
|                                                                    |
+------------------------------------------------------------------+
```

---

### 1.9 Reschedule Booking Page

```
+------------------------------------------------------------------+
|                                                                    |
|              +-------------------------------+                     |
|              |                               |                     |
|              |      Reschedule Booking        |                     |
|              |  Pick a new time for your      |                     |
|              |  meeting.                       |                    |
|              |                               |                     |
|              |  < February 2026 >             |                     |
|              |  Su Mo Tu We Th Fr Sa          |                     |
|              |   1  2  3  4  5  6  7          |                     |
|              |   8  9 10 11 12 13 [14]        |                     |
|              |  15 16 17 18 19 20 21          |                     |
|              |  22 23 24 25 26 27 28          |                     |
|              |                               |                     |
|              |  Sat, Feb 14                   |                     |
|              |  [10:00] [10:30] [*11:00*]     |                     |
|              |  [11:30] [12:00] [12:30]       |                     |
|              |                               |                     |
|              |  [   Confirm New Time    ]     |                     |
|              |                               |                     |
|              +-------------------------------+                     |
|                                                                    |
+------------------------------------------------------------------+
```

**Key layout decisions:**
- Centered card with calendar and 3-column slot grid
- CTA button appears only after slot selection

---

## 2. Dashboard Pages

### 2.1 Dashboard Shell (Layout)

```
+------------------------------------------------------------------+
| [Logo: SchedulSign]                      [user@email.com] [Logout]|
+------------------------------------------------------------------+
| [Sidebar]         |  [Main Content Area]                          |
|                   |                                                |
| Overview          |  (page content renders here)                  |
| Event Types       |                                                |
| Bookings          |                                                |
| Availability      |                                                |
| Contacts          |                                                |
| Webhooks          |                                                |
| Settings          |                                                |
|                   |                                                |
|                   |                                                |
+-------------------+------------------------------------------------+
```

**Key layout decisions:**
- Top bar: logo left, user email + logout right, h-14, sticky
- Sidebar: 224px (w-56), hidden on mobile, nav items with icons
- Active nav item: blue background highlight
- Main content: flex-1, max-w-5xl, padded
- Mobile: sidebar hidden, content full-width (mobile nav TBD)

---

### 2.2 Dashboard Home (Overview)

```
+------------------------------------------------------------------+
| Dashboard                                                          |
|                                                                    |
| +------------------+  +------------------+  +------------------+  |
| | [Calendar Icon]  |  | [Clock Icon]     |  | [Users Icon]     |  |
| | Event Types      |  | Upcoming Bookings|  | Contacts         |  |
| | 3                |  | 12               |  | 47               |  |
| +------------------+  +------------------+  +------------------+  |
|                                                                    |
| +----------------------------------------------------------------+|
| | Upcoming Bookings                            View all ->        ||
| +----------------------------------------------------------------+|
| | 30 Min Meeting                          [CONFIRMED]             ||
| | Fri, Feb 13, 2026 at 2:00 PM                                    ||
| | Jane Doe (jane@example.com)                                      ||
| +----------------------------------------------------------------+|
| | 60 Min Consultation                     [CONFIRMED]             ||
| | Mon, Feb 16, 2026 at 10:00 AM                                   ||
| | Bob Smith (bob@example.com)                                      ||
| +----------------------------------------------------------------+|
| | (empty state if no bookings)                                     ||
| | No upcoming bookings                                             ||
| | Create an event type to get started                              ||
| +----------------------------------------------------------------+|
|                                                                    |
+------------------------------------------------------------------+
```

**Key layout decisions:**
- Page title at top left
- 3-column stat cards: icon + label + large number
- Upcoming bookings: card with header row (title + "View all" link)
- Each booking row: title, datetime, booker info, status badge
- Empty state: centered text with CTA link

---

### 2.3 Event Types List

```
+------------------------------------------------------------------+
| Event Types                                [+ New Event Type]      |
|                                                                    |
| +----------------------------------------------------------------+|
| | [|] 30 Minute Meeting                                           ||
| |     30 min - Google Meet - 5 bookings    [Copy] [Edit] [Delete] ||
| +----------------------------------------------------------------+|
| | [|] 60 Minute Consultation                                      ||
| |     1h - Zoom - 12 bookings             [Copy] [Edit] [Delete] ||
| +----------------------------------------------------------------+|
| | [|] 15 Min Quick Chat                                           ||
| |     15 min - Phone - 2 bookings         [Copy] [Edit] [Delete] ||
| +----------------------------------------------------------------+|
|                                                                    |
| (empty state)                                                      |
| +----------------------------------------------------------------+|
| |                  No event types yet                              ||
| |            Create your first event type                          ||
| +----------------------------------------------------------------+|
|                                                                    |
+------------------------------------------------------------------+
```

**Key layout decisions:**
- Header row: page title left, primary action button right
- Event type cards: left color bar, title + metadata row, action icons right
- Metadata: duration, location type, booking count
- Actions: copy link, edit (navigate), delete (with confirm)
- Empty state: centered with CTA link

---

### 2.4 Create Event Type Modal

```
+------------------------------------------------------------------+
|                                                                    |
|        +--------------------------------------+                    |
|        |  Create Event Type                   |                    |
|        |                                      |                    |
|        |  Title                               |                    |
|        |  [e.g. 30 Minute Meeting_________]   |                    |
|        |                                      |                    |
|        |  Duration (minutes)                  |                    |
|        |  [30 v]                              |                    |
|        |                                      |                    |
|        |  Location                            |                    |
|        |  [Google Meet v]                     |                    |
|        |                                      |                    |
|        |  Description                         |                    |
|        |  [                               ]   |                    |
|        |  [  Optional                     ]   |                    |
|        |                                      |                    |
|        |                 [Cancel]  [Create]    |                    |
|        +--------------------------------------+                    |
|                                                                    |
+------------------------------------------------------------------+
```

**Key layout decisions:**
- Centered modal with backdrop overlay
- Simple form: title, duration dropdown, location dropdown, description textarea
- Two buttons: Cancel (ghost) and Create (primary)

---

### 2.5 Edit Event Type (Full Page)

```
+------------------------------------------------------------------+
| [<-] Edit Event Type                                               |
|                                                                    |
| +----------------------------------------------------------------+|
| | Title                           Duration (min)                  ||
| | [30 Minute Meeting_____]        [30 v]                          ||
| |                                                                 ||
| | Location                        Color                           ||
| | [Google Meet v]                 [Color Picker]                  ||
| |                                                                 ||
| | Description                                                     ||
| | [A quick intro call to discuss your project...              ]   ||
| +----------------------------------------------------------------+|
| |                                                                 ||
| | --- Scheduling Rules ---                                        ||
| |                                                                 ||
| | Buffer before (min)   Buffer after (min)   Min notice (min)     ||
| | [0___]                [0___]               [120__]              ||
| |                                                                 ||
| | Daily limit           Weekly limit         Max future (days)    ||
| | [No limit__]          [No limit__]         [60___]              ||
| +----------------------------------------------------------------+|
| |                                                                 ||
| | --- Payment ---                                                 ||
| | [ ] Require payment before booking                              ||
| |                                                                 ||
| | --- Options ---                                                 ||
| | [ ] Collective scheduling                                       ||
| | [x] Active (visible on booking page)                            ||
| |                                                                 ||
| |                                    [Save Changes]               ||
| +----------------------------------------------------------------+|
|                                                                    |
+------------------------------------------------------------------+
```

**Key layout decisions:**
- Back arrow + title in header
- Single white card containing all settings
- 2-column grid for basic fields
- Horizontal rule separators between sections
- Scheduling rules in 3-column grid
- Checkboxes for toggles (payment, collective, active)
- Save button bottom-right

---

### 2.6 Bookings List

```
+------------------------------------------------------------------+
| Bookings                                                           |
|                                                                    |
| [*Upcoming*]  [Past]  [Cancelled]  [All]                          |
|                                                                    |
| +----------------------------------------------------------------+|
| | 30 Min Meeting                              [CONFIRMED]         ||
| | Fri, Feb 13, 2026  2:00 PM - 2:30 PM                           ||
| | Jane Doe - jane@example.com                                     ||
| | Join meeting                                                    ||
| +----------------------------------------------------------------+|
| | 60 Min Consultation                         [CONFIRMED]         ||
| | Mon, Feb 16, 2026  10:00 AM - 11:00 AM                         ||
| | Bob Smith - bob@example.com                                     ||
| | Join meeting                                                    ||
| +----------------------------------------------------------------+|
| | (empty)  No bookings found                                      ||
| +----------------------------------------------------------------+|
|                                                                    |
+------------------------------------------------------------------+
```

**Key layout decisions:**
- Filter tabs: horizontal pill buttons for status filtering
- Active tab: blue background
- Booking rows in white card with dividers
- Each row: title, datetime range, booker info, meeting link, status badge
- Status badge colors: green=confirmed, red=cancelled, yellow=rescheduled, gray=default

---

### 2.7 Availability Settings

```
+------------------------------------------------------------------+
| Availability                                            [Save]     |
|                                                                    |
| +----------------------------------------------------------------+|
| | [ ] Sunday      Unavailable                                     ||
| +----------------------------------------------------------------+|
| | [x] Monday      [09:00] -- [17:00]                             ||
| +----------------------------------------------------------------+|
| | [x] Tuesday     [09:00] -- [17:00]                             ||
| +----------------------------------------------------------------+|
| | [x] Wednesday   [09:00] -- [17:00]                             ||
| +----------------------------------------------------------------+|
| | [x] Thursday    [09:00] -- [17:00]                             ||
| +----------------------------------------------------------------+|
| | [x] Friday      [09:00] -- [17:00]                             ||
| +----------------------------------------------------------------+|
| | [ ] Saturday    Unavailable                                     ||
| +----------------------------------------------------------------+|
|                                                                    |
+------------------------------------------------------------------+
```

**Key layout decisions:**
- Header with Save button (top right)
- White card with dividers between days
- Each row: checkbox toggle, day name (fixed width), time range or "Unavailable"
- Time inputs: HTML time inputs for start/end
- Dash separator between start and end times
- Disabled days show gray "Unavailable" text

---

### 2.8 Contacts List

```
+------------------------------------------------------------------+
| Contacts                                                           |
|                                                                    |
| +----------------------------------------------------------------+|
| | Name       | Email               | Phone    | Source  | Added   ||
| +----------------------------------------------------------------+|
| | Jane Doe   | jane@example.com    | 555-1234 | booking | Feb 10 ||
| | Bob Smith  | bob@example.com     | --       | booking | Feb 8  ||
| | Alice Lee  | alice@example.com   | 555-5678 | sig     | Feb 5  ||
| +----------------------------------------------------------------+|
|                                                                    |
| (empty state)                                                      |
| | Contacts are automatically created from bookings and signatures.||
|                                                                    |
+------------------------------------------------------------------+
```

**Key layout decisions:**
- Simple data table with header row
- Columns: Name, Email, Phone, Source (badge), Date Added
- Source shown as small badge/tag
- Empty state: informational message about auto-creation

---

### 2.9 Settings Page

```
+------------------------------------------------------------------+
| Settings                                                           |
|                                                                    |
| +-- Profile -----------------------------------------------+      |
| |                                                           |      |
| | Name                     URL Slug                         |      |
| | [John Smith___]          schedulsign.com/ [john-smith]    |      |
| |                                                           |      |
| | Timezone                 Email                            |      |
| | [America/New_York v]     [john@email.com] (disabled)      |      |
| |                                                           |      |
| | --- Branding ---                                          |      |
| | Brand Color              Logo URL                         |      |
| | [Color Picker]           [https://...]                    |      |
| |                                                           |      |
| | [Save Profile]                                            |      |
| +-----------------------------------------------------------+      |
|                                                                    |
| +-- Calendar Connections --------------------------------+          |
| |                                                        |          |
| | [Google]  john@gmail.com           Connected (check)   |          |
| |                                                        |          |
| | [+ Connect Outlook / Office 365]                       |          |
| +--------------------------------------------------------+          |
|                                                                    |
| +-- Subscription ------------------------------------------+       |
| |                                                          |       |
| | [FREE]  (or [PRO] Renews March 1, 2026)                |       |
| |                                                          |       |
| | Upgrade to Pro for unlimited features.                   |       |
| | [$5/month]  [$48/year (save 20%)]                       |       |
| |                                                          |       |
| | (or if Pro: Manage billing ->)                          |       |
| +----------------------------------------------------------+       |
|                                                                    |
| +-- Embed Widget ------------------------------------------+       |
| |                                                          |       |
| | Add SchedulSign to your website:                         |       |
| | +------------------------------------------------------+ |       |
| | | <iframe src="..." style="..." />                      | |       |
| | +------------------------------------------------------+ |       |
| |                                                          |       |
| | Or use the JavaScript snippet:                           |       |
| | +------------------------------------------------------+ |       |
| | | <script src="..." data-user="john-smith"></script>    | |       |
| | +------------------------------------------------------+ |       |
| +----------------------------------------------------------+       |
|                                                                    |
+------------------------------------------------------------------+
```

**Key layout decisions:**
- Vertical stack of card sections with spacing
- Profile: 2-column grid for fields, branding sub-section
- Calendar connections: list of connected providers with status, dashed-border add button
- Subscription: plan badge, upgrade buttons or manage billing link
- Embed: code blocks with dark background, monospace font

---

### 2.10 Webhooks Page

```
+------------------------------------------------------------------+
| Webhooks                                         [+ Add Webhook]   |
|                                                                    |
| (inline create form when active)                                   |
| +----------------------------------------------------------------+|
| | [https://your-app.com/webhook___________]  [Add]  [Cancel]     ||
| +----------------------------------------------------------------+|
|                                                                    |
| +----------------------------------------------------------------+|
| | https://api.example.com/hooks/schedulsign                       ||
| | Events: booking.created, booking.cancelled                      ||
| | Secret: whsec_abc123...          [Copy]              [Delete]   ||
| +----------------------------------------------------------------+|
| | https://hooks.zapier.com/12345                                  ||
| | Events: booking.created                                         ||
| | Secret: whsec_def456...          [Copy]              [Delete]   ||
| +----------------------------------------------------------------+|
|                                                                    |
| (empty)  No webhooks configured                                   |
|                                                                    |
+------------------------------------------------------------------+
```

**Key layout decisions:**
- Header with "Add Webhook" button
- Inline form: URL input + Add/Cancel buttons in a card
- Webhook items: URL (monospace), events list, truncated secret with copy button, delete button
- Empty state: centered message

---

## 3. E-Signature Pages (Future Module)

### 3.1 Documents List (Dashboard)

```
+------------------------------------------------------------------+
| Documents                                    [+ New Document]      |
|                                                                    |
| [All]  [Draft]  [Sent]  [Signed]  [Completed]                     |
|                                                                    |
| +----------------------------------------------------------------+|
| | [PDF Icon]  Client Contract - Q1 2026       [SENT]              ||
| |             Sent to jane@example.com                            ||
| |             Created Feb 10, 2026                                ||
| |                                   [View] [Resend] [Void]       ||
| +----------------------------------------------------------------+|
| | [PDF Icon]  NDA - Project Alpha             [DRAFT]             ||
| |             Not yet sent                                        ||
| |             Created Feb 8, 2026                                 ||
| |                                   [Edit] [Send]  [Delete]       ||
| +----------------------------------------------------------------+|
| | [PDF Icon]  Service Agreement               [COMPLETED]         ||
| |             Signed by bob@example.com                           ||
| |             Completed Feb 5, 2026                               ||
| |                                   [View] [Download] [Audit]     ||
| +----------------------------------------------------------------+|
|                                                                    |
| (empty state)                                                      |
| | No documents yet. Upload a PDF or create from a template.       ||
|                                                                    |
+------------------------------------------------------------------+
```

**Key layout decisions:**
- Same pattern as event types/bookings: header with CTA, filter tabs, card list
- Each document row: file icon, title, status badge, recipient info, dates
- Contextual actions based on document status:
  - Draft: Edit, Send, Delete
  - Sent: View, Resend, Void
  - Completed: View, Download, Audit Trail
- Status badge colors: gray=draft, blue=sent, yellow=viewed, green=signed, emerald=completed, red=voided

---

### 3.2 Document Editor (Field Placement)

```
+------------------------------------------------------------------+
| [<- Back]  NDA - Project Alpha                    [Send] [Save]   |
+------------------------------------------------------------------+
|                   |                                                |
| Field Palette     |  +--Document Preview (PDF Viewer)----------+  |
|                   |  |                                         |  |
| [Signature]       |  |  (Page 1 of 3)                         |  |
| [Date]            |  |                                         |  |
| [Text]            |  |  This Non-Disclosure Agreement...       |  |
| [Initials]        |  |                                         |  |
| [Checkbox]        |  |                                         |  |
|                   |  |                                         |  |
| ---- Signers ---- |  |  +-[Signature Field]--+                |  |
|                   |  |  | Signer: Jane Doe   |                |  |
| Signer 1:         |  |  | [Drag to position] |                |  |
| [jane@example.com]|  |  +--------------------+                |  |
|                   |  |                                         |  |
| [+ Add Signer]    |  |  +-[Date Field]-------+                |  |
|                   |  |  | Auto-filled         |                |  |
| ---- Signing ---- |  |  +--------------------+                |  |
| Order             |  |                                         |  |
|                   |  |  [< Page 1 of 3 >]                     |  |
| ( ) Any order     |  +----------------------------------------+  |
| (*) Sequential    |                                                |
|                   |                                                |
+-------------------+------------------------------------------------+
```

**Key layout decisions:**
- Full-width layout with back button and action buttons in header
- Left sidebar: field palette (draggable field types), signer list, signing order options
- Main area: document preview with placed fields as draggable/resizable overlays
- Fields show signer assignment and type
- Page navigation at bottom of document preview
- Responsive: on mobile, field palette becomes a bottom sheet/drawer

---

### 3.3 Signing Experience (Signer View)

```
+------------------------------------------------------------------+
|                                                                    |
| [SchedulSign]                    Sent by: John Smith               |
|                                                                    |
| +----------------------------------------------------------------+|
| |                                                                 ||
| |  (Document Content - PDF Render)                                ||
| |                                                                 ||
| |  This Non-Disclosure Agreement is entered into by              ||
| |  and between...                                                 ||
| |                                                                 ||
| |  +-[SIGN HERE]------------------------------+                  ||
| |  |                                          |                  ||
| |  |  Click to sign                           |                  ||
| |  |                                          |                  ||
| |  +------------------------------------------+                  ||
| |                                                                 ||
| |  +-[DATE]---------+                                            ||
| |  | Auto-filled    |                                            ||
| |  +----------------+                                            ||
| |                                                                 ||
| +----------------------------------------------------------------+|
|                                                                    |
|    [< Page 1 of 3 >]                                              |
|                                                                    |
|    [Decline]                               [Finish Signing]        |
|                                                                    |
+------------------------------------------------------------------+

(Signature Modal - appears when clicking "SIGN HERE")
+--------------------------------------+
|  Add Your Signature                  |
|                                      |
|  [Draw]  [Type]  [Upload]            |
|                                      |
|  +--------------------------------+  |
|  |                                |  |
|  |   (Canvas / Text Input /       |  |
|  |    Upload Area)                |  |
|  |                                |  |
|  +--------------------------------+  |
|                                      |
|  [Clear]              [Apply]        |
+--------------------------------------+
```

**Key layout decisions:**
- Clean, focused layout: header with branding + sender info
- Document takes up most of the viewport
- Signature fields highlighted with colored border and "SIGN HERE" label
- Guided flow: fields to complete are highlighted sequentially
- Bottom bar: Decline (secondary) and Finish Signing (primary)
- Signature modal: tab interface for Draw/Type/Upload methods
- Draw: canvas with pen input
- Type: text input with font preview
- Upload: file upload area for image
- Page navigation if multi-page document

---

## 4. Responsive Behavior Summary

### Mobile (< 768px)

| Screen | Adaptation |
|--------|-----------|
| Landing page | Single column, stacked features, stacked pricing |
| Login/Signup | Full width card, same layout |
| Dashboard shell | Sidebar hidden, hamburger menu or bottom nav |
| Dashboard pages | Single column, stat cards stack vertically |
| Booking widget | Event info stacks above calendar, slots below |
| Document editor | Bottom sheet for field palette |
| Signing view | Full-width document, sticky bottom bar |

### Tablet (768px - 1024px)

| Screen | Adaptation |
|--------|-----------|
| Landing page | 2-column features maintained |
| Dashboard shell | Sidebar visible (narrower) |
| Booking widget | Two-panel maintained |
| Document editor | Collapsible sidebar |

### Desktop (> 1024px)

All layouts as shown in wireframes above. Max content width: 1152px (max-w-6xl for public pages, max-w-5xl for dashboard).

---

## 5. Key Interaction Patterns

### Navigation
- **Public pages**: Sticky top nav with logo + auth buttons
- **Dashboard**: Sticky top bar + fixed sidebar, content scrolls independently
- **Booking flow**: Step-based progression (calendar -> time -> form -> confirmation)

### Loading States
- Skeleton loading (animate-pulse) for data fetching
- Spinner for async actions (save, create, delete)
- Button text changes during loading ("Saving..." / "Creating...")

### Empty States
- Centered text with description of what will appear
- CTA link/button to create first item

### Modals
- Centered overlay with backdrop blur
- Used sparingly: only for quick creation flows (event type, webhook)
- Complex edits use full pages

### Feedback
- Success: green toast or inline confirmation
- Error: red alert bar inline with form
- Status badges: colored pills with text

### Forms
- Labels above inputs
- Focus ring on active input (blue)
- Required fields marked with asterisk
- Helper text below fields (small, gray)
- Disabled fields have gray background
