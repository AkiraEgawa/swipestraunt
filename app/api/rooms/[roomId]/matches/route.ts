import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Parse the URL manually
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/"); // ["", "api", "rooms", "ROOM_ID", "matches"]
  const roomId = pathParts[3];

  if (!roomId) {
    return NextResponse.json({ matched: false });
  }

  const restaurantId = url.searchParams.get("restaurantId");
  if (!restaurantId) {
    return NextResponse.json({ matched: false });
  }

  try {
    // Check if any other member liked the same restaurant
    const swipes = await prisma.swipe.findMany({
      where: {
        roomId,
        restaurantId: String(restaurantId),
        choice: true,
      },
    });

    // Matched if at least 2 users liked it
    const matched = swipes.length >= 2;

    return NextResponse.json({ matched });
  } catch (err) {
    console.error("🔥 Match Check Error:", err);
    return NextResponse.json({ matched: false });
  }
}
