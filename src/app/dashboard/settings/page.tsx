"use client"

import { useEffect, useState } from "react"
import { Save, ExternalLink } from "lucide-react"
import { PLANS } from "@/lib/stripe"

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/user").then(r => r.json()).then(setUser)
  }, [])

  async function handleSave() {
    setSaving(true)
    await fetch("/api/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: user.name,
        timezone: user.timezone,
        slug: user.slug,
        brandColor: user.brandColor,
        brandLogo: user.brandLogo,
      }),
    })
    setSaving(false)
  }

  async function handleUpgrade(yearly: boolean) {
    const priceId = yearly ? process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID : process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    })
    const { url } = await res.json()
    window.location.href = url
  }

  async function handleManageBilling() {
    const res = await fetch("/api/stripe/portal", { method: "POST" })
    const { url } = await res.json()
    window.location.href = url
  }

  async function connectOutlook() {
    window.location.href = "/api/auth/outlook"
  }

  if (!user) return <div className="animate-pulse">Loading...</div>

  const timezones = Intl.supportedValuesOf("timeZone")

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Profile */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold mb-4">Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input type="text" value={user.name || ""} onChange={e => setUser({ ...user, name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">URL Slug</label>
            <div className="flex items-center border rounded-lg overflow-hidden">
              <span className="bg-gray-50 px-3 py-2 text-sm text-gray-500 border-r">schedulsign.com/</span>
              <input type="text" value={user.slug || ""} onChange={e => setUser({ ...user, slug: e.target.value })}
                className="flex-1 px-3 py-2 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Timezone</label>
            <select value={user.timezone} onChange={e => setUser({ ...user, timezone: e.target.value })}
              className="w-full border rounded-lg px-3 py-2">
              {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" value={user.email} disabled className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-gray-500" />
          </div>
        </div>

        {/* Branding */}
        <h3 className="font-medium mt-6 mb-3">Branding</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Brand Color</label>
            <input type="color" value={user.brandColor} onChange={e => setUser({ ...user, brandColor: e.target.value })}
              className="w-full h-10 border rounded-lg cursor-pointer" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Logo URL</label>
            <input type="url" value={user.brandLogo || ""} onChange={e => setUser({ ...user, brandLogo: e.target.value })}
              className="w-full border rounded-lg px-3 py-2" placeholder="https://..." />
          </div>
        </div>

        <button onClick={handleSave} disabled={saving}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 text-sm">
          <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>

      {/* Calendar Connections */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold mb-4">Calendar Connections</h2>
        <div className="space-y-3">
          {user.calendarConnections?.map((conn: any) => (
            <div key={conn.provider + conn.email} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <span className="text-sm font-medium">{conn.provider}</span>
                <span className="text-sm text-gray-500 ml-2">{conn.email}</span>
              </div>
              <span className="text-xs text-green-600 font-medium">Connected ✓</span>
            </div>
          ))}
          <button onClick={connectOutlook}
            className="w-full border-2 border-dashed rounded-lg p-3 text-sm text-gray-600 hover:bg-gray-50 transition">
            + Connect Outlook / Office 365
          </button>
        </div>
      </div>

      {/* Subscription */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold mb-4">Subscription</h2>
        <div className="flex items-center gap-3 mb-4">
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${user.plan === "PRO" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
            {user.plan}
          </span>
          {user.stripeCurrentPeriodEnd && (
            <span className="text-sm text-gray-500">
              Renews {new Date(user.stripeCurrentPeriodEnd).toLocaleDateString()}
            </span>
          )}
        </div>

        {user.plan === "FREE" ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Upgrade to Pro for unlimited event types, signatures, and all integrations.</p>
            <div className="flex gap-3">
              <button onClick={() => handleUpgrade(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                $5/month
              </button>
              <button onClick={() => handleUpgrade(true)}
                className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 text-sm">
                $48/year (save 20%)
              </button>
            </div>
          </div>
        ) : (
          <button onClick={handleManageBilling}
            className="text-sm text-blue-600 hover:underline flex items-center gap-1">
            Manage billing <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Embed Code */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold mb-4">Embed Widget</h2>
        <p className="text-sm text-gray-600 mb-3">Add SchedulSign to your website:</p>
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono overflow-x-auto">
          {`<!-- SchedulSign Embed -->
<iframe src="${typeof window !== 'undefined' ? window.location.origin : ''}/{user.slug}" 
  style="width:100%;height:700px;border:none;" 
  loading="lazy"></iframe>`}
        </div>
        <p className="text-sm text-gray-500 mt-3">Or use the JavaScript snippet:</p>
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono overflow-x-auto mt-2">
          {`<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/embed.js" 
  data-user="${user.slug}"></script>`}
        </div>
      </div>
    </div>
  )
}
