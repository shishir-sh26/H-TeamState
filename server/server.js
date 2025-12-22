const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

/**
 * 1. DYNAMIC CORS SETUP
 * We allow both your local development URL and your future Vercel URL.
 * Replace 'https://your-app.vercel.app' with your actual Vercel URL once deployed.
 */
const allowedOrigins = [
  "http://localhost:3000", 
  "https://your-app-name.vercel.app" 
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.get("/", (req, res) => {
  res.send("H-TeamState Backend is Running!");
});

const server = http.createServer(app);

/**
 * 2. SOCKET.IO INITIALIZATION
 * We use the same dynamic origins here to ensure the WebSocket connection works.
 */
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("join-team", (teamId) => {
    socket.join(teamId);
    console.log(`User joined team: ${teamId}`);
  });

  socket.on("update-project", (data) => {
    socket.to(data.teamId).emit("receive-update", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected");
  });
});

/**
 * 3. DYNAMIC PORT
 * Cloud hosts like Render/Railway assign a port via the 'PORT' environment variable.
 */
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});