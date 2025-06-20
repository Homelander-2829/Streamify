import express from "express"
import { signup, login, logout,onboard } from "../controllers/auth.controller.js"
import { protectRoute } from "../middleware/auth.middleware.js"

const router = express.Router()

router.post("/signup", signup)  // This becomes /api/auth/signup
router.post("/login", login)    // This becomes /api/auth/login
router.post("/logout", logout)  // This becomes /api/auth/logout

router.post("/onboarding",protectRoute,onboard)

// check if user is logged in or not
router.get("/me", protectRoute, (req,res) =>{
    res.status(200).json({success:true, user: req.user})
})

export default router 