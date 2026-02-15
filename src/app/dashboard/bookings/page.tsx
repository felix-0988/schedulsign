"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [filter, setFilter] = useState<string>("upcoming")

  useEffect(() => {
    fetch("/api/bookings").then(r => r.json()).then(setBookings)
  }, [])

  const filtered = bookings.filter(b => {
    if (filter === "upcoming") return b.status === "CONFIRMED" && new Date(b.startTime) > new Date()
    if (filter === "past") return b.status === "COMPLETED" || new Date(b.startTime) < new Date()
    if (filter === "cancelled") return b.status === "CANCELLED"
    return true
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Bookings</h1>

      <div className="flex gap-2 mb-6">
        {["upcoming", "past", "cancelled", "all"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm capitalize ${filter === f ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white border rounded-xl divide-y">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No bookings found</div>
        ) : filtered.map(b => (
          <div key={b.id} className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">{b.title}</p>
              <p className="text-sm text-gray-600">
                {format(new Date(b.startTime), "EEE, MMM d, yyyy")} at {format(new Date(b.startTime), "h:mm a")} — {format(new Date(b.endTime), "h:mm a")}
              </p>
              <p className="text-sm text-gray-500">{b.bookerName} · {b.bookerEmail}</p>
              {b.meetingUrl && (
                <a href={b.meetingUrl} target="_blank" className="text-sm text-blue-600 hover:underline">Join meeting</a>
              )}
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              b.status === "CONFIRMED" ? "bg-green-100 text-green-700" :
              b.status === "CANCELLED" ? "bg-red-100 text-red-700" :
              b.status === "RESCHEDULED" ? "bg-yellow-100 text-yellow-700" :
              "bg-gray-100 text-gray-700"
            }`}>{b.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
