import { NextResponse } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth"
import { cookies } from "next/headers"
import { getCurrentUser } from "aws-amplify/auth/server"
import { runWithAmplifyServerContext } from "@/lib/amplify-server-utils"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  const user = await getAuthenticatedUser()
  if (!user) {
    // Temporary debug: capture why auth failed
    const debug: Record<string, unknown> = {}
    try {
      const cookieStore = await cookies()
      const allCookies = cookieStore.getAll()
      const cognitoCookies = allCookies.filter((c) => c.name.includes("Cognito"))
      debug.totalCookies = allCookies.length
      debug.cognitoCookieCount = cognitoCookies.length
      debug.cognitoCookieNames = cognitoCookies.map((c) => c.name)

      // Try getCurrentUser directly to capture the exact error
      try {
        const cognitoUser = await runWithAmplifyServerContext({
          nextServerContext: { cookies: () => cookieStore },
          operation: (contextSpec) => getCurrentUser(contextSpec),
        })
        debug.getCurrentUser = { success: true, userId: cognitoUser.userId }

        // If getCurrentUser succeeded, the issue is in Prisma lookup
        const dbUser = await prisma.user.findUnique({
          where: { cognitoId: cognitoUser.userId },
          select: { id: true, email: true },
        })
        debug.prismaLookup = dbUser ? { found: true, id: dbUser.id } : { found: false }
      } catch (e) {
        debug.getCurrentUser = { success: false, error: String(e) }
      }
    } catch (e) {
      debug.debugError = String(e)
    }

    return NextResponse.json(
      { error: "Unauthorized", debug },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    )
  }

  // Return user with calendar connections
  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true, name: true, email: true, image: true, timezone: true,
      plan: true, slug: true, brandColor: true, brandLogo: true,
      stripeCurrentPeriodEnd: true,
      calendarConnections: {
        select: {
          id: true, provider: true, email: true,
          isPrimary: true, checkConflicts: true, label: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  })

  return NextResponse.json(fullUser)
}

export async function PATCH(req: Request) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: body.name,
      timezone: body.timezone,
      slug: body.slug,
      brandColor: body.brandColor,
      brandLogo: body.brandLogo,
    },
  })
  return NextResponse.json(updated)
}
