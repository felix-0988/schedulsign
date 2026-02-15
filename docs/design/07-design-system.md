# SchedulSign Design System

A comprehensive design system for SchedulSign. All values reference Tailwind CSS utility classes from the existing codebase configuration. The goal is a clean, professional, trustworthy aesthetic that competes with Calendly and SignNow while feeling approachable for freelancers and small businesses.

---

## 1. Design Principles

1. **Clarity over decoration** -- Every element should serve a purpose. Reduce visual noise.
2. **Trust through consistency** -- Consistent patterns build user confidence, especially for signatures and payments.
3. **Progressive disclosure** -- Show essential information first; advanced options on demand.
4. **Accessible by default** -- WCAG AA compliance minimum. High contrast, clear focus states, keyboard navigable.
5. **Mobile-first** -- Design for small screens first, enhance for larger viewports.

---

## 2. Color Palette

### Primary (Blue)

The primary blue conveys trust, reliability, and professionalism. Used for primary actions, active navigation, links, and brand identity.

| Token | Tailwind | Hex | Usage |
|-------|----------|-----|-------|
| primary-50 | `bg-blue-50` | #eff6ff | Hover backgrounds, active nav bg |
| primary-100 | `bg-blue-100` | #dbeafe | Feature icon backgrounds, light badges |
| primary-500 | `bg-blue-500` | #3b82f6 | Focus rings |
| primary-600 | `bg-blue-600` | #2563eb | Primary buttons, links, brand accent |
| primary-700 | `bg-blue-700` | #1d4ed8 | Button hover state |
| primary-800 | `bg-blue-800` | #1e40af | Dark accents (rare) |

### Secondary (Purple)

Purple is used for the e-signature feature vertical to visually distinguish it from scheduling (blue).

| Token | Tailwind | Hex | Usage |
|-------|----------|-----|-------|
| secondary-100 | `bg-purple-100` | #f3e8ff | E-sig icon backgrounds |
| secondary-600 | `bg-purple-600` | #9333ea | E-sig accents, badges |

### Neutrals (Gray)

| Token | Tailwind | Hex | Usage |
|-------|----------|-----|-------|
| gray-50 | `bg-gray-50` | #f9fafb | Page backgrounds, hover states |
| gray-100 | `bg-gray-100` | #f3f4f6 | Badges, subtle backgrounds |
| gray-200 | `bg-gray-200` | #e5e7eb | Borders (less common) |
| gray-300 | `bg-gray-300` | #d1d5db | Disabled text, muted borders |
| gray-400 | `bg-gray-400` | #9ca3af | Placeholder text, muted icons |
| gray-500 | `bg-gray-500` | #6b7280 | Secondary text, icon default |
| gray-600 | `bg-gray-600` | #4b5563 | Body text |
| gray-700 | `bg-gray-700` | #374151 | Strong body text |
| gray-900 | `bg-gray-900` | #111827 | Headings, emphasis |

### Semantic Colors

| Purpose | Background | Text | Tailwind |
|---------|-----------|------|----------|
| Success | `bg-green-100` | `text-green-700` | Confirmed status, success states |
| Success Icon | `bg-green-500` | `text-white` | Checkmark icons |
| Warning | `bg-yellow-100` | `text-yellow-700` | Rescheduled status |
| Error | `bg-red-50` | `text-red-600` | Error messages, form validation |
| Error Action | `bg-red-600` | `text-white` | Cancel/delete buttons |
| Info | `bg-blue-50` | `text-blue-700` | Informational badges |

### User Brand Color

Users can set a custom `brandColor` (default: `#2563eb`). This is applied dynamically via inline `style` attributes for:
- Booking page event title
- Calendar selected date background
- Selected time slot background
- Booking confirmation CTA button
- User avatar fallback background

---

## 3. Typography

### Font Family

- **Primary**: Inter (Google Fonts, already configured)
  - Tailwind: default via `next/font/google` integration
  - Fallback: system sans-serif stack

### Type Scale

