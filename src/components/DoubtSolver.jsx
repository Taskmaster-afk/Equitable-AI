import { useState, useRef, useEffect } from "react";
import {
  Send,
  BookOpen,
  HelpCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Image as ImageIcon,
  Video as VideoIcon,
  FileText,
  ChevronRight,
  ShieldCheck,
  Maximize2,
  History,
  Plus,
  Trash2,
  Clock,
  MessageSquare
} from "lucide-react";
import { api } from "../services/api";
import { SUPPORTED_LANGUAGES } from "../data/oerKnowledgeBase";

const SAMPLE_CURRICULUM_CATEGORIES = [
  {
    name: "Class 11-12 Physics",
    grade: "Grade 11-12",
    subject: "Physics",
    doubts: [
      {
        label: "Wave Optics: YDSE Fringe Width",
        question: "In Young’s Double Slit Experiment, what is the formula for fringe width β? How does the fringe width change if the apparatus is immersed in water of refractive index 4/3?",
        topicId: "wave-optics"
      },
      {
        label: "Kinematics: Projectile Range Derivation",
        question: "Why is the horizontal range of a projectile identical for complementary angles of projection θ and (90° - θ)? Show the complete derivation.",
        topicId: "projectile-motion"
      },
      {
        label: "Current Electricity: Kirchhoff’s Loop Rule",
        question: "How do I apply Kirchhoff’s Second Law (Loop Rule) and what is the proper sign convention for EMF and IR drops in a closed circuit loop?",
        topicId: "current-electricity"
      },
      {
        label: "Electromagnetism: Faraday's & Lenz's Law",
        question: "State Faraday's laws of electromagnetic induction. Why does Lenz's law satisfy the Principle of Conservation of Energy?",
        topicId: "electromagnetism"
      }
    ]
  },
  {
    name: "Class 11-12 Chemistry",
    grade: "Grade 11-12",
    subject: "Chemistry",
    doubts: [
      {
        label: "Organic: SN1 vs SN2 Mechanisms",
        question: "Explain the key differences between SN1 and SN2 reaction mechanisms in haloalkanes. Why do tertiary halides prefer SN1 while primary halides undergo SN2?",
        topicId: "organic-haloalkanes"
      },
      {
        label: "Electrochemistry: Nernst Equation",
        question: "How do I use the Nernst Equation to calculate cell potential E_cell at 298 K when ion concentrations are non-standard?",
        topicId: "electrochemistry"
      },
      {
        label: "Bonding: VSEPR & Hybridization",
        question: "Why is the bond angle in ammonia (NH3) 107° and water (H2O) 104.5°, even though both central atoms have sp3 hybridization?",
        topicId: "chemical-bonding"
      },
      {
        label: "Coordination Chemistry: Crystal Field Splitting",
        question: "Explain crystal field splitting in octahedral complexes. What is the difference between high-spin and low-spin configurations?",
        topicId: "coordination-chemistry"
      }
    ]
  },
  {
    name: "Class 11-12 Mathematics",
    grade: "Grade 11-12",
    subject: "Mathematics",
    doubts: [
      {
        label: "Calculus: Integration by Parts (ILATE)",
        question: "How do I integrate ∫ x · e^x dx using the Integration by Parts formula? Which function is chosen as first function according to ILATE?",
        topicId: "calculus-integrals"
      },
      {
        label: "Matrices: Inverse Matrix from Adjoint",
        question: "What is the exact condition for a square matrix A to be invertible, and how is the inverse formula A^-1 = (1/|A|) · adj(A) derived from cofactors?",
        topicId: "matrices-determinants"
      },
      {
        label: "Calculus: Derivative from First Principle",
        question: "Find the derivative of f(x) = sin x from First Principles using limits: f'(x) = lim h->0 [f(x+h) - f(x)] / h.",
        topicId: "calculus-derivatives"
      },
      {
        label: "Vectors & 3D: Shortest Distance Between Lines",
        question: "How do I calculate the shortest distance between two skew lines in vector form r = a1 + λb1 and r = a2 + μb2?",
        topicId: "vectors-3d"
      }
    ]
  },
  {
    name: "Class 11-12 Biology",
    grade: "Grade 11-12",
    subject: "Biology",
    doubts: [
      {
        label: "Genetics: DNA Replication & Semi-Conservative Model",
        question: "Explain the Meselson-Stahl experiment that proved semi-conservative DNA replication. What enzymes are involved at the replication fork?",
        topicId: "genetics-dna"
      },
      {
        label: "Biotechnology: Steps in Recombinant DNA Technology",
        question: "What are the key steps in creating a recombinant DNA molecule using restriction endonucleases and DNA ligase?",
        topicId: "biotechnology"
      },
      {
        label: "Photosynthesis: Light & Dark Reactions (Calvin Cycle)",
        question: "Differentiate between the light-dependent reactions and the Calvin C3 cycle in photosynthesis. What is the role of RuBisCO?",
        topicId: "photosynthesis-calvin"
      }
    ]
  },
  {
    name: "Class 9-10 Science & Math",
    grade: "Grade 9-10",
    subject: "General Science & Math",
    doubts: [
      {
        label: "Physics: Newton’s 2nd Law F=ma",
        question: "Why does a cricket fielder pull their hands backward while catching a fast ball? How does rate of change of momentum explain reduced impact force?",
        topicId: "newton-laws"
      },
      {
        label: "Optics: Concave & Convex Mirror Formula",
        question: "Derive the mirror formula 1/f = 1/v + 1/u for a concave mirror forming a real inverted image. What is the sign convention?",
        topicId: "optics-mirrors"
      },
      {
        label: "Electricity: Ohm's Law & Equivalent Resistance",
        question: "State Ohm's Law and derive the formula for equivalent resistance when three resistors R1, R2, and R3 are connected in parallel.",
        topicId: "electricity-ohms-law"
      },
      {
        label: "Math: Quadratic Equation Quadratic Formula",
        question: "How do I solve 2x^2 - 7x + 3 = 0 using the quadratic formula x = [-b ± √(b^2 - 4ac)] / (2a)? What does the discriminant indicate?",
        topicId: "quadratic-equations"
      },
      {
        label: "Biology: Human Digestive System & Enzymes",
        question: "What are the key digestive enzymes in the stomach and small intestine, and how does bile juice aid in fat emulsification?",
        topicId: "digestive-system"
      }
    ]
  }
];

