import React from "react";

class WorkspaceErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Workspace Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-2xl mx-auto my-12 p-8 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-2xl shadow-xl space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center mx-auto text-xl font-bold">
            🏛️
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Classroom Workspace Synchronizing</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Re-initializing active curriculum and timetable streams...
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="clean-button-primary px-4 py-2 text-xs font-bold rounded-lg shadow-xs"
          >
            Reload Classroom Desk ↻
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
import { useState, useEffect } from "react";
import { ArrowRight, Bell, Sparkles, CheckCircle2, X } from "lucide-react";
import { Navbar } from "./components/Navbar";
import { DoubtSolver } from "./components/DoubtSolver";
import { AdaptivePractice } from "./components/AdaptivePractice";
import { TeacherDashboard } from "./components/TeacherDashboard";
import { ScholarshipMatcher } from "./components/ScholarshipMatcher";
import { OerLibrary } from "./components/OerLibrary";
import { ClassHub } from "./components/ClassHub";
import { CommunityForum } from "./components/CommunityForum";
import { DirectMessages } from "./components/DirectMessages";
import { LoginPage } from "./components/LoginPage";
import { api } from "./services/api";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [currentTeacher, setCurrentTeacher] = useState(null);
  const [currentClassInfo, setCurrentClassInfo] = useState(null);
  const [studentClasses, setStudentClasses] = useState([]);
  const [activeTab, setActiveTab] = useState("tutor");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [students, setStudents] = useState([]);
  const [isAiConnected, setIsAiConnected] = useState(true);
  const [practiceTopicFocus, setPracticeTopicFocus] = useState(undefined);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [isAcceptingInvite, setIsAcceptingInvite] = useState(false);

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("equitable_dark_mode") === "true";
  });

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("equitable_dark_mode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("equitable_dark_mode", "false");
    }
  }, [isDarkMode]);

  // Sync activeTab with URL Hash and Browser Back/Forward navigation
  const navigateToTab = (tab, pushHistory = true) => {
    setActiveTab(tab);
    const targetHash = `#${tab}`;
    if (window.location.hash !== targetHash) {
      if (pushHistory) {
        window.history.pushState({ tab }, "", targetHash);
      } else {
        window.history.replaceState({ tab }, "", targetHash);
      }
    }
  };

  useEffect(() => {
    const handleLocationSync = () => {
      const hash = window.location.hash.replace("#", "").trim();
      const validTabs = ["tutor", "practice", "classhub", "community", "teacher", "scholarships", "oer", "messages", "about"];
      if (hash && validTabs.includes(hash)) {
        setActiveTab(hash);
      }
    };

    handleLocationSync();
    window.addEventListener("popstate", handleLocationSync);
    window.addEventListener("hashchange", handleLocationSync);

    checkHealth();
    restoreSession();

    return () => {
      window.removeEventListener("popstate", handleLocationSync);
      window.removeEventListener("hashchange", handleLocationSync);
    };
  }, []);

  useEffect(() => {
    if (currentStudent) {
      loadStudentInvites(currentStudent);
      loadStudentClasses(currentStudent);
      loadNotifications(currentStudent.id);
    } else if (currentTeacher) {
      loadNotifications(currentTeacher.id);
    } else {
      setPendingInvites([]);
      setStudentClasses([]);
      setNotifications([]);
    }
  }, [currentStudent?.id, currentTeacher?.id]);

  const loadNotifications = async (userId) => {
    if (!userId) return;
    try {
      const res = await api.getUserNotifications(userId);
      setNotifications(res?.notifications || []);
    } catch (err) {
      console.warn("Could not load notifications:", err);
    }
  };

  const checkHealth = async () => {
    try {
      const health = await api.getHealth();
      setIsAiConnected(health.aiEnabled);
    } catch (err) {
      console.error("Health check error:", err);
    }
  };

  const loadStudentClasses = async (student) => {
    if (!student) return;
    try {
      const res = await api.getStudentClasses(student.id, student.email);
      const classes = res?.classes || [];
      setStudentClasses(classes);
      if (classes.length > 0 && (!currentClassInfo || !classes.some(c => c.classCode === currentClassInfo.classCode))) {
        setCurrentClassInfo(classes[0]);
      }
    } catch (err) {
      console.error("Failed to load student classes:", err);
    }
  };

  const handleJoinClass = async (classCode) => {
    if (!currentStudent || !classCode) return;
    try {
      const res = await api.joinClass(currentStudent.id, classCode);
      if (res.student) setCurrentStudent(res.student);
      if (res.classInfo) setCurrentClassInfo(res.classInfo);
      if (res.classes) setStudentClasses(res.classes);
      navigateToTab("classhub");
      return res;
    } catch (err) {
      console.error("Join class error:", err);
      throw err;
    }
  };

  const loadStudentInvites = async (student) => {
    if (!student) return;
    try {
      const res = await api.getStudentInvites(student.email, student.id);
      setPendingInvites(res.invites || []);
    } catch (err) {
      console.error("Failed to load student invites:", err);
    }
  };

  const handleAcceptInvite = async (invite) => {
    if (!currentStudent || !invite) return;
    setIsAcceptingInvite(true);
    try {
      const res = await api.acceptInvite(
        invite.id,
        currentStudent.id,
        currentStudent.name,
        currentStudent.email
      );
      if (res.student) {
        setCurrentStudent(res.student);
      }
      if (res.classInfo) {
        setCurrentClassInfo(res.classInfo);
      }
      // Remove accepted invite from pending list
      setPendingInvites((prev) => prev.filter((i) => i.id !== invite.id));
      loadStudentClasses(res.student || currentStudent);
      navigateToTab("classhub");
    } catch (err) {
      alert("Failed to join class: " + err.message);
    } finally {
      setIsAcceptingInvite(false);
    }
  };

  const handleRejectInvite = async (inviteId) => {
    try {
      await api.rejectInvite(inviteId);
      setPendingInvites((prev) => prev.filter((i) => i.id !== inviteId));
    } catch (err) {
      console.error("Failed to decline invite:", err);
    }
  };

  const restoreSession = async () => {
    const savedToken = api.getToken();
    if (!savedToken) return;
    try {
      const res = await api.verifySession(savedToken);
      if (res.valid && res.user) {
        setCurrentUser(res.user);
        if (res.user.role === "teacher") {
          setCurrentTeacher(res.teacherProfile || null);
          if (res.teacherProfile?.classes && res.teacherProfile.classes.length > 0) {
            const firstClass = res.teacherProfile.classes[0];
            setCurrentClassInfo(typeof firstClass === "string" ? { classCode: firstClass } : firstClass);
          }
          const initialHash = window.location.hash.replace("#", "");
          navigateToTab(initialHash || "teacher", false);
        } else {
          setCurrentStudent(res.studentProfile || null);
          setCurrentClassInfo(res.classInfo || null);
          if (res.studentProfile?.primaryLanguage) {
            setSelectedLanguage(res.studentProfile.primaryLanguage);
          }
          const initialHash = window.location.hash.replace("#", "");
          navigateToTab(initialHash || "tutor", false);
          loadStudentInvites(res.studentProfile);
          loadStudentClasses(res.studentProfile);
        }
      }
    } catch {
      api.setToken(null);
    }
  };

  const handleLoginSuccess = (user, student, teacher, classInfo) => {
    setCurrentUser(user);
    if (user.role === "teacher") {
      setCurrentTeacher(teacher || null);
      setCurrentStudent(null);
      if (teacher?.classes && teacher.classes.length > 0) {
        const firstClass = teacher.classes[0];
        setCurrentClassInfo(typeof firstClass === "string" ? { classCode: firstClass } : firstClass);
      } else {
        setCurrentClassInfo(null);
      }
      navigateToTab("teacher");
    } else {
      setCurrentStudent(student || null);
      setCurrentTeacher(null);
      setCurrentClassInfo(classInfo || student?.classInfo || null);
      if (student?.primaryLanguage) {
        setSelectedLanguage(student.primaryLanguage);
      }
      navigateToTab("tutor");
      loadStudentInvites(student);
      loadStudentClasses(student);
    }
  };

  const handleLogout = () => {
    api.setToken(null);
    setCurrentUser(null);
    setCurrentStudent(null);
    setCurrentTeacher(null);
    setCurrentClassInfo(null);
    setStudentClasses([]);
    navigateToTab("tutor");
  };

  const handleUpdateStudent = (updated) => {
    setCurrentStudent(updated);
    setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleNavigateToPractice = (topicId) => {
    if (topicId) {
      setPracticeTopicFocus(topicId);
    }
    setActiveTab("practice");
  };

  const handleSelectStudentFromTeacher = async (studentId) => {
    try {
      const res = await api.getStudent(studentId);
      if (res.student) {
        alert(`Selected student: ${res.student.name} (${res.student.gradeLevel}). View their diagnostic breakdown in the student roster.`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8F9FA] dark:bg-[#0D0D0D] text-[#1A1A1A] dark:text-[#E5E7EB] font-sans selection:bg-black selection:text-white transition-colors duration-200">
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
        />
        <footer className="mt-auto border-t border-[#E5E7EB] dark:border-[#2A2A2A] bg-white dark:bg-[#0f0f0f] py-3 text-xs text-[#9ca3af] dark:text-[#6b7280]">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
            <span><span className="font-bold text-[#374151] dark:text-[#d1d5db]">Equitable-Scholar</span> · Grounded Education Platform</span>
            <span>© 2026</span>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] dark:bg-[#121212] text-[#1A1A1A] dark:text-[#E5E7EB] selection:bg-black selection:text-white font-sans transition-colors">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={navigateToTab}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
        currentUser={currentUser}
        currentStudent={currentStudent}
        currentTeacher={currentTeacher}
        currentClassInfo={currentClassInfo}
        isAiConnected={isAiConnected}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        notifications={notifications}
        onOpenNotifications={() => setShowNotificationsModal(true)}
      />

      {/* Pending Classroom Invitations Banner */}
      {currentStudent && pendingInvites.length > 0 && (
        <div className="bg-indigo-900 text-white border-b-2 border-indigo-700 py-3.5 px-4 sm:px-8 shadow-inner">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-black font-bold text-[10px] uppercase px-2 py-0.5 tracking-wider rounded-xs">
                  Classroom Invitation Pending
                </span>
                <span className="text-xs text-indigo-200">
                  {pendingInvites.length} invite awaiting your confirmation
                </span>
              </div>
              <h3 className="font-bold text-sm text-white">
                Teacher <strong>{pendingInvites[0].teacherName || "Faculty"}</strong> invited you to join{" "}
                <span className="underline font-mono">{pendingInvites[0].classCode}</span> - {pendingInvites[0].className} ({pendingInvites[0].section || "Section A"})
              </h3>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto">
              <button
                onClick={() => handleRejectInvite(pendingInvites[0].id)}
                className="px-3 py-1.5 text-xs text-indigo-200 hover:text-white border border-indigo-500 hover:border-indigo-400 transition-colors"
              >
                Decline
              </button>
              <button
                onClick={() => handleAcceptInvite(pendingInvites[0])}
                disabled={isAcceptingInvite}
                className="px-4 py-1.5 text-xs font-bold bg-white text-indigo-950 hover:bg-indigo-50 border border-white transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span>{isAcceptingInvite ? "Joining..." : "Accept & Join Classroom"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1">
        {/* User-Friendly Portal Welcome & Navigation Banner */}
        {currentUser && (
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800/80 px-4 sm:px-8 py-2.5 transition-colors">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                  currentUser.role === "teacher"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-black"
                    : "bg-emerald-600 text-white"
                }`}>
                  {currentUser.role === "teacher" ? "👨‍🏫" : "🎓"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      Welcome, {currentUser.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ({currentUser.role === "teacher" ? (currentTeacher?.department || "Faculty") : (currentStudent?.gradeLevel || "Student")})
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                    🏫 {currentUser.institute || currentUser.school || currentStudent?.institute || currentTeacher?.school || "National School Campus"}
                  </span>
                </div>
              </div>

              {/* Quick Navigation Action Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {currentUser.role !== "teacher" ? (
                  <>
                    <button
                      onClick={() => navigateToTab("tutor")}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                        activeTab === "tutor"
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white shadow-2xs"
                          : "bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-slate-400"
                      }`}
                    >
                      💡 Socratic Tutor
                    </button>
                    <button
                      onClick={() => navigateToTab("classhub")}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                        activeTab === "classhub"
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white shadow-2xs"
                          : "bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-slate-400"
                      }`}
                    >
                      🏛️ Classroom
                    </button>
                    <button
                      onClick={() => navigateToTab("practice")}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                        activeTab === "practice"
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white shadow-2xs"
                          : "bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-slate-400"
                      }`}
                    >
                      ⚡ Adaptive Practice
                    </button>
                    <button
                      onClick={() => navigateToTab("scholarships")}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                        activeTab === "scholarships"
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white shadow-2xs"
                          : "bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-slate-400"
                      }`}
                    >
                      💰 Scholarships
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => navigateToTab("teacher")}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                        activeTab === "teacher"
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white shadow-2xs"
                          : "bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-slate-400"
                      }`}
                    >
                      📊 Diagnostic Radar
                    </button>
                    <button
                      onClick={() => navigateToTab("classhub")}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                        activeTab === "classhub"
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white shadow-2xs"
                          : "bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-slate-400"
                      }`}
                    >
                      🏛️ Classroom Workspace
                    </button>
                    <button
                      onClick={() => navigateToTab("community")}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                        activeTab === "community"
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white shadow-2xs"
                          : "bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-slate-400"
                      }`}
                    >
                      💬 Class Doubts
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Tutor / Doubt Solver */}
        {activeTab === "tutor" && (
          <DoubtSolver
            currentStudent={currentStudent}
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
            onNavigateToPractice={handleNavigateToPractice}
          />
        )}

        {/* Adaptive Practice */}
        {activeTab === "practice" && (
          <AdaptivePractice
            currentStudent={currentStudent}
            onUpdateStudent={handleUpdateStudent}
            preselectedTopicId={practiceTopicFocus}
          />
        )}

        {/* Classroom Resources & Notes Hub */}
        {activeTab === "classhub" && (
          <WorkspaceErrorBoundary>
            <ClassHub
              currentStudent={currentStudent}
              currentTeacher={currentTeacher}
              classInfo={currentClassInfo}
              studentClasses={studentClasses}
              onSelectClass={(cls) => setCurrentClassInfo(cls)}
              onJoinClass={handleJoinClass}
              onLeaveClass={handleLeaveClass}
              onNavigateToTutor={() => navigateToTab("tutor")}
              onNavigateToPractice={() => navigateToTab("practice")}
              onNavigateToCommunity={() => navigateToTab("community")}
            />
          </WorkspaceErrorBoundary>
        )}

        {/* Institutional Community Forum */}
        {activeTab === "community" && (
          <CommunityForum
            currentUser={currentUser}
            currentStudent={currentStudent}
            currentTeacher={currentTeacher}
            onNavigateToTutor={() => navigateToTab("tutor")}
          />
        )}

        {/* Direct Messages & Mental Health Sanctum */}
        {activeTab === "messages" && (
          <DirectMessages
            currentUser={currentUser}
            currentStudent={currentStudent}
            currentTeacher={currentTeacher}
            studentClasses={studentClasses}
            selectedLanguage={selectedLanguage}
          />
        )}

        {/* Teacher Dashboard */}
        {activeTab === "teacher" && currentUser.role === "teacher" && (
          <TeacherDashboard
            students={students}
            onSelectStudent={handleSelectStudentFromTeacher}
            currentTeacher={currentTeacher}
          />
        )}

        {/* Scholarship & Financial Aid Matcher */}
        {activeTab === "scholarships" && (
          <ScholarshipMatcher currentStudent={currentStudent} />
        )}

        {/* Open Educational Library & Resource Dump */}
        {activeTab === "oer" && (
          <OerLibrary
            currentStudent={currentStudent}
            currentTeacher={currentTeacher}
            onNavigateToTutor={() => navigateToTab("tutor")}
            onNavigateToPractice={() => navigateToTab("practice")}
          />
        )}
      </main>

      {/* Notifications Modal */}
      {showNotificationsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#18181b] border border-slate-300 dark:border-zinc-700 max-w-lg w-full p-6 space-y-4 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Academic Notifications</h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">Class alerts, notices, and scholarship updates</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {notifications.some(n => !n.isRead) && (
                  <button
                    onClick={async () => {
                      for (const n of notifications) {
                        if (!n.isRead) await api.markNotificationRead(n.id).catch(() => {});
                      }
                      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                    }}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
                <button
                  onClick={() => setShowNotificationsModal(false)}
                  className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 font-bold flex items-center justify-center text-xs transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {notifications.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500 dark:text-zinc-400 space-y-2">
                  <Bell className="w-8 h-8 mx-auto text-slate-300 dark:text-zinc-600" />
                  <p>No notifications right now.</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const isJoin = n.category === "classroom_join" || n.category === "classroom_enrolled";
                  const isLeave = n.category === "classroom_leave";
                  const isMsg = n.category === "message";
                  const isAnn = n.category === "announcement" || n.category === "circular";

                  return (
                    <div
                      key={n.id}
                      onClick={async () => {
                        if (!n.isRead) {
                          await api.markNotificationRead(n.id).catch(() => {});
                          setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, isRead: true } : item));
                        }
                        if (n.linkTab) {
                          navigateToTab(n.linkTab);
                          setShowNotificationsModal(false);
                        }
                      }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 relative overflow-hidden ${
                        isJoin
                          ? "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700/80 shadow-2xs hover:border-emerald-500"
                          : isLeave
                          ? "bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-700/80 shadow-2xs hover:border-rose-500"
                          : isMsg
                          ? "bg-indigo-50/80 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-700/80 shadow-2xs hover:border-indigo-500"
                          : !n.isRead
                          ? "bg-amber-50/80 dark:bg-amber-950/25 border-amber-300 dark:border-amber-700/80 shadow-2xs hover:border-amber-400"
                          : "bg-slate-50 dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700"
                      }`}
                    >
                      {/* Left accent bar */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                        isJoin
                          ? "bg-emerald-500"
                          : isLeave
                          ? "bg-rose-500"
                          : isMsg
                          ? "bg-indigo-500"
                          : !n.isRead
                          ? "bg-amber-500"
                          : "bg-slate-300 dark:bg-zinc-700"
                      }`} />

                      <div className="flex items-center justify-between gap-2 pl-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isJoin && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-emerald-600 text-white">
                              + Classroom Active
                            </span>
                          )}
                          {isLeave && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-rose-600 text-white">
                              - Class Left
                            </span>
                          )}
                          {isMsg && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-indigo-600 text-white flex items-center gap-1">
                              💬 Message
                            </span>
                          )}
                          {isAnn && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-amber-600 text-white">
                              📢 Circular
                            </span>
                          )}
                          <span className="font-bold text-xs text-slate-900 dark:text-white">{n.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-400 font-mono shrink-0">
                          {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
                        </span>
                      </div>

                      {n.senderName && (
                        <div className="pl-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
                          <span className="w-4 h-4 rounded-full bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 flex items-center justify-center text-[9px] font-bold">
                            {n.senderName.charAt(0)}
                          </span>
                          <span>From: {n.senderName}</span>
                        </div>
                      )}

                      <p className="pl-1.5 text-xs text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
                        {n.message}
                      </p>

                      {n.linkTab && (
                        <div className="pl-1.5 pt-0.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                            Open {n.linkTab === "classhub" ? "Classroom Workspace" : n.linkTab === "messages" ? "Direct Messages Chat" : n.linkTab === "scholarships" ? "Scholarships" : "Socratic Tutor"} →
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-[#E5E7EB] dark:border-[#2A2A2A] bg-white dark:bg-[#0f0f0f] py-3 text-xs text-[#9ca3af] dark:text-[#6b7280]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
          <span><span className="font-bold text-[#374151] dark:text-[#d1d5db]">Equitable-Scholar</span> · Grounded Education</span>
          <span>© 2026</span>
        </div>
      </footer>
    </div>
  );
}
