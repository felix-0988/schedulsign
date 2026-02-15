import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { initDefaultAvailability } from "@/lib/availability"
import { generateSlug } from "@/lib/utils"

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const slug = generateSlug(name) + "-" + Math.random().toString(36).slice(2, 6)

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, slug },
    })

    await initDefaultAvailability(user.id)

    return NextResponse.json({ user: { id: user.id, email: user.email } })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
