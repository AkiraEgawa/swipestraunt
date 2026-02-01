"use client";

import { Suspense } from "react";
import JoinRoomClient from "./JoinRoomClient";

export default function JoinRoomPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <JoinRoomClient />
    </Suspense>
  );
}