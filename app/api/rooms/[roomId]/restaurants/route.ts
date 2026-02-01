import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/"); // e.g. ["", "api", "rooms", "ROOM_ID", "restaurants"]
  const roomId = pathParts[3]; // get the [roomId] part

  if (!roomId) return NextResponse.json({ restaurants: [] });

  try {
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) return NextResponse.json({ restaurants: [] });

    const { lat, lon, range } = room;
    if (lat == null || lon == null) return NextResponse.json({ restaurants: [] });

    const radiusMeters = (typeof range === "number" ? range : 5) * 1000;

    const overpassQuery = `
[out:json];
(
  node["amenity"="restaurant"](around:${radiusMeters},${lat},${lon});
  way["amenity"="restaurant"](around:${radiusMeters},${lat},${lon});
);
out center;
`;

    const overpassRes = await fetch(
      "https://overpass-api.de/api/interpreter",
      {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: overpassQuery,
      }
    );

    if (!overpassRes.ok) return NextResponse.json({ restaurants: [] });

    const overpassData = await overpassRes.json();

    const restaurants = (overpassData.elements ?? [])
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
    return NextResponse.json({ restaurants: [] });
  }
}
