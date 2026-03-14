"use client"

import { useState } from "react"
import { Check, ExternalLink } from "lucide-react"

const categories = [
  "Bug Report",
  "Feature Request",
  "Billing",
  "Calendar Integration",
  "General Question",
]

export default function SupportPage() {
  const [category, setCategory] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [ticket, setTicket] = useState<{ ticketId: string; trackingUrl: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, subject, message }),
    })

    if (res.ok) {
      const data = await res.json()
      setTicket({ ticketId: data.ticketId, trackingUrl: data.trackingUrl })
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error || "Something went wrong. Please try again.")
    }
    setLoading(false)
  }

  if (ticket) {
    return (
      <div className="max-w-lg mx-auto mt-12 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Ticket Submitted</h1>
        <p className="text-gray-600 mb-2">
          Your support ticket <span className="font-semibold text-gray-900">{ticket.ticketId}</span> has been created.
        </p>
        <p className="text-gray-600 mb-6">
          You can track the progress of your ticket at any time.
        </p>
        <div className="flex flex-col items-center gap-3">
          <a
            href={ticket.trackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition"
          >
            Track Ticket
            <ExternalLink className="w-4 h-4" />
          </a>
          <button
            onClick={() => { setTicket(null); setSubject(""); setMessage(""); setCategory("") }}
            className="text-blue-600 hover:underline text-sm"
          >
            Submit another ticket
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Support</h1>
      <p className="text-gray-600 mb-6">Have a question or issue? Submit a ticket and track its progress.</p>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Subject <span className="text-red-500">*</span></label>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Brief description of your issue"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Message <span className="text-red-500">*</span></label>
          <textarea
            required
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your issue or question in detail..."
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none resize-y"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !subject.trim() || !message.trim()}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? "Submitting..." : "Submit Ticket"}
        </button>
      </form>
    </div>
  )
}
