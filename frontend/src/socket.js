import { io } from "socket.io-client";

const rawSocketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
const socketUrl = rawSocketUrl.replace(/\/+$/, "");

const socket = io(socketUrl, {
  autoConnect: false,
  // Start with polling, then upgrade to websocket when available.
  transports: ["polling", "websocket"],
  timeout: 20000,
});

export default socket;
