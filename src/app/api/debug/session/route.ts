import { auth } from "@/auth"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await auth()

  // Also try a direct Prisma query to test
  let prismaTest = "UNTESTED"
  try {
    const prisma = (await import("@/lib/prisma")).default
    const user = await prisma.user.findFirst()
    prismaTest = user ? `OK: found user ${user.id} (${user.email})` : "OK: no users found"
  } catch (error: any) {
    prismaTest = `ERROR: ${error?.message} | code: ${error?.code} | meta: ${JSON.stringify(error?.meta)}`
  }

  return NextResponse.json({ session, prismaTest })
}
