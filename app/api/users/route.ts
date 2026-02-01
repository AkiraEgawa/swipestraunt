import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const users = await prisma.user.findMany()
    return NextResponse.json(users)
  } catch (error) {
    console.error("Failed to fetch users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const { email } = await req.json()

  try {
    // Try to create the user
    const user = await prisma.user.create({
      data: { email },
    })
    return NextResponse.json(user)
  } catch (err: any) {
    // Prisma unique constraint error code is P2002
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "Username already in use" },
        { status: 400 }
      )
    }
    console.error(err)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}