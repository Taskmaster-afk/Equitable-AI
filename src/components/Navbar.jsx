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
  Share2,
  Moon,
  Sun,
  Heart,
  Bell,
  Sparkles
} from "lucide-react";
import { SUPPORTED_LANGUAGES } from "../data/oerKnowledgeBase";
import { getTranslation } from "../data/translations";

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
  onLogout,
  onOpenAuditModal,
  isDarkMode,
  setIsDarkMode,
  notifications = [],
  onOpenNotifications
}) => {
  const isTeacher = currentUser?.role === "teacher";
  const t = (key, fallback) => getTranslation(selectedLanguage, key, fallback);
  const unreadNotifs = notifications.filter(n => !n.isRead).length;

  return (
    <header id="main-header" className="bg-white dark:bg-[#121212] border-b border-[#E5E7EB] dark:border-[#2A2A2A] sticky top-0 z-40 transition-colors">
      {/* Top Status & Context Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-1.5 border-b border-[#F0F2F5] dark:border-[#222] flex flex-wrap items-center justify-between text-xs text-[#4B5563] dark:text-[#9CA3AF] gap-2">
        <div className="flex items-center gap-2 text-[11px]">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="font-semibold text-[#1A1A1A] dark:text-[#E5E7EB]">{t("statusStrip")}</span>
        </div>

        {/* Global Controls & User Role State */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setIsDarkMode && setIsDarkMode(!isDarkMode)}
            title={isDarkMode ? t("lightMode", "Switch to Light Mode") : t("darkMode", "Switch to Dark Mode")}
            className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 border border-[#E5E7EB] dark:border-[#333] hover:bg-[#F3F4F6] dark:hover:bg-[#222] text-[#4B5563] dark:text-[#E5E7EB] transition-colors"
          >
            {isDarkMode ? <Sun className="w-3 h-3 text-amber-400" /> : <Moon className="w-3 h-3 text-indigo-600" />}
            <span className="hidden sm:inline">{isDarkMode ? t("lightMode") : t("darkMode")}</span>
          </button>

          {/* Notifications Bell (Teacher & Student) */}
          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              title="View verification alerts, notices & student requests"
              className={`relative flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 border transition-colors ${
                unreadNotifs > 0
                  ? "border-amber-400 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200"
                  : "border-[#E5E7EB] dark:border-[#333] hover:bg-[#F3F4F6] dark:hover:bg-[#222] text-[#4B5563] dark:text-[#E5E7EB]"
              }`}
            >
              <Bell className={`w-3 h-3 ${unreadNotifs > 0 ? "text-amber-600 dark:text-amber-400" : "text-[#6B7280] dark:text-[#AAA]"}`} />
              <span>{t("notifications", "Notifications")}</span>
              {unreadNotifs > 0 ? (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              ) : (
                <span className="text-[10px] font-mono text-neutral-400">({notifications?.length || 0})</span>
              )}
            </button>
          )}

          {/* Evaluator & Architecture Briefing Button */}
          {onOpenAuditModal && (
            <button
              onClick={onOpenAuditModal}
              title="System Architecture, Semantic RAG & Security Audit"
              className="flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 px-2 py-0.5 hover:bg-emerald-100 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>{t("evaluatorAudit")}</span>
            </button>
          )}

          {/* User Badge */}
          {currentUser && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 ${
                    isTeacher ? "bg-black text-white dark:bg-white dark:text-black" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100"
                  }`}
                >
                  {isTeacher ? "TEACHER" : "STUDENT"}
                </span>
                <span className="font-bold text-[#1A1A1A] dark:text-white text-xs">
                  {currentUser.name}
                </span>
                {(currentUser.institute || currentUser.school || currentStudent?.institute || currentTeacher?.school) && (
                  <span
                    className="hidden md:inline-flex items-center text-[10px] text-[#4B5563] dark:text-[#9CA3AF] bg-[#F3F4F6] dark:bg-[#222] border border-[#E5E7EB] dark:border-[#333] px-1.5 py-0.5 truncate max-w-[170px]"
                    title={currentUser.institute || currentUser.school || currentStudent?.institute || currentTeacher?.school}
                  >
                    🏫 {currentUser.institute || currentUser.school || currentStudent?.institute || currentTeacher?.school}
                  </span>
                )}
                {!isTeacher && currentStudent?.classCode && currentStudent.classCode !== "NCERT-10A" && (
                  <span className="text-[10px] font-mono font-bold bg-[#F3F4F6] dark:bg-[#222] border border-[#E5E7EB] dark:border-[#333] px-1 text-[#4B5563] dark:text-[#AAA]">
                    Class: {currentStudent.classCode}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Language Selector */}
          <div className="flex items-center gap-1">
            <Globe className="w-3 h-3 text-[#6B7280] dark:text-[#9CA3AF]" />
            <select
              id="lang-select"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-[#F8F9FA] dark:bg-[#1E1E1E] border border-[#E5E7EB] dark:border-[#333] text-[#1A1A1A] dark:text-[#E5E7EB] px-1.5 py-0.5 font-medium outline-none text-xs cursor-pointer hover:border-[#9CA3AF] transition-colors"
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
            className="flex items-center gap-1 text-[11px] font-mono text-[#6B7280] dark:text-[#9CA3AF]"
            title={isAiConnected ? "Gemini 3.7 Online" : "Grounded Offline Database Mode"}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${isAiConnected ? "bg-emerald-500" : "bg-amber-500"}`} />
            <span className="hidden sm:inline">{isAiConnected ? "Gemini 3.7" : "Offline"}</span>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={onLogout}
            title="Switch User / Sign Out"
            className="flex items-center gap-1 text-[11px] text-[#6B7280] dark:text-[#9CA3AF] hover:text-rose-600 dark:hover:text-rose-400 font-semibold px-2 py-0.5 border border-[#E5E7EB] dark:border-[#333] hover:border-rose-200 transition-colors"
          >
            <LogOut className="w-3 h-3" />
            <span className="hidden sm:inline">{t("signOut")}</span>
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
          <div className="w-7 h-7 bg-black dark:bg-white flex items-center justify-center">
            <div className="w-3.5 h-3.5 bg-white dark:bg-black rotate-45" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-[#1A1A1A] dark:text-white">
              {t("appTitle")}
            </span>
            <span className="hidden md:inline-block ml-2 text-[10px] uppercase tracking-widest text-[#9CA3AF] font-bold">
              {t("appSubtitle")}
            </span>
          </div>
        </div>

        {/* Organized Navigation Segment Tabs (Role Adaptive) */}
        <nav className="flex items-center gap-1 sm:gap-2 text-xs font-medium text-[#4B5563] dark:text-[#AAA] flex-wrap">
          {/* Teacher View Tabs */}
          {isTeacher ? (
            <>
              <button
                id="tab-btn-teacher"
                onClick={() => setActiveTab("teacher")}
                className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors border ${
                  activeTab === "teacher"
                    ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-semibold"
                    : "bg-white dark:bg-[#1A1A1A] hover:bg-[#F8F9FA] dark:hover:bg-[#252525] text-[#4B5563] dark:text-[#CCC] border-transparent hover:border-[#E5E7EB] dark:hover:border-[#333]"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{t("tabClassRadar")}</span>
              </button>

              <button
                id="tab-btn-classhub"
                onClick={() => setActiveTab("classhub")}
                className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors border ${
                  activeTab === "classhub"
                    ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-semibold"
                    : "bg-white dark:bg-[#1A1A1A] hover:bg-[#F8F9FA] dark:hover:bg-[#252525] text-[#4B5563] dark:text-[#CCC] border-transparent hover:border-[#E5E7EB] dark:hover:border-[#333]"
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{t("tabClassroomResources")}</span>
              </button>

              <button
                id="tab-btn-community"
                onClick={() => setActiveTab("community")}
                className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors border ${
                  activeTab === "community"
                    ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-semibold"
                    : "bg-white dark:bg-[#1A1A1A] hover:bg-[#F8F9FA] dark:hover:bg-[#252525] text-[#4B5563] dark:text-[#CCC] border-transparent hover:border-[#E5E7EB] dark:hover:border-[#333]"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{t("tabCommunityChat")}</span>
              </button>

              <button
                id="tab-btn-messages"
                onClick={() => setActiveTab("messages")}
                className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors border ${
                  activeTab === "messages"
                    ? "bg-indigo-600 text-white border-indigo-600 font-semibold shadow-xs"
                    : "bg-white dark:bg-[#1A1A1A] hover:bg-[#F8F9FA] dark:hover:bg-[#252525] text-[#4B5563] dark:text-[#CCC] border-transparent hover:border-[#E5E7EB] dark:hover:border-[#333]"
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>{t("tabDirectMessages")}</span>
              </button>

              <button
                id="tab-btn-tutor"
                onClick={() => setActiveTab("tutor")}
                className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors border ${
                  activeTab === "tutor"
                    ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-semibold"
                    : "bg-white dark:bg-[#1A1A1A] hover:bg-[#F8F9FA] dark:hover:bg-[#252525] text-[#4B5563] dark:text-[#CCC] border-transparent hover:border-[#E5E7EB] dark:hover:border-[#333]"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{t("tabAiDoubtSolver")}</span>
              </button>

              <button
                id="tab-btn-oer"
                onClick={() => setActiveTab("oer")}
                className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors border ${
                  activeTab === "oer"
                    ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-semibold"
                    : "bg-white dark:bg-[#1A1A1A] hover:bg-[#F8F9FA] dark:hover:bg-[#252525] text-[#4B5563] dark:text-[#CCC] border-transparent hover:border-[#E5E7EB] dark:hover:border-[#333]"
                }`}
              >
                <Library className="w-3.5 h-3.5" />
                <span>{t("tabLibraryDump")}</span>
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
                    ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-semibold"
                    : "bg-white dark:bg-[#1A1A1A] hover:bg-[#F8F9FA] dark:hover:bg-[#252525] text-[#4B5563] dark:text-[#CCC] border-transparent hover:border-[#E5E7EB] dark:hover:border-[#333]"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{t("tabAiDoubtSolver")}</span>
              </button>

              <button
                id="tab-btn-practice"
                onClick={() => setActiveTab("practice")}
                className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors border ${
                  activeTab === "practice"
                    ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-semibold"
                    : "bg-white dark:bg-[#1A1A1A] hover:bg-[#F8F9FA] dark:hover:bg-[#252525] text-[#4B5563] dark:text-[#CCC] border-transparent hover:border-[#E5E7EB] dark:hover:border-[#333]"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>{t("tabAdaptivePractice")}</span>
              </button>

              <button
                id="tab-btn-classhub"
                onClick={() => setActiveTab("classhub")}
                className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors border ${
                  activeTab === "classhub"
                    ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-semibold"
                    : "bg-white dark:bg-[#1A1A1A] hover:bg-[#F8F9FA] dark:hover:bg-[#252525] text-[#4B5563] dark:text-[#CCC] border-transparent hover:border-[#E5E7EB] dark:hover:border-[#333]"
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{t("tabClassroomResources")}</span>
              </button>

              <button
                id="tab-btn-community"
                onClick={() => setActiveTab("community")}
                className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors border ${
                  activeTab === "community"
                    ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-semibold"
                    : "bg-white dark:bg-[#1A1A1A] hover:bg-[#F8F9FA] dark:hover:bg-[#252525] text-[#4B5563] dark:text-[#CCC] border-transparent hover:border-[#E5E7EB] dark:hover:border-[#333]"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{t("tabCommunityChat")}</span>
              </button>

              <button
                id="tab-btn-messages"
                onClick={() => setActiveTab("messages")}
                className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors border ${
                  activeTab === "messages"
                    ? "bg-indigo-600 text-white border-indigo-600 font-semibold shadow-xs"
                    : "bg-white dark:bg-[#1A1A1A] hover:bg-[#F8F9FA] dark:hover:bg-[#252525] text-[#4B5563] dark:text-[#CCC] border-transparent hover:border-[#E5E7EB] dark:hover:border-[#333]"
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>{t("tabDirectMessages")}</span>
              </button>

              <button
                id="tab-btn-oer"
                onClick={() => setActiveTab("oer")}
                className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors border ${
                  activeTab === "oer"
                    ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-semibold"
                    : "bg-white dark:bg-[#1A1A1A] hover:bg-[#F8F9FA] dark:hover:bg-[#252525] text-[#4B5563] dark:text-[#CCC] border-transparent hover:border-[#E5E7EB] dark:hover:border-[#333]"
                }`}
              >
                <Library className="w-3.5 h-3.5" />
                <span>{t("tabLibraryDump")}</span>
              </button>

              <button
                id="tab-btn-scholarships"
                onClick={() => setActiveTab("scholarships")}
                className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors border ${
                  activeTab === "scholarships"
                    ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-semibold"
                    : "bg-white dark:bg-[#1A1A1A] hover:bg-[#F8F9FA] dark:hover:bg-[#252525] text-[#4B5563] dark:text-[#CCC] border-transparent hover:border-[#E5E7EB] dark:hover:border-[#333]"
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>{t("tabScholarships")}</span>
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

