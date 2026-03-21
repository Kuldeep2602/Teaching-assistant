"use client";

import { create } from "zustand";
import { io, type Socket } from "socket.io-client";
import { SOCKET_EVENTS, type SocketEventPayload } from "@veda/shared";
import { SOCKET_URL } from "../lib/config";
import { useAssignmentsStore } from "./assignments";

type SocketState = {
  socket: Socket | null;
  connected: boolean;
  connect: () => void;
};

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  connected: false,
  connect: () => {
    if (get().socket) {
      return;
    }

    const socket = io(SOCKET_URL, {
      transports: ["websocket"]
    });

    const applyEvent = (payload: SocketEventPayload) => {
      useAssignmentsStore.getState().applySocketEvent(payload);
    };

    socket.on("connect", () => set({ connected: true }));
    socket.on("disconnect", () => set({ connected: false }));
    socket.on(SOCKET_EVENTS.QUEUED, applyEvent);
    socket.on(SOCKET_EVENTS.PROCESSING, applyEvent);
    socket.on(SOCKET_EVENTS.COMPLETED, applyEvent);
    socket.on(SOCKET_EVENTS.FAILED, applyEvent);
    socket.on(SOCKET_EVENTS.PDF_READY, applyEvent);

    set({ socket });
  }
}));
