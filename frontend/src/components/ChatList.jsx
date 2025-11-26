import React from "react";
import { motion } from "framer-motion";

export default function ChatList({ conversations, onSelectChat, selectedChatId }) {
  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      });
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getColor = (name) => {
    const colors = [
      "bg-gradient-to-br from-red-400 to-red-600",
      "bg-gradient-to-br from-green-400 to-green-600",
      "bg-gradient-to-br from-[#8ba3b5] to-[#4a7a94]",
      "bg-gradient-to-br from-yellow-400 to-yellow-600",
      "bg-gradient-to-br from-[#8ba3b5] to-[#8ba3b5]",
      "bg-gradient-to-br from-pink-400 to-pink-600",
      "bg-gradient-to-br from-[#8ba3b5] to-[#4a7a94]",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto custom-scrollbar">
      {conversations.map((chat, index) => {
        const isSelected = selectedChatId === chat._id;
        return (
          <motion.div
            key={chat._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelectChat(chat)}
            className={`flex items-center p-4 cursor-pointer transition-all border-b border-gray-50 hover:bg-gray-50 relative ${
              isSelected ? "bg-[#f5f7f9]/50" : ""
            }`}
          >
            {isSelected && (
              <motion.div 
                layoutId="activeChat"
                className="absolute left-0 top-0 bottom-0 w-1 bg-[#2c5f7a]"
              />
            )}

            {/* Avatar */}
            <div className="relative">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-lg text-white shadow-md ${
                  chat.isGroup ? "bg-gradient-to-br from-gray-700 to-gray-900" : getColor(chat.name)
              }`}>
                {chat.isGroup ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ) : getInitials(chat.name)}
              </div>
              {/* Unread indicator dot on avatar */}
              {chat.unreadCount > 0 && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 ml-4 min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className={`text-sm font-bold truncate ${
                  chat.unreadCount > 0 ? "text-gray-900" : isSelected ? "text-[#1a3a52]" : "text-gray-900"
                }`}>
                  {chat.name}
                </h3>
                <span className={`text-xs flex-shrink-0 ml-2 font-medium ${
                  chat.unreadCount > 0 ? "text-[#2c5f7a] font-semibold" : "text-gray-400"
                }`}>
                  {formatTime(chat.timestamp)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <p className={`text-sm truncate pr-2 ${chat.unreadCount > 0 ? "font-semibold text-gray-800" : "text-gray-500"}`}>
                  {chat.lastMessage || "No messages yet"}
                </p>
                {chat.unreadCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex-shrink-0 bg-[#2c5f7a] text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[1.25rem] text-center shadow-md"
                  >
                    {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                  </motion.span>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
      
      {conversations.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400 p-8 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="font-medium">No conversations yet</p>
          <p className="text-sm mt-1">Start a new chat to connect</p>
        </div>
      )}
    </div>
  );
}
