import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { userId, location, range } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    if (!location) {
      return NextResponse.json({ error: "Location is required" }, { status: 400 })
    }

    // Create the room with location and range
    const room = await prisma.room.create({
      data: {
        location,
        range,
        members: {
          create: { userId } // add the creator as a member
        }
      },
      include: { members: true } // optional, just to return members
    })

    return NextResponse.json({ roomId: room.id })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 })
  }
}