export const DoubtSolver = ({
  currentStudent,
  selectedLanguage,
  setSelectedLanguage,
  onNavigateToPractice
}) => {
  const DEFAULT_WELCOME_MESSAGE = {
    id: "welcome-msg",
    role: "assistant",
    content: `Hello ${currentStudent?.name || "there"}! I am your AI Curriculum & Classroom Tutor.

You can ask any doubt in Physics, Chemistry, Mathematics, or Biology across Classes 6 to 12. Every solution provided is step-by-step and grounded in open educational curriculum materials and classroom-shared notes with chapter and concept citations.`,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    groundingStatus: "verified_grounded",
    groundingReasoning: "Ready to retrieve curriculum and classroom knowledge base passages.",
    citations: [],
    suggestedFollowUps: [
      "How do I solve ∫ x · e^x dx using integration by parts (ILATE)?",
      "Why does a fielder pull hands back when catching a ball (Newton’s 2nd Law)?",
      "What are the key differences between SN1 and SN2 reaction mechanisms?"
    ]
  };

  const [messages, setMessages] = useState([DEFAULT_WELCOME_MESSAGE]);
  const [currentSessionId, setCurrentSessionId] = useState(`session-${Date.now()}`);
  const [chatSessions, setChatSessions] = useState([]);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const [inputText, setInputText] = useState("");
  const [gradeLevel, setGradeLevel] = useState(currentStudent?.gradeLevel || "Grade 11-12");
  const [explanationStyle, setExplanationStyle] = useState("step-by-step");
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [sidebarTab, setSidebarTab] = useState("citations");

  const userId = currentStudent?.id || currentStudent?.email || "student-1";

  useEffect(() => {
    if (currentStudent?.gradeLevel) {
      setGradeLevel(currentStudent.gradeLevel);
      if (currentStudent.gradeLevel === "Grade 9-10") {
        setActiveCategoryIndex(4);
      } else {
        setActiveCategoryIndex(0);
      }
    }
    loadChatSessions();
  }, [currentStudent?.id, currentStudent?.gradeLevel]);

  const loadChatSessions = async () => {
    if (!userId) return;
    setIsLoadingHistory(true);
    try {
      const res = await api.getAiChatHistory(userId);
      setChatSessions(res?.sessions || []);
    } catch (e) {
      console.warn("Could not load past AI sessions", e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleStartNewChat = () => {
    const newId = `session-${Date.now()}`;
    setCurrentSessionId(newId);
    setMessages([DEFAULT_WELCOME_MESSAGE]);
    setShowHistoryDrawer(false);
  };

  const handleSelectSession = (sess) => {
    setCurrentSessionId(sess.id);
    if (sess.messages && sess.messages.length > 0) {
      setMessages(sess.messages);
    }
    if (sess.language) setSelectedLanguage(sess.language);
    if (sess.gradeLevel) setGradeLevel(sess.gradeLevel);
    setShowHistoryDrawer(false);
    scrollToBottom();
  };

  const handleDeleteSession = async (e, sessId) => {
    e.stopPropagation();
    try {
      await api.deleteAiChatSession(sessId);
      if (currentSessionId === sessId) {
        handleStartNewChat();
      }
      loadChatSessions();
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  };

  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (overrideText) => {
    const query = overrideText || inputText;
    if ((!query.trim() && !imagePreview) || isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    const newMsg = {
      id: userMsgId,
      role: "user",
      content: query.trim() || "Uploaded problem photo for step-by-step solution.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      gradeLevel,
      language: selectedLanguage,
      imageAttachment: imagePreview || void 0,
      groundingStatus: "verified_grounded"
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");
    const sentImage = imagePreview;
    setImagePreview(null);
    setIsLoading(true);
    scrollToBottom();

    try {
      const prevContext = messages.slice(-4).map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await api.solveDoubt({
        question: query,
        gradeLevel,
        language: selectedLanguage,
        explanationStyle,
        studentId: userId,
        imageData: sentImage || void 0,
        previousContext: prevContext
      });

      const assistantMsg = {
        id: `asst-${Date.now()}`,
        role: "assistant",
        content: res.explanation,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        gradeLevel: res.gradeLevel,
        language: res.language,
        citations: res.citations,
        groundingStatus: res.groundingStatus,
        groundingReasoning: res.groundingReasoning,
        suggestedFollowUps: res.suggestedFollowUps
      };

      const updatedLadder = [...messages, newMsg, assistantMsg];
      setMessages((prev) => [...prev, assistantMsg]);
      setSidebarTab("citations");

      // Persist AI Chat History session to DB
      const sessId = currentSessionId || `session-${Date.now()}`;
      api.saveAiChatSession({
        id: sessId,
        userId,
        title: query.trim().slice(0, 45) || "Doubt Session",
        messages: updatedLadder,
        language: selectedLanguage,
        gradeLevel
      }).then(() => loadChatSessions()).catch((e) => console.warn(e));

    } catch (err) {
      const errorMsg = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: `I encountered an issue retrieving the knowledge base passages: ${err.message}. Please check your connection or try rephrasing the question.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        groundingStatus: "unsupported_in_corpus",
        groundingReasoning: "Connection or retrieval error."
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const handleSelectSample = (sample) => {
    if (sample.lang) {
      setSelectedLanguage(sample.lang);
    }
    setInputText(sample.question);
  };

  const latestAssistantMessage = [...messages].reverse().find(
    (m) => m.role === "assistant" && m.citations && m.citations.length > 0
  );
  const activeCitations = latestAssistantMessage?.citations || [];

  return (
    <div id="doubt-solver-container" className="max-w-7xl mx-auto px-4 sm:px-8 py-5">
      {/* Clean Quick-Topic Selector Ribbon */}
      <div className="bg-white border border-[#E5E7EB] p-3 mb-4 flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-black" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A]">
              Curriculum & Classroom Topic Prompts:
            </span>
          </div>

          {/* Subject Categories Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_CURRICULUM_CATEGORIES.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveCategoryIndex(idx);
                  setGradeLevel(cat.grade);
                }}
                className={`text-[11px] px-2.5 py-1 border transition-colors font-medium ${
                  activeCategoryIndex === idx
                    ? "bg-black text-white border-black font-semibold"
                    : "bg-[#F8F9FA] text-[#4B5563] border-[#E5E7EB] hover:bg-[#E5E7EB]"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Category Sample Doubts */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#F0F2F5]">
          <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold">
            Try Sample:
          </span>
          {(SAMPLE_CURRICULUM_CATEGORIES[activeCategoryIndex]?.doubts || []).map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectSample(s)}
              className="text-xs bg-[#F8F9FA] hover:bg-white text-[#1A1A1A] px-2.5 py-1 border border-[#E5E7EB] hover:border-black transition-colors text-left font-medium"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Column Clean Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Chat / Doubt Workspace (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col h-[660px] bg-white border border-[#E5E7EB]">
          {/* Streamlined Workspace Controls Bar */}
          <div className="px-4 py-2.5 border-b border-[#E5E7EB] bg-[#F8F9FA] flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold">
                  Class:
                </span>
                <select
                  id="grade-select"
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="bg-white border border-[#E5E7EB] px-2 py-1 text-[#1A1A1A] font-medium outline-none text-xs hover:border-[#9CA3AF]"
                >
                  <option value="Grade 11-12">Class 11 & 12 (Higher Secondary)</option>
                  <option value="Grade 9-10">Class 9 & 10 (Secondary)</option>
                  <option value="Grade 6-8">Class 6 to 8 (Middle)</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold">
                  Format:
                </span>
                <select
                  id="style-select"
                  value={explanationStyle}
                  onChange={(e) => setExplanationStyle(e.target.value)}
                  className="bg-white border border-[#E5E7EB] px-2 py-1 text-[#1A1A1A] font-medium outline-none text-xs hover:border-[#9CA3AF]"
                >
                  <option value="step-by-step">Step-by-Step Derivation</option>
                  <option value="simple-analogy">Intuitive Real-World Analogy</option>
                  <option value="prerequisite-basics">Foundational Basics First</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
                className="clean-button-secondary px-2.5 py-1 text-xs flex items-center gap-1.5 font-bold"
                title="View past AI doubt solving sessions"
              >
                <History className="w-3.5 h-3.5 text-indigo-600" />
                <span>History ({chatSessions.length})</span>
              </button>

              <button
                type="button"
                onClick={handleStartNewChat}
                className="clean-button-primary px-2.5 py-1 text-xs flex items-center gap-1 bg-black text-white hover:bg-neutral-800 font-bold"
                title="Start a new doubt solving session"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ New Doubt</span>
              </button>

              <div className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 font-semibold">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Knowledge Grounded</span>
              </div>
            </div>
          </div>

          {/* History Drawer Overlay / Popover */}
          {showHistoryDrawer && (
            <div className="bg-white border-b-2 border-black p-4 space-y-3 shadow-md animate-in slide-in-from-top duration-150 max-h-60 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold text-xs text-[#1A1A1A]">
                    Past AI Doubt Sessions ({chatSessions.length})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHistoryDrawer(false)}
                  className="text-xs text-[#6B7280] hover:text-black font-bold"
                >
                  ✕ Close
                </button>
              </div>

              {isLoadingHistory ? (
                <div className="text-xs text-[#6B7280] py-3 text-center">Loading past doubt history...</div>
              ) : chatSessions.length === 0 ? (
                <div className="text-xs text-[#6B7280] py-3 text-center">
                  No saved past doubt sessions found. Ask your first question to auto-save!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {chatSessions.map((sess) => {
                    const isSelected = sess.id === currentSessionId;
                    return (
                      <div
                        key={sess.id}
                        onClick={() => handleSelectSession(sess)}
                        className={`p-2.5 border text-left cursor-pointer transition-all flex items-start justify-between gap-2 ${
                          isSelected
                            ? "bg-indigo-50 border-indigo-500 shadow-xs"
                            : "bg-[#F9FAFB] border-[#E5E7EB] hover:border-black"
                        }`}
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="font-bold text-xs text-[#1A1A1A] truncate">
                            {sess.title || "Doubt Session"}
                          </div>
                          <div className="text-[10px] text-[#6B7280] flex items-center gap-2">
                            <span>{sess.gradeLevel || "Grade 11-12"}</span>
                            <span>&bull;</span>
                            <span className="flex items-center gap-0.5">
                              <MessageSquare className="w-3 h-3 text-[#9CA3AF]" />
                              {sess.messages?.length || 0} msgs
                            </span>
                            <span>&bull;</span>
                            <span>{new Date(sess.updatedAt || Date.now()).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleDeleteSession(e, sess.id)}
                          className="text-[#9CA3AF] hover:text-rose-600 p-1 shrink-0 transition-colors"
                          title="Delete session from history"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAFAFA]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold">
                  <span className="text-[#4B5563]">
                    {msg.role === "user" ? currentStudent?.name || "You" : "AI Tutor"}
                  </span>
                  <span>&bull;</span>
                  <span className="font-mono text-[10px] text-[#9CA3AF]">{msg.timestamp}</span>
                </div>

                <div
                  className={`max-w-[92%] p-4 text-sm ${
                    msg.role === "user"
                      ? "bg-[#1A1A1A] text-white border border-black"
                      : "bg-white border border-[#E5E7EB] text-[#1A1A1A]"
                  }`}
                >
                  {/* Attached Image preview */}
                  {msg.imageAttachment && (
                    <div className="mb-3 border border-[#E5E7EB] bg-neutral-900 p-1">
                      <img
                        src={msg.imageAttachment}
                        alt="Uploaded student work"
                        className="max-h-48 object-contain"
                      />
                      <p className="text-[10px] uppercase tracking-widest text-[#9CA3AF] font-bold mt-1">Uploaded Problem Image</p>
                    </div>
                  )}

                  {/* Text Content */}
                  <div className="whitespace-pre-wrap leading-relaxed space-y-2 font-sans">
                    {msg.content}
                  </div>

                  {/* Inline Verified Citation Badge */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3.5 pt-3 border-t border-[#E5E7EB] bg-[#F8F9FA] -mx-4 -mb-4 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-[#1A1A1A] flex items-center gap-1.5 uppercase tracking-wider">
                          <BookOpen className="w-3.5 h-3.5 text-black" />
                          Curriculum & Classroom Citations ({msg.citations.length})
                        </span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 font-bold uppercase tracking-wider font-mono">
                          Grounding Verified
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {(msg.citations || []).map((cite) => (
                          <div
                            key={cite.id}
                            className="bg-white border border-[#E5E7EB] p-2 text-xs"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-bold text-[#1A1A1A]">{cite.sourceName}</span>
                              <span className="bg-black text-white px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider shrink-0">
                                {cite.publisher}
                              </span>
                            </div>
                            <p className="text-[#6B7280] text-[11px] mt-0.5">
                              {cite.chapter} &bull; {cite.section}
                            </p>
                            <p className="mt-1 text-[#4B5563] italic font-mono text-[11px] bg-[#F8F9FA] p-1 border border-[#E5E7EB]">
                              "{cite.excerptSnippet}"
                            </p>
                            <p className="mt-1 text-[10px] text-[#9CA3AF] font-mono">
                              Reference: {cite.pageOrRef}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Follow-Up Prompts */}
                  {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-[#E5E7EB]">
                      <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold mb-1.5 flex items-center gap-1">
                        <HelpCircle className="w-3 h-3 text-[#9CA3AF]" />
                        Deepen Understanding:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {(msg.suggestedFollowUps || []).map((f, i) => (
                          <button
                            key={i}
                            onClick={() => handleSubmit(f)}
                            className="text-xs bg-white hover:bg-[#F3F4F6] text-[#1A1A1A] border border-[#E5E7EB] px-2 py-1 text-left transition-colors flex items-center gap-1 font-medium"
                          >
                            <span>{f}</span>
                            <ChevronRight className="w-3 h-3 shrink-0 text-[#9CA3AF]" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="p-3 flex items-center gap-2.5 text-xs text-[#4B5563] bg-white border border-[#E5E7EB]">
                  <RefreshCw className="w-4 h-4 text-black animate-spin" />
                  <span>Retrieving curriculum & classroom passages and computing step-by-step solution...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Image preview before send */}
          {imagePreview && (
            <div className="px-4 py-2 bg-[#F3F4F6] border-t border-[#E5E7EB] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={imagePreview} alt="Upload preview" className="w-10 h-10 object-cover border border-[#E5E7EB]" />
                <div className="text-xs">
                  <p className="font-bold text-[#1A1A1A]">Problem Photo Attached</p>
                  <p className="text-[#6B7280] text-[11px]">Will be analyzed with step-by-step curriculum verification</p>
                </div>
              </div>
              <button
                onClick={() => setImagePreview(null)}
                className="text-xs text-rose-600 hover:text-rose-800 font-bold uppercase tracking-wider"
              >
                Remove
              </button>
            </div>
          )}

          {/* Quick Syllabus Recommended Questions Strip */}
          <div className="px-3 py-2 bg-[#F9FAFB] border-t border-[#E5E7EB] flex items-center gap-2 overflow-x-auto">
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#6B7280] shrink-0">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Recommended:</span>
            </div>
            <div className="flex items-center gap-1.5 flex-nowrap overflow-x-auto py-0.5">
              {(SAMPLE_CURRICULUM_CATEGORIES[activeCategoryIndex]?.doubts || []).map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setInputText(s.question);
                    handleSubmit(s.question);
                  }}
                  className="text-[11px] bg-white hover:bg-black hover:text-white border border-[#E5E7EB] px-2.5 py-1 shrink-0 font-medium transition-colors shadow-xs"
                  title={s.question}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <div className="p-3 border-t border-[#E5E7EB] bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />

              <button
                type="button"
                id="btn-upload-problem"
                onClick={() => fileInputRef.current?.click()}
                title="Upload photo of handwritten work or textbook problem"
                className="p-2 border border-[#E5E7EB] hover:bg-[#F8F9FA] text-[#4B5563] transition-colors"
              >
                <ImageIcon className="w-4 h-4" />
              </button>

              <input
                type="text"
                id="doubt-input-field"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Ask any Class 6-12 doubt in ${SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage)?.name || "English"}...`}
                className="flex-1 clean-input py-2 text-sm"
                disabled={isLoading}
              />

              <button
                type="submit"
                id="btn-submit-doubt"
                disabled={(!inputText.trim() && !imagePreview) || isLoading}
                className="clean-button-primary py-2 px-4 text-xs font-semibold shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ask Doubt</span>
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar: Clean Organized Reference & Adaptive Hub (4 Columns) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Sidebar Tab Navigation */}
          <div className="bg-white border border-[#E5E7EB] p-1 flex gap-1">
            <button
              onClick={() => setSidebarTab("citations")}
              className={`flex-1 py-1.5 text-center text-xs font-semibold transition-colors ${
                sidebarTab === "citations" ? "bg-black text-white" : "text-[#6B7280] hover:text-black"
              }`}
            >
              Citations ({activeCitations.length})
            </button>
            <button
              onClick={() => setSidebarTab("practice")}
              className={`flex-1 py-1.5 text-center text-xs font-semibold transition-colors ${
                sidebarTab === "practice" ? "bg-black text-white" : "text-[#6B7280] hover:text-black"
              }`}
            >
              Next Practice
            </button>
            <button
              onClick={() => setSidebarTab("syllabus")}
              className={`flex-1 py-1.5 text-center text-xs font-semibold transition-colors ${
                sidebarTab === "syllabus" ? "bg-black text-white" : "text-[#6B7280] hover:text-black"
              }`}
            >
              Curriculum Index
            </button>
          </div>

          {/* Tab Content 1: Active Citations */}
          {sidebarTab === "citations" && (
            <div className="bg-white border border-[#E5E7EB] p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
                <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                  Active Reference Proof
                </span>
                <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-1.5 py-0.5 font-bold">
                  Grounding Verified
                </span>
              </div>

              {activeCitations && activeCitations.length > 0 ? (
                <div className="space-y-3">
                  {(activeCitations || []).map((c) => (
                    <div key={c.id} className="p-3 bg-[#F8F9FA] border border-[#E5E7EB] space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#1A1A1A]">{c.sourceName}</span>
                        <span className="bg-black text-white text-[9px] px-1 py-0.5 font-bold">
                          {c.publisher}
                        </span>
                      </div>
                      <p className="text-[#4B5563] text-[11px]">{c.chapter}</p>
                      <p className="text-[#6B7280] text-[11px]">{c.section}</p>
                      <div className="p-2 bg-white border border-[#E5E7EB] text-[11px] font-mono text-[#374151]">
                        "{c.excerptSnippet}"
                      </div>
                      <p className="text-[10px] text-[#9CA3AF]">
                        Official Reference: <span className="font-bold text-black">{c.pageOrRef}</span>
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-[#6B7280] space-y-2">
                  <BookOpen className="w-6 h-6 mx-auto text-[#9CA3AF]" />
                  <p>Ask any doubt to view the exact textbook & classroom page references and derivations.</p>
                </div>
              )}
            </div>
          )}

          {/* Tab Content 2: Connect to Practice */}
          {sidebarTab === "practice" && (
            <div className="bg-white border border-[#E5E7EB] p-4 space-y-3">
              <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider block pb-2 border-b border-[#E5E7EB]">
                Adaptive Mastery Loop
              </span>
              <p className="text-xs text-[#4B5563] leading-relaxed">
                Reinforce what you just learned with our adaptive ladder. If you get a question wrong, the system automatically steps down to prerequisite concepts from earlier chapters.
              </p>
              <button
                onClick={() => onNavigateToPractice && onNavigateToPractice()}
                className="w-full clean-button-primary py-2.5 text-xs justify-between"
              >
                <span>Launch Adaptive Practice</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Tab Content 3: Syllabus Covered */}
          {sidebarTab === "syllabus" && (
            <div className="bg-white border border-[#E5E7EB] p-4 space-y-3">
              <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider block pb-2 border-b border-[#E5E7EB]">
                Indexed Curriculum Subjects
              </span>
              <div className="space-y-2 text-xs">
                <div className="p-2 border border-[#E5E7EB] bg-[#F8F9FA]">
                  <p className="font-bold text-[#1A1A1A]">Mathematics (Classes 11 & 12)</p>
                  <p className="text-[#6B7280] text-[11px]">Integrals, Matrices, Vectors, 3D Geometry, Derivatives, Trigonometry</p>
                </div>
                <div className="p-2 border border-[#E5E7EB] bg-[#F8F9FA]">
                  <p className="font-bold text-[#1A1A1A]">Physics (Classes 11 & 12)</p>
                  <p className="text-[#6B7280] text-[11px]">Electrostatics, Current Electricity, Wave Optics, Projectile Motion, Thermodynamics</p>
                </div>
                <div className="p-2 border border-[#E5E7EB] bg-[#F8F9FA]">
                  <p className="font-bold text-[#1A1A1A]">Chemistry (Classes 11 & 12)</p>
                  <p className="text-[#6B7280] text-[11px]">Electrochemistry, SN1/SN2 Haloalkanes, VSEPR Bonding, Mole Concept & Stoichiometry</p>
                </div>
                <div className="p-2 border border-[#E5E7EB] bg-[#F8F9FA]">
                  <p className="font-bold text-[#1A1A1A]">Biology (Classes 11 & 12)</p>
                  <p className="text-[#6B7280] text-[11px]">Molecular Genetics, Biotechnology & PCR, Cell Biology, Photosynthesis C3 Cycle</p>
                </div>
              </div>
            </div>
          )}

          {/* Grounding Guarantee Box */}
          <div className="bg-[#F8F9FA] border border-[#E5E7EB] p-3 text-xs text-[#4B5563] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#1A1A1A]">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Zero Hallucination Directive</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#6B7280]">
              Every step is strictly checked against official curriculum frameworks and classroom resources. If a concept is outside the curriculum, the tutor explicitly indicates the boundary.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
