"use client";
import { Suspense } from "react";
import CreateRoomInner from "./CreateRoomInner";

export default function CreateRoomPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <CreateRoomInner />
    </Suspense>
  );
}
