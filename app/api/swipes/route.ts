import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId, roomId, restaurantId, choice } = await req.json();

    if (!userId || !roomId || !restaurantId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Convert restaurantId to string before upserting
    const swipe = await prisma.swipe.upsert({
      where: {
        userId_roomId_restaurantId: {
          userId,
          roomId,
          restaurantId: String(restaurantId), // ✅ cast to string
        },
      },
      update: { choice },
      create: {
        userId,
        roomId,
        restaurantId: String(restaurantId), // ✅ cast to string
        choice,
      },
    });

    return NextResponse.json({ swipe });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save swipe" }, { status: 500 });
  }
}