| Element | Class | Size | Weight | Line Height | Usage |
|---------|-------|------|--------|------------|-------|
| Display | `text-5xl md:text-6xl font-bold tracking-tight` | 3rem / 3.75rem | 700 | tight | Landing page hero headline |
| H1 | `text-2xl font-bold` | 1.5rem | 700 | normal | Page titles |
| H2 | `text-xl font-semibold` | 1.25rem | 600 | normal | Section headings, card titles |
| H3 | `text-lg font-semibold` | 1.125rem | 600 | normal | Sub-section headings |
| Body | `text-base text-gray-600` | 1rem | 400 | 1.5 | Descriptions, paragraphs |
| Body Strong | `text-base font-medium` | 1rem | 500 | 1.5 | Emphasized body text |
| Small | `text-sm text-gray-600` | 0.875rem | 400 | 1.25 | Metadata, secondary info |
| Small Strong | `text-sm font-medium` | 0.875rem | 500 | 1.25 | Labels, nav items |
| Caption | `text-xs text-gray-500` | 0.75rem | 400 | 1 | Timestamps, hints |
| Caption Strong | `text-xs font-medium` | 0.75rem | 500 | 1 | Badges, tags |

### Text Colors

| Purpose | Class | Usage |
|---------|-------|-------|
| Heading | `text-gray-900` | All headings, strong emphasis |
| Body | `text-gray-600` | Primary body text |
| Secondary | `text-gray-500` | Metadata, descriptions |
| Muted | `text-gray-400` | Placeholders, "powered by" text |
| Link | `text-blue-600 hover:underline` | Inline links |
| Error | `text-red-600` | Error messages |
| White | `text-white` | On dark/colored backgrounds |

---

## 4. Spacing

Based on a 4px base unit. Use Tailwind's default spacing scale consistently.

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| space-1 | 4px | `p-1`, `gap-1` | Tight spacing, icon gaps |
| space-2 | 8px | `p-2`, `gap-2` | Inner element spacing |
| space-3 | 12px | `p-3`, `gap-3` | Compact padding |
| space-4 | 16px | `p-4`, `gap-4` | Standard card padding, form gaps |
| space-5 | 20px | `p-5` | Event type card padding |
| space-6 | 24px | `p-6`, `gap-6` | Section padding, main content |
| space-8 | 32px | `p-8`, `gap-8` | Large card padding, section gaps |
| space-10 | 40px | `py-10` | Vertical section separation |
| space-12 | 48px | `py-12` | Section vertical rhythm |
| space-16 | 64px | `py-16` | Large section padding |
| space-20 | 80px | `py-20` | Landing page section padding |

### Layout Widths

| Token | Tailwind | Value | Usage |
|-------|----------|-------|-------|
| content-sm | `max-w-md` | 448px | Auth forms, confirmation cards |
| content-md | `max-w-lg` | 512px | Public booking page |
| content-lg | `max-w-3xl` | 768px | Booking widget, pricing grid |
| content-xl | `max-w-5xl` | 1024px | Dashboard main content |
| content-2xl | `max-w-6xl` | 1152px | Landing page, public pages |

### Sidebar

| Element | Value | Tailwind |
|---------|-------|----------|
| Width | 224px | `w-56` |
| Visibility | Hidden < 768px | `hidden md:block` |

### Top Bar

| Element | Value | Tailwind |
|---------|-------|----------|
| Height (public) | 64px | `h-16` |
| Height (dashboard) | 56px | `h-14` |
| Position | Sticky | `sticky top-0 z-50` |

---

## 5. Border Radius

| Token | Tailwind | Value | Usage |
|-------|----------|-------|-------|
| radius-sm | `rounded` | 4px | Checkboxes, small badges |
| radius-md | `rounded-lg` | 8px | Buttons, inputs, cards, modals |
| radius-lg | `rounded-xl` | 12px | Feature cards, dashboard cards |
| radius-xl | `rounded-2xl` | 16px | Landing page feature cards, booking widget |
| radius-full | `rounded-full` | 9999px | Avatars, badges/pills, step numbers |

### Conventions
- **Inputs and buttons**: `rounded-lg` (8px)
- **Cards**: `rounded-xl` (12px)
- **Landing page cards and booking widget**: `rounded-2xl` (16px)
- **Avatars and pills**: `rounded-full`

---

## 6. Shadows and Elevation

| Level | Tailwind | Usage |
|-------|----------|-------|
| none | `shadow-none` | Default state for most elements |
| sm | `shadow-sm` | Cards on hover (subtle lift) |
| md | `shadow-md` | Booking widget hover |
| lg | `shadow-lg` | Modals, booking widget main container |

### Convention
- Most cards use `border` only (no shadow by default)
- Shadow appears on hover: `hover:shadow-lg transition` or `hover:shadow-sm transition`
- Modals and overlays use `shadow-lg`
- Backdrop: `bg-black/50` for modal overlays

---

## 7. Borders

