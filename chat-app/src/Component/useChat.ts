import { useEffect, useRef, useState, useCallback } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";

export interface ChatMessage {
  id: string; // client-side uuid
  user: string;
  msg: string;
  ts: number;
  mine: boolean;
}

interface ServerPacket {
  type: "chat" | "history";
  room: string;
  user: string;
  msg: string;
  ts: number;
}

export const useChat = (token: string, room = "lobby") => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const wsRef = useRef<ReconnectingWebSocket>(null);

  // connect once
  useEffect(() => {
    const ws = new ReconnectingWebSocket(
      `ws://${window.location.hostname}:3000`,
      [], // subprotocols
      { maxRetries: 10, WebSocket } // browser WS impl
    );
    wsRef.current = ws;
    ws.onopen = () => {
      /** attach JWT as header‐like sub-protocol */
      // @ts-expect-error – property is writable in most browsers
      ws._transport?._socket?.protocol = token;
    };
    ws.onmessage = (evt) => {
      const pkt: ServerPacket = JSON.parse(evt.data);
      if (pkt.type === "history" || pkt.type === "chat") {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            user: pkt.user,
            msg: pkt.msg,
            ts: pkt.ts,
            mine: false,
          },
        ]);
      }
    };
    return () => ws.close();
  }, [token]);

  const send = useCallback((text: string) => {
    if (!wsRef.current) return;
    const payload = JSON.stringify({ type: "chat", msg: text });
    wsRef.current.send(payload);
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        user: "You",
        msg: text,
        ts: Date.now(),
        mine: true,
      },
    ]);
  }, []);

  return { messages, send };
};
