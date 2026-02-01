import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, roomId, choice } = body

    if (!userId || !roomId || typeof choice !== "boolean") {
      return NextResponse.json(
        { error: "userId, roomId, and choice are required" },
        { status: 400 }
      )
    }

    const swipe = await prisma.swipe.create({ // swipes will have userID, roomID, and their choice (yes or no)
      data: {
        userId,
        roomId,
        choice,
      },
    })

    const yesCount = await prisma.swipe.count({ // count yes
      where: {
        roomId,
        choice: true,
      },
    })

    return NextResponse.json({
      swipe,
      match: yesCount === 2,
    })
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "User already swiped in this room" },
        { status: 409 }
      )
    }

    console.error(error)
    return NextResponse.json(
      { error: "Failed to submit swipe" },
      { status: 500 }
    )
  }
}
