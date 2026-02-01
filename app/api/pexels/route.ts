import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const keyword = url.searchParams.get("query") || "food";

    const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=1`, {
      headers: {
        Authorization: process.env.PEXELS_API_KEY!, // server-only
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch from Pexels" }, { status: res.status });
    }

    const data = await res.json();
    const imageUrl = data.photos?.[0]?.src?.medium || "https://via.placeholder.com/400x300?text=No+Image";

    return NextResponse.json({ imageUrl });
  } catch (err) {
    console.error("Pexels API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
