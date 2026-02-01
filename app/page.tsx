"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type User = {
  id: string
  email: string
}

export default function Users() {
  const router = useRouter()
  const [username, setUsername] = useState("")

  const handleClick = async () => {
    const name = prompt("Enter your username:")
    if (!name) return

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: name }), // using "email" as your API expects
      })

      if (!res.ok) {
        // API returned an error
        const errData = await res.json()
        alert(`Error: ${errData.error || "Username already in use"}`)
        return
      }

      const user = await res.json()
      setUsername(user.email)
      alert(`Welcome, ${user.email}!`)

      router.push(`/create-room?userId=${user.id}`)
      // TODO: proceed to swiping / room creation
    } catch (error) {
      console.error(error)
      alert("Something went wrong while creating your user.")
    }
  }


  return (
  <div className="w-screen h-screen flex justify-center items-center bg-[url('/background.jpg')] bg-cover bg-center m-0 p-0">
    <button
      className="btn btn-ghost p-0 w-100 h-40 relative overflow-hidden"
      onClick={handleClick}
    >
      <span className="absolute inset-0">
        <img
          src="/startBTN.png"
          alt="Start"
          className="w-full h-full object-contain"
        />
      </span>
      <span className="sr-only">Start</span>
    </button>
  </div>

  )
}
