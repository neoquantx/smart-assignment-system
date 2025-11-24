// routes/messageRoutes.js
import express from "express";
import mongoose from "mongoose";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get unread message counts per sender for the current user (MUST BE BEFORE /:userId)
router.get("/unread-summary", authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const results = await Message.aggregate([
      {
        $match: {
          receiver: new mongoose.Types.ObjectId(currentUserId),
          read: false,
        },
      },
      {
        $group: {
          _id: "$sender",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "senderInfo",
        },
      },
      {
        $unwind: "$senderInfo",
      },
    ]);

    const shaped = results.map((item) => ({
      senderId: item._id.toString(),
      senderName: item.senderInfo.name,
      unreadCount: item.count,
    }));

    res.json(shaped);
  } catch (error) {
    console.error("Failed to fetch unread summary", error);
    res.status(500).json({ error: "Failed to fetch unread summary" });
  }
});

// Get group chat messages
router.get("/group/all", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({ isGroupChat: true })
      .sort({ timestamp: 1 })
      .populate("sender", "name");
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch group messages" });
  }
});

// Get list of conversations (recent chats)
router.get("/conversations", authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const currentUserObjectId = new mongoose.Types.ObjectId(currentUserId);

    // 1. Group Chat Conversation
    const lastGroupMessage = await Message.findOne({ isGroupChat: true })
      .sort({ timestamp: -1 });
    
    const groupChat = {
      _id: "group",
      name: "Common Group Chat",
      lastMessage: lastGroupMessage ? lastGroupMessage.message : "No messages yet",
      timestamp: lastGroupMessage ? lastGroupMessage.timestamp : new Date(),
      unreadCount: 0,
      isGroup: true,
      avatar: "👥"
    };

    // 2. Direct Messages
    const directMessages = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: currentUserObjectId },
            { receiver: currentUserObjectId }
          ],
          isGroupChat: { $ne: true }
        }
      },
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", currentUserObjectId] },
              "$receiver",
              "$sender"
            ]
          },
          lastMessage: { $first: "$message" },
          timestamp: { $first: "$timestamp" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ["$receiver", currentUserObjectId] },
                  { $eq: ["$read", false] }
                ]},
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      {
        $unwind: "$userInfo"
      },
      {
        $project: {
          _id: 1,
          name: "$userInfo.name",
          lastMessage: 1,
          timestamp: 1,
          unreadCount: 1,
          isGroup: { $literal: false }
        }
      },
      {
        $sort: { timestamp: -1 }
      }
    ]);

    // Combine: Group chat usually at top if pinned, or sorted by time. 
    // For now, let's put group chat at top if it exists, or sort everything by time.
    // The user request implies a WhatsApp style where everything is sorted by time.
    
    let allConversations = [...directMessages];
    
    // Only add group chat if it has messages or we want it always visible
    // Let's always show it
    allConversations.push(groupChat);
    
    // Sort all by timestamp descending, with name as tie-breaker for stability
    allConversations.sort((a, b) => {
      const timeDiff = new Date(b.timestamp) - new Date(a.timestamp);
      if (timeDiff !== 0) return timeDiff;
      return (a.name || "").localeCompare(b.name || "");
    });

    res.json(allConversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// Get messages between current user and another user (includes broadcasts from that user)
router.get("/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const messages = await Message.find({
      $or: [
        // direct messages
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId },
        // broadcasts sent by either side
        { sender: currentUserId, isBroadcast: true },
        { sender: userId, isBroadcast: true },
      ],
    })
      .sort({ timestamp: 1 })
      .populate("sender", "name")
      .populate("receiver", "name");

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Send a message (optionally broadcast)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { receiver, message, isBroadcast, isGroupChat } = req.body;
    const sender = req.user.id;

    if (isGroupChat) {
      const newMessage = new Message({ sender, message, isGroupChat: true });
      await newMessage.save();
      return res.status(201).json(newMessage);
    }

    if (isBroadcast) {
      const students = await User.find({ role: "Student" }).select("_id");
      const docs = students.map((s) => ({
        sender,
        receiver: s._id,
        message,
        isBroadcast: true,
      }));

      const created = await Message.insertMany(docs);
      return res.status(201).json({ broadcast: true, count: created.length });
    }

    const newMessage = new Message({ sender, receiver, message, isBroadcast: false });
    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Mark messages as read
router.put("/read/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    await Message.updateMany(
      { sender: userId, receiver: currentUserId, read: false },
      { read: true }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to mark as read" });
  }
});

export default router;