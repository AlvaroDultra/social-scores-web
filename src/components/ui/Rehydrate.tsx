"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export default function Rehydrate() {
  const rehydrate = useAuthStore((s) => s.rehydrate);
  useEffect(() => { rehydrate(); }, [rehydrate]);
  return null;
}
