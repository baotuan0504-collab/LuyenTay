import { Server as HttpServer } from "http";

// store online users in memory: userId -> socketId
export const onlineUsers: Map<string, string> = new Map();

export const initializeSocket = (httpServer: HttpServer) => {
  const allowedOrigins = [
    "http://127.0.0.1:8081", // Expo mobile
    "http://127.0.0.1:5173", // Vite web dev
    // "http://192.168.38.103:5173", // vite web devs
    // "http://192.168.38.103:8081", // expo mobile

    process.env.FRONTEND_URL, // production
  ].filter(Boolean) as string[];

  const corsOptions =
    process.env.NODE_ENV === "development"
      ? { origin: true }
      : { origin: allowedOrigins };

};
