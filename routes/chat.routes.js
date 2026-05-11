const express = require("express");
const router = express.Router();
const {
  startChat,
  getMyChats,
  getChatMessages,
  sendMessage,
  getUnreadCount,
  markAsRead,
} = require("../controllers/chat.controller");
const { verifyToken } = require("../middleware/auth.middleware");

// All chat routes require login
router.post("/start", verifyToken, startChat);
router.get("/my-chats", verifyToken, getMyChats);
router.get("/:chatId/messages", verifyToken, getChatMessages);
router.post("/:chatId/messages", verifyToken, sendMessage);
router.get("/unread-count", verifyToken, getUnreadCount);
router.put("/:chatId/mark-read", verifyToken, markAsRead);


module.exports = router;