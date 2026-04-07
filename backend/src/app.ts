import cors from "cors";
import express from "express";
import path from "path";

import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/authRoutes";
import chatRoutes from "./routes/chatRoutes";
import messageRoutes from "./routes/messageRoutes";
import postRoutes from "./routes/postRoutes";
import storyRoutes from "./routes/storyRoutes";
import userRoutes from "./routes/userRoutes";

const app = express();

const allowedOrigins = [
  // "http://127.0.0.1:8081", // expo mobile
  // "http://127.0.0.1:5173", // vite web devs
  "http://192.168.38.103:5173", // vite web devs
  "http://192.168.38.103:8081", // expo mobile
  "http://127.20.10.6:5201",
  "http://10.10.33.245:5201",
  process.env.FRONTEND_URL!, // production
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // allow credentials from client (cookies, authorization headers, etc.)
  })
);

app.use(express.json()); // parses incoming JSON request bodies and makes them available as req.body in your route handlers

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/stories", storyRoutes);
// error handlers must come after all the routes and other middlewares so they can catch errors passed with next(err) or thrown inside async handlers.
app.use(errorHandler);

// serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../web/dist")));

  app.get("/{*any}", (_, res) => {
    res.sendFile(path.join(__dirname, "../../web/dist/index.html"));
  });
}

export default app;
