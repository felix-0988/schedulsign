# SchedulSign - Architecture & Implementation Reference

This document describes the **currently implemented** system as of February 2026. For planned features (e-signatures), see the design docs.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router, SSR) | 14.2.35 |
| Runtime | React / TypeScript | 18.3.1 / 5.x |
| Database | PostgreSQL (AWS RDS) | 16.4 |
| ORM | Prisma | 5.22.0 |
| Auth | AWS Cognito + Amplify v6 | 6.16.2 |
| Payments | Stripe | 20.3.1 |
| Calendar | Google APIs / Microsoft Graph | 171.4.0 / 3.0.7 |
| Video | Google Meet (via Calendar API) / Zoom API | - |
| Email | Nodemailer via AWS SES SMTP | 7.0.13 |
| SMS | Twilio | 5.12.1 |
| Styling | Tailwind CSS + Lucide React icons | 3.4.1 / 0.564.0 |
| Testing | Vitest (unit) + Playwright (E2E) | 4.0.18 / 1.58.2 |
| Infra | Terraform on AWS | >= 1.0 |

---

## Database Schema

### Models

**User** - Central entity with subscription/branding
- Auth: `cognitoId` (unique), `email` (unique)
- Profile: `name`, `slug` (unique), `image`, `timezone`
- Subscription: `stripeCustomerId`, `stripeSubscriptionId`, `plan` (FREE/PRO)
- Branding: `brandColor` (default `#2563eb`), `brandLogo`

**EventType** - Bookable meeting configurations
- Basic: `title`, `slug`, `description`, `duration`, `location`, `color`, `active`
- Rules: `bufferBefore`, `bufferAfter`, `dailyLimit`, `weeklyLimit`, `minNotice`, `maxFutureDays`
- Payment: `requirePayment`, `price`, `currency`
- Collective: `isCollective`, `collectiveMembers` (array of user IDs)
- Has many: `CustomQuestion`, `Booking`

**CustomQuestion** - Intake form fields for event types
- `label`, `type` (TEXT/TEXTAREA/SELECT/RADIO/CHECKBOX/PHONE/EMAIL), `required`, `options`, `order`

**Booking** - Scheduled meetings
- `uid` (unique), `title`, `startTime`, `endTime`
- `status`: PENDING, CONFIRMED, CANCELLED, RESCHEDULED, COMPLETED, NO_SHOW
- Booker: `bookerName`, `bookerEmail`, `bookerTimezone`, `bookerPhone`
- Meeting: `location`, `meetingUrl`, `meetingId`
- Payment: `paid`, `paymentAmount`, `stripePaymentIntentId`
- `answers` (JSON), `cancelReason`, `rescheduleUid`
- Reminders: `reminderSentAt`, `smsReminderSentAt`

**Availability** - Weekly schedule rules
- `dayOfWeek` (0-6), `date` (for overrides), `startTime`/`endTime` (HH:MM), `enabled`

**CalendarConnection** - OAuth calendar integrations
- `provider` (GOOGLE/OUTLOOK), `accessToken`, `refreshToken`, `expiresAt`, `email`
- `isPrimary`, `checkConflicts`, `label`
- Unique: `[userId, provider, email]`

**Webhook** - Outgoing webhook subscriptions
- `url`, `events` (array), `secret` (HMAC-SHA256), `active`

**Contact** - Auto-populated from bookings
- `name`, `email`, `phone`, `company`, `notes`, `source` (booking/signature/manual)

**Document** - E-signature documents (schema only, not implemented)
- `title`, `fileName`, `fileUrl`, `status` (DRAFT/SENT/VIEWED/SIGNED/COMPLETED/VOIDED)

---

## API Endpoints

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/auth/google` | Session | Start Google Calendar OAuth |
| GET | `/api/auth/google/callback` | - | Google Calendar OAuth callback |
| GET | `/api/auth/outlook` | Session | Start Outlook Calendar OAuth |
| GET | `/api/auth/outlook/callback` | Session | Outlook Calendar OAuth callback |
| GET | `/api/auth/clear-cookies` | - | Clear stale Cognito cookies |

### User
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/user` | Session | Get current user + calendar connections |
| PATCH | `/api/user` | Session | Update profile (name, timezone, slug, branding) |

