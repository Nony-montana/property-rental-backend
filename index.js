const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const adminRoutes = require("./routes/admin.routes");

dotenv.config();

const connectDB = require("./config/connectDB");
const authRoutes = require("./routes/auth.routes");
const propertyRoutes = require("./routes/property.routes");
const chatRoutes = require("./routes/chat.routes");

connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Property Rental API is running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/admin", adminRoutes);


// SOCKET.IO
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join a chat room
  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
    console.log(`User joined chat: ${chatId}`);
  });

  // Send a message
  socket.on("send_message", (data) => {
    io.to(data.chatId).emit("receive_message", data);
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));