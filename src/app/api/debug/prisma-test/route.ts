import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  const results: Record<string, any> = {}
  const testEmail = "szewong@gmail.com"

  // Test 1: count (this works)
  try {
    const count = await prisma.user.count()
    results.count = `OK: ${count} users`
  } catch (error: any) {
    results.count = { error: error.message, code: error.code, meta: error.meta }
  }

  // Test 2: findUnique (same as JWT callback)
  try {
    const user = await prisma.user.findUnique({ where: { email: testEmail } })
    results.findUnique = user ? `OK: found ${user.id}` : "OK: not found"
  } catch (error: any) {
    results.findUnique = { error: error.message, code: error.code, meta: error.meta }
  }

  // Test 3: create with same fields as JWT callback (only if user doesn't exist)
  try {
    const existing = await prisma.user.findUnique({ where: { email: "test-debug@example.com" } })
    if (!existing) {
      const user = await prisma.user.create({
        data: {
          email: "test-debug@example.com",
          name: "Debug Test",
          image: null,
          slug: "debugtest",
        },
      })
      results.create = `OK: created ${user.id}`
      // Clean up
      await prisma.user.delete({ where: { id: user.id } })
      results.cleanup = "OK: deleted test user"
    } else {
      results.create = "SKIPPED: test user already exists"
    }
  } catch (error: any) {
    results.create = { error: error.message, code: error.code, meta: error.meta }
  }

  return NextResponse.json(results)
}
