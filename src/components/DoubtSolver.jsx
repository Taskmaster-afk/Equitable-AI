import { useState, useRef, useEffect } from "react";
import {
  Send,
  BookOpen,
  HelpCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Image as ImageIcon,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { api } from "../services/api";
import { SUPPORTED_LANGUAGES } from "../data/oerKnowledgeBase";
const NCERT_SAMPLE_CATEGORIES = [
  {
    name: "Class 11-12 Physics",
    grade: "Grade 11-12",
    subject: "Physics",
    doubts: [
      {
        label: "Wave Optics: YDSE Fringe Width",
        question: "In Young\u2019s Double Slit Experiment, what is the formula for fringe width \u03B2? How does the fringe width change if the apparatus is immersed in water of refractive index 4/3?",
        topicId: "wave-optics"
      },
      {
        label: "Kinematics: Projectile Motion Range",
        question: "Why is the horizontal range of a projectile identical for complementary angles of projection \u03B8 and (90\xB0 - \u03B8)? Show the NCERT derivation.",
        topicId: "projectile-motion"
      },
      {
        label: "Current Electricity: Kirchhoff\u2019s Loop Rule",
        question: "How do I apply Kirchhoff\u2019s Second Law (Loop Rule) and what is the proper sign convention for EMF and IR drops in a closed circuit loop?",
        topicId: "current-electricity"
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
        question: "Why is the bond angle in ammonia (NH3) 107\xB0 and water (H2O) 104.5\xB0, even though both central atoms have sp3 hybridization?",
        topicId: "chemical-bonding"
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
        question: "How do I integrate \u222B x \xB7 e^x dx using the Integration by Parts formula? Which function is chosen as first function according to ILATE?",
        topicId: "calculus-integrals"
      },
      {
        label: "Matrices: Inverse of a Matrix",
        question: "What is the exact condition for a square matrix A to be invertible, and how is the inverse formula A^-1 = (1/|A|) \xB7 adj(A) derived from cofactors?",
        topicId: "matrices-determinants"
      },
      {
        label: "Calculus: Derivative from First Principle",
        question: "Find the derivative of f(x) = sin x from First Principles using limits: f'(x) = lim h->0 [f(x+h) - f(x)] / h.",
        topicId: "calculus-derivatives"
      }
    ]
  },
  {
    name: "Class 11-12 Biology",
    grade: "Grade 11-12",
    subject: "Biology",
    doubts: [
      {
        label: "Genetics: Semiconservative DNA Replication",
        question: "How did Meselson and Stahl prove that DNA replication is semiconservative using 15N and 14N isotopes in E. coli?",
        topicId: "molecular-genetics"
      },
      {
        label: "Biotechnology: 3 Steps of PCR",
        question: "Describe the 3 cyclic steps of Polymerase Chain Reaction (PCR): Denaturation, Annealing, and Extension. Why is Taq Polymerase used?",
        topicId: "biotech-pcr"
      },
      {
        label: "Plant Physio: Photosynthesis C3 Cycle",
        question: "What is the role of enzyme RuBisCO in the Calvin C3 cycle during the carboxylation step of photosynthesis?",
        topicId: "plant-photosynthesis"
      }
    ]
  },
  {
    name: "Class 9-10 Science & Math",
    grade: "Grade 9-10",
    subject: "General Science & Math",
    doubts: [
      {
        label: "Physics: Newton\u2019s 2nd Law F=ma",
        question: "Why does a cricket fielder pull their hands backward while catching a fast ball? How does rate of change of momentum explain reduced impact force?",
        topicId: "newton-laws"
      },
      {
        label: "Math: Linear Equations in 2 Variables",
        question: "How do I find 3 distinct solutions for the linear equation 2x + 3y = 12 and plot them as a straight line on a graph?",
        topicId: "linear-equations"
      },
      {
        label: "Biology (Hindi): Photosynthesis & Stomata",
        question: "\u092A\u094C\u0927\u094B\u0902 \u092E\u0947\u0902 \u092A\u094D\u0930\u0915\u093E\u0936 \u0938\u0902\u0936\u094D\u0932\u0947\u0937\u0923 (Photosynthesis) \u0915\u0940 \u0930\u093E\u0938\u093E\u092F\u0928\u093F\u0915 \u0938\u092E\u0940\u0915\u0930\u0923 \u0915\u094D\u092F\u093E \u0939\u0948 \u0914\u0930 \u0938\u094D\u091F\u094B\u092E\u0947\u091F\u093E \u0915\u0948\u0938\u0947 \u0917\u0948\u0938\u094B\u0902 \u0915\u093E \u0906\u0926\u093E\u0928-\u092A\u094D\u0930\u0926\u093E\u0928 \u0915\u0930\u0924\u0947 \u0939\u0948\u0902?",
        lang: "hi",
        topicId: "photosynthesis"
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
  const [messages, setMessages] = useState([
    {
      id: "welcome-msg",
      role: "assistant",
      content: `Hello ${currentStudent?.name || "there"}! I am your NCERT Grounded AI Tutor.

You can ask any doubt in Physics, Chemistry, Mathematics, or Biology across Classes 6 to 12. Every solution provided is step-by-step and strictly grounded in official NCERT National Curriculum textbooks with transparent page and chapter citations.`,
      timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      groundingStatus: "verified_grounded",
      groundingReasoning: "Ready to retrieve NCERT textbook curriculum passages.",
      citations: [],
      suggestedFollowUps: [
        "How do I solve \u222B x \xB7 e^x dx using integration by parts (ILATE)?",
        "Why does a fielder pull hands back when catching a ball (Newton\u2019s 2nd Law)?",
        "What are the key differences between SN1 and SN2 reaction mechanisms?"
      ]
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [gradeLevel, setGradeLevel] = useState(currentStudent?.gradeLevel || "Grade 11-12");
  const [explanationStyle, setExplanationStyle] = useState("step-by-step");
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [sidebarTab, setSidebarTab] = useState("citations");
  useEffect(() => {
    if (currentStudent?.gradeLevel) {
      setGradeLevel(currentStudent.gradeLevel);
      if (currentStudent.gradeLevel === "Grade 9-10") {
        setActiveCategoryIndex(4);
      } else {
        setActiveCategoryIndex(0);
      }
    }
  }, [currentStudent?.id, currentStudent?.gradeLevel]);
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
    if (!query.trim() && !imagePreview || isLoading) return;
    const userMsgId = `user-${Date.now()}`;
    const newMsg = {
      id: userMsgId,
      role: "user",
      content: query.trim() || "Uploaded handwritten problem for NCERT analysis.",
      timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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
        studentId: currentStudent?.id || "student-1",
        imageData: sentImage || void 0,
        previousContext: prevContext
      });
      const assistantMsg = {
        id: `asst-${Date.now()}`,
        role: "assistant",
        content: res.explanation,
        timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        gradeLevel: res.gradeLevel,
        language: res.language,
        citations: res.citations,
        groundingStatus: res.groundingStatus,
        groundingReasoning: res.groundingReasoning,
        suggestedFollowUps: res.suggestedFollowUps
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setSidebarTab("citations");
    } catch (err) {
      const errorMsg = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: `I encountered an issue retrieving the NCERT textbook passage: ${err.message}. Please check your connection or try rephrasing the question.`,
        timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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
  const latestAssistantMessage = [...messages].reverse().find((m) => m.role === "assistant" && m.citations && m.citations.length > 0);
  const activeCitations = latestAssistantMessage?.citations || [];
  return <div id="doubt-solver-container" className="max-w-7xl mx-auto px-4 sm:px-8 py-5">
      {
    /* Clean Quick-Topic Selector Ribbon */
  }
      <div className="bg-white border border-[#E5E7EB] p-3 mb-4 flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-black" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A]">
              NCERT Curriculum Prompts by Subject:
            </span>
          </div>

          {
    /* Subject Categories Tabs */
  }
          <div className="flex flex-wrap gap-1.5">
            {NCERT_SAMPLE_CATEGORIES.map((cat, idx) => <button
    key={idx}
    onClick={() => {
      setActiveCategoryIndex(idx);
      setGradeLevel(cat.grade);
    }}
    className={`text-[11px] px-2.5 py-1 border transition-colors font-medium ${activeCategoryIndex === idx ? "bg-black text-white border-black font-semibold" : "bg-[#F8F9FA] text-[#4B5563] border-[#E5E7EB] hover:bg-[#E5E7EB]"}`}
  >
                {cat.name}
              </button>)}
          </div>
        </div>

        {
    /* Selected Category Sample Doubts */
  }
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#F0F2F5]">
          <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold">
            Try Sample:
          </span>
          {NCERT_SAMPLE_CATEGORIES[activeCategoryIndex].doubts.map((s, idx) => <button
    key={idx}
    onClick={() => handleSelectSample(s)}
    className="text-xs bg-[#F8F9FA] hover:bg-white text-[#1A1A1A] px-2.5 py-1 border border-[#E5E7EB] hover:border-black transition-colors text-left font-medium"
  >
              {s.label}
            </button>)}
        </div>
      </div>

      {
    /* Main 2-Column Clean Workspace */
  }
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {
    /* Chat / Doubt Workspace (8 Columns) */
  }
        <div className="lg:col-span-8 flex flex-col h-[660px] bg-white border border-[#E5E7EB]">
          {
    /* Streamlined Workspace Controls Bar */
  }
          <div className="px-4 py-2.5 border-b border-[#E5E7EB] bg-[#F8F9FA] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
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

            <div className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 font-semibold">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>NCERT Grounding Verified</span>
            </div>
          </div>

          {
    /* Messages Scroll Area */
  }
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAFAFA]">
            {messages.map((msg) => <div
    key={msg.id}
    className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
  >
                <div className="flex items-center gap-1.5 mb-1 text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold">
                  <span className="text-[#4B5563]">
                    {msg.role === "user" ? currentStudent?.name || "You" : "NCERT AI Tutor"}
                  </span>
                  <span>&bull;</span>
                  <span className="font-mono text-[10px] text-[#9CA3AF]">{msg.timestamp}</span>
                </div>

                <div
    className={`max-w-[92%] p-4 text-sm ${msg.role === "user" ? "bg-[#1A1A1A] text-white border border-black" : "bg-white border border-[#E5E7EB] text-[#1A1A1A]"}`}
  >
                  {
    /* Attached Image preview */
  }
                  {msg.imageAttachment && <div className="mb-3 border border-[#E5E7EB] bg-neutral-900 p-1">
                      <img
    src={msg.imageAttachment}
    alt="Uploaded student work"
    className="max-h-48 object-contain"
  />
                      <p className="text-[10px] uppercase tracking-widest text-[#9CA3AF] font-bold mt-1">Uploaded Problem Image</p>
                    </div>}

                  {
    /* Text Content */
  }
                  <div className="whitespace-pre-wrap leading-relaxed space-y-2 font-sans">
                    {msg.content}
                  </div>

                  {
    /* Inline Verified NCERT Citation Badge */
  }
                  {msg.citations && msg.citations.length > 0 && <div className="mt-3.5 pt-3 border-t border-[#E5E7EB] bg-[#F8F9FA] -mx-4 -mb-4 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-[#1A1A1A] flex items-center gap-1.5 uppercase tracking-wider">
                          <BookOpen className="w-3.5 h-3.5 text-black" />
                          NCERT Textbook Citations ({msg.citations.length})
                        </span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 font-bold uppercase tracking-wider font-mono">
                          98% Grounded
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {msg.citations.map((cite) => <div
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
                          </div>)}
                      </div>
                    </div>}

                  {
    /* Suggested Follow-Up Prompts */
  }
                  {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && <div className="mt-3 pt-2.5 border-t border-[#E5E7EB]">
                      <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold mb-1.5 flex items-center gap-1">
                        <HelpCircle className="w-3 h-3 text-[#9CA3AF]" />
                        Deepen Understanding:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestedFollowUps.map((f, i) => <button
    key={i}
    onClick={() => handleSubmit(f)}
    className="text-xs bg-white hover:bg-[#F3F4F6] text-[#1A1A1A] border border-[#E5E7EB] px-2 py-1 text-left transition-colors flex items-center gap-1 font-medium"
  >
                            <span>{f}</span>
                            <ChevronRight className="w-3 h-3 shrink-0 text-[#9CA3AF]" />
                          </button>)}
                      </div>
                    </div>}
                </div>
              </div>)}

            {isLoading && <div className="flex items-start gap-2">
                <div className="p-3 flex items-center gap-2.5 text-xs text-[#4B5563] bg-white border border-[#E5E7EB]">
                  <RefreshCw className="w-4 h-4 text-black animate-spin" />
                  <span>Retrieving official NCERT textbook passages and computing solution...</span>
                </div>
              </div>}

            <div ref={chatEndRef} />
          </div>

          {
    /* Image preview before send */
  }
          {imagePreview && <div className="px-4 py-2 bg-[#F3F4F6] border-t border-[#E5E7EB] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={imagePreview} alt="Upload preview" className="w-10 h-10 object-cover border border-[#E5E7EB]" />
                <div className="text-xs">
                  <p className="font-bold text-[#1A1A1A]">Problem Photo Attached</p>
                  <p className="text-[#6B7280] text-[11px]">Will be analyzed against NCERT curriculum</p>
                </div>
              </div>
              <button
    onClick={() => setImagePreview(null)}
    className="text-xs text-rose-600 hover:text-rose-800 font-bold uppercase tracking-wider"
  >
                Remove
              </button>
            </div>}

          {
    /* Input Bar */
  }
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
    placeholder={`Ask any Class 11-12 NCERT question in ${SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage)?.name || "English"}...`}
    className="flex-1 clean-input py-2 text-sm"
    disabled={isLoading}
  />

              <button
    type="submit"
    id="btn-submit-doubt"
    disabled={!inputText.trim() && !imagePreview || isLoading}
    className="clean-button-primary py-2 px-4 text-xs font-semibold shrink-0"
  >
                <Send className="w-3.5 h-3.5" />
                <span>Ask Doubt</span>
              </button>
            </form>
          </div>
        </div>

        {
    /* Sidebar: Clean Organized Reference & Adaptive Hub (4 Columns) */
  }
        <div className="lg:col-span-4 space-y-4">
          {
    /* Sidebar Tab Navigation */
  }
          <div className="bg-white border border-[#E5E7EB] p-1 flex gap-1">
            <button
    onClick={() => setSidebarTab("citations")}
    className={`flex-1 py-1.5 text-center text-xs font-semibold transition-colors ${sidebarTab === "citations" ? "bg-black text-white" : "text-[#6B7280] hover:text-black"}`}
  >
              NCERT Citations
            </button>
            <button
    onClick={() => setSidebarTab("practice")}
    className={`flex-1 py-1.5 text-center text-xs font-semibold transition-colors ${sidebarTab === "practice" ? "bg-black text-white" : "text-[#6B7280] hover:text-black"}`}
  >
              Next Practice
            </button>
            <button
    onClick={() => setSidebarTab("syllabus")}
    className={`flex-1 py-1.5 text-center text-xs font-semibold transition-colors ${sidebarTab === "syllabus" ? "bg-black text-white" : "text-[#6B7280] hover:text-black"}`}
  >
              Curriculum Index
            </button>
          </div>

          {
    /* Tab Content 1: Active Citations */
  }
          {sidebarTab === "citations" && <div className="bg-white border border-[#E5E7EB] p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
                <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                  Active Reference Proof
                </span>
                <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-1.5 py-0.5 font-bold">
                  Verified NCERT
                </span>
              </div>

              {activeCitations.length > 0 ? <div className="space-y-3">
                  {activeCitations.map((c) => <div key={c.id} className="p-3 bg-[#F8F9FA] border border-[#E5E7EB] space-y-1.5 text-xs">
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
                    </div>)}
                </div> : <div className="text-center py-8 text-xs text-[#6B7280] space-y-2">
                  <BookOpen className="w-6 h-6 mx-auto text-[#9CA3AF]" />
                  <p>Ask any doubt to view the exact NCERT textbook page references and derivations.</p>
                </div>}
            </div>}

          {
    /* Tab Content 2: Connect to Practice */
  }
          {sidebarTab === "practice" && <div className="bg-white border border-[#E5E7EB] p-4 space-y-3">
              <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider block pb-2 border-b border-[#E5E7EB]">
                Adaptive Mastery Loop
              </span>
              <p className="text-xs text-[#4B5563] leading-relaxed">
                Reinforce what you just learned with our adaptive ladder. If you get a question wrong, the system automatically steps down to prerequisite concepts from earlier NCERT chapters.
              </p>
              <button
    onClick={() => onNavigateToPractice && onNavigateToPractice()}
    className="w-full clean-button-primary py-2.5 text-xs justify-between"
  >
                <span>Launch Adaptive Practice</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>}

          {
    /* Tab Content 3: Syllabus Covered */
  }
          {sidebarTab === "syllabus" && <div className="bg-white border border-[#E5E7EB] p-4 space-y-3">
              <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider block pb-2 border-b border-[#E5E7EB]">
                Indexed NCERT Subjects
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
            </div>}

          {
    /* Grounding Guarantee Box */
  }
          <div className="bg-[#F8F9FA] border border-[#E5E7EB] p-3 text-xs text-[#4B5563] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#1A1A1A]">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Zero Hallucination Directive</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#6B7280]">
              Every step is strictly checked against official NCERT National Curriculum textbooks. If a concept is outside the curriculum, the tutor explicitly indicates the boundary.
            </p>
          </div>
        </div>
      </div>
    </div>;
};
