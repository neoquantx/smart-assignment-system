// src/pages/StudentDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getAssignments, getSubmissions, getUsers, getConversations, markMessagesAsRead, markGroupMessagesAsRead } from "../services/api";
import StudentLayout from "../components/StudentLayout";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import Chat from "../components/Chat";
import ChatList from "../components/ChatList";
import { motion, AnimatePresence } from "framer-motion";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatWithUser, setChatWithUser] = useState(null);
  const [chatMode, setChatMode] = useState("individual");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [teachers, setTeachers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [teacherSearch, setTeacherSearch] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "Student") {
      navigate("/");
      return;
    }

    setLoading(true);
    Promise.all([getAssignments(), getSubmissions(), getUsers("Teacher"), getConversations()])
      .then(([assignRes, subRes, teacherRes, convosRes]) => {
        setAssignments(assignRes || []);
        setSubmissions(subRes || []);
        setTeachers(teacherRes || []);
        setConversations(convosRes || []);
      })
      .catch(() => {
        setAssignments([]);
        setSubmissions([]);
        setTeachers([]);
      })
      .finally(() => setLoading(false));
      
    // Poll for conversations - but merge with existing state to preserve unread updates
    const id = setInterval(() => {
      getConversations().then(freshConvos => {
        setConversations(prevConvos => {
          if (!prevConvos || prevConvos.length === 0) return freshConvos || [];
          
          // Merge: keep local unreadCount if it's 0 (user has read it)
          // but update if there are new unread messages
          return (freshConvos || []).map(freshChat => {
            const prevChat = prevConvos.find(c => c._id === freshChat._id);
            if (!prevChat) return freshChat;
            
            // If we previously marked this as read (unreadCount = 0),
            // only update if fresh data shows new unread messages
            if (prevChat.unreadCount === 0 && freshChat.unreadCount > 0) {
              return freshChat;
            }
            
            // Otherwise keep the previous state (preserve our read status)
            return prevChat.unreadCount === 0 ? prevChat : freshChat;
          });
        });
      }).catch(() => {});
    }, 5000);
    return () => clearInterval(id);
  }, [navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return "No deadline";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "short", 
      day: "numeric" 
    });
  };

  const handleSelectChat = async (chat) => {
    if (chat.isGroup) {
      setChatMode("group");
      setChatWithUser(null);
      // Clear unread count for group chat locally
      setConversations(prev => prev.map(c => 
        c._id === "group" ? { ...c, unreadCount: 0 } : c
      ));
      try {
        await markGroupMessagesAsRead();
        // Pull a fresh snapshot to stay in sync with other clients
        const refreshed = await getConversations();
        setConversations(refreshed || []);
      } catch (err) {
        console.error("Failed to mark group messages as read", err);
      }
    } else {
      setChatMode("individual");
      setChatWithUser({ _id: chat._id, name: chat.name });
      try {
        await markMessagesAsRead(chat._id);
        setConversations(prev => prev.map(c => 
          c._id === chat._id ? { ...c, unreadCount: 0 } : c
        ));
      } catch (err) {
        console.error("Failed to mark messages as read", err);
      }
    }
  };

  const handleStartNewChat = (teacher) => {
    setChatMode("individual");
    setChatWithUser(teacher);
    setShowNewChatModal(false);
  };

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(teacherSearch.toLowerCase())
  );

  // Filter active assignments (deadline hasn't passed yet and not submitted)
  const activeAssignments = assignments.filter(assignment => {
    const now = new Date();
    const deadline = assignment.deadline ? new Date(assignment.deadline) : null;
    
    // Check if already submitted
    const hasSubmitted = submissions.some(s => 
      String(s.assignment?._id || s.assignment) === String(assignment._id || assignment.id)
    );
    
    // Show only if: (no deadline OR deadline hasn't passed) AND not submitted
    // If submitted, don't show in active count
    if (hasSubmitted) return false;
    
    return !deadline || now <= deadline;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <StudentLayout>
      <div className="p-4 lg:p-8 space-y-8">
        {/* Welcome Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#2c5f7a] to-[#4a7a94] p-8 text-white shadow-xl"
        >
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}! 👋</h1>
            <p className="text-[#b8c5d0] text-lg max-w-2xl">
              You have {activeAssignments.length} active assignments. Keep up the great work!
            </p>
          </div>
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
        </motion.div>

        {/* Assignments Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Available Assignments</h2>
            <span className="px-3 py-1 bg-[#e8eef2] text-[#1a3a52] rounded-full text-sm font-medium">
              {activeAssignments.length} Active
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loading />
            </div>
          ) : activeAssignments.length === 0 ? (
            <EmptyState message="No assignments available at the moment." />
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {activeAssignments.map((assignment) => (
                <motion.div
                  key={assignment._id || assignment.id}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-[#f5f7f9] rounded-lg group-hover:bg-[#e8eef2] transition-colors">
                        <svg className="w-6 h-6 text-[#2c5f7a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {assignment.subject || "General"}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-[#2c5f7a] transition-colors">
                      {assignment.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 h-10">
                      {assignment.description || "No description provided."}
                    </p>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Due: {formatDate(assignment.deadline)}</span>
                    </div>

                    {(() => {
                      const hasSubmitted = submissions.some(s => String(s.assignment?._id || s.assignment) === String(assignment._id || assignment.id));
                      if (hasSubmitted) {
                        return (
                          <Link
                            to="/student/submissions"
                            className="block w-full bg-green-50 text-green-700 border border-green-200 text-center font-medium py-2.5 px-4 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            View Submission
                          </Link>
                        );
                      }

                      return (
                        <Link
                          to={`/student/submit/${assignment._id || assignment.id}`}
                          className="block w-full bg-gradient-to-r from-[#2c5f7a] to-[#4a7a94] text-white text-center font-medium py-2.5 px-4 rounded-lg hover:shadow-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          <span>View / Submit</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </Link>
                      );
                    })()}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Chat Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="border-t border-gray-200 pt-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden h-[600px] flex flex-col md:flex-row">
            {/* Left Sidebar: Chat List */}
            <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col h-full">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50 backdrop-blur-sm">
                <h3 className="font-bold text-gray-700">Chats</h3>
                <button 
                  onClick={() => setShowNewChatModal(true)}
                  className="p-2 bg-[#e8eef2] text-[#2c5f7a] rounded-full hover:bg-[#b8c5d0] transition-colors shadow-sm"
                  title="New Chat"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <ChatList 
                  conversations={conversations} 
                  onSelectChat={handleSelectChat}
                  selectedChatId={chatMode === "group" ? "group" : chatWithUser?._id || chatWithUser?.id}
                />
              </div>
            </div>

            {/* Right Side: Chat Window */}
            <div className="hidden md:flex w-2/3 flex-col bg-gray-50/50">
              {chatMode === "group" ? (
                <Chat 
                  currentUser={user} 
                  isGroupChat={true} 
                  onMessageSent={() => getConversations().then(c => setConversations(c || []))}
                />
              ) : chatWithUser ? (
                <Chat 
                  currentUser={user} 
                  chatWithUser={chatWithUser} 
                  onMessageSent={() => getConversations().then(c => setConversations(c || []))}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                    <svg className="w-12 h-12 text-[#b8c5d0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No conversation selected</h3>
                  <p className="text-gray-500 max-w-xs">Select a conversation from the list or start a new one to begin messaging.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* New Chat Modal */}
        <AnimatePresence>
          {showNewChatModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl max-w-md w-full p-6 h-[500px] flex flex-col shadow-2xl"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">New Chat</h2>
                  <button onClick={() => setShowNewChatModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="mb-4 relative">
                  <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={teacherSearch}
                    onChange={(e) => setTeacherSearch(e.target.value)}
                    placeholder="Search teachers..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4a7a94] focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                  />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {filteredTeachers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <p>No teachers found.</p>
                    </div>
                  ) : (
                    filteredTeachers.map(teacher => (
                      <button
                        key={teacher.id || teacher._id}
                        onClick={() => handleStartNewChat(teacher)}
                        className="w-full flex items-center gap-4 p-3 hover:bg-[#f5f7f9] rounded-xl transition-all duration-200 text-left group border border-transparent hover:border-[#b8c5d0]"
                      >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4a7a94] to-[#4a7a94] text-white flex items-center justify-center font-bold text-lg shadow-md group-hover:scale-105 transition-transform">
                          {teacher.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-[#1a3a52] transition-colors">{teacher.name}</p>
                          <p className="text-xs text-gray-500">{teacher.email}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </StudentLayout>
  );
}