| Variant | Tailwind | Usage |
|---------|----------|-------|
| Default | `border` (1px solid gray-200) | Cards, inputs, dividers |
| Strong | `border-2` | Pro pricing card emphasis |
| Colored | `border-blue-600` | Active/focused elements |
| Dashed | `border-2 border-dashed` | Add/connect placeholder |
| Divider | `border-t` or `divide-y` | Between list items |
| Left accent | `border-l-4` + custom color | Event type color indicator |

---

## 8. Animations and Transitions

| Type | Tailwind | Usage |
|------|----------|-------|
| Default transition | `transition` | Buttons, links, hover states |
| Background transition | `transition-colors` | Background color changes |
| Spin | `animate-spin` | Loading spinner |
| Pulse | `animate-pulse` | Skeleton loading states |

### Transition Duration
Default Tailwind `transition` = 150ms ease. This is applied consistently for all interactive elements.

### Loading Patterns
- **Spinner**: `animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600`
- **Skeleton**: `animate-pulse bg-gray-200 rounded` with approximate content dimensions
- **Button loading**: Text changes to "Saving..." / "Creating..." with `disabled:opacity-50`

---

## 9. Components

### 9.1 Buttons

#### Primary Button
```
bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium
disabled:opacity-50
```
Usage: Main CTAs (Create, Save, Submit, Start Free)

#### Primary Button Large
```
bg-blue-600 text-white px-8 py-3.5 rounded-lg text-lg font-medium hover:bg-blue-700 transition
```
Usage: Landing page hero CTAs

#### Secondary Button (Outline)
```
border border-gray-300 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition font-medium
```
Usage: Cancel, Go back, secondary actions

#### Ghost Button
```
text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-lg text-sm
```
Usage: Filter tabs, subtle actions

#### Danger Button
```
bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 disabled:opacity-50
```
Usage: Cancel booking, delete confirmation

#### Icon Button
```
p-2 hover:bg-gray-100 rounded-lg
```
Usage: Copy, edit, delete icon actions in lists

#### Brand-Colored Button (dynamic)
```
py-2.5 rounded-lg text-white font-medium disabled:opacity-50 transition
style={{ backgroundColor: host.brandColor }}
```
Usage: Booking confirmation on public pages

#### Button Sizes

| Size | Padding | Text | Usage |
|------|---------|------|-------|
| Small | `px-3 py-1.5 text-xs` | 12px | Filter tabs, compact actions |
| Default | `px-4 py-2 text-sm` | 14px | Dashboard buttons |
| Medium | `px-4 py-2.5 text-sm` | 14px | Auth forms, booking CTA |
| Large | `px-8 py-3.5 text-lg` | 18px | Landing page hero |

#### Button States

| State | Treatment |
|-------|----------|
| Default | Normal colors |
| Hover | Darker shade (`hover:bg-blue-700`) |
| Active/Pressed | Same as hover (no special treatment) |
| Disabled | `disabled:opacity-50` + `cursor-not-allowed` |
| Loading | Text changes ("Saving..."), disabled state |

### 9.2 Form Inputs

#### Text Input
```
w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
```

#### Text Input (compact, dashboard)
```
w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none
```

#### Select
```
w-full border rounded-lg px-3 py-2
```

#### Textarea
```
w-full border rounded-lg px-3 py-2 h-20 resize-none
```

#### Checkbox
```
rounded
```
Note: Uses browser default + rounded override. Consider adding accent-color for brand matching.

#### Time Input
```
border rounded px-2 py-1 text-sm
```

#### Color Input
```
w-full h-10 border rounded-lg cursor-pointer
```

#### Disabled Input
```
w-full border rounded-lg px-3 py-2 bg-gray-50 text-gray-500
```

#### Input with Prefix
```
<div class="flex items-center border rounded-lg overflow-hidden">
  <span class="bg-gray-50 px-3 py-2 text-sm text-gray-500 border-r">prefix/</span>
  <input class="flex-1 px-3 py-2 focus:outline-none" />
</div>
```
Usage: URL slug input in settings

#### Form Labels
```
block text-sm font-medium mb-1      // dashboard forms
block text-sm font-medium mb-1.5    // auth forms
```

#### Helper Text
```
text-xs text-gray-500 mt-1
```

#### Error Message
```
bg-red-50 text-red-600 text-sm p-3 rounded-lg
```

### 9.3 Cards

#### Standard Card (Dashboard)
```
bg-white border rounded-xl p-6
```
Usage: Settings sections, stats cards

#### Compact Card
```
bg-white border rounded-xl p-5
```
Usage: Event type list items

#### Interactive Card
```
bg-white border rounded-xl p-5 hover:shadow-sm transition
```
Usage: Event type rows, clickable items

