"use client"

import { useEffect, useState } from "react"
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, startOfWeek, endOfWeek } from "date-fns"
import { toZonedTime } from "date-fns-tz"
import { ChevronLeft, ChevronRight, Clock, Globe, Check } from "lucide-react"
import Link from "next/link"

interface BookingWidgetProps {
  eventType: {
    id: string
    title: string
    description: string | null
    duration: number
    location: string
    color: string
    requirePayment: boolean
    price: number | null
    currency: string
    questions: {
      id: string
      label: string
      type: string
      required: boolean
      options: string[]
    }[]
  }
  host: {
    name: string
    image: string | null
    brandColor: string
    brandLogo: string | null
  }
}

export default function BookingWidget({ eventType, host }: BookingWidgetProps) {
  const [step, setStep] = useState<"calendar" | "time" | "form" | "confirmed">("calendar")
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [slots, setSlots] = useState<{ start: string; end: string }[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [timezone, setTimezone] = useState("")
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [booking, setBooking] = useState(false)
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null)

  // Form
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [answers, setAnswers] = useState<Record<string, string>>({})

  useEffect(() => {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
  }, [])

  useEffect(() => {
    if (!selectedDate || !timezone) return
    setLoadingSlots(true)
    const dateStr = format(selectedDate, "yyyy-MM-dd")
    fetch(`/api/slots?eventTypeId=${eventType.id}&date=${dateStr}&timezone=${timezone}`)
      .then(r => r.json())
      .then(data => {
        setSlots(Array.isArray(data) ? data : [])
        setLoadingSlots(false)
      })
  }, [selectedDate, timezone, eventType.id])

  // Calendar rendering
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart)
  const calEnd = endOfWeek(monthEnd)
  const calDays = eachDayOfInterval({ start: calStart, end: calEnd })

  async function handleBook() {
    setBooking(true)
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventTypeId: eventType.id,
        startTime: selectedSlot,
        bookerName: name,
        bookerEmail: email,
        bookerTimezone: timezone,
        bookerPhone: phone || undefined,
        answers: Object.keys(answers).length ? answers : undefined,
      }),
    })

    if (res.ok) {
      const data = await res.json()
      setConfirmedBooking(data)

      // If payment required, redirect
      if (eventType.requirePayment && eventType.price) {
        const payRes = await fetch("/api/stripe/booking-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId: data.id }),
        })
        const { url } = await payRes.json()
        if (url) window.location.href = url
        return
      }

      setStep("confirmed")
    }
    setBooking(false)
  }

  if (step === "confirmed" && confirmedBooking) {
    const startDate = new Date(confirmedBooking.startTime)
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Booking Confirmed!</h1>
        <p className="text-gray-600 mb-6">You&apos;re all set. A confirmation email has been sent.</p>
        <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
          <p><strong>{eventType.title}</strong></p>
          <p className="text-sm text-gray-600">📅 {format(startDate, "EEEE, MMMM d, yyyy")}</p>
          <p className="text-sm text-gray-600">🕐 {format(toZonedTime(startDate, timezone), "h:mm a")} ({timezone})</p>
          <p className="text-sm text-gray-600">👤 {host.name}</p>
          {confirmedBooking.meetingUrl && (
            <a href={confirmedBooking.meetingUrl} target="_blank"
              className="inline-block mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
              Join Meeting
            </a>
          )}
        </div>
        <div className="mt-4 flex gap-4 justify-center text-sm">
          <Link href={`/reschedule/${confirmedBooking.uid}`} className="text-blue-600 hover:underline">Reschedule</Link>
          <Link href={`/cancel/${confirmedBooking.uid}`} className="text-red-600 hover:underline">Cancel</Link>
        </div>
        <p className="text-xs text-gray-400 mt-6">Powered by <Link href="/" className="text-blue-600">SchedulSign</Link></p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="md:flex">
        {/* Left: event info */}
        <div className="md:w-72 p-6 border-b md:border-b-0 md:border-r">
          {host.brandLogo ? (
            <img src={host.brandLogo} alt={host.name} className="w-10 h-10 rounded-full mb-3" />
          ) : (
            <div className="w-10 h-10 rounded-full mb-3 flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: host.brandColor }}>{host.name[0]}</div>
          )}
          <p className="text-sm text-gray-500">{host.name}</p>
          <h1 className="text-xl font-bold mt-1" style={{ color: host.brandColor }}>{eventType.title}</h1>
          {eventType.description && <p className="text-sm text-gray-600 mt-2">{eventType.description}</p>}
          <div className="mt-4 space-y-2 text-sm text-gray-500">
            <p className="flex items-center gap-2"><Clock className="w-4 h-4" /> {eventType.duration} min</p>
            <p className="flex items-center gap-2"><Globe className="w-4 h-4" /> {eventType.location.replace("_", " ")}</p>
            {eventType.requirePayment && eventType.price && (
              <p className="font-medium text-gray-700">
                💰 {eventType.currency.toUpperCase()} {eventType.price}
              </p>
            )}
          </div>

          {/* Timezone selector */}
          <div className="mt-4">
            <select value={timezone} onChange={e => setTimezone(e.target.value)}
              className="w-full text-xs border rounded px-2 py-1 text-gray-600">
              {typeof Intl !== "undefined" && Intl.supportedValuesOf("timeZone").map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: calendar + slots or form */}
        <div className="flex-1 p-6">
          {step === "form" ? (
            /* Booking form */
            <div>
              <button onClick={() => setStep("calendar")} className="text-sm text-blue-600 hover:underline mb-4">
                ← Back
              </button>
              <h2 className="font-semibold mb-1">Enter your details</h2>
              <p className="text-sm text-gray-500 mb-4">
                {selectedSlot && format(toZonedTime(new Date(selectedSlot), timezone), "EEE, MMM d · h:mm a")} ({timezone})
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>

                {/* Custom questions */}
                {eventType.questions.map(q => (
                  <div key={q.id}>
                    <label className="block text-sm font-medium mb-1">
                      {q.label} {q.required && "*"}
                    </label>
                    {q.type === "TEXTAREA" ? (
                      <textarea value={answers[q.id] || ""} onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 h-20 resize-none" required={q.required} />
                    ) : q.type === "SELECT" ? (
                      <select value={answers[q.id] || ""} onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2" required={q.required}>
                        <option value="">Select...</option>
                        {q.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : q.type === "CHECKBOX" ? (
                      <input type="checkbox" checked={answers[q.id] === "true"}
                        onChange={e => setAnswers({ ...answers, [q.id]: e.target.checked ? "true" : "false" })}
                        className="rounded" />
                    ) : (
                      <input type={q.type === "EMAIL" ? "email" : q.type === "PHONE" ? "tel" : "text"}
                        value={answers[q.id] || ""} onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2" required={q.required} />
                    )}
                  </div>
                ))}

                <button onClick={handleBook} disabled={booking || !name || !email}
                  className="w-full py-2.5 rounded-lg text-white font-medium disabled:opacity-50 transition"
                  style={{ backgroundColor: host.brandColor }}>
                  {booking ? "Booking..." : eventType.requirePayment ? `Book & Pay ${eventType.currency.toUpperCase()} ${eventType.price}` : "Confirm Booking"}
                </button>
              </div>
            </div>
          ) : (
            /* Calendar + time slots */
            <div className="md:flex gap-6">
              {/* Calendar */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
                  <div className="flex gap-1">
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, -1))} className="p-1 hover:bg-gray-100 rounded">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 hover:bg-gray-100 rounded">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => <div key={d}>{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calDays.map(day => {
                    const isCurrentMonth = isSameMonth(day, currentMonth)
                    const isSelected = selectedDate && isSameDay(day, selectedDate)
                    const isPast = day < new Date(new Date().toDateString())
                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => { setSelectedDate(day); setSelectedSlot(null) }}
                        disabled={isPast || !isCurrentMonth}
                        className={`h-10 rounded-lg text-sm transition ${
                          isSelected
                            ? "text-white font-bold"
                            : isPast || !isCurrentMonth
                            ? "text-gray-300"
                            : "hover:bg-gray-100"
                        }`}
                        style={isSelected ? { backgroundColor: host.brandColor } : undefined}
                      >
                        {format(day, "d")}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Time slots */}
              {selectedDate && (
                <div className="md:w-44 mt-4 md:mt-0">
                  <h3 className="font-medium text-sm mb-3">{format(selectedDate, "EEE, MMM d")}</h3>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {loadingSlots ? (
                      <p className="text-sm text-gray-400 animate-pulse">Loading...</p>
                    ) : slots.length === 0 ? (
                      <p className="text-sm text-gray-500">No available times</p>
                    ) : slots.map(slot => {
                      const time = toZonedTime(new Date(slot.start), timezone)
                      const isSelected = selectedSlot === slot.start
                      return (
                        <button
                          key={slot.start}
                          onClick={() => {
                            if (isSelected) {
                              setStep("form")
                            } else {
                              setSelectedSlot(slot.start)
                            }
                          }}
                          className={`w-full text-sm py-2 px-3 rounded-lg border transition text-center ${
                            isSelected ? "text-white border-transparent" : "hover:border-blue-300"
                          }`}
                          style={isSelected ? { backgroundColor: host.brandColor } : undefined}
                        >
                          {isSelected ? "Confirm →" : format(time, "h:mm a")}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
