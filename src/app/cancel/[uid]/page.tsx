"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

export default function CancelPage() {
  const { uid } = useParams()
  const [reason, setReason] = useState("")
  const [cancelled, setCancelled] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleCancel() {
    setLoading(true)
    const res = await fetch(`/api/bookings/${uid}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    })
    if (res.ok) setCancelled(true)
    setLoading(false)
  }

  if (cancelled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border p-8 text-center">
          <h1 className="text-2xl font-bold mb-2">Booking Cancelled</h1>
          <p className="text-gray-600">Your booking has been cancelled successfully.</p>
          <Link href="/" className="text-blue-600 hover:underline text-sm mt-4 inline-block">Back to home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border p-8">
        <h1 className="text-2xl font-bold mb-2">Cancel Booking</h1>
        <p className="text-gray-600 mb-6">Are you sure you want to cancel this booking?</p>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Reason (optional)</label>
          <textarea value={reason} onChange={e => setReason(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 h-24 resize-none" placeholder="Why are you cancelling?" />
        </div>
        <div className="flex gap-3">
          <Link href="/" className="flex-1 text-center border py-2.5 rounded-lg hover:bg-gray-50">Go back</Link>
          <button onClick={handleCancel} disabled={loading}
            className="flex-1 bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 disabled:opacity-50">
            {loading ? "Cancelling..." : "Cancel Booking"}
          </button>
        </div>
      </div>
    </div>
  )
}
