import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ roomId: string }> } // params is a Promise in App Router
) {
  try {
    const { roomId } = await ctx.params; // ✅ unwrap params

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { members: true, swipes: true },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json(room);
  } catch (err: any) {
    console.error(err); // check server console for the real error
    return NextResponse.json({ error: "Failed to fetch room" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request, 
  context: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await context.params // <- always works
  if (!roomId) {
    return NextResponse.json({ error: "No room ID provided" }, { status: 400 });
  }

  try {
    // delete related swipes
    await prisma.swipe.deleteMany({ where: { roomId } });
    // delete room members
    await prisma.roomMember.deleteMany({ where: { roomId } });
    // delete the room itself
    await prisma.room.delete({ where: { id: roomId } });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete room" }, { status: 500 });
  }
}