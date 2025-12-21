const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

// This fixes the "Cannot GET /" error
app.get("/", (req, res) => {
  res.send("Backend Server is Running! Socket.io is ready.");
});

const server = http.createServer(app);

// Correctly initializing 'io' before using it
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("join-team", (teamId) => {
    socket.join(teamId);
    console.log(`User joined team: ${teamId}`);
  });

  socket.on("update-project", (data) => {
    // Sends updates to everyone in that team room
    socket.to(data.teamId).emit("receive-update", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected");
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});