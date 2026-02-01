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
  const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=1`, {
    headers: {
      Authorization: process.env.NEXT_PUBLIC_PEXELS_API_KEY || "",
    },
  });
  const data = await res.json();
  if (data.photos && data.photos.length > 0) {
    return data.photos[0].src.medium;
  }
  // fallback if no image found
  return "https://via.placeholder.com/400x300?text=No+Image";
};

export default function RestaurantSwiper({ roomId, userId }: Props) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [match, setMatch] = useState<Restaurant | null>(null);

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const res = await fetch(`/api/rooms/${roomId}/restaurants`);
        const data = await res.json();
        // For each restaurant, fetch a Pexels image using its cuisine or name
        const restaurantsWithImages: Restaurant[] = await Promise.all(
          data.restaurants.map(async (r: Restaurant) => {
            const keyword = r.cuisine || r.name || "food";
            const image = await fetchPexelsImage(keyword);
            return { ...r, image };
          })
        );
        setRestaurants(restaurantsWithImages);
      } catch (err) {
        console.error(err);
      }
    };
    loadRestaurants();
  }, [roomId]);

  const swipe = async (choice: boolean) => {
    const restaurant = restaurants[currentIndex];
    if (!restaurant) return;

    // Save swipe to database
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
      // Check if any other member has already liked this restaurant
      const res = await fetch(`/api/rooms/${roomId}/matches?restaurantId=${restaurant.id}`);
      const data = await res.json();
      if (data.matched) {
        setMatch(restaurant);
      }
    }

    setCurrentIndex((prev) => prev + 1);
  };

  if (match) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold mb-4">It's a Match! 🎉</h2>
        <img src={match.image} alt={match.name} className="mx-auto mb-4 w-64 h-48 object-cover rounded" />
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
  }

  if (currentIndex >= restaurants.length) return <p className="p-8">No more restaurants!</p>;
  const current = restaurants[currentIndex];

  return (
    <div className="p-8 max-w-sm mx-auto border rounded shadow">
      <img src={current.image} alt={current.name} className="w-full h-64 object-cover rounded mb-4" />
      <h2 className="font-bold text-lg mb-1">{current.name}</h2>
      {current.cuisine && <p className="text-gray-600 mb-4">{current.cuisine}</p>}
      <div className="flex justify-between">
        <button
          onClick={() => swipe(false)}
          className="btn btn-error w-24"
        >
          ❌
        </button>
        <button
          onClick={() => swipe(true)}
          className="btn btn-success w-24"
        >
          ❤️
        </button>
      </div>
    </div>
  );
}
