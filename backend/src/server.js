import express from "express"
import "dotenv/config"
import authRoutes from "./routes/authroute.js"
import connectDB from "./lib/db.js"
import cors from "cors"
import cookieParser from "cookie-parser"
import userRoutes from "./routes/user.Route.js"
import chatRoutes from "./routes/chat.route.js"
// import path from "path"
const app = express()
const PORT = process.env.PORT || 3000 // Add default port
// const __dirname = path.resolve(); // Get the current directory
app.use(cors({
    origin: ['https://homelander-2829.github.io', 'http://localhost:5173'],
    credentials: true,
  }));
  
app.use(express.json())
app.use(cookieParser())
app.use("/api/auth", authRoutes) // This handles all /api/auth routes
app.use("/api/users",userRoutes);
app.use("/api/chat",chatRoutes);

// if (process.env.NODE_ENV === "production") {
//     app.use(express.static(path.join(__dirname, "../frontend/dist")));
//     app.get("*", (req, res) => {
//         res.sendFile(path.join(__dirname, "../frontend/dist", "index.html")); // ✅ FIXED path
//     });
// }

app.get('/', (req, res) => {
    res.send('Backend is running');
  });

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
})

// Ultra minimal test - add imports one by one

// Ultra minimal test - add imports one by one

// Ultra minimal test - add imports one by one

// Ultra minimal test - add imports one by one

// Ultra minimal test - add imports one by one

// console.log("Starting ultra minimal test...");

// Ultra minimal test - add imports one by one

// console.log("Starting ultra minimal test...");

// // Test 1: Just express
// import express from "express"
// console.log("✓ Express imported");

// // Test 2: Add dotenv
// import "dotenv/config"
// console.log("✓ Dotenv imported");

// // Test 3: Add cors
// import cors from "cors"
// console.log("✓ Cors imported");

// // Test 4: Add cookie-parser
// import cookieParser from "cookie-parser"
// console.log("✓ Cookie-parser imported");

// // Test 5: Add path
// import path from "path"
// console.log("✓ Path imported");

// const app = express();
// console.log("✓ Express app created");

// const PORT = 3000;
// const __dirname = path.resolve();

// // Test 6: Add middleware one by one
// app.use(cors({
//     origin: "http://localhost:5173",
//     credentials: true
// }));
// console.log("✓ CORS middleware added");

// app.use(express.json());
// console.log("✓ JSON middleware added");

// app.use(cookieParser());
// console.log("✓ Cookie parser middleware added");
// app.listen(PORT, () => {
//     console.log(`✓ Server running on port ${PORT}`);
// });