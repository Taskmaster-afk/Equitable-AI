import {
  BookOpen,
  GraduationCap,
  Users,
  Award,
  Library,
  Globe,
  Calendar,
  LogOut,
  MessageSquare,
  Share2
} from "lucide-react";
import { SUPPORTED_LANGUAGES } from "../data/oerKnowledgeBase";

export const Navbar = ({
  activeTab,
  setActiveTab,
  selectedLanguage,
  setSelectedLanguage,
  currentUser,
  currentStudent,
  currentTeacher,
  currentClassInfo,
  isAiConnected,
  onLogout
}) => {
  const isTeacher = currentUser?.role === "teacher";

  return (
    <header id="main-header" className="bg-white border-b border-[#E5E7EB] sticky top-0 z-40">
      {/* Top Status & Context Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-1.5 border-b border-[#F0F2F5] flex flex-wrap items-center justify-between text-xs text-[#4B5563] gap-2">
        <div className="flex items-center gap-2 text-[11px]">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="font-semibold text-[#1A1A1A]">Open Curriculum Grounded Learning Engine</span>
          <span className="text-[#D1D5DB]">&bull;</span>
          <span className="text-[#6B7280] hidden sm:inline text-[11px]">
            Classroom Shared Knowledge & Multi-Source RAG
          </span>
        </div>

        {/* Global Controls & User Role State */}
        <div className="flex items-center gap-3">
          {/* User Badge */}
          {currentUser && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 ${
                    isTeacher ? "bg-black text-white" : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {isTeacher ? "TEACHER" : "STUDENT"}
                </span>
                <span className="font-bold text-[#1A1A1A] text-xs">
                  {currentUser.name}
                </span>
                {(currentUser.institute || currentUser.school || currentStudent?.institute || currentTeacher?.school) && (
                  <span
                    className="hidden md:inline-flex items-center text-[10px] text-[#4B5563] bg-[#F3F4F6] border border-[#E5E7EB] px-1.5 py-0.5 truncate max-w-[170px]"
                    title={currentUser.institute || currentUser.school || currentStudent?.institute || currentTeacher?.school}
                  >
                    🏫 {currentUser.institute || currentUser.school || currentStudent?.institute || currentTeacher?.school}
                  </span>
                )}
                {!isTeacher && currentStudent?.classCode && (
                  <span className="text-[10px] font-mono font-bold bg-[#F3F4F6] border border-[#E5E7EB] px-1 text-[#4B5563]">
                    Code: {currentStudent.classCode}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Language Selector */}
          <div className="flex items-center gap-1">
            <Globe className="w-3 h-3 text-[#6B7280]" />
            <select
              id="lang-select"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-[#F8F9FA] border border-[#E5E7EB] text-[#1A1A1A] px-1.5 py-0.5 font-medium outline-none text-xs cursor-pointer hover:border-[#9CA3AF] transition-colors"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* AI Grounding Status Indicator */}
          <div
            className="flex items-center gap-1 text-[11px] font-mono text-[#6B7280]"
            title={isAiConnected ? "Gemini 3.7 Online" : "Grounded Offline Database Mode"}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${isAiConnected ? "bg-emerald-500" : "bg-amber-500"}`} />
            <span className="hidden sm:inline">{isAiConnected ? "Gemini 3.7" : "Offline"}</span>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={onLogout}
            title="Switch User / Sign Out"
            className="flex items-center gap-1 text-[11px] text-[#6B7280] hover:text-rose-600 font-semibold px-2 py-0.5 border border-[#E5E7EB] hover:border-rose-200 transition-colors"
          >
            <LogOut className="w-3 h-3" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div
          className="flex items-center gap-2.5 cursor-pointer select-none"
          onClick={() => setActiveTab(isTeacher ? "teacher" : "tutor")}
        >
          <div className="w-7 h-7 bg-black flex items-center justify-center">
            <div className="w-3.5 h-3.5 bg-white rotate-45" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-[#1A1A1A]">
              EQUITABLE.AI
            </span>
            <span className="hidden md:inline-block ml-2 text-[10px] uppercase tracking-widest text-[#9CA3AF] font-bold">
              Open Curriculum
            </span>
          </div>
        </div>

        {/* Organized Navigation Segment Tabs (Role Adaptive) */}
        <nav className="flex items-center gap-1 sm:gap-2 text-xs font-medium text-[#4B5563] flex-wrap">
          {/* Teacher View Tabs */}
          {isTeacher ? (
            <>
              <button
                id="tab-btn-teacher"
                onClick={() => setActiveTab("teacher")}
                className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors border ${
                  activeTab === "teacher"
                    ? "bg-black text-white border-black font-semibold"
                    : "bg-white hover:bg-[#F8F9FA] text-[#4B5563] border-transparent hover:border-[#E5E7EB]"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Class Radar & Roster</span>
              </button>

              <button
                id="tab-btn-classhub"
                onClick={() => setActiveTab("classhub")}
                className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors border ${
                  activeTab === "classhub"
                    ? "bg-black text-white border-black font-semibold"
                    : "bg-white hover:bg-[#F8F9FA] text-[#4B5563] border-transparent hover:border-[#E5E7EB]"
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Classroom Resources</span>
              </button>

              <button
                id="tab-btn-community"
                onClick={() => setActiveTab("community")}
                className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors border ${
                  activeTab === "community"
                    ? "bg-black text-white border-black font-semibold"
                    : "bg-white hover:bg-[#F8F9FA] text-[#4B5563] border-transparent hover:border-[#E5E7EB]"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Community Chat</span>
              </button>

              <button
                id="tab-btn-tutor"
                onClick={() => setActiveTab("tutor")}
                className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors border ${
                  activeTab === "tutor"
                    ? "bg-black text-white border-black font-semibold"
                    : "bg-white hover:bg-[#F8F9FA] text-[#4B5563] border-transparent hover:border-[#E5E7EB]"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>AI Doubt Solver</span>
              </button>

              <button
                id="tab-btn-oer"
                onClick={() => setActiveTab("oer")}
                className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors border ${
                  activeTab === "oer"
                    ? "bg-black text-white border-black font-semibold"
                    : "bg-white hover:bg-[#F8F9FA] text-[#4B5563] border-transparent hover:border-[#E5E7EB]"
                }`}
              >
                <Library className="w-3.5 h-3.5" />
                <span>Library & Dump</span>
              </button>
            </>
          ) : (
            /* Student View Tabs */
            <>
              <button
                id="tab-btn-tutor"
                onClick={() => setActiveTab("tutor")}
                className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors border ${
                  activeTab === "tutor"
                    ? "bg-black text-white border-black font-semibold"
                    : "bg-white hover:bg-[#F8F9FA] text-[#4B5563] border-transparent hover:border-[#E5E7EB]"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>AI Doubt Solver</span>
              </button>

              <button
                id="tab-btn-practice"
                onClick={() => setActiveTab("practice")}
                className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors border ${
                  activeTab === "practice"
                    ? "bg-black text-white border-black font-semibold"
                    : "bg-white hover:bg-[#F8F9FA] text-[#4B5563] border-transparent hover:border-[#E5E7EB]"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Adaptive Practice</span>
              </button>

              <button
                id="tab-btn-classhub"
                onClick={() => setActiveTab("classhub")}
                className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors border ${
                  activeTab === "classhub"
                    ? "bg-black text-white border-black font-semibold"
                    : "bg-white hover:bg-[#F8F9FA] text-[#4B5563] border-transparent hover:border-[#E5E7EB]"
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Classroom & Notes</span>
              </button>

              <button
                id="tab-btn-community"
                onClick={() => setActiveTab("community")}
                className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors border ${
                  activeTab === "community"
                    ? "bg-black text-white border-black font-semibold"
                    : "bg-white hover:bg-[#F8F9FA] text-[#4B5563] border-transparent hover:border-[#E5E7EB]"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Community Chat</span>
              </button>

              <button
                id="tab-btn-oer"
                onClick={() => setActiveTab("oer")}
                className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors border ${
                  activeTab === "oer"
                    ? "bg-black text-white border-black font-semibold"
                    : "bg-white hover:bg-[#F8F9FA] text-[#4B5563] border-transparent hover:border-[#E5E7EB]"
                }`}
              >
                <Library className="w-3.5 h-3.5" />
                <span>Library & Dump</span>
              </button>

              <button
                id="tab-btn-scholarships"
                onClick={() => setActiveTab("scholarships")}
                className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors border ${
                  activeTab === "scholarships"
                    ? "bg-black text-white border-black font-semibold"
                    : "bg-white hover:bg-[#F8F9FA] text-[#4B5563] border-transparent hover:border-[#E5E7EB]"
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Aid Matcher</span>
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
