import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  const env = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "NOT SET",
    AUTH_SECRET: process.env.AUTH_SECRET ? "SET (hidden)" : "NOT SET",
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST ?? "NOT SET",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? "NOT SET",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "SET (hidden)" : "NOT SET",
    DATABASE_URL: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 30) + "..." : "NOT SET",
    NODE_ENV: process.env.NODE_ENV ?? "NOT SET",
  }

  let db = "UNTESTED"
  try {
    const count = await prisma.user.count()
    db = `OK (${count} users)`
  } catch (error) {
    db = `ERROR: ${error instanceof Error ? error.message : String(error)}`
  }

  // Test Google token endpoint reachability
  let googleTokenEndpoint = "UNTESTED"
  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "authorization_code", code: "test" }),
    })
    const body = await res.json()
    googleTokenEndpoint = `Reachable (${res.status}: ${body.error || 'ok'})`
  } catch (error) {
    googleTokenEndpoint = `ERROR: ${error instanceof Error ? error.message : String(error)}`
  }

  // Test Auth.js CSRF endpoint
  let authCsrf = "UNTESTED"
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
  try {
    const res = await fetch(`${baseUrl}/api/auth/csrf`)
    const body = await res.json()
    authCsrf = body.csrfToken ? "OK (token received)" : `ERROR: no token - ${JSON.stringify(body)}`
  } catch (error) {
    authCsrf = `ERROR: ${error instanceof Error ? error.message : String(error)}`
  }

  // Test Auth.js providers endpoint
  let authProviders = "UNTESTED"
  try {
    const res = await fetch(`${baseUrl}/api/auth/providers`)
    const body = await res.json()
    authProviders = body.google ? `OK (google configured, callbackUrl: ${body.google.callbackUrl})` : `ERROR: ${JSON.stringify(body)}`
  } catch (error) {
    authProviders = `ERROR: ${error instanceof Error ? error.message : String(error)}`
  }

  return NextResponse.json({ ...env, database: db, googleTokenEndpoint, authCsrf, authProviders })
}
