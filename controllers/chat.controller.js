const Chat = require("../models/chat.model");
const Message = require("../models/message.model");

// START OR GET EXISTING CHAT
const startChat = async (req, res) => {
  try {
    const { propertyId, landlordId } = req.body;
    const tenantId = req.user.id;

    // Check if chat already exists
    let chat = await Chat.findOne({
      property: propertyId,
      landlord: landlordId,
      tenant: tenantId,
    })
      .populate("property", "title images")
      .populate("landlord", "firstName lastName")
      .populate("tenant", "firstName lastName");

    // If not, create a new one
    if (!chat) {
      chat = await Chat.create({
        property: propertyId,
        landlord: landlordId,
        tenant: tenantId,
      });

      chat = await Chat.findById(chat._id)
        .populate("property", "title images")
        .populate("landlord", "firstName lastName")
        .populate("tenant", "firstName lastName");
    }

    res.status(200).json({ message: "Chat started", data: chat });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL CHATS FOR LOGGED IN USER
const getMyChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let chats;

    if (role === "LANDLORD") {
      chats = await Chat.find({ landlord: userId })
        .populate("property", "title images")
        .populate("tenant", "firstName lastName")
        .sort({ lastMessageTime: -1 });
    } else {
      chats = await Chat.find({ tenant: userId })
        .populate("property", "title images")
        .populate("landlord", "firstName lastName")
        .sort({ lastMessageTime: -1 });
    }

    res.status(200).json({ message: "Chats fetched", data: chats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET MESSAGES FOR A CHAT
const getChatMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "firstName lastName role")
      .sort({ createdAt: 1 });

    res.status(200).json({ message: "Messages fetched", data: messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SEND A MESSAGE
const sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const { chatId } = req.params;

    const message = await Message.create({
      chat: chatId,
      sender: req.user.id,
      content,
    });

    // Update last message in chat
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: content,
      lastMessageTime: new Date(),
    });

    const populated = await Message.findById(message._id)
      .populate("sender", "firstName lastName role");

    res.status(201).json({ message: "Message sent", data: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET UNREAD MESSAGE COUNT
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadCount = await Message.countDocuments({
      read: false,
      sender: { $ne: userId },
      chat: {
        $in: await Chat.find({
          $or: [{ landlord: userId }, { tenant: userId }]
        }).distinct('_id')
      }
    });

    res.status(200).json({ count: unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// MARK MESSAGES AS READ
const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;

    await Message.updateMany(
      { chat: chatId, sender: { $ne: userId }, read: false },
      { read: true }
    );

    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { startChat, getMyChats, getChatMessages, sendMessage, getUnreadCount, markAsRead };