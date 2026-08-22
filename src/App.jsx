import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { DoubtSolver } from "./components/DoubtSolver";
import { AdaptivePractice } from "./components/AdaptivePractice";
import { TeacherDashboard } from "./components/TeacherDashboard";
import { ScholarshipMatcher } from "./components/ScholarshipMatcher";
import { OerLibrary } from "./components/OerLibrary";
import { ClassHub } from "./components/ClassHub";
import { CommunityForum } from "./components/CommunityForum";
import { LoginPage } from "./components/LoginPage";
import { api } from "./services/api";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [currentTeacher, setCurrentTeacher] = useState(null);
  const [currentClassInfo, setCurrentClassInfo] = useState(null);
  const [activeTab, setActiveTab] = useState("tutor");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [students, setStudents] = useState([]);
  const [isAiConnected, setIsAiConnected] = useState(true);
  const [practiceTopicFocus, setPracticeTopicFocus] = useState(undefined);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const health = await api.getHealth();
      setIsAiConnected(health.aiEnabled);
    } catch (err) {
      console.error("Health check error:", err);
    }
  };

  const handleLoginSuccess = (user, student, teacher, classInfo) => {
    setCurrentUser(user);
    if (user.role === "teacher") {
      setCurrentTeacher(teacher || null);
      setCurrentStudent(null);
      setCurrentClassInfo(null);
      setActiveTab("teacher");
    } else {
      setCurrentStudent(student || null);
      setCurrentTeacher(null);
      setCurrentClassInfo(classInfo || student?.classInfo || null);
      if (student?.primaryLanguage) {
        setSelectedLanguage(student.primaryLanguage);
      }
      setActiveTab("tutor");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentStudent(null);
    setCurrentTeacher(null);
    setCurrentClassInfo(null);
    setActiveTab("tutor");
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
        <LoginPage onLoginSuccess={handleLoginSuccess} />
        <footer className="mt-auto border-t border-[#E5E7EB] bg-white py-4 text-xs text-[#6B7280]">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="font-bold text-[#1A1A1A]">AI for Equitable Education Access</span> &bull; Open Curriculum Grounded Knowledge & Multi-Role Isolated Portal
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span>National Open Curriculum Core (Physics, Chemistry, Maths, Biology)</span>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#1A1A1A] selection:bg-black selection:text-white font-sans">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
        currentUser={currentUser}
        currentStudent={currentStudent}
        currentTeacher={currentTeacher}
        currentClassInfo={currentClassInfo}
        isAiConnected={isAiConnected}
        onLogout={handleLogout}
      />

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
            onNavigateToTutor={() => setActiveTab("tutor")}
            onNavigateToPractice={() => setActiveTab("practice")}
          />
        )}

        {/* Institutional Community Forum */}
        {activeTab === "community" && (
          <CommunityForum
            currentUser={currentUser}
            currentStudent={currentStudent}
            currentTeacher={currentTeacher}
            onNavigateToTutor={() => setActiveTab("tutor")}
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
            onNavigateToTutor={() => setActiveTab("tutor")}
            onNavigateToPractice={() => setActiveTab("practice")}
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
            <span>Open Educational Curriculum Standards</span>
            <span className="text-[#E5E7EB]">|</span>
            <span className="text-black font-semibold">Strict Privacy Isolation</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
