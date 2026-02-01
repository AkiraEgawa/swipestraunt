"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinRoomPage() {
  const [roomId, setRoomId] = useState("");
  const [userId, setUserId] = useState("");
  const router = useRouter();

  const handleJoin = async () => {
    if (!roomId || !userId) {
      alert("Room ID and User ID are required");
      return;
    }

    const res = await fetch(`/api/rooms/${roomId}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Failed to join room");
      return;
    }

    alert(data.message || "Joined successfully!");
    router.push(`/room/${roomId}?userId=${userId}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl mb-4">Join Room</h1>

      <input
        type="text"
        placeholder="Your User ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        className="mb-2 p-2 border border-black rounded w-64"
      />

      <input
        type="text"
        placeholder="Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        className="mb-4 p-2 border border-black rounded w-64"
      />

      <button onClick={handleJoin} className="btn btn-primary">
        Join Room
      </button>
    </div>
  );
}