### Event Types
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/event-types` | Session | List event types with questions + booking counts |
| POST | `/api/event-types` | Session | Create event type (enforces plan limits) |
| GET | `/api/event-types/[id]` | Session | Get single event type |
| PATCH | `/api/event-types/[id]` | Session | Update event type |
| DELETE | `/api/event-types/[id]` | Session | Delete event type |

### Bookings
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/bookings` | Session | List user's bookings |
| POST | `/api/bookings` | Public | Create booking (conflict check, calendar, email, webhook) |
| POST | `/api/bookings/[uid]/cancel` | Public | Cancel booking |
| POST | `/api/bookings/[uid]/reschedule` | Public | Reschedule booking |

### Availability & Slots
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/availability` | Session | Get availability rules |
| PUT | `/api/availability` | Session | Replace all availability rules |
| GET | `/api/slots` | Public | Get available time slots for an event type |

### Calendar Connections
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| PATCH | `/api/calendar-connections/[id]` | Session | Update calendar settings |
| DELETE | `/api/calendar-connections/[id]` | Session | Disconnect calendar |

### Payments
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/stripe/checkout` | Session | Create subscription checkout |
| POST | `/api/stripe/portal` | Session | Create billing portal session |
| POST | `/api/stripe/webhook` | Stripe sig | Handle Stripe webhook events |
| POST | `/api/stripe/booking-payment` | Public | Create per-booking payment session |

### Other
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/contacts` | Session | List contacts |
| GET/POST/DELETE | `/api/webhooks` | Session | Manage webhooks |
| GET | `/api/cron/reminders` | Bearer (CRON_SECRET) | Send email/SMS reminders |
| GET | `/api/v1/bookings` | API key | Public API - list bookings |
| GET/POST | `/api/v1/event-types` | API key | Public API - event types |

---

## Authentication Architecture

### Login Methods
- **Email/password** via AWS Cognito User Pool
- **Google OAuth** via Cognito federated identity (client-side `signInWithRedirect`)

### Flow
1. **Client-side**: Amplify SDK (`aws-amplify` with `ssr: true`) handles all auth operations
2. **Cookies**: Tokens stored as non-HttpOnly `CognitoIdentityServiceProvider.*` cookies (readable by both client and server)
3. **Server-side**: `runWithAmplifyServerContext` + `getCurrentUser()` reads cookies for API route auth
4. **Middleware**: Checks Cognito cookies on protected routes, redirects unauthenticated users to `/login`
5. **Auto-provisioning**: First OAuth login creates a DB user record (or links to existing email match)

### Key Files
- `src/lib/amplify-config.ts` - Amplify/Cognito configuration
- `src/lib/amplify-server-utils.ts` - Server-side Amplify context
- `src/lib/auth.ts` - `getAuthenticatedUser()` used by all API routes
- `src/lib/auth-service.ts` - Client-side auth operations
- `src/lib/contexts/auth-context.tsx` - React auth context/provider
- `src/middleware.ts` - Route protection

### Cognito Lambda Triggers
- **PostConfirmation**: Creates DB user record on signup
- **CustomEmailSender**: Sends branded verification/reset emails via SES

---

## Calendar Integration

### Google Calendar
- OAuth via `/api/auth/google` (scopes: `openid email profile calendar`)
- Token auto-refresh (proactive + reactive on 401)
- Creates events with Google Meet conferenceData
- Conflict detection via `events.list` API

### Outlook / Office 365
- OAuth via `/api/auth/outlook` (scopes: `Calendars.ReadWrite offline_access User.Read`)
- Creates events via Microsoft Graph API
- Conflict detection via `calendarView` endpoint

### Multi-Calendar Support
- Up to 6 connected calendars per user
- Per-calendar conflict checking toggle
- Primary calendar designation (auto-promotes on disconnect)
- Events fetched in parallel via `Promise.allSettled`
- In-memory cache with 5-minute TTL

### Slot Generation (`src/lib/availability.ts`)
1. Fetch user availability rules, event type config, calendar conflicts, and existing bookings
2. Generate 15-minute increment slots within each availability window
3. Filter by: past times, min notice, buffer before/after, daily/weekly limits
4. For collective events: compute intersection of all members' available slots

---

## Payment System

### Subscription (Pro Plan)
- **$5/month** or **$48/year** (20% discount)
- Stripe Checkout for upgrade, Stripe Customer Portal for management
- Webhook events: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.deleted`

