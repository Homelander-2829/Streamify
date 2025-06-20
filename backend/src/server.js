import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";
import connectDB from "./lib/db.js";

// Setup __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000; // Always fallback to 5000

// Middlewares
app.use(
  cors({
    origin: "http://localhost:5173", // ⚠️ Update this to your deployed frontend URL on Render
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

// Serve frontend in production
// Serve frontend in production
// Serve frontend in production
// Serve frontend in production
if (process.env.NODE_ENV === "production") {
    const frontendPath = path.resolve(__dirname, "../../frontend/dist");
    app.use(express.static(frontendPath));
  
    app.get(/^(?!\/api).*/, (req, res) => {
      res.sendFile(path.join(frontendPath, "index.html"));
    });
  }

// Connect DB and start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await connectDB();
});
