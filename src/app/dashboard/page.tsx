"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Calendar, Clock, Users, ArrowRight } from "lucide-react"

export default function DashboardPage() {
  const [stats, setStats] = useState({ eventTypes: 0, upcoming: 0, contacts: 0 })
  const [bookings, setBookings] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/event-types").then(r => r.json()).then(d => setStats(s => ({ ...s, eventTypes: d.length })))
    fetch("/api/bookings").then(r => r.json()).then(d => {
      const upcoming = d.filter((b: any) => b.status === "CONFIRMED" && new Date(b.startTime) > new Date())
      setBookings(upcoming.slice(0, 5))
      setStats(s => ({ ...s, upcoming: upcoming.length }))
    })
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600">Event Types</span>
          </div>
          <p className="text-3xl font-bold">{stats.eventTypes}</p>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-600">Upcoming Bookings</span>
          </div>
          <p className="text-3xl font-bold">{stats.upcoming}</p>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-gray-600">Contacts</span>
          </div>
          <p className="text-3xl font-bold">{stats.contacts}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold">Upcoming Bookings</h2>
          <Link href="/dashboard/bookings" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {bookings.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No upcoming bookings</p>
            <Link href="/dashboard/event-types" className="text-blue-600 text-sm hover:underline mt-2 inline-block">
              Create an event type to get started
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {bookings.map((b) => (
              <div key={b.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{b.title}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(b.startTime).toLocaleDateString()} at{" "}
                    {new Date(b.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <p className="text-sm text-gray-500">{b.bookerName} ({b.bookerEmail})</p>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">{b.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
