import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { roomId, userId } = body

    if (!roomId || !userId) {
      return NextResponse.json(
        { error: "roomId and userId are required" },
        { status: 400 }
      )
    }

    const memberCount = await prisma.roomMember.count({
      where: { roomId },
    })

    if (memberCount >= 2) {
      return NextResponse.json(
        { error: "Room is full" },
        { status: 403 }
      )
    }

    const member = await prisma.roomMember.create({
      data: {
        roomId,
        userId,
      },
    })

    return NextResponse.json(member, { status: 201 })
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "User already in room" },
        { status: 409 }
      )
    }

    console.error(error)
    return NextResponse.json(
      { error: "Failed to join room" },
      { status: 500 }
    )
  }
}