#### Feature Card (Landing)
```
border rounded-2xl p-8 hover:shadow-lg transition
```

#### Card with Dividers
```
bg-white border rounded-xl divide-y
```
Usage: Bookings list, availability days, webhooks list

#### Card Header Row
```
flex items-center justify-between p-4 border-b
```

### 9.4 Navigation

#### Top Bar (Public)
```
border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50
> div.max-w-6xl mx-auto px-6 h-16 flex items-center justify-between
```

#### Top Bar (Dashboard)
```
bg-white border-b h-14 flex items-center px-6 sticky top-0 z-50
```

#### Sidebar Nav
```
aside.w-56 bg-white border-r min-h-[calc(100vh-3.5rem)] p-4 hidden md:block
```

#### Nav Item (Default)
```
flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition
```

#### Nav Item (Active)
```
flex items-center gap-3 px-3 py-2 rounded-lg text-sm bg-blue-50 text-blue-700 font-medium
```

### 9.5 Modals

#### Modal Overlay
```
fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4
```

#### Modal Container
```
bg-white rounded-xl max-w-md w-full p-6
```

#### Modal Title
```
text-lg font-semibold mb-4
```

#### Modal Actions
```
flex gap-3 justify-end
```

### 9.6 Badges and Status Pills

#### Status Badge
```
text-xs px-2 py-1 rounded-full font-medium
```

| Status | Background | Text |
|--------|-----------|------|
| Confirmed | `bg-green-100` | `text-green-700` |
| Cancelled | `bg-red-100` | `text-red-700` |
| Rescheduled | `bg-yellow-100` | `text-yellow-700` |
| Default | `bg-gray-100` | `text-gray-700` |
| Plan: Free | `bg-gray-100` | `text-gray-700` |
| Plan: Pro | `bg-blue-100` | `text-blue-700` |

#### Info Badge
```
inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm px-4 py-1.5 rounded-full
```
Usage: Landing page "Replace Calendly + DocuSign" badge

#### Source Tag
```
text-xs bg-gray-100 px-2 py-1 rounded
```
Usage: Contact source (booking, signature, manual)

#### "Most Popular" Label
```
absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full
```

### 9.7 Calendar Component

#### Calendar Container
Layout within booking widget right panel.

#### Month Navigation
```
flex items-center justify-between mb-4
> h2.font-semibold (month name)
> div.flex gap-1 (prev/next buttons: p-1 hover:bg-gray-100 rounded)
```

#### Day Header Row
```
grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2
```

#### Day Cell
```
h-10 rounded-lg text-sm transition

States:
  Default:    hover:bg-gray-100
  Selected:   text-white font-bold style={{ backgroundColor: brandColor }}
  Disabled:   text-gray-300
  Out of month: text-gray-300
```

#### Time Slot Button
```
w-full text-sm py-2 px-3 rounded-lg border transition text-center

States:
  Default:  hover:border-blue-300
  Selected: text-white border-transparent style={{ backgroundColor: brandColor }}
```

### 9.8 Data Tables

#### Table Container
```
bg-white border rounded-xl
> table.w-full
```

#### Table Header
```
border-b
> tr.text-left text-sm text-gray-500
  > th.p-4
```

#### Table Body
```
divide-y
> tr
  > td.p-4
  > td.p-4 text-sm text-gray-600
  > td.p-4 font-medium
```

### 9.9 Empty States

#### Standard Empty State
```
p-8 text-center text-gray-500
> p (description)
> Link.text-blue-600 text-sm hover:underline mt-2 inline-block (CTA)
```

#### Empty State with Extended Description
```
p-12 text-center
> p.text-gray-500 mb-4 (description)
> button.text-blue-600 hover:underline (CTA)
```

### 9.10 Loading States

#### Full Page Spinner
```
min-h-screen flex items-center justify-center
> div.animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600
```

#### Inline Loading
```
animate-pulse (with text "Loading...")
```

#### Skeleton Placeholder
```
animate-pulse bg-gray-200 rounded-lg h-[height] w-[width]
```

### 9.11 Alerts and Feedback

#### Error Alert (Inline)
```
bg-red-50 text-red-600 text-sm p-3 rounded-lg
```

#### Success Indicator
```
w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4
> Check icon: w-8 h-8 text-green-600
```
Usage: Booking confirmation, reschedule success

#### Connected Status
```
flex items-center justify-between p-3 bg-green-50 rounded-lg
> span.text-xs text-green-600 font-medium
```

