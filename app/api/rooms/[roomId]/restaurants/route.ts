import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await ctx.params;

    if (!roomId) {
      return NextResponse.json({ error: "No room ID provided" }, { status: 400 });
    }

    // fetch room
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const { lat, lon, range } = room;

    if (lat == null || lon == null) {
      return NextResponse.json({ error: "Room does not have coordinates" }, { status: 400 });
    }

    const radiusMeters = (typeof range === "number" ? range : 5) * 1000;

    // --- Overpass API query ---
    const overpassQuery = `
[out:json];
(
  node["amenity"="restaurant"](around:${radiusMeters},${lat},${lon});
  way["amenity"="restaurant"](around:${radiusMeters},${lat},${lon});
);
out center;
`;

    const overpassRes = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: overpassQuery,
    });

    if (!overpassRes.ok) {
      return NextResponse.json({ error: "Failed to fetch restaurants" }, { status: 502 });
    }

    const overpassData = await overpassRes.json();

    const restaurants = overpassData.elements
      .filter((el: any) => el.tags?.name)
      .map((el: any) => ({
        id: el.id,
        name: el.tags.name,
        cuisine: el.tags.cuisine || null,
        lat: el.lat || el.center?.lat,
        lon: el.lon || el.center?.lon,
      }));

    return NextResponse.json({ restaurants });
  } catch (err) {
    console.error("🔥 FETCH RESTAURANTS ERROR:", err);
    return NextResponse.json({ error: "Failed to fetch restaurants" }, { status: 500 });
  }
}
