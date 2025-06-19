import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getStreamToken } from "../controllers/chat.controller.js";

// Create a new router instance for chat-related routes

const router = express.Router()

router.get("/token",protectRoute,getStreamToken)
export default router