import { io } from "socket.io-client";

const url = import.meta.env.VITE_BACKEND_URL;
if (!url) {
  console.warn("[socket] Missing VITE_BACKEND_URL in environment");
}

export const socket = io(url,{
    withCredentials:true,
    autoConnect:false,
    transports: ["websocket"]
});
