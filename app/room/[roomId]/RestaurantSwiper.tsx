"use client";

import { useState, useEffect } from "react";

type Restaurant = {
  id: string;
  name: string;
  cuisine: string | null;
  image: string;
};

type Props = {
  roomId: string;
  userId: string;
};

// Helper to fetch a random image from Pexels for a keyword
const fetchPexelsImage = async (keyword: string): Promise<string> => {
  const res = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(
      keyword
    )}&per_page=1`,
    {
      headers: {
        Authorization: process.env.NEXT_PUBLIC_PEXELS_API_KEY || "",
      },
    }
  );
  const data = await res.json();
  if (data.photos && data.photos.length > 0) {
    return data.photos[0].src.medium;
  }
  return "https://via.placeholder.com/400x300?text=No+Image";
};

export default function RestaurantSwiper({ roomId, userId }: Props) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [match, setMatch] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [flash, setFlash] = useState(false);
  const [shutter, setShutter] = useState(false);

  // Load restaurants
  useEffect(() => {
    let cancelled = false;

    const loadRestaurants = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/rooms/${roomId}/restaurants`);
        const data = await res.json();

        if (res.status !== 200 || data.error) {
          if (!cancelled) setTimeout(loadRestaurants, 2000);
          return;
        }

        const restaurantsData = Array.isArray(data.restaurants)
          ? data.restaurants
          : [];

        const restaurantsWithImages: Restaurant[] = await Promise.all(
          restaurantsData.map(async (r: Restaurant) => {
            const keyword = r.cuisine || r.name || "food";
            const image = await fetchPexelsImage(keyword);
            return { ...r, image };
          })
        );

        if (!cancelled) {
          setRestaurants(restaurantsWithImages);
          setCurrentIndex(0);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setTimeout(loadRestaurants, 2000);
      }
    };

    loadRestaurants();
    return () => {
      cancelled = true;
    };
  }, [roomId]);

  // Swipe handler
  const swipe = async (choice: boolean) => {
    const restaurant = restaurants[currentIndex];
    if (!restaurant) return;

    if (choice) {
      setFlash(true);
      setShutter(true);
      setTimeout(() => setFlash(false), 120);
      setTimeout(() => setShutter(false), 350);
    }

    await fetch(`/api/swipes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        roomId,
        restaurantId: restaurant.id,
        choice,
      }),
    });

    if (choice) {
      const res = await fetch(
        `/api/rooms/${roomId}/matches?restaurantId=${restaurant.id}`
      );
      const data = await res.json();
      if (data.matched) {
        setMatch(restaurant);
        return;
      }
    }

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, choice ? 380 : 0);
  };

  if (loading) return <p className="p-8">Loading restaurants...</p>;
  if (match)
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold mb-4">It's a Match! 🎉</h2>
        <img
          src={match.image}
          alt={match.name}
          className="mx-auto mb-4 w-64 h-48 object-cover rounded"
        />
        <p className="font-semibold">{match.name}</p>
        {match.cuisine && <p className="text-gray-600">{match.cuisine}</p>}
        <button
          className="btn btn-primary mt-4"
          onClick={() => setMatch(null)}
        >
          Continue Swiping
        </button>
      </div>
    );

  if (currentIndex >= restaurants.length)
    return <p className="p-8">No more restaurants!</p>;

  const current = restaurants[currentIndex];

  return (
    <div className="min-h-screen flex justify-center pt-10">
      <div
        className="relative max-w-sm w-full h-[560px] rounded-xl shadow-2xl overflow-hidden"
        style={{
          backgroundImage: "url('/Film.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* FLASH overlay */}
        {flash && (
          <div className="absolute inset-0 bg-white z-50 animate-flash pointer-events-none" />
        )}

        {/* SHUTTERS overlay */}
        {shutter && (
          <>
            <div className="absolute top-0 left-0 w-full h-1/2 bg-black z-40 animate-shutter-top" />
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-black z-40 animate-shutter-bottom" />
          </>
        )}

        {/* TOP: Image */}
        <div className="absolute top-1.5 left-12 w-full h-1/2 p-4">
          <div className="w-full h-full overflow-hidden rounded-md">
            <img
              src={current.image}
              alt={current.name}
              className="w-[72.5%] h-[100%] object-cover"
            />
          </div>
        </div>

        {/* BOTTOM: Text + buttons */}
        <div className="absolute bottom-0 left-0 w-full h-1/2 p-6 flex flex-col justify-between">
          <div className="absolute inset-0 flex flex-col justify-end items-center pb-45">
            <h2 className="text-black font-bold text-xl drop-shadow max-w-[60%] text-center">
              {current.name}
            </h2>
            {current.cuisine && (
              <p className="text-black text-sm max-w-[80%] wrap-break-words text-center">{current.cuisine}</p>
            )}
          </div>

          <div className="flex justify-between mt-4 absolute bottom-20 left-25">
            <button onClick={() => swipe(false)} className="btn btn-error w-24">
              X
            </button>
            <button onClick={() => swipe(true)} className="btn btn-success w-24">
              ❤️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
