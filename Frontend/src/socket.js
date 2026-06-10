import { io } from "socket.io-client";

export const SOCKET_URL = "http://localhost:8080";

let socket;

export function getSocket() {
  const token = localStorage.getItem("token");

  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      auth: { token },
      transports: ["websocket", "polling"],
    });
  }

  socket.auth = { token };
  if (!socket.connected) socket.connect();

  return socket;
}

export function disconnectSocket() {
  if (socket?.connected) socket.disconnect();
}