### Per-Booking Payments
- Event types with `requirePayment: true` create a Stripe Checkout session
- Booking created as PENDING until payment confirmed

### Plan Limits
| Feature | Free | Pro |
|---------|------|-----|
| Event types | 1 | Unlimited |
| Calendar sync | Yes | Yes |
| Custom branding | No | Yes |
| SMS reminders | No | Yes |
| Payment collection | No | Yes |
| Webhooks & API | No | Yes |

---

## Infrastructure (AWS)

### Architecture
```
User → Amplify (Next.js SSR) → RDS PostgreSQL
                              → Cognito (auth)
                              → SES (email)
                              → S3 (Terraform state)
                              → Lambda (triggers, migrations)
```

### Resources
- **Amplify**: `WEB_COMPUTE` platform, auto-build from GitHub
- **RDS**: PostgreSQL 16.4, `db.t4g.micro` (dev), private subnets, encrypted
- **VPC**: `10.0.0.0/16` with 2 public + 2 private subnets, 2 NAT Gateways
- **Cognito**: User Pool with Google federation, custom domain
- **Lambda** (3): PostConfirmation trigger, CustomEmailSender, DB migrations
- **KMS**: Encryption key for Cognito email codes
- **Secrets Manager**: DB password, app secrets

### Environment Strategy
- Account-per-environment (Dev/QA/Prod)
- Terraform S3 backend per account
- Same resource names across environments

### Estimated Costs
| Environment | Monthly Cost |
|-------------|-------------|
| Dev | ~$90 |
| QA | ~$100 |
| Prod | ~$155-175 |
| **Total** | **~$350-370** |

---

## Email & Notifications

### Transactional Email (via AWS SES + Nodemailer)
- Booking confirmation (to booker)
- Booking cancellation (to both parties)
- Booking reminders (1 hour before, via cron)

### Cognito Email (via Lambda + cross-account SES)
- Verification codes
- Password reset codes

### SMS (via Twilio, Pro plan only)
- Booking reminders (1 hour before, via cron)

---

## Project Structure

```
src/
  app/
    (auth)/         # Login, signup, forgot-password
    [username]/     # Public profile + booking pages
    cancel/[uid]/   # Booking cancellation
    reschedule/[uid]/ # Booking reschedule
    dashboard/      # All authenticated dashboard pages
    api/            # All API routes
  components/       # Reusable UI components
  lib/
    auth.ts         # Server-side auth (getAuthenticatedUser)
    auth-service.ts # Client-side auth operations
    amplify-config.ts    # Cognito/Amplify config
    amplify-server-utils.ts # Server-side Amplify context
    availability.ts # Slot generation logic
    prisma.ts       # Prisma client singleton
    stripe.ts       # Stripe client
    email.ts        # Email sending via SES
    calendar/       # Calendar integration (Google, Outlook, conflict detection)
    contexts/       # React contexts (auth)
infrastructure/
  terraform/        # All AWS infrastructure as code
prisma/
  schema.prisma     # Database schema
  migrations/       # Migration history
e2e/                # Playwright E2E tests
```

---

## What's Not Yet Implemented

The following features are **designed but not built**:

- **E-Signature Module** - Document upload, field placement, signing flow, audit trail, templates. The `Document` model exists in the schema but no routes, pages, or components exist.
- **Privacy Policy / Terms of Service** pages
- **Mobile dashboard navigation** (bottom tab bar or hamburger)
- **Booking detail view** (only list view exists)
- **Date-specific availability overrides** UI (schema supports it)
- **Embed JavaScript widget** (only iframe embed code is generated)

See `docs/design/04-user-flows-esignature.md` for the planned e-signature design.
