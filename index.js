const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const cookieParser = require("cookie-parser");

dotenv.config();

const connectDB = require("./config/connectDB");
const authRoutes = require("./routes/auth.routes");
const propertyRoutes = require("./routes/property.routes");
const chatRoutes = require("./routes/chat.routes");
const adminRoutes = require("./routes/admin.routes");

connectDB();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:3001",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

// ===========================
// SECURITY MIDDLEWARE
// ===========================

// 1. Helmet — sets secure HTTP headers
app.use(helmet());

// 2. HTTPS enforcement in production
app.use((req, res, next) => {
  if (
    process.env.NODE_ENV === "production" &&
    req.headers["x-forwarded-proto"] !== "https"
  ) {
    return res.redirect("https://" + req.headers.host + req.url);
  }
  next();
});

// 3. CORS — only allow trusted frontend origins
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// 4. Cookie parser
app.use(cookieParser());

// 5. Body parser
app.use(express.json());


// 7. MongoDB injection protection — sanitize query operators
app.use(mongoSanitize());

// 8. Global rate limiting — max 100 requests per 15 minutes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Too many requests, please try again later." },
});
app.use(globalLimiter);

// 9. Strict rate limiting on auth routes — max 10 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many attempts, please try again in 15 minutes." },
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/request-otp", authLimiter);

// ===========================
// SOCKET.IO
// ===========================
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
  });

  socket.on("send_message", (data) => {
    io.to(data.chatId).emit("receive_message", data);
  });

  socket.on("disconnect", () => {});
});

// ===========================
// ROUTES
// ===========================
app.get("/", (req, res) => {
  res.send("HomeFind API is running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/admin", adminRoutes);

// ===========================
// START SERVER
// ===========================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));