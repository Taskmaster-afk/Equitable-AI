import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Navbar } from "./components/Navbar";
import { DoubtSolver } from "./components/DoubtSolver";
import { AdaptivePractice } from "./components/AdaptivePractice";
import { TeacherDashboard } from "./components/TeacherDashboard";
import { ScholarshipMatcher } from "./components/ScholarshipMatcher";
import { OerLibrary } from "./components/OerLibrary";
import { ClassHub } from "./components/ClassHub";
import { CommunityForum } from "./components/CommunityForum";
import { LoginPage } from "./components/LoginPage";
import { ArchitectureTransparencyModal } from "./components/ArchitectureTransparencyModal";
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
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [isAcceptingInvite, setIsAcceptingInvite] = useState(false);

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
      const validTabs = ["tutor", "practice", "classhub", "community", "teacher", "scholarships", "oer", "about"];
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
    } else {
      setPendingInvites([]);
      setStudentClasses([]);
    }
  }, [currentStudent?.id, currentStudent?.email]);

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
      <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-black selection:text-white">
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onOpenAuditModal={() => setIsAuditModalOpen(true)}
        />
        <footer className="mt-auto border-t border-[#E5E7EB] bg-white py-4 text-xs text-[#6B7280]">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="font-bold text-[#1A1A1A]">AI for Equitable Education Access</span> &bull; Open Curriculum Grounded Knowledge & Multi-Role Isolated Portal
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <button
                onClick={() => setIsAuditModalOpen(true)}
                className="text-emerald-700 hover:text-emerald-900 font-semibold underline underline-offset-2"
              >
                Evaluator Technical Briefing & Audit
              </button>
              <span className="text-[#D1D5DB]">&bull;</span>
              <span>National Open Curriculum Core</span>
            </div>
          </div>
        </footer>

        {/* Technical Briefing Modal */}
        <ArchitectureTransparencyModal
          isOpen={isAuditModalOpen}
          onClose={() => setIsAuditModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#1A1A1A] selection:bg-black selection:text-white font-sans">
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
        onOpenAuditModal={() => setIsAuditModalOpen(true)}
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
          <ClassHub
            currentStudent={currentStudent}
            currentTeacher={currentTeacher}
            classInfo={currentClassInfo}
            studentClasses={studentClasses}
            onSelectClass={(cls) => setCurrentClassInfo(cls)}
            onJoinClass={handleJoinClass}
            onNavigateToTutor={() => navigateToTab("tutor")}
            onNavigateToPractice={() => navigateToTab("practice")}
            onNavigateToCommunity={() => navigateToTab("community")}
          />
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

      {/* Geometric Balance Minimalist Footer */}
      <footer className="mt-auto border-t border-[#E5E7EB] bg-white py-4 text-xs text-[#6B7280]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="font-bold text-[#1A1A1A]">AI for Equitable Education Access</span> &bull; Grounded Knowledge & Multilingual Tutor
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <button
              onClick={() => setIsAuditModalOpen(true)}
              className="text-emerald-700 hover:text-emerald-900 font-semibold underline underline-offset-2"
            >
              Evaluator Technical Briefing & Audit
            </button>
            <span className="text-[#E5E7EB]">|</span>
            <span className="text-black font-semibold">Strict Privacy & Ephemeral AI</span>
          </div>
        </div>
      </footer>

      {/* Technical Briefing Modal */}
      <ArchitectureTransparencyModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />
    </div>
  );
}
