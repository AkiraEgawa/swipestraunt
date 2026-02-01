import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, ctx: { params: { roomId: string } }) {
  const { roomId } = ctx.params;
  const restaurantId = new URL(req.url).searchParams.get("restaurantId");
  if (!restaurantId) return NextResponse.json({ matched: false });

  // Check if any other member liked the same restaurant
 const swipes = await prisma.swipe.findMany({
  where: {
    roomId,
    restaurantId: String(restaurantId), // make sure this is string
    choice: true,
  },
});


  // Matched if at least 2 users liked it
  const matched = swipes.length >= 2;

  return NextResponse.json({ matched });
}
