"use client"

import { useEffect, useState } from "react"

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/contacts").then(r => r.json()).then(d => Array.isArray(d) ? setContacts(d) : null)
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Contacts</h1>
      <div className="bg-white border rounded-xl">
        {contacts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Contacts are automatically created from bookings and signatures.
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b">
              <tr className="text-left text-sm text-gray-500">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Source</th>
                <th className="p-4">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {contacts.map(c => (
                <tr key={c.id}>
                  <td className="p-4 font-medium">{c.name}</td>
                  <td className="p-4 text-sm text-gray-600">{c.email}</td>
                  <td className="p-4 text-sm text-gray-600">{c.phone || "—"}</td>
                  <td className="p-4"><span className="text-xs bg-gray-100 px-2 py-1 rounded">{c.source}</span></td>
                  <td className="p-4 text-sm text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
