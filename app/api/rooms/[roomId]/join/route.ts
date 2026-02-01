import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ roomId: string }> } // note Promise
) {
  // unwrap the promise first
  const { roomId } = await ctx.params;

  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Check if room exists
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Check if user is already a member
    const existing = await prisma.roomMember.findUnique({
      where: { userId_roomId: { userId, roomId } },
    });

    if (existing) {
      return NextResponse.json({ message: "Already a member" });
    }

    // Add user as member
    await prisma.roomMember.create({
      data: { userId, roomId },
    });

    return NextResponse.json({ message: "Joined room successfully" });
  } catch (err) {
    console.error("🔥 Join Room Error:", err);
    return NextResponse.json({ error: "Failed to join room" }, { status: 500 });
  }
}
