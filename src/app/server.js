const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require('cors');
const session = require("express-session");
const lusca = require("lusca");
// const http = require("http");
// const { Server } = require("socket.io");
const { connectToDB } = require("../utils/db.js");
const routes = require("./routes.js");

dotenv.config({ path: "./.env" });
const passport = require("passport");
require("../utils/passportGoogle.js"); 

const port = process.env.PORT || 8000;
const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: process.env.FRONTEND_URL || "http://localhost:3000",
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   },
// });

// Socket.IO connection handling
// io.on("connection", (socket) => {
//   console.log("A user connected:", socket.id);

//   socket.on("joinDiscussion", (discussionId) => {
//     socket.join(discussionId);
//     console.log(`User ${socket.id} joined discussion ${discussionId}`);
//   });

//   socket.on("leaveDiscussion", (discussionId) => {
//     socket.leave(discussionId);
//     console.log(`User ${socket.id} left discussion ${discussionId}`);
//   });

//   socket.on("sendMessage", (data) => {
//     const { discussionId, message, userId } = data;
//     io.to(discussionId).emit("receiveMessage", { userId, message });
//   });

//   socket.on("likeComment", (data) => {
//     const { discussionId, commentId, userId } = data;
//     io.to(discussionId).emit("commentLiked", { commentId, userId });
//   });

//   socket.on("disconnect", () => {
//     console.log("A user disconnected:", socket.id);
//   });
// });

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax", // Adjust as needed
    },
  })
);

app.set("trust proxy", 1);
app.use(passport.initialize());
app.use(passport.session());

// CORS setup
const corsOptions = {
  origin: ["https://ventoro-frontend-production.vercel.app", "http://localhost:3000"], // Add both frontend URLs
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Allow credentials
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Routes
app.use("/api", routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Connect to database
connectToDB();