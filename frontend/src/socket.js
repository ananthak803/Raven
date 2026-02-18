import { io } from "socket.io-client";

const url = import.meta.env.VITE_BACKEND_URL;

console.log("url",url);

export const socket = io(url,{
    withCredentials:true,
});
