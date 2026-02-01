"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateOrJoinRoom() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get("userId"); // grab from URL

  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState("");
  const [range, setRange] = useState(5); // default 5 km
  const [roomIdToJoin, setRoomIdToJoin] = useState("");

  // Join an existing room
  const handleJoinRoom = async () => {
    if (!userId) {
      alert("User ID is missing from URL!");
      return;
    }
    if (!roomIdToJoin) {
      alert("Please enter a Room ID to join");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/rooms/${roomIdToJoin}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to join room");
        setLoading(false);
        return;
      }

      router.push(`/room/${roomIdToJoin}?userId=${userId}`);
    } catch (err) {
      console.error(err);
      alert("Something went wrong while joining the room.");
      setLoading(false);
    }
  };

  // Create a new room
  const handleCreateRoom = async () => {
    if (!userId) {
      alert("User ID is required");
      return;
    }
    if (!location) {
      alert("Location is required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, location, range }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to create room");
        setLoading(false);
        return;
      }

      const { roomId } = await res.json();
      router.push(`/room/${roomId}?userId=${userId}`);
    } catch (err) {
      console.error(err);
      alert("Something went wrong while creating the room.");
      setLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen p-4"
      style={{
        backgroundImage: "url('/background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* JOIN ROOM */}
      <h1 className="text-2xl mb-4 text-black font-bold">Join a Room</h1>
      <input
        type="text"
        placeholder="Enter Room ID"
        value={roomIdToJoin}
        onChange={(e) => setRoomIdToJoin(e.target.value)}
        className="mb-2 p-2 w-64 rounded"
        style={{
          border: "2px solid black",
          color: "black",
          backgroundColor: "white",
        }}
      />
      <button
        onClick={handleJoinRoom}
        disabled={loading}
        className="btn btn-primary w-64 mb-10"
      >
        {loading ? "Joining..." : "Join Room"}
      </button>

      {/* CREATE ROOM */}
      <h1 className="text-2xl mb-4 text-black font-bold">Create a Room</h1>
      <input
        type="text"
        placeholder="Enter location (e.g., City or Address)"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="mb-2 p-2 w-64 rounded"
        style={{
          border: "2px solid black",
          color: "black",
          backgroundColor: "white",
        }}
      />
      <input
        type="number"
        min={1}
        placeholder="Range (km)"
        value={range}
        onChange={(e) => setRange(Number(e.target.value))}
        className="mb-4 p-2 w-64 rounded"
        style={{
          border: "2px solid black",
          color: "black",
          backgroundColor: "white",
        }}
      />
      <button
        onClick={handleCreateRoom}
        disabled={loading}
        className="btn btn-primary w-64"
      >
        {loading ? "Creating..." : "Create Room"}
      </button>
    </div>
  );
}
