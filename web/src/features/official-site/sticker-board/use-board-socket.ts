"use client";

import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import type { BoardEvent } from "@/lib/board-events";
import type { BoardItemData } from "./types";

export function useBoardSocket(
  onEvent: (event: BoardEvent) => void,
) {
  useEffect(() => {
    const socket: Socket = io({
      path: "/api/socketio",
      transports: ["websocket", "polling"],
    });

    socket.on("board:event", (event: BoardEvent) => {
      onEvent(event);
    });

    return () => {
      socket.disconnect();
    };
  }, [onEvent]);
}

export function applyBoardEvent(
  items: BoardItemData[],
  event: BoardEvent,
): BoardItemData[] {
  if (event.type === "create") {
    const item = event.item as BoardItemData;
    if (items.some((i) => i.id === item.id)) return items;
    return [...items, item];
  }
  if (event.type === "update") {
    const item = event.item as BoardItemData;
    return items.map((i) => (i.id === item.id ? { ...i, ...item } : i));
  }
  if (event.type === "delete") {
    const id = (event.item as { id: string }).id;
    return items.filter((i) => i.id !== id);
  }
  return items;
}
