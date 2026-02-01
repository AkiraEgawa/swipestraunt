import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const LOCATIONIQ_KEY = process.env.LOCATIONIQ_KEY; // make sure this is set in your .env

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, location, range } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }
    if (!location) {
      return NextResponse.json({ error: "Location is required" }, { status: 400 });
    }

    const safeRange = typeof range === "number" ? range : 5;

    // --- Geocode the location using LocationIQ ---
    const geoRes = await fetch(
      `https://us1.locationiq.com/v1/search.php?key=${LOCATIONIQ_KEY}&q=${encodeURIComponent(
        location
      )}&format=json&limit=1`
    );

    if (!geoRes.ok) {
      return NextResponse.json(
        { error: "Failed to geocode location" },
        { status: geoRes.status }
      );
    }

    const geoData = await geoRes.json();

    if (!geoData || !geoData.length) {
      return NextResponse.json(
        { error: "Could not find coordinates for the location" },
        { status: 400 }
      );
    }

    const lat = parseFloat(geoData[0].lat);
    const lon = parseFloat(geoData[0].lon);

    // --- Create the room in the database ---
    const room = await prisma.room.create({
      data: {
        location,
        range: safeRange,
        lat,
        lon,
        members: {
          create: {
            userId, // automatically add the creator as a member
          },
        },
      },
      include: { members: true },
    });

    return NextResponse.json({ roomId: room.id });
  } catch (err) {
    console.error("🔥 API ERROR:", err);
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}
