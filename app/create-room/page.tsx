"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState } from "react"

export default function CreateRoomPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const userId = searchParams.get("userId")

  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState("")
  const [range, setRange] = useState(5) // default 5 km

  const gotoJoin = async () => {
    router.push(`/join-room?userId=${userId}`)

  }

  const handleCreateRoom = async () => {
    if (!userId) {
      alert("User ID is required")
      return
    }
    if (!location) {
      alert("Location is required")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, location, range }),
      })

      if (!res.ok) {
        const err = await res.json()
        alert(err.error || "Failed to create room")
        setLoading(false)
        return
      }

      const { roomId } = await res.json()
      router.push(`/room/${roomId}?userId=${userId}`)
    } catch (err) {
      console.error(err)
      alert("Something went wrong while creating the room.")
      setLoading(false)
    }
  }

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen"
      style={{
        backgroundImage: "url('/background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <h1 className="text-2xl mb-4 text-black font-bold">Join a Room</h1>
      {/* Room Join Button */}
      <button
        className="btn btn-primary w-64"
        onClick={gotoJoin}
      ></button >
      <h1 className="text-2xl mb-4 text-black font-bold">Create a Room</h1>

      {/* Location input */}
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

      {/* Range input */}
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
  )
}
