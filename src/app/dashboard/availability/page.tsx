"use client"

import { useEffect, useState } from "react"
import { Save } from "lucide-react"

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

interface Rule {
  dayOfWeek: number
  startTime: string
  endTime: string
  enabled: boolean
}

export default function AvailabilityPage() {
  const [rules, setRules] = useState<Rule[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch("/api/availability").then(r => r.json()).then((data) => {
      if (data.length === 0) {
        // Default: Mon-Fri 9-5
        setRules(DAYS.map((_, i) => ({
          dayOfWeek: i,
          startTime: "09:00",
          endTime: "17:00",
          enabled: i >= 1 && i <= 5,
        })))
      } else {
        // Group by day
        const byDay = DAYS.map((_, i) => {
          const existing = data.find((r: any) => r.dayOfWeek === i)
          return existing || { dayOfWeek: i, startTime: "09:00", endTime: "17:00", enabled: false }
        })
        setRules(byDay)
      }
    })
  }, [])

  async function handleSave() {
    setSaving(true)
    await fetch("/api/availability", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rules: rules.filter(r => r.enabled) }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Availability</h1>
        <button onClick={handleSave} disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 text-sm">
          <Save className="w-4 h-4" /> {saving ? "Saving..." : saved ? "Saved ✓" : "Save"}
        </button>
      </div>

      <div className="bg-white border rounded-xl divide-y">
        {rules.map((rule, i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            <input type="checkbox" checked={rule.enabled}
              onChange={e => {
                const updated = [...rules]
                updated[i].enabled = e.target.checked
                setRules(updated)
              }}
              className="rounded" />
            <span className="w-28 text-sm font-medium">{DAYS[rule.dayOfWeek]}</span>
            {rule.enabled ? (
              <div className="flex items-center gap-2">
                <input type="time" value={rule.startTime}
                  onChange={e => {
                    const updated = [...rules]
                    updated[i].startTime = e.target.value
                    setRules(updated)
                  }}
                  className="border rounded px-2 py-1 text-sm" />
                <span className="text-gray-400">—</span>
                <input type="time" value={rule.endTime}
                  onChange={e => {
                    const updated = [...rules]
                    updated[i].endTime = e.target.value
                    setRules(updated)
                  }}
                  className="border rounded px-2 py-1 text-sm" />
              </div>
            ) : (
              <span className="text-sm text-gray-400">Unavailable</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
