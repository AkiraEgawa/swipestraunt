"use client";

import { useEffect, useState } from "react";

type Restaurant = {
  id: string;
  name: string;
  cuisine: string | null;
  lat: number;
  lon: number;
};

type Props = {
  roomId: string;
};

export default function RestList({ roomId }: Props) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  const PEXELS_API_KEY = process.env.NEXT_PUBLIC_PEXELS_API_KEY; // Make sure this is set

  useEffect(() => {
    if (!roomId) return;

    const fetchRestaurants = async () => {
      try {
        // 1. Get restaurants from your API
        const res = await fetch(`/api/rooms/${roomId}/restaurants`);
        if (!res.ok) throw new Error("Failed to fetch restaurants");

        const data = await res.json();
        const restaurantsWithImages = await Promise.all(
          data.restaurants.map(async (restaurant: Restaurant) => {
            // 2. Search for an image on Pexels
            const query = `${restaurant.name} ${restaurant.cuisine || "restaurant"}`;
            const imgRes = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`, {
              headers: {
                Authorization: PEXELS_API_KEY!,
              },
            });

            const imgData = await imgRes.json();
            const imgUrl = imgData.photos?.[0]?.src?.medium || "https://via.placeholder.com/400x300?text=No+Image";

            return { ...restaurant, image: imgUrl };
          })
        );

        setRestaurants(restaurantsWithImages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [roomId]);

  if (loading) return <p>Loading restaurants...</p>;
  if (!restaurants.length) return <p>No restaurants found</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
      {restaurants.map((restaurant) => (
        <div key={restaurant.id} className="border rounded shadow p-4">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-48 object-cover rounded mb-2"
          />
          <h2 className="font-bold">{restaurant.name}</h2>
          {restaurant.cuisine && <p className="text-sm text-gray-600">{restaurant.cuisine}</p>}
        </div>
      ))}
    </div>
  );
}
