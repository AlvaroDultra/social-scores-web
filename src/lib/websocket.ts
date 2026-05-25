import { Client, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let client: Client | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

export function connectWebSocket(
  onRankingUpdate: (data: unknown) => void,
  onFeedUpdate: (data: unknown) => void
) {
  if (client?.connected) return;

  client = new Client({
    webSocketFactory: () =>
      new SockJS(process.env.NEXT_PUBLIC_WS_URL as string),
    reconnectDelay: 5000,
    onConnect: () => {
      client!.subscribe("/topic/ranking", (msg) => {
        onRankingUpdate(JSON.parse(msg.body));
      });
      client!.subscribe("/topic/feed", (msg) => {
        onFeedUpdate(JSON.parse(msg.body));
      });
    },
    onDisconnect: () => {
      // Auto-reconnect handled by reconnectDelay
    },
  });

  client.activate();
}

export function disconnectWebSocket() {
  client?.deactivate();
  client = null;
}
