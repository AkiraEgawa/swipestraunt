import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId, location, range } = await req.json();

    if (!userId || !location) {
      return NextResponse.json(
        { error: "userId and location are required" },
        { status: 400 }
      );
    }

    // Geocode the location
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        location
      )}`,
      {
        headers: {
          "User-Agent": "swipestraunt/1.0 (test@example.com)", // required by OSM
        },
      }
    );

    if (!geoRes.ok) {
      return NextResponse.json(
        { error: "Failed to geocode location" },
        { status: 500 }
      );
    }

    const geoData = await geoRes.json();

    if (!geoData.length) {
      return NextResponse.json(
        { error: "Could not find coordinates for location" },
        { status: 400 }
      );
    }

    const lat = parseFloat(geoData[0].lat);
    const lon = parseFloat(geoData[0].lon);

    // Create the room with lat/lon
    const room = await prisma.room.create({
      data: {
        location,
        range: range ?? 5,
        lat,
        lon,
      },
    });

    // Add the user as a member
    await prisma.roomMember.create({
      data: {
        userId,
        roomId: room.id,
      },
    });

    return NextResponse.json({ roomId: room.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ roomId: string }> } // params is a Promise
) {
  try {
    // unwrap params
    const { roomId } = await ctx.params;

    if (!roomId) {
      return NextResponse.json({ error: "Room ID required" }, { status: 400 });
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { members: true, swipes: true },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // return the room
    return NextResponse.json(room);
  } catch (err) {
    console.error("🔥 API ERROR:", err);
    return NextResponse.json({ error: "Failed to fetch room" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await ctx.params; // ✅ unwrap params

    if (!roomId) {
      return NextResponse.json({ error: "No room ID provided" }, { status: 400 });
    }

    // delete related swipes first
    await prisma.swipe.deleteMany({ where: { roomId } });

    // delete room members
    await prisma.roomMember.deleteMany({ where: { roomId } });

    // delete the room itself
    await prisma.room.delete({ where: { id: roomId } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("🔥 DELETE ROOM ERROR:", err);
    return NextResponse.json({ error: "Failed to delete room" }, { status: 500 });
  }
}