### 9.12 Code Blocks

#### Embed Code Display
```
bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono overflow-x-auto
```

---

## 10. Iconography

### Icon Library
Lucide React (already installed: `lucide-react`)

### Icon Sizes

| Size | Class | Usage |
|------|-------|-------|
| Extra Small | `w-3 h-3` | Inline with small text (arrows in links) |
| Small | `w-4 h-4` | Nav icons, action buttons, inline metadata |
| Default | `w-5 h-5` | Stat card icons, standalone icons |
| Medium | `w-6 h-6` | Feature card icons |
| Large | `w-8 h-8` | Success/confirmation icons |

### Common Icons

| Purpose | Icon | Component |
|---------|------|-----------|
| Scheduling | Calendar | `Calendar` |
| E-Signatures | FileSignature | `FileSignature` |
| Time/Duration | Clock | `Clock` |
| Settings | Settings | `Settings` |
| Bookings link | Link2 | `Link2` |
| Dashboard | LayoutDashboard | `LayoutDashboard` |
| Users/Contacts | Users | `Users` |
| Webhooks | Webhook | `Webhook` |
| Add/Create | Plus | `Plus` |
| Delete | Trash2 | `Trash2` |
| Copy | Copy | `Copy` |
| Edit/Open | ExternalLink | `ExternalLink` |
| Back | ArrowLeft | `ArrowLeft` |
| Forward/CTA | ArrowRight | `ArrowRight` |
| Prev | ChevronLeft | `ChevronLeft` |
| Next | ChevronRight | `ChevronRight` |
| Save | Save | `Save` |
| Logout | LogOut | `LogOut` |
| Check | Check | `Check` |
| Globe/Timezone | Globe | `Globe` |
| Lightning/Speed | Zap | `Zap` |
| More options | MoreVertical | `MoreVertical` |
| Shield/Security | Shield | `Shield` |

### Feature Icon Container
```
w-12 h-12 bg-{color}-100 rounded-xl flex items-center justify-center mb-4
> Icon.w-6 h-6 text-{color}-600
```
Blue for scheduling features, purple for e-signature features.

---

## 11. Branding

### Logo Treatment
Text-based logo:
```html
<span class="text-xl font-bold text-blue-600">Schedul</span>
<span class="text-xl font-bold text-gray-900">Sign</span>
```

Sizes:
- Public nav: `text-xl font-bold`
- Dashboard nav: `text-lg font-bold`
- Auth pages: `text-2xl font-bold`

### Brand Identity
- **Name**: SchedulSign (one word, camelCase treatment in logo)
- **Tagline**: "Schedule meetings. Get documents signed. One platform."
- **Value prop**: "Replace Calendly + DocuSign for $5/mo"

---

## 12. Accessibility

### Focus States
All interactive elements must have visible focus indicators:
```
focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
```

### Color Contrast
- Body text (`text-gray-600` #4b5563) on white: 7.06:1 ratio (AAA)
- Secondary text (`text-gray-500` #6b7280) on white: 5.32:1 ratio (AA)
- White text on `bg-blue-600` (#2563eb): 4.68:1 ratio (AA)
- White text on `bg-red-600` (#dc2626): 4.53:1 ratio (AA)
- Link text (`text-blue-600` #2563eb) on white: 4.68:1 ratio (AA)

### Keyboard Navigation
- All interactive elements reachable via Tab
- Modal traps focus within modal when open
- Escape key closes modals
- Enter/Space activates buttons

### Screen Reader
- Semantic HTML: `<nav>`, `<main>`, `<aside>`, `<header>`, `<footer>`
- Button title attributes for icon-only buttons
- Form labels associated with inputs
- `aria-label` for icon buttons without visible text
- Live regions for dynamic status updates (toast notifications)

### Reduced Motion
Consider adding `motion-reduce:` prefix for users who prefer reduced motion:
```
motion-reduce:transition-none
motion-reduce:animate-none
```

---

## 13. Responsive Breakpoints

Using Tailwind's default breakpoints:

| Breakpoint | Min Width | Prefix | Usage |
|-----------|-----------|--------|-------|
| Mobile | 0px | (default) | Base styles, single column |
| Tablet | 768px | `md:` | 2-column layouts, sidebar visible |
| Desktop | 1024px | `lg:` | Full layouts (rarely needed, md covers most) |
| Wide | 1280px | `xl:` | Not currently used |

### Pattern
```
// Mobile first: single column
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">

// Mobile first: stack, then side by side
<div class="flex flex-col sm:flex-row items-center gap-4">
```
