// src/pages/TeacherDashboard.jsx
import React, { useEffect, useState, useMemo } from "react";
import { getAssignments, getSubmissions, createAssignment, postFeedback, getUsers, getUnreadSummary, markMessagesAsRead, sendMessage, getConversations, markGroupMessagesAsRead } from "../services/api";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Chat from "../components/Chat";
import ChatList from "../components/ChatList";
import Analytics from "./Analytics";
import TeacherProfile from "./TeacherProfile";
import { motion, AnimatePresence } from "framer-motion";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const location = useLocation();

  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("assignments");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    deadline: "",
    maxMarks: 100
  });

  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [marks, setMarks] = useState("");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  
  // Chat State
  const [chatWithUser, setChatWithUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [unreadMap, setUnreadMap] = useState({});
  const [chatMode, setChatMode] = useState("individual"); // "individual" or "group"
  const [conversations, setConversations] = useState([]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  const getFileUrl = (filePath) => {
    if (!filePath) return "";
    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
      return filePath;
    }
    const API_BASE = import.meta.env.VITE_API_URL;
    return `${API_BASE}${filePath.startsWith("/") ? filePath : `/${filePath}`}`;
  };

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    if (user.role !== "Teacher") {
      navigate("/student/dashboard");
      return;
    }
    // pick tab from query param if present
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab) setActiveTab(tab);

    loadData();
  }, []); // ✅ FIXED: Empty dependency array - only run once on mount

  const loadData = () => {
    setLoading(true);
    Promise.all([getAssignments(), getSubmissions(), getUsers("Student"), getConversations()])
      .then(([a, s, st, c]) => {
        setAssignments(a || []);
        setSubmissions(s || []);
        setStudents(st || []);
        setConversations(c || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleSetTab = (t) => {
    setActiveTab(t);
    navigate(`?tab=${t}`, { replace: true });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setCreating(true);
    
    try {
      await createAssignment({
        title: newAssignment.title,
        description: newAssignment.description,
        deadline: newAssignment.deadline,
        maxMarks: Number(newAssignment.maxMarks) || 100
      });
      
      alert("Assignment created successfully!");
      setShowCreateModal(false);
      setNewAssignment({ title: "", description: "", deadline: "", maxMarks: 100 });
      loadData();
    } catch (err) {
      alert(err.message || "Failed to create assignment");
    } finally {
      setCreating(false);
    }
  };

  const handleGrade = (submission) => {
    setSelectedSubmission(submission);
    setMarks(submission.marks?.toString() || "");
    setFeedback(submission.feedback || "");
    setShowGradeModal(true);
  };

  const handleSaveGrade = async () => {
    if (!marks || marks === "") {
      alert("Please enter marks before saving");
      return;
    }

    const max = selectedSubmission && (selectedSubmission.assignmentMaxMarks || selectedSubmission.assignment?.maxMarks) ? (selectedSubmission.assignmentMaxMarks || selectedSubmission.assignment?.maxMarks) : 100;
    if (Number(marks) < 0 || Number(marks) > Number(max)) {
      alert(`Marks must be between 0 and ${max}`);
      return;
    }

    setSaving(true);
    try {
      await postFeedback({
        submissionId: selectedSubmission._id || selectedSubmission.id,
        marks: Number(marks),
        feedback: feedback
      });
      alert("Feedback saved successfully!");
      setShowGradeModal(false);
      setSelectedSubmission(null);
      setMarks("");
      setFeedback("");
      loadData();
    } catch (err) {
      alert(err.message || "Failed to save feedback");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No deadline";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "short", 
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };

  const getAssignmentStatus = (assignment) => {
    if (!assignment.deadline) return { label: "Active", color: "green" };
    
    const now = new Date();
    const deadline = new Date(assignment.deadline);
    const submissionCount = submissions.filter(s => 
      String(s.assignment?._id || s.assignment) === String(assignment._id)
    ).length;
    
    const relatedSubs = submissions.filter(s => 
      String(s.assignment?._id || s.assignment) === String(assignment._id)
    );
    const allGraded = relatedSubs.length > 0 && relatedSubs.every(s => s.marks != null);
    
    if (allGraded) return { label: "Graded", color: "blue" };
    if (now > deadline) return { label: "Active", color: "green" };
    if (now < deadline && submissionCount === 0) return { label: "Upcoming", color: "yellow" };
    return { label: "Active", color: "green" };
  };

  const getSubmissionCount = (assignmentId) => {
    const count = submissions.filter(s => 
      String(s.assignment?._id || s.assignment) === String(assignmentId)
    ).length;
    return count;
  };

  const filteredStudents = useMemo(() => {
    const term = studentSearch.trim().toLowerCase();
    if (!term) return [];
    return students.filter((student) =>
      (student.name || "").toLowerCase().includes(term)
    ).slice(0, 10);
  }, [students, studentSearch]);

  useEffect(() => {
    if (!user || user.role !== "Teacher") return;

    const fetchData = async () => {
      try {
        const [summary, convos] = await Promise.all([
          getUnreadSummary(),
          getConversations()
        ]);
        
        const next = {};
        (summary || []).forEach((item) => {
          next[item.senderId] = { count: item.unreadCount, name: item.senderName };
        });
        setUnreadMap(next);
        
        // Merge conversations: keep local unreadCount if it's 0 (user has read it)
        setConversations(prevConvos => {
          if (!prevConvos || prevConvos.length === 0) return convos || [];
          
          return (convos || []).map(freshChat => {
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
      } catch (err) {
        console.error("❌ Failed to load chat data", err);
      }
    };

    fetchData();
    const id = setInterval(fetchData, 5000); // Poll every 5s for chat updates
    return () => clearInterval(id);
  }, [user?.id]);

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
        const refreshed = await getConversations();
        setConversations(refreshed || []);
      } catch (err) {
        console.error("Failed to mark group messages as read", err);
      }
    } else {
      setChatMode("individual");
      setChatWithUser({ _id: chat._id, name: chat.name });
      // Mark as read immediately
      try {
        await markMessagesAsRead(chat._id);
        // Update local unread map
        setUnreadMap((prev) => ({ ...prev, [chat._id]: { ...prev[chat._id], count: 0 } }));
        // Update conversation list locally to reflect read status
        setConversations(prev => prev.map(c => 
          c._id === chat._id ? { ...c, unreadCount: 0 } : c
        ));
      } catch (err) {
        console.error("Failed to mark messages as read", err);
      }
    }
  };

  const handleStartNewChat = (student) => {
    setChatMode("individual");
    setChatWithUser(student);
    setShowNewChatModal(false);
    // Check if this student is already in conversations
    const existing = conversations.find(c => c._id === student._id);
    if (!existing) {
      // Optimistically add to list or just let it appear after first message
      // For now, just let the Chat component handle the messaging.
      // Once a message is sent, the poller will pick it up.
    }
  };

  const tabVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your assignments and review student submissions.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-[#2c5f7a] to-[#4a7a94] hover:from-[#1a3a52] hover:to-[#4a7a94] text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            Create New Assignment
          </motion.button>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 md:gap-8 border-b border-gray-200 mb-8 overflow-x-auto pb-1 scrollbar-hide">
          {["assignments", "submissions", "feedback", "analytics", "profile"].map((tab) => (
            <button
              key={tab}
              onClick={() => handleSetTab(tab)}
              className={`pb-4 font-medium transition relative whitespace-nowrap px-2 ${
                activeTab === tab
                  ? "text-[#2c5f7a]"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {activeTab === tab && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2c5f7a]"
                />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center h-64"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2c5f7a]"></div>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {activeTab === "assignments" ? (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Assignments</h2>
                  {assignments.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                      <div className="w-20 h-20 bg-[#e8eef2] rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-[#8ba3b5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments yet</h3>
                      <p className="text-gray-500 mb-6">Create your first assignment to get started!</p>
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="text-[#2c5f7a] font-medium hover:text-[#1a3a52]"
                      >
                        Create Assignment &rarr;
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {assignments.map((assignment) => {
                        const status = getAssignmentStatus(assignment);
                        const submissionCount = getSubmissionCount(assignment._id);
                        const totalStudents = 30; // Placeholder
                        
                        return (
                          <motion.div
                            key={assignment._id}
                            whileHover={{ y: -5 }}
                            className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <h3 className="text-lg font-bold text-gray-900 flex-1 line-clamp-1 mr-2">
                                {assignment.title}
                              </h3>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                  status.color === "green"
                                    ? "bg-green-100 text-green-700"
                                    : status.color === "blue"
                                    ? "bg-[#e8eef2] text-[#1a3a52]"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {status.label}
                              </span>
                            </div>
                            
                            <div className="space-y-4">
                              <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                </svg>
                                <span className="font-medium">{formatDate(assignment.deadline)}</span>
                              </div>
                              
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                                  </svg>
                                  <span>Submissions</span>
                                </div>
                                <span className="font-bold text-gray-900">{submissionCount}</span>
                              </div>
                              
                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                  <div
                                  className="bg-[#2c5f7a] h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${Math.min((submissionCount / totalStudents) * 100, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : activeTab === "submissions" ? (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Submissions</h2>
                  {submissions.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                      <p className="text-gray-500">No submissions yet</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50/50 border-b border-gray-200">
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student</th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Assignment</th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Submitted</th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {submissions.map((sub) => (
                              <tr key={sub._id} className="hover:bg-gray-50/80 transition-colors">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4a7a94] to-[#4a7a94] text-white flex items-center justify-center font-bold text-xs">
                                      {(sub.studentName || sub.student?.name || "S").charAt(0)}
                                    </div>
                                    {sub.studentName || sub.student?.name || "Student"}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{sub.assignmentTitle || sub.assignment?.title || "Assignment"}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{formatDate(sub.submittedAt)}</td>
                                <td className="px-6 py-4">
                                  {sub.marks != null ? (
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide">Graded</span>
                                  ) : (
                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold uppercase tracking-wide">Pending</span>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  <button
                                    onClick={() => handleGrade(sub)}
                                    className="text-[#2c5f7a] hover:text-[#1a3a52] font-medium text-sm hover:underline"
                                  >
                                    {sub.marks != null ? "View/Edit" : "Grade"}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              ) : activeTab === "feedback" ? (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Graded Submissions</h2>
                  {submissions.filter(sub => sub.marks != null).length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                      <p className="text-gray-500">No graded submissions yet</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50/50 border-b border-gray-200">
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student</th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Assignment</th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Submitted</th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Marks</th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {submissions.filter(sub => sub.marks != null).map((sub) => (
                              <tr key={sub._id} className="hover:bg-gray-50/80 transition-colors">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                                      {(sub.studentName || sub.student?.name || "S").charAt(0)}
                                    </div>
                                    {sub.studentName || sub.student?.name || "Student"}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{sub.assignmentTitle || sub.assignment?.title || "Assignment"}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{formatDate(sub.submittedAt)}</td>
                                <td className="px-6 py-4 text-sm font-bold text-gray-900">{sub.marks}/{sub.assignmentMaxMarks || sub.assignment?.maxMarks || 100}</td>
                                <td className="px-6 py-4">
                                  <button
                                    onClick={() => handleGrade(sub)}
                                    className="text-[#2c5f7a] hover:text-[#1a3a52] font-medium text-sm hover:underline"
                                  >
                                    View/Edit
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              ) : activeTab === "analytics" ? (
                <Analytics />
              ) : activeTab === "profile" ? (
                <TeacherProfile />
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chat Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-7xl mx-auto p-4 lg:p-8 border-t border-gray-200"
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
                selectedChatId={chatMode === "group" ? "group" : chatWithUser?._id}
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
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Search students..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2c5f7a] focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {filteredStudents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <p>No students found.</p>
                  </div>
                ) : (
                  filteredStudents.map(student => (
                    <button
                      key={student._id}
                      onClick={() => handleStartNewChat(student)}
                      className="w-full flex items-center gap-4 p-3 hover:bg-[#e8eef2] rounded-xl transition-all duration-200 text-left group border border-transparent hover:border-[#b8c5d0]"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4a7a94] to-[#4a7a94] text-white flex items-center justify-center font-bold text-lg shadow-md group-hover:scale-105 transition-transform">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 group-hover:text-[#1a3a52] transition-colors">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.email}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Assignment Modal */}
      <AnimatePresence>
        {showCreateModal && (
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
              className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Assignment</h2>
              <form onSubmit={handleCreateAssignment} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    required
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2c5f7a] focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                    placeholder="Assignment title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                  <textarea
                    required
                    value={newAssignment.description}
                    onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2c5f7a] focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white resize-none"
                    placeholder="Assignment description"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Deadline</label>
                  <input
                    type="datetime-local"
                    required
                    value={newAssignment.deadline}
                    onChange={(e) => setNewAssignment({...newAssignment, deadline: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2c5f7a] focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Max Marks</label>
                  <input
                    type="number"
                    min={1}
                    value={newAssignment.maxMarks}
                    onChange={(e) => setNewAssignment({...newAssignment, maxMarks: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2c5f7a] focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                    placeholder="Total marks for this assignment (e.g., 30)"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-[#2c5f7a] to-[#4a7a94] hover:from-[#1a3a52] hover:to-[#4a7a94] text-white rounded-xl font-bold transition-all shadow-lg disabled:opacity-50 disabled:shadow-none"
                  >
                    {creating ? "Creating..." : "Create Assignment"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grade Modal */}
      <AnimatePresence>
        {showGradeModal && selectedSubmission && (
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
              className="bg-white rounded-2xl max-w-5xl w-full p-6 shadow-2xl h-[90vh] flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedSubmission.marks != null ? "Edit" : "Grade"} Submission
                </h2>
                <button onClick={() => setShowGradeModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
                {/* Left: Document viewer */}
                <div className="flex-1 border border-gray-200 rounded-xl overflow-hidden bg-gray-50 flex flex-col">
                  <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-white">
                    <span className="font-bold text-gray-700 text-sm">Student Submission</span>
                    <div className="flex items-center gap-3 text-gray-500">
                      <button
                        type="button"
                        className="hover:text-[#2c5f7a] transition-colors"
                        title="Open in new tab"
                        onClick={() =>
                          selectedSubmission.fileUrl &&
                          window.open(getFileUrl(selectedSubmission.fileUrl), "_blank")
                        }
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </button>
                      {selectedSubmission.fileUrl && (
                        <a
                          href={getFileUrl(selectedSubmission.fileUrl)}
                          download
                          className="hover:text-[#2c5f7a] transition-colors"
                          title="Download"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M8 12l4 4m0 0l4-4m-4 4V4" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 flex items-center justify-center px-6 py-8 bg-gray-100/50">
                    {selectedSubmission.fileUrl ? (
                      <iframe
                        src={getFileUrl(selectedSubmission.fileUrl)}
                        title="Student submission"
                        className="w-full h-full rounded-lg border border-gray-200 bg-white shadow-sm"
                      />
                    ) : (
                      <div className="text-center text-gray-500">
                        <div className="mx-auto mb-4 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="font-bold text-gray-900">No preview available</p>
                        <p className="text-sm text-gray-500 mt-1">
                          The student hasn't uploaded a file or the format isn't supported.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: student info and grading form */}
                <div className="w-full lg:w-96 flex-shrink-0 flex flex-col gap-4 overflow-y-auto">
                  <div className="border border-gray-200 rounded-xl p-4 flex items-center gap-4 bg-white shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4a7a94] to-[#4a7a94] text-white flex items-center justify-center font-bold text-lg shadow-md">
                      {(selectedSubmission.studentName || selectedSubmission.student?.name || "S").charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">
                        {selectedSubmission.studentName || selectedSubmission.student?.name || "Student"}
                      </p>
                      {selectedSubmission.submittedAt && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          Submitted:{" "}
                          {new Date(selectedSubmission.submittedAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm flex-1 flex flex-col gap-6">
                    <div>
                      <label
                        htmlFor="modal-marks"
                        className="block text-sm font-bold text-gray-700 mb-2"
                      >
                        Marks{" "}
                        {selectedSubmission &&
                        (selectedSubmission.assignmentMaxMarks || selectedSubmission.assignment?.maxMarks)
                          ? `(out of ${
                              selectedSubmission.assignmentMaxMarks ||
                              selectedSubmission.assignment?.maxMarks
                            })`
                          : ""}
                      </label>
                      <input
                        id="modal-marks"
                        type="number"
                        min="0"
                        max={
                          selectedSubmission &&
                          (selectedSubmission.assignmentMaxMarks || selectedSubmission.assignment?.maxMarks)
                            ? selectedSubmission.assignmentMaxMarks ||
                              selectedSubmission.assignment?.maxMarks
                            : 100
                        }
                        value={marks}
                        onChange={(e) => setMarks(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2c5f7a] focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white font-medium"
                        placeholder="Enter marks"
                      />
                    </div>

                    <div className="flex-1 flex flex-col">
                      <label
                        htmlFor="modal-feedback"
                        className="block text-sm font-bold text-gray-700 mb-2"
                      >
                        Feedback Comment
                      </label>
                      <textarea
                        id="modal-feedback"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4a7a94] focus:border-transparent outline-none resize-none text-sm flex-1 transition-all bg-gray-50 focus:bg-white"
                        placeholder="Provide detailed feedback here. Focus on strengths and areas for improvement..."
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowGradeModal(false)}
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveGrade}
                        disabled={saving}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-[#2c5f7a] to-[#4a7a94] hover:from-[#1a3a52] hover:to-[#4a7a94] text-white rounded-xl font-bold transition-all shadow-lg shadow-lg disabled:opacity-50 disabled:shadow-none"
                      >
                        {saving ? "Saving..." : "Save Feedback"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
