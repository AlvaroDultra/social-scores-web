"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { rehydrate, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    rehydrate();
    setReady(true);
  }, [rehydrate]);

  useEffect(() => {
    if (ready && !isAuthenticated()) {
      sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
      router.replace("/login");
    }
  }, [ready, isAuthenticated, router]);

  if (!ready || !isAuthenticated()) return null;

  return <>{children}</>;
}
