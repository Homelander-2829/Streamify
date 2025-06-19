import User from "../models/User.js"
import jwt from "jsonwebtoken"
import { upsertStreamUser } from "../lib/stream.js";


export const signup = async (req, res) => {
    console.log("hello")
    const { email, password, fullName } = req.body;
    try {
        if (!email || !password || !fullName) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }
        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }
        
        // Fixed email regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Invalid email format"
            });
        }
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "Email already exists, please use a different one"
            });
        }
        
        const idx = Math.floor(Math.random() * 100) + 1;
        const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

        const newUser = await User.create({
            email,
            fullName,
            password, // Save hashed password
            profilePic: randomAvatar,
        });
        
        
        try {
            await upsertStreamUser({
                id:newUser._id.toString(),
                name:newUser.fullName,
                image:newUser.profilePic || ""
            })
            console.log(`Stream user created for ${newUser._id}`)
        } catch (error) {
            console.log("Error crrateing stream user :",error)
        }


        // Create JWT token
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: "7d"
        });

        // Set cookie
        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true, // Prevent XSS attacks
            sameSite: "strict", // Prevent CSRF attacks
            secure: process.env.NODE_ENV === "production"
        });

        // Don't send password in response

        res.status(201).json({
            success: true,
            user: newUser,
            message: "User created successfully"
        });
    } catch (err) {
        console.log("Error in signup controller", err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}

export async function login(req,res) {
    try{
        const {email,password} = req.body;

        if(!email || !password){
            return res.status(400).json({
                message:"All fields are required"
            })
        }
        const user = await User.findOne({email});
        if(!user) return res.status(401).json({message:"Invalid email"});

        const isPasswordCorrect = await user.matchPassword(password);
        if(!isPasswordCorrect) {
            return res.status(401).json({
                message:"Invalid password"
            })
        }

        // Create JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: "7d"
        });

        // Set cookie
        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true, // Prevent XSS attacks
            sameSite: "strict", // Prevent CSRF attacks
            secure: process.env.NODE_ENV === "production"
        });

        res.status(200).json({
            success:true,
            user
        });    
    }catch(err){
        console.log("Error in login controller",err.message);
        res.status(500).json({
            message:"Internal server error"
        })
    }
 }

export function logout(req,res){
     res.clearCookie("jwt")
     res.status(200).json({
        success:true,
        message:"Logout successful"
     })
}

export async function onboard(req,res){
    console.log(req.user);
    try {
        const userId = req.user._id
        
        const {fullName,bio,nativeLanguage,learningLanguage,location} = req.body
        if(!fullName || !bio || !nativeLanguage || !learningLanguage|| !location){
            return res.status(400).json({
                message:"All fields are required",
                missingFields:[
                    !fullName && "fullName",
                    !bio && "bio",
                    !nativeLanguage && "nativeLanguage",
                    !learningLanguage && "learningLanguage",
                    !location && "location",
                ].filter(Boolean),
            });
        }
        const updatedUser = await User.findByIdAndUpdate(userId,{
            ...req.body, //sagla yeun jat yamadhe ... taklyavar
            isOnboarded:true,
        },{new:true})
        if(!updatedUser){
           return res.status(404).json({
            message:"User not found"
           }) 
        }
        try {
            await upsertStreamUser({
                id:updatedUser._id.toString(),
                name:updatedUser.fullName,
                image: updatedUser.profilePic || "",
            })
            console.log(`Stream user updated after onboarding for ${updatedUser.fullName}`)
        } catch (error) {
            console.log("Error updating user during onboarding : ",error.message)
        } 
        return res.status(200).json({
            success:true,
            user:updatedUser
        })
    } catch (error) {
        console.log("Onboarding error",error)
        return res.status(500).json({
            message:"Internal server error"
        })
    }
}