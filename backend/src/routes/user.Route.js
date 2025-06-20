import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js"
import { getRecommendedUsers } from "../controllers/user.Controller.js"
import { getMyFriends } from "../controllers/user.Controller.js"
import { sendFriendRequest } from "../controllers/user.Controller.js"
import { acceptFriendRequest } from "../controllers/user.Controller.js"
import { getFriendRequests } from "../controllers/user.Controller.js"
import { getOutgoingFriendReqs } from "../controllers/user.Controller.js"

const router = express.Router()

// apply auth middleware to all routes

router.use(protectRoute)

router.get("/",getRecommendedUsers)
router.get("/friends",getMyFriends)

router.post("/friend-request/:id",sendFriendRequest)
router.put("/friend-request/:id/accept",acceptFriendRequest)

router.get("/friend-requests",getFriendRequests)
router.get("/outgoing-friend-requests",getOutgoingFriendReqs);

export default router