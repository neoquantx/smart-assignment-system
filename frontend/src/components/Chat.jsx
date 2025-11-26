import React, { useState, useEffect, useRef } from "react";
import { getMessages, sendMessage, markMessagesAsRead, getGroupMessages, markGroupMessagesAsRead } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";

// Emoji categories with popular emojis
const emojiCategories = {
  "😊 Smileys": ["😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂", "😉", "😍", "🥰", "😘", "😋", "😎", "🤩", "🥳", "😏", "😌", "🤔", "🤫", "🤭", "🙄", "😬", "😮", "🥺", "😢", "😭", "😤", "😡", "🤯"],
  "👋 Gestures": ["👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "🤙", "👋", "🖐️", "✋", "🖖", "👏", "🙌", "🤝", "🙏", "💪", "🦾", "✍️", "🤳", "💅"],
  "❤️ Hearts": ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❤️‍🔥", "💖", "💗", "💓", "💕", "💞", "💘", "💝"],
  "🎉 Celebrations": ["🎉", "🎊", "🎈", "🎁", "🏆", "🥇", "🎯", "✨", "🌟", "⭐", "💫", "🔥", "💥", "🎵", "🎶"],
  "📚 Study": ["📚", "📖", "📝", "✏️", "📌", "📎", "🔍", "💡", "🎓", "🏫", "📊", "📈", "✅", "❌", "❓", "❗", "💯", "🧠", "📅", "⏰", "⏳"]
};

export default function Chat({ currentUser, chatWithUser, isGroupChat, onMessageSent }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeEmojiCategory, setActiveEmojiCategory] = useState(Object.keys(emojiCategories)[0]);
  const messagesEndRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
      if (isGroupChat) {
        loadMessages();
      } else if (chatWithUser) {
        loadMessages();
      } else {
        setMessages([]);
      }
  }, [chatWithUser, isGroupChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEmojiClick = (emoji) => {
    setNewMessage(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const loadMessages = async () => {
    try {
      if (isGroupChat) {
        const msgs = await getGroupMessages();
        setMessages(msgs);
        // Mark group messages as read
        await markGroupMessagesAsRead();
      } else {
        const userId = chatWithUser._id || chatWithUser.id || chatWithUser;
        const msgs = await getMessages(userId);
        setMessages(msgs);
        await markMessagesAsRead(userId);
      }
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setLoading(true);
    try {
      if (isGroupChat) {
        await sendMessage(null, newMessage, { isGroupChat: true });
      } else {
        const userId = chatWithUser._id || chatWithUser.id || chatWithUser;
        await sendMessage(userId, newMessage);
      }
      setNewMessage("");
      loadMessages(); // Reload to show new message
      if (onMessageSent) onMessageSent();
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (!chatWithUser && !isGroupChat) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50/50 p-8 text-center">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">No Chat Selected</h3>
        <p className="text-gray-500 text-sm">Select a conversation to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center gap-3 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        {isGroupChat ? (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8ba3b5] to-[#4a7a94] flex items-center justify-center text-white shadow-md">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4a7a94] to-cyan-500 flex items-center justify-center text-white font-bold shadow-md">
            {chatWithUser.name?.charAt(0)}
          </div>
        )}
        <div>
          <h3 className="font-bold text-gray-900">
            {isGroupChat ? "Common Group Chat" : chatWithUser.name}
          </h3>
          <p className="text-xs text-green-500 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            Online
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => {
            // More robust comparison - check all possible id fields
            const senderId = String(msg.sender._id || msg.sender.id || msg.sender);
            const currentUserId = String(currentUser._id || currentUser.id);
            const isMe = senderId === currentUserId;
            
            const msgDate = new Date(msg.timestamp);
            const prevMsg = index > 0 ? messages[index - 1] : null;
            const prevMsgDate = prevMsg ? new Date(prevMsg.timestamp) : null;
            
            // Check if we need to show a date separator
            const showDateSeparator = !prevMsgDate || 
              msgDate.toDateString() !== prevMsgDate.toDateString();
            
            // Format the date
            const formatDate = (date) => {
              const today = new Date();
              const yesterday = new Date(today);
              yesterday.setDate(yesterday.getDate() - 1);
              
              if (date.toDateString() === today.toDateString()) {
                return "Today";
              } else if (date.toDateString() === yesterday.toDateString()) {
                return "Yesterday";
              } else {
                return date.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
                });
              }
            };

            return (
              <React.Fragment key={msg._id}>
                {/* Date Separator */}
                {showDateSeparator && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center my-4"
                  >
                    <div className="bg-gray-200 text-gray-600 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                      {formatDate(msgDate)}
                    </div>
                  </motion.div>
                )}
                
                {/* Message */}
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm ${
                      isMe
                        ? "bg-[#2c5f7a] text-white rounded-br-none"
                        : "bg-white text-gray-900 border border-gray-100 rounded-bl-none"
                    }`}
                  >
                    {isGroupChat && !isMe && (
                      <p className="text-xs font-bold mb-1 text-[#2c5f7a]">
                        {msg.sender.name || "Unknown"}
                      </p>
                    )}
                    <p className="text-sm leading-relaxed">{msg.message}</p>
                    <p className={`text-[10px] mt-1 text-right ${isMe ? "text-[#b8c5d0]" : "text-gray-400"}`}>
                      {msgDate.toLocaleString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </motion.div>
              </React.Fragment>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200 relative">
        {/* Emoji Picker */}
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              ref={emojiPickerRef}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-20 left-4 right-4 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-20"
            >
              {/* Category Tabs */}
              <div className="flex overflow-x-auto border-b border-gray-100 p-2 gap-1 bg-gray-50/50">
                {Object.keys(emojiCategories).map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveEmojiCategory(category)}
                    className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-all ${
                      activeEmojiCategory === category
                        ? "bg-[#2c5f7a] text-white font-medium shadow-sm"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              
              {/* Emoji Grid */}
              <div className="p-3 max-h-48 overflow-y-auto">
                <div className="grid grid-cols-8 gap-1">
                  {emojiCategories[activeEmojiCategory].map((emoji, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEmojiClick(emoji)}
                      className="p-2 text-2xl hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200 focus-within:border-[#4a7a94] focus-within:ring-2 focus-within:ring-[#4a7a94]/20 transition-all">
          {/* Emoji Button */}
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2 rounded-lg transition-all ${
              showEmojiPicker 
                ? "bg-[#2c5f7a] text-white" 
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            onFocus={() => setShowEmojiPicker(false)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 placeholder-gray-500 px-2"
          />
          <button
            onClick={handleSend}
            disabled={loading || !newMessage.trim()}
            className="p-2 bg-[#2c5f7a] text-white rounded-lg hover:bg-[#1a3a52] disabled:opacity-50 disabled:hover:bg-[#2c5f7a] transition-colors shadow-sm"
          >
            {loading ? (
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
