"use client";

import { useEffect } from "react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  return Uint8Array.from(Array.from(raw).map((c) => c.charCodeAt(0)));
}

export function usePush() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());

  useEffect(() => {
    if (!isAuthenticated) return;
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    async function setup() {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");
        await navigator.serviceWorker.ready;

        // Verifica se já tem subscription ativa
        const existing = await reg.pushManager.getSubscription();
        if (existing) return;

        // Pede permissão
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        // Busca chave pública VAPID
        const { data } = await api.get<{ publicKey: string }>("/api/push/public-key");
        if (!data.publicKey) return;

        // Cria subscription
        const subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(data.publicKey),
        });

        const json = subscription.toJSON();
        await api.post("/api/push/subscribe", {
          endpoint: json.endpoint,
          p256dh: json.keys?.p256dh,
          auth: json.keys?.auth,
        });
      } catch (err) {
        console.warn("Push setup skipped:", err);
      }
    }

    setup();
  }, [isAuthenticated]);
}
