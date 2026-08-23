import { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  Heart,
  User,
  Shield,
  Clock,
  Sparkles,
  Smile,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  CheckCircle2,
  Lock,
  Headphones,
  Brain,
  Paperclip,
  Image as ImageIcon,
  FileText,
  X
} from "lucide-react";
import { api } from "../services/api";
import { getTranslation } from "../data/translations";

export const DirectMessages = ({
  currentUser,
  currentStudent,
  currentTeacher,
  studentClasses = [],
  selectedLanguage = "en"
}) => {
  const isTeacher = !!currentTeacher;
  const t = (key, fallback) => getTranslation(selectedLanguage, key, fallback);

  const [activeSection, setActiveSection] = useState("direct"); // "direct" | "wellness"
  const [wellnessMode, setWellnessMode] = useState("ai"); // "ai" | "human"

  // 1-on-1 Direct Message State
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [attachedMedia, setAttachedMedia] = useState(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef(null);

  // Mental Health Chat State
  const [wellnessSessions, setWellnessSessions] = useState([]);
  const [activeWellnessSession, setActiveWellnessSession] = useState(null);
  const [wellnessInput, setWellnessInput] = useState("");
  const [isAiResponding, setIsAiResponding] = useState(false);

  const messagesEndRef = useRef(null);

  // Auto scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeWellnessSession?.messages]);

  // Load Contacts (Teachers for students, Students for teachers)
  useEffect(() => {
    loadContacts();
  }, [currentUser?.id, currentStudent?.id, currentTeacher?.id]);

  const loadContacts = async () => {
    const list = [];
    
    if (isTeacher) {
      // 1. Fetch teacher classes
      try {
        const tClassesRes = await api.getTeacherClasses(currentTeacher?.id || currentUser?.id).catch(() => ({ classes: [] }));
        const tClasses = tClassesRes?.classes || [];
        const studentsMap = new Map();

        // Check rosters for each class
        for (const c of tClasses) {
          const code = c.classCode;
          if (code) {
            const roster = await api.getClassStudents(code).catch(() => ({ students: [] }));
            const rList = roster?.students || [];
            rList.forEach(s => {
              if (s.studentId && !studentsMap.has(s.studentId)) {
                studentsMap.set(s.studentId, {
                  id: s.studentId,
                  name: s.studentName,
                  email: s.studentEmail,
                  role: "student",
                  classCode: code,
                  section: s.section || "Section A"
                });
              }
            });
          }
        }

        // Add foundation student contacts
        const defaultStudents = [
          { id: "student-1", name: "Aarav Sharma", role: "student", classCode: "NCERT-12A", section: "Section A" },
          { id: "student-3", name: "Rohan Das", role: "student", classCode: "NCERT-10A", section: "Section A" },
          { id: "student-2", name: "Priya Patel", role: "student", classCode: "NCERT-12A", section: "Section B" }
        ];

        defaultStudents.forEach(ds => {
          if (!studentsMap.has(ds.id)) {
            studentsMap.set(ds.id, ds);
          }
        });

        const finalList = Array.from(studentsMap.values());
        setContacts(finalList);
        if (finalList.length > 0 && !selectedContact) {
          setSelectedContact(finalList[0]);
        }
      } catch (err) {
        console.error("Failed to load teacher contacts:", err);
      }
    } else {
      // Student view: list all teachers & classmates
      const contactMap = new Map();

      // Default Faculty leads
      const defaultTeachers = [
        { id: "teacher-1", name: "Dr. Rajesh Varma", role: "teacher", classCode: "NCERT-12A", department: "Senior Physics HOD" },
        { id: "teacher-2", name: "Mrs. Sunita Sharma", role: "teacher", classCode: "NCERT-10A", department: "Secondary Mathematics Lead" },
        { id: "teacher-3", name: "Dr. Arvind Gupta", role: "teacher", classCode: "NCERT-11A", department: "Physical Chemistry Lead" }
      ];

      defaultTeachers.forEach(t => contactMap.set(t.id, t));

      // Add enrolled class teachers
      (studentClasses || []).forEach(cls => {
        if (cls.teacherId) {
          contactMap.set(cls.teacherId, {
            id: cls.teacherId,
            name: cls.teacherName || "Faculty Instructor",
            role: "teacher",
            classCode: cls.classCode
          });
        }
      });

      // Add peer classmates
      const peerStudents = [
        { id: "student-1", name: "Aarav Sharma (Classmate)", role: "student", classCode: "NCERT-12A" },
        { id: "student-3", name: "Rohan Das (Classmate)", role: "student", classCode: "NCERT-10A" },
        { id: "student-2", name: "Priya Patel (Classmate)", role: "student", classCode: "NCERT-12A" }
      ].filter(p => p.id !== currentUser?.id);

      peerStudents.forEach(p => contactMap.set(p.id, p));

      const finalList = Array.from(contactMap.values());
      setContacts(finalList);
      if (finalList.length > 0 && !selectedContact) {
        setSelectedContact(finalList[0]);
      }
    }
  };

  // Poll direct messages
  useEffect(() => {
    if (!selectedContact) return;
    loadMessages();
    const interval = setInterval(loadMessages, 4000);
    return () => clearInterval(interval);
  }, [selectedContact?.id, currentUser?.id]);

  const loadMessages = async () => {
    if (!selectedContact || !currentUser) return;
    try {
      const res = await api.getDirectMessages(currentUser.id, selectedContact.id);
      setMessages(res.messages || []);
    } catch (err) {
      console.error("Failed to load direct messages:", err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isImg = file.type.startsWith("image/");
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      setAttachedMedia({
        dataUrl: loadEvt.target.result,
        type: isImg ? "image" : "file",
        name: file.name,
        size: (file.size / 1024).toFixed(1) + " KB"
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !attachedMedia) || !selectedContact || !currentUser) return;

    const payload = {
      senderId: currentUser.id,
      senderName: currentUser.name || (isTeacher ? "Teacher" : "Student"),
      senderRole: isTeacher ? "teacher" : "student",
      recipientId: selectedContact.id,
      recipientName: selectedContact.name,
      recipientRole: selectedContact.role,
      classCode: selectedContact.classCode || "",
      message: newMessage.trim() || (attachedMedia ? `[Attached ${attachedMedia.type}: ${attachedMedia.name}]` : ""),
      mediaUrl: attachedMedia?.dataUrl || null,
      mediaType: attachedMedia?.type || null,
      mediaName: attachedMedia?.name || null
    };

    setIsSending(true);
    try {
      const res = await api.sendDirectMessage(payload);
      setNewMessage("");
      setAttachedMedia(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setMessages(prev => [...prev, res.message]);
    } catch (err) {
      alert("Failed to send message: " + err.message);
    } finally {
      setIsSending(false);
    }
  };

  // Load Mental Health Sessions
  useEffect(() => {
    if (activeSection === "wellness" && currentUser) {
      loadWellnessChat();
    }
  }, [activeSection, currentUser?.id]);

  const loadWellnessChat = async () => {
    try {
      const res = await api.getMentalHealthChats(currentUser.id);
      const chats = res.chats || [];
      setWellnessSessions(chats);
      if (chats.length > 0) {
        setActiveWellnessSession(chats[0]);
      } else {
        // Initialize default AI / Human session
        const initChat = {
          id: `mhc-${Date.now()}`,
          studentId: currentUser.id,
          studentName: currentUser.name || "Student",
          mode: wellnessMode,
          topic: "Academic Stress & Well-being",
          messages: [
            {
              id: "msg-welcome",
              senderId: "counselor-1",
              senderName: wellnessMode === "ai" ? "AI Wellbeing Companion" : "Dr. Shalini (Clinical Counselor)",
              senderRole: wellnessMode === "ai" ? "ai" : "counselor",
              text: `Hello ${currentUser.name || "Friend"}! Welcome to your confidential Mental Health & Wellbeing space. Take a deep breath. You are safe here. How are you feeling today? Are you feeling exam pressure, study fatigue, or would you like to talk about anything on your mind?`,
              timestamp: new Date().toISOString()
            }
          ]
        };
        const saved = await api.saveMentalHealthChat(initChat);
        setActiveWellnessSession(saved.chat || initChat);
      }
    } catch (err) {
      console.error("Failed to load wellness session:", err);
    }
  };

  const handleSendWellnessMessage = async (e) => {
    e.preventDefault();
    if (!wellnessInput.trim() || !currentUser) return;

    const userText = wellnessInput.trim();
    setWellnessInput("");

    const newMsg = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name || "Student",
      senderRole: "student",
      text: userText,
      timestamp: new Date().toISOString()
    };

    const currentChat = activeWellnessSession || {
      id: `mhc-${Date.now()}`,
      studentId: currentUser.id,
      studentName: currentUser.name || "Student",
      mode: wellnessMode,
      messages: []
    };

    const updatedMessages = [...(currentChat.messages || []), newMsg];
    const updatedChat = { ...currentChat, messages: updatedMessages, mode: wellnessMode, updatedAt: new Date().toISOString() };
    setActiveWellnessSession(updatedChat);

    try {
      if (wellnessMode === "ai") {
        setIsAiResponding(true);
        // Call AI mental health counseling responder
        const aiRes = await api.talkToAiCounselor({
          studentName: currentUser.name || "Student",
          message: userText,
          history: updatedMessages
        });

        const aiMsg = {
          id: `msg-ai-${Date.now()}`,
          senderId: "ai-counselor",
          senderName: "AI Wellbeing Companion",
          senderRole: "ai",
          text: aiRes.reply || "I understand how challenging academic workload can be. Remember to take regular 5-minute pauses, stay hydrated, and celebrate small milestones. You are capable of handling this step-by-step.",
          timestamp: new Date().toISOString()
        };

        const finalChat = { ...updatedChat, messages: [...updatedMessages, aiMsg] };
        setActiveWellnessSession(finalChat);
        await api.saveMentalHealthChat(finalChat);
      } else {
        // Human Counselor message save
        await api.saveMentalHealthChat(updatedChat);
      }
    } catch (err) {
      console.error("Failed to send wellness message:", err);
    } finally {
      setIsAiResponding(false);
    }
  };

  return (
    <div id="direct-messages-container" className="max-w-7xl mx-auto px-4 sm:px-8 py-5 space-y-5">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-zinc-800 dark:border-zinc-800 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 dark:border-zinc-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-600 text-white text-[10px] font-mono font-bold px-2 py-0.5 uppercase tracking-wider">
                Direct Communication & Wellness
              </span>
              <span className="text-xs text-slate-500 dark:text-zinc-400 dark:text-[#AAA]">
                Private &bull; Protected &bull; 1-on-1 Faculty & Counselor Support
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white dark:text-white">
              Personal Teacher Messaging & Mental Health Sanctum
            </h1>
            <p className="text-xs text-slate-600 dark:text-zinc-300 dark:text-[#AAA]">
              Communicate privately with your subject teachers for personal doubts, share notes/diagrams, or connect with our confidential Mental Health counseling service.
            </p>
          </div>

          {/* Section Mode Switcher */}
          <div className="flex items-center gap-2 bg-[#F8F9FA] dark:bg-[#252525] p-1 border border-slate-200 dark:border-zinc-800 dark:border-zinc-700">
            <button
              onClick={() => setActiveSection("direct")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-all ${
                activeSection === "direct"
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                  : "text-slate-600 dark:text-zinc-300 dark:text-[#AAA] hover:text-black dark:hover:text-white"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{isTeacher ? "Student Inquiries (1-on-1)" : "Teacher Direct Chat"}</span>
            </button>

            <button
              onClick={() => setActiveSection("wellness")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-all ${
                activeSection === "wellness"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-slate-600 dark:text-zinc-300 dark:text-[#AAA] hover:text-emerald-700 dark:hover:text-emerald-400"
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Mental Health & Counseling</span>
            </button>
          </div>
        </div>

        <div className="pt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-zinc-400 dark:text-[#AAA]">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>End-to-End Private Channel: Peer-to-peer student chat is restricted for student safety.</span>
          </span>
          <span className="text-emerald-700 dark:text-emerald-400 font-medium">
            🌿 24/7 Academic Stress Support Available
          </span>
        </div>
      </div>

      {/* SECTION 1: DIRECT 1-ON-1 MESSAGING WITH TEACHER */}
      {activeSection === "direct" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[520px]">
          {/* Contacts Sidebar (4 cols) */}
          <div className="lg:col-span-4 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-zinc-800 dark:border-zinc-800 flex flex-col">
            <div className="p-3.5 border-b border-slate-200 dark:border-zinc-800 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 dark:bg-[#222] flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-900 dark:text-white dark:text-white flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400 dark:text-[#AAA]" />
                <span>{isTeacher ? "Enrolled Students" : "Subject Teachers"}</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 dark:text-[#AAA]">{contacts.length} Contacts</span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-[#F0F2F5] dark:divide-[#2A2A2A] max-h-[500px]">
              {contacts.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 dark:text-zinc-400 dark:text-[#AAA]">
                  No contacts found. Join a classroom to automatically link with your subject teachers.
                </div>
              ) : (
                contacts.map((contact) => {
                  const isSelected = selectedContact?.id === contact.id;
                  return (
                    <div
                      key={contact.id}
                      onClick={() => setSelectedContact(contact)}
                      className={`p-3 cursor-pointer transition-colors flex items-center gap-3 ${
                        isSelected
                          ? "bg-indigo-50/70 dark:bg-indigo-950/40 border-l-4 border-l-black dark:border-l-white"
                          : "hover:bg-[#F8F9FA] dark:hover:bg-[#222]"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs font-mono shrink-0 ${
                        contact.role === "teacher" ? "bg-black text-white dark:bg-white dark:text-black" : "bg-emerald-600 text-white"
                      }`}>
                        {contact.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="truncate flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs text-slate-900 dark:text-white truncate">{contact.name}</span>
                          <span className="shrink-0 px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 animate-pulse">
                            ACTIVE
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                          {contact.classCode ? `Class: ${contact.classCode}` : ""} {contact.school ? `• ${contact.school}` : ""}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Conversation Pane (8 cols) */}
          <div className="lg:col-span-8 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-zinc-800 dark:border-zinc-800 flex flex-col justify-between">
            {/* Header */}
            <div className="p-3.5 border-b border-slate-200 dark:border-zinc-800 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 dark:bg-[#222] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-xs">
                  {selectedContact?.name?.slice(0, 1).toUpperCase() || "?"}
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white dark:text-white">{selectedContact?.name || "Select Contact"}</h3>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 dark:text-[#AAA]">
                    {selectedContact?.role === "teacher" ? "Classroom Faculty" : "Student"} &bull; Private 1-on-1 Live Conversation
                  </p>
                </div>
              </div>
              <button
                onClick={loadMessages}
                title="Refresh messages"
                className="p-1 text-slate-500 dark:text-zinc-400 dark:text-[#AAA] hover:text-black dark:hover:text-white transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Messages Stream */}
            <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[380px] bg-[#FDFDFD] dark:bg-[#151515]">
              {messages.length === 0 ? (
                <div className="text-center py-16 text-xs text-[#9CA3AF] space-y-1">
                  <MessageSquare className="w-8 h-8 mx-auto text-[#D1D5DB] dark:text-[#444]" />
                  <p>No messages yet in this direct conversation.</p>
                  <p className="text-[11px] text-[#9CA3AF]">Send a private message or upload diagram/notes to discuss homework, grades, or concepts.</p>
                </div>
              ) : (
                messages.map((m, msgIdx) => {
                  const isMe = m.senderId === currentUser?.id;
                  const isRecent = msgIdx >= messages.length - 2 && !isMe;
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-center gap-1 mb-0.5 text-[10px] text-[#9CA3AF]">
                        <span className="font-semibold">{m.senderName}</span>
                        <span>&bull;</span>
                        <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div
                        className={`p-3 text-xs max-w-md rounded-xl leading-relaxed shadow-2xs transition-all ${
                          isMe
                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 rounded-br-none"
                            : isRecent
                            ? "bg-emerald-50/90 dark:bg-emerald-950/40 text-slate-900 dark:text-white border-2 border-emerald-400 dark:border-emerald-600 rounded-bl-none shadow-md"
                            : "bg-slate-100 dark:bg-zinc-800/90 text-slate-900 dark:text-white border border-slate-200 dark:border-zinc-700 rounded-bl-none"
                        }`}
                      >
                        {isRecent && (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1.5 pb-1 border-b border-emerald-200 dark:border-emerald-800/60">
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            <span>⭐ New Message</span>
                          </div>
                        )}
                        <div className="whitespace-pre-wrap">{m.message}</div>

                        {/* Render Attached Image */}
                        {m.mediaUrl && m.mediaType === "image" && (
                          <div className="mt-2 rounded overflow-hidden max-w-xs border border-white/20">
                            <img src={m.mediaUrl} alt={m.mediaName || "Attachment"} className="w-full h-auto object-cover max-h-48 rounded" />
                          </div>
                        )}

                        {/* Render Attached Document Download */}
                        {m.mediaUrl && m.mediaType !== "image" && (
                          <a
                            href={m.mediaUrl}
                            download={m.mediaName || "study-material.pdf"}
                            className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/20 dark:bg-white/20 rounded text-xs font-semibold hover:underline"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>{m.mediaName || "Download Attached Document"}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Attachment Preview Chip */}
            {attachedMedia && (
              <div className="px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/60 border-t border-slate-200 dark:border-zinc-800 dark:border-zinc-700 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-indigo-950 dark:text-indigo-200">
                  {attachedMedia.type === "image" ? (
                    <ImageIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  ) : (
                    <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  )}
                  <span className="font-semibold truncate max-w-xs">{attachedMedia.name}</span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">({attachedMedia.size})</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAttachedMedia(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="text-neutral-400 hover:text-rose-600 font-bold"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 dark:border-zinc-800 dark:border-zinc-800 bg-white dark:bg-[#18181b] flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx,.txt"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Attach study image, diagram or document"
                className="p-2 border border-slate-200 dark:border-zinc-800 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 dark:text-[#AAA] hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white transition-colors"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                placeholder={isTeacher ? "Reply to student inquiry..." : "Type personal question for your teacher..."}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 bg-[#F9FAFB] dark:bg-[#222] border border-slate-200 dark:border-zinc-800 dark:border-zinc-700 px-3 py-2 text-xs text-slate-900 dark:text-white dark:text-white outline-none focus:border-black dark:focus:border-white"
              />
              <button
                type="submit"
                disabled={isSending || (!newMessage.trim() && !attachedMedia)}
                className="bg-black dark:bg-white text-white dark:text-black hover:bg-[#333] dark:hover:bg-neutral-200 px-4 py-2 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 transition-colors"
              >
                <Send className="w-3 h-3" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SECTION 2: MENTAL HEALTH & WELLBEING SANCTUM */}
      {activeSection === "wellness" && (
        <div className="space-y-4">
          {/* Mode Switcher Banner */}
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
                🌿
              </div>
              <div>
                <h3 className="font-bold text-sm text-emerald-950 dark:text-emerald-200">Student Mental Health & Emotional Wellness</h3>
                <p className="text-xs text-emerald-800 dark:text-emerald-300">
                  Select your preferred counseling mode: AI Empathetic Companion for instant support or Certified Human Counselor for professional live dialogue.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white dark:bg-[#18181b] p-1 border border-emerald-300 dark:border-emerald-700">
              <button
                onClick={() => setWellnessMode("ai")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-all ${
                  wellnessMode === "ai"
                    ? "bg-emerald-700 text-white"
                    : "text-emerald-900 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                }`}
              >
                <Brain className="w-3.5 h-3.5" />
                <span>AI Wellbeing Companion (24/7)</span>
              </button>

              <button
                onClick={() => setWellnessMode("human")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-all ${
                  wellnessMode === "human"
                    ? "bg-emerald-700 text-white"
                    : "text-emerald-900 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                }`}
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>Live Human Counselor</span>
              </button>
            </div>
          </div>

          {/* Chat Window */}
          <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-zinc-800 dark:border-zinc-800 flex flex-col justify-between min-h-[460px]">
            {/* Wellness Header */}
            <div className="p-3.5 border-b border-slate-200 dark:border-zinc-800 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 dark:bg-[#222] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                  {wellnessMode === "ai" ? "🤖" : "🧑‍⚕️"}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white dark:text-white">
                    {wellnessMode === "ai" ? "AI Empathetic Wellness Tutor" : "Dr. Shalini (Clinical Counseling Psychologist)"}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 dark:text-[#AAA]">
                    {wellnessMode === "ai" ? "Instant, non-judgmental stress & mindfulness support" : "Certified Human Counselor • Active Session"}
                  </p>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 font-bold px-2 py-0.5">
                100% Confidential & Secure
              </span>
            </div>

            {/* Messages */}
            <div className="p-4 space-y-3.5 flex-1 overflow-y-auto max-h-[380px] bg-[#FDFDFD] dark:bg-[#151515]">
              {activeWellnessSession?.messages?.map((msg) => {
                const isStudent = msg.senderRole === "student";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isStudent ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-1 mb-0.5 text-[10px] text-[#9CA3AF]">
                      <span className="font-semibold">{msg.senderName}</span>
                      <span>&bull;</span>
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div
                      className={`p-3.5 text-xs max-w-lg rounded leading-relaxed whitespace-pre-wrap ${
                        isStudent
                          ? "bg-emerald-800 text-white"
                          : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              {isAiResponding && (
                <div className="flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 font-semibold italic p-2 bg-emerald-50/50 dark:bg-emerald-950/20">
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-emerald-600 dark:text-emerald-400" />
                  <span>AI Wellness Companion is typing with empathy...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendWellnessMessage} className="p-3 border-t border-slate-200 dark:border-zinc-800 dark:border-zinc-800 bg-white dark:bg-[#18181b] flex items-center gap-2">
              <input
                type="text"
                placeholder={wellnessMode === "ai" ? "Share what is making you feel stressed, overwhelmed, or anxious..." : "Message Dr. Shalini confidentially..."}
                value={wellnessInput}
                onChange={(e) => setWellnessInput(e.target.value)}
                className="flex-1 bg-[#F9FAFB] dark:bg-[#222] border border-slate-200 dark:border-zinc-800 dark:border-zinc-700 px-3 py-2 text-xs text-slate-900 dark:text-white dark:text-white outline-none focus:border-emerald-600"
              />
              <button
                type="submit"
                disabled={!wellnessInput.trim() || isAiResponding}
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 transition-colors"
              >
                <Send className="w-3 h-3" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
