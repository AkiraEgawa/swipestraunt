"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import RestaurantSwiper from "./RestaurantSwiper";

type Room = {
  id: string;
  createdAt: string;
  members: { id: string; userId: string }[];
  swipes: any[];
};

export default function RoomPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  console.log(params);
  const userId = searchParams.get("userId");
  const roomId = params?.roomId;

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch room info
  useEffect(() => {
    if (!roomId) return;

    fetch(`/api/rooms/${roomId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch room");
        return res.json();
      })
      .then(setRoom)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [roomId]);

  const handleCloseRoom = async () => {
    console.log("roomId", roomId);
    if (!roomId) {
      alert("Room ID not available yet!");
      return;
    }

    try {
      const res = await fetch(`/api/rooms/${roomId}`, { method: "DELETE" });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Failed to close room");
      }

      router.push(`/create-room?userId=${userId}`); // back to creation page
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!roomId) return <p className="text-red-500">No room ID provided</p>;
  if (loading) return <p>Loading room...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!room) return <p>Room not found</p>;

  return (
    <div className="min-h-screen flex justify-center">
      <div className="max-w-xl w-full mx-auto text-black">
        {/* Room header with copy button */}
        <h1 className="text-black font-bold mb-4 flex items-center gap-2">
          Room {room.id}
          <button
            onClick={() => navigator.clipboard.writeText(room.id)}
            className="px-2 py-1 bg-gray-200 rounded border border-gray-400 hover:bg-gray-300 transition"
            title="Copy Room ID"
          >
            Copy
          </button>
        </h1>

        <button className="btn btn-error mb-4" onClick={handleCloseRoom}>
          Close Room
        </button>

        <RestaurantSwiper roomId={room.id} userId={userId!} />
      </div>
    </div>
  );
}
