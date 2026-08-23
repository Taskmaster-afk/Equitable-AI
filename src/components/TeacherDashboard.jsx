import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Layers,
  KeyRound,
  Plus,
  Copy,
  Check,
  Calendar,
  UserPlus,
  Send,
  Users,
  Bell,
  Trash2,
  Megaphone,
  BookOpen,
  ShieldCheck,
  Mail,
  Clock
} from "lucide-react";
import { api } from "../services/api";

export const TeacherDashboard = ({
  students,
  onSelectStudent,
  currentTeacher
}) => {
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [selectedClassCode, setSelectedClassCode] = useState("all");
  const [flaggedStudents, setFlaggedStudents] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [classOverview, setClassOverview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeViewTab, setActiveViewTab] = useState("triage");
  const [selectedTopicForPlan, setSelectedTopicForPlan] = useState(null);
  const [generatedLessonPlan, setGeneratedLessonPlan] = useState(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newGradeLevel, setNewGradeLevel] = useState("Class 10");
  const [newStream, setNewStream] = useState("Science & Mathematics");
  const [copiedCode, setCopiedCode] = useState(null);

  // Student Invites & Section State
  const [invites, setInvites] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteClassCode, setInviteClassCode] = useState("");
  const [inviteSection, setInviteSection] = useState("Section A");
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [inviteStatus, setInviteStatus] = useState(null);
  const [classRoster, setClassRoster] = useState([]);
  const [selectedSectionFilter, setSelectedSectionFilter] = useState("all");

  // Classroom Announcements State
  const [announcements, setAnnouncements] = useState([]);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");
  const [announcementSection, setAnnouncementSection] = useState("all");
  const [announcementPriority, setAnnouncementPriority] = useState("normal");
  const [isPostingAnnouncement, setIsPostingAnnouncement] = useState(false);
  const [announcementStatus, setAnnouncementStatus] = useState(null);
  useEffect(() => {
    loadClassesAndInsights();
    loadInvites();
    loadAnnouncements();
    if (selectedClassCode && selectedClassCode !== "all") {
      loadRoster(selectedClassCode);
    }
  }, [selectedClassCode, currentTeacher?.id]);

  const loadInvites = async () => {
    try {
      const res = await api.getTeacherInvites(currentTeacher?.id);
      setInvites(res?.invites || []);
    } catch (err) {
      console.error("Failed to load invites:", err);
    }
  };

  const loadAnnouncements = async () => {
    const code = selectedClassCode !== "all" ? selectedClassCode : (teacherClasses[0]?.classCode || "KV-10A");
    if (!code) return;
    try {
      const res = await api.getClassAnnouncements(code);
      setAnnouncements(res?.announcements || []);
    } catch (err) {
      console.error("Failed to load announcements:", err);
    }
  };

  const loadRoster = async (code) => {
    try {
      const res = await api.getClassStudents(code);
      setClassRoster(res?.students || []);
    } catch (err) {
      console.error("Failed to load roster:", err);
    }
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setIsSendingInvite(true);
    setInviteStatus(null);
    try {
      const targetCode = inviteClassCode || selectedClassCode !== "all" ? (inviteClassCode || selectedClassCode) : (teacherClasses[0]?.classCode || "KV-10A");
      const res = await api.inviteStudent({
        classCode: targetCode,
        studentEmail: inviteEmail.trim(),
        studentName: inviteName.trim(),
        section: inviteSection,
        teacherId: currentTeacher?.id,
        teacherName: currentTeacher?.name
      });
      setInviteStatus({ type: "success", text: res.message || "Invitation sent successfully!" });
      setInviteEmail("");
      setInviteName("");
      loadInvites();
      setTimeout(() => {
        setShowInviteModal(false);
        setInviteStatus(null);
      }, 2000);
    } catch (err) {
      setInviteStatus({ type: "error", text: err.message || "Failed to send invite" });
    } finally {
      setIsSendingInvite(false);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementContent.trim()) return;
    setIsPostingAnnouncement(true);
    setAnnouncementStatus(null);
    try {
      const targetCode = selectedClassCode !== "all" ? selectedClassCode : (teacherClasses[0]?.classCode || "KV-10A");
      const res = await api.createAnnouncement(targetCode, {
        title: announcementTitle.trim(),
        content: announcementContent.trim(),
        section: announcementSection,
        priority: announcementPriority,
        teacherId: currentTeacher?.id,
        teacherName: currentTeacher?.name
      });
      setAnnouncementStatus({ type: "success", text: "Announcement broadcasted successfully!" });
      setAnnouncementTitle("");
      setAnnouncementContent("");
      loadAnnouncements();
      setTimeout(() => {
        setShowAnnouncementModal(false);
        setAnnouncementStatus(null);
      }, 2000);
    } catch (err) {
      setAnnouncementStatus({ type: "error", text: err.message || "Failed to broadcast announcement" });
    } finally {
      setIsPostingAnnouncement(false);
    }
  };

  const handleDeleteAnnouncement = async (annId) => {
    const targetCode = selectedClassCode !== "all" ? selectedClassCode : (teacherClasses[0]?.classCode || "KV-10A");
    try {
      await api.deleteAnnouncement(targetCode, annId);
      loadAnnouncements();
    } catch (err) {
      console.error("Failed to delete announcement:", err);
    }
  };

  const loadClassesAndInsights = async () => {
    setIsLoading(true);
    try {
      const teacherId = currentTeacher?.id;
      const [classesRes, insightsRes] = await Promise.all([
        api.getTeacherClasses(teacherId),
        api.getTeacherInsights(selectedClassCode, teacherId)
      ]);
      setTeacherClasses(classesRes?.classes || []);
      setFlaggedStudents(insightsRes?.flaggedStudents || []);
      setHeatmap(insightsRes?.heatmap || []);
      setClassOverview(insightsRes?.classOverview || null);
    } catch (err) {
      console.error("Failed to load teacher insights:", err);
      setTeacherClasses([]);
      setFlaggedStudents([]);
      setHeatmap([]);
    } finally {
      setIsLoading(false);
    }
  };
  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    try {
      const res = await api.createClass({
        className: newClassName,
        gradeLevel: newGradeLevel,
        stream: newStream,
        teacherId: currentTeacher?.id,
        teacherName: currentTeacher?.name || "Teacher",
        school: currentTeacher?.school || currentTeacher?.institute || "School"
      });
      setShowCreateClassModal(false);
      setNewClassName("");
      const updatedClasses = await api.getTeacherClasses(currentTeacher?.id);
      setTeacherClasses(updatedClasses.classes || []);
      setSelectedClassCode(res.classInfo.classCode);
    } catch (err) {
      console.error("Error creating new class code:", err);
    }
  };
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };
  const handleGenerateLessonPlan = async (topic) => {
    setSelectedTopicForPlan(topic);
    setIsGeneratingPlan(true);
    setGeneratedLessonPlan(null);
    try {
      const res = await api.generateLessonPlan({
        topicName: topic.topicName,
        strugglingCount: topic.strugglingStudentsCount,
        weakConcepts: ["Curriculum Derivation Steps", "Formula sign conventions and graph plots"]
      });
      setGeneratedLessonPlan(res.lessonPlan);
    } catch (err) {
      console.error("Error generating lesson plan:", err);
    } finally {
      setIsGeneratingPlan(false);
    }
  };
  return <div id="teacher-dashboard-container" className="max-w-7xl mx-auto px-4 sm:px-8 py-5">
      {
    /* Streamlined Header with Class Filter & Actions */
  }
      <div className="bg-white border border-[#E5E7EB] p-4 sm:p-5 mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold">
              Teacher Classroom Radar
            </span>
            <span className="text-[#E5E7EB]">&bull;</span>
            <span className="text-xs font-semibold text-[#1A1A1A]">
              {currentTeacher?.name || "Dr. Rajesh Varma"}
            </span>
            <span className="text-[#E5E7EB]">&bull;</span>
            <span className="text-xs text-[#4B5563] font-medium">
              🏫 {currentTeacher?.school || currentTeacher?.institute || "Kendriya Vidyalaya No. 1"}
            </span>
          </div>
          <h2 className="text-lg font-bold text-[#1A1A1A] tracking-tight">
            Student Monitoring & Diagnostic Intervention
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Monitor students registered under your class codes. Class privacy is strictly isolated between students.
          </p>
        </div>        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Class Code Filter Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-[#9CA3AF]">Class:</span>
            <select
              value={selectedClassCode}
              onChange={(e) => setSelectedClassCode(e.target.value)}
              className="bg-[#F8F9FA] border border-[#E5E7EB] px-2.5 py-1.5 text-xs font-bold text-[#1A1A1A] outline-none focus:border-black"
            >
              <option value="all">All Assigned Classes ({teacherClasses.length})</option>
              {teacherClasses.map((c) => (
                <option key={c.classCode} value={c.classCode}>
                  [{c.classCode}] {c.className} ({c.enrolledCount} students)
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setInviteClassCode(selectedClassCode !== "all" ? selectedClassCode : (teacherClasses[0]?.classCode || ""));
              setShowInviteModal(true);
            }}
            className="clean-button-primary py-1.5 px-3 text-xs flex items-center gap-1.5 bg-indigo-600 border-indigo-600 hover:bg-indigo-700 text-white"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite Student</span>
          </button>

          <button
            onClick={() => setShowAnnouncementModal(true)}
            className="clean-button-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
          >
            <Megaphone className="w-3.5 h-3.5 text-amber-700" />
            <span>Broadcast Notice</span>
          </button>

          <button
            onClick={() => setShowCreateClassModal(true)}
            className="clean-button-secondary py-1.5 px-3 text-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Class</span>
          </button>

          <button
            onClick={() => {
              loadClassesAndInsights();
              loadInvites();
              loadAnnouncements();
            }}
            className="clean-button-secondary py-1.5 px-3 text-xs"
            title="Refresh Diagnostic Signals"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Class Codes Quick Distributor Strip */}
      <div className="bg-[#F8F9FA] border border-[#E5E7EB] p-3 mb-5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-black" />
          <span className="font-bold text-[#1A1A1A]">Active Class Codes to Share with Students:</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {teacherClasses.map((c) => (
            <div
              key={c.classCode}
              className="bg-white border border-[#E5E7EB] px-2.5 py-1 flex items-center gap-2 hover:border-[#9CA3AF] transition-colors"
            >
              <span className="font-mono font-bold text-black">{c.classCode}</span>
              <span className="text-[11px] text-[#6B7280]">({c.enrolledCount} enrolled)</span>
              <button
                onClick={() => handleCopyCode(c.classCode)}
                className="text-[#6B7280] hover:text-black transition-colors"
                title="Copy class code for students"
              >
                {copiedCode === c.classCode ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Summary KPI Strip */}
      {classOverview && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="p-3 bg-white border border-[#E5E7EB]">
            <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold block mb-1">Enrolled Students</span>
            <span className="text-xl font-bold text-[#1A1A1A] font-mono">{classOverview.totalEnrolled}</span>
            <span className="text-[10px] text-[#6B7280] block mt-0.5">In selected class</span>
          </div>

          <div className="p-3 bg-white border border-rose-200">
            <span className="text-[10px] uppercase tracking-wider text-rose-700 font-bold block mb-1">Needs Attention</span>
            <span className="text-xl font-bold text-rose-700 font-mono">{classOverview.needingIntervention}</span>
            <span className="text-[10px] text-rose-600 block mt-0.5">Identified concept gaps</span>
          </div>

          <div className="p-3 bg-white border border-[#E5E7EB]">
            <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold block mb-1">Pending Invites</span>
            <span className="text-xl font-bold text-indigo-700 font-mono">{invites.filter(i => i.status === "pending").length}</span>
            <span className="text-[10px] text-[#6B7280] block mt-0.5">Awaiting student join</span>
          </div>

          <div className="p-3 bg-white border border-[#E5E7EB]">
            <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold block mb-1">Broadcast Notices</span>
            <span className="text-xl font-bold text-black font-mono">{announcements.length}</span>
            <span className="text-[10px] text-[#6B7280] block mt-0.5">Official circulars</span>
          </div>
        </div>
      )}

      {/* View Mode Segment Switcher */}
      <div className="bg-white border border-[#E5E7EB] p-1 mb-4 flex gap-1 flex-wrap">
        <button
          onClick={() => setActiveViewTab("triage")}
          className={`py-1.5 px-3 text-xs font-semibold transition-colors flex items-center gap-1.5 ${activeViewTab === "triage" ? "bg-black text-white" : "text-[#6B7280] hover:text-black"}`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Student Triage ({flaggedStudents.length})</span>
        </button>

        <button
          onClick={() => setActiveViewTab("sections")}
          className={`py-1.5 px-3 text-xs font-semibold transition-colors flex items-center gap-1.5 ${activeViewTab === "sections" ? "bg-black text-white" : "text-[#6B7280] hover:text-black"}`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Student Invites & Sections ({invites.length} invites)</span>
        </button>

        <button
          onClick={() => setActiveViewTab("announcements")}
          className={`py-1.5 px-3 text-xs font-semibold transition-colors flex items-center gap-1.5 ${activeViewTab === "announcements" ? "bg-black text-white" : "text-[#6B7280] hover:text-black"}`}
        >
          <Megaphone className="w-3.5 h-3.5" />
          <span>Official Announcements ({announcements.length})</span>
        </button>

        <button
          onClick={() => setActiveViewTab("heatmap")}
          className={`py-1.5 px-3 text-xs font-semibold transition-colors flex items-center gap-1.5 ${activeViewTab === "heatmap" ? "bg-black text-white" : "text-[#6B7280] hover:text-black"}`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>NCERT Mastery Heatmap ({heatmap.length})</span>
        </button>

        <button
          onClick={() => setActiveViewTab("classes")}
          className={`py-1.5 px-3 text-xs font-semibold transition-colors flex items-center gap-1.5 ${activeViewTab === "classes" ? "bg-black text-white" : "text-[#6B7280] hover:text-black"}`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Class Details ({teacherClasses.length})</span>
        </button>
      </div>

      {/* View 1: Student Triage List */}
      {activeViewTab === "triage" && (
        <div className="space-y-3">
          {flaggedStudents.length === 0 ? (
            <div className="bg-white border border-[#E5E7EB] p-8 text-center text-xs text-[#6B7280]">
              No registered students found for this class code yet. Click <strong>Invite Student</strong> to onboard students to their section!
            </div>
          ) : (
            flaggedStudents.map((flag) => {
              const isHigh = flag.severity === "high_priority";
              const isMedium = flag.severity === "medium_attention";
              const isExpanded = expandedStudentId === flag.studentId;
              return (
                <div
                  key={flag.studentId}
                  className={`border text-xs transition-colors bg-white ${isHigh ? "border-rose-300" : isMedium ? "border-amber-200" : "border-[#E5E7EB]"}`}
                >
                  <div
                    onClick={() => setExpandedStudentId(isExpanded ? null : flag.studentId)}
                    className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#F8F9FA]"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${isHigh ? "bg-rose-600" : isMedium ? "bg-amber-500" : "bg-emerald-500"}`} />

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-[#1A1A1A] text-sm">
                            {flag.studentName}
                          </h4>
                          {flag.classCode && (
                            <span className="bg-[#F0F2F5] text-[#374151] border border-[#E5E7EB] px-1.5 py-0.2 text-[10px] font-mono font-bold">
                              {flag.classCode}
                            </span>
                          )}
                          <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.2 text-[10px] font-bold">
                            {flag.section || "Section A"}
                          </span>
                        </div>
                        <p className="text-[#6B7280] text-xs">
                          {flag.studentClass || flag.gradeLevel} &bull; {flag.primaryIssue}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${isHigh ? "bg-rose-100 text-rose-800" : isMedium ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
                        {isHigh ? "High Priority" : isMedium ? "Needs Review" : "On Track"}
                      </span>

                      <div className="text-right hidden sm:block">
                        <span className="font-bold text-[#1A1A1A] font-mono">{flag.practiceAccuracyRate}%</span>
                        <span className="text-[10px] text-[#9CA3AF] block">Accuracy</span>
                      </div>

                      {isExpanded ? <ChevronUp className="w-4 h-4 text-[#6B7280]" /> : <ChevronDown className="w-4 h-4 text-[#6B7280]" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 border-t border-[#F0F2F5] bg-[#FAFAFA] space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#9CA3AF] block mb-1">
                            Diagnostic Evidence Rationale
                          </span>
                          <p className="text-xs text-[#374151] leading-relaxed">
                            {flag.plainLanguageReason}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#9CA3AF] block mb-1">
                            Recommended Pedagogical Intervention
                          </span>
                          <p className="text-xs text-[#374151] leading-relaxed">
                            {flag.suggestedIntervention}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* View 2: Student Invites & Section Roster */}
      {activeViewTab === "sections" && (
        <div className="space-y-5">
          {/* Section Toolbar */}
          <div className="bg-white border border-[#E5E7EB] p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#1A1A1A]">Filter Section:</span>
              <div className="flex gap-1.5">
                {["all", "Section A", "Section B", "Section C", "Section D"].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setSelectedSectionFilter(sec)}
                    className={`px-2.5 py-1 text-xs font-bold border transition-colors ${selectedSectionFilter === sec ? "bg-black text-white border-black" : "bg-[#F8F9FA] text-[#4B5563] border-[#E5E7EB] hover:border-black"}`}
                  >
                    {sec === "all" ? "All Sections" : sec}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setInviteClassCode(selectedClassCode !== "all" ? selectedClassCode : (teacherClasses[0]?.classCode || ""));
                setShowInviteModal(true);
              }}
              className="clean-button-primary py-1.5 px-3 text-xs flex items-center gap-1.5 bg-indigo-600 border-indigo-600 text-white"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Send New Student Invite</span>
            </button>
          </div>

          {/* Pending Invitations Table */}
          <div className="bg-white border border-[#E5E7EB] p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-[#1A1A1A]">Sent Student Invitations ({invites.length})</h3>
              </div>
              <span className="text-xs text-[#6B7280]">
                {invites.filter(i => i.status === "pending").length} Pending &bull; {invites.filter(i => i.status === "accepted").length} Joined
              </span>
            </div>

            {invites.length === 0 ? (
              <p className="text-xs text-[#6B7280] py-4 text-center">
                No student invitations sent yet. Click <strong>+ Send New Student Invite</strong> to invite students by email to a section.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] text-[#6B7280] uppercase text-[10px] font-bold">
                      <th className="py-2 px-3">Student Name</th>
                      <th className="py-2 px-3">Email Address</th>
                      <th className="py-2 px-3">Class</th>
                      <th className="py-2 px-3">Section</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3">Sent At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F2F5]">
                    {invites.map((inv) => (
                      <tr key={inv.id} className="hover:bg-[#F9FAFB]">
                        <td className="py-2.5 px-3 font-semibold text-[#1A1A1A]">{inv.studentName || "Student"}</td>
                        <td className="py-2.5 px-3 font-mono text-[#4B5563]">{inv.studentEmail}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-black">{inv.classCode}</td>
                        <td className="py-2.5 px-3">
                          <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 font-bold text-[10px] border border-indigo-200">
                            {inv.section || "Section A"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          {inv.status === "accepted" ? (
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 font-bold text-[10px] border border-emerald-200 flex items-center gap-1 w-fit">
                              <Check className="w-3 h-3" /> Joined
                            </span>
                          ) : (
                            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 font-bold text-[10px] border border-amber-200 flex items-center gap-1 w-fit">
                              <Clock className="w-3 h-3" /> Pending
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-[#9CA3AF] text-[11px]">
                          {inv.invitedAt ? new Date(inv.invitedAt).toLocaleDateString() : "Recently"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Enrolled Students Roster by Section */}
          <div className="bg-white border border-[#E5E7EB] p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-black" />
                <h3 className="font-bold text-sm text-[#1A1A1A]">
                  Enrolled Students by Section ({flaggedStudents.filter(s => selectedSectionFilter === "all" || s.section === selectedSectionFilter || (!s.section && selectedSectionFilter === "Section A")).length})
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {flaggedStudents
                .filter(s => selectedSectionFilter === "all" || s.section === selectedSectionFilter || (!s.section && selectedSectionFilter === "Section A"))
                .map((student) => (
                  <div key={student.studentId} className="border border-[#E5E7EB] p-3 bg-[#F9FAFB] space-y-1.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-[#1A1A1A]">{student.studentName}</h4>
                        <span className="text-[10px] text-[#6B7280] font-mono">{student.email || student.studentId}</span>
                      </div>
                      <span className="bg-indigo-100 text-indigo-800 font-bold text-[10px] px-2 py-0.5 border border-indigo-200">
                        {student.section || "Section A"}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#4B5563] pt-1 border-t border-[#E5E7EB] flex items-center justify-between">
                      <span>Class: <strong>{student.studentClass || student.gradeLevel}</strong></span>
                      <span>Accuracy: <strong>{student.practiceAccuracyRate}%</strong></span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* View 3: Classroom Announcements */}
      {activeViewTab === "announcements" && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E5E7EB] p-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-[#1A1A1A]">Official Teacher Announcements Channel</h3>
              <p className="text-xs text-[#6B7280]">
                Broadcast formal circulars, homework notices, and exam alerts. Only teachers can post here.
              </p>
            </div>

            <button
              onClick={() => setShowAnnouncementModal(true)}
              className="clean-button-primary py-1.5 px-3 text-xs flex items-center gap-1.5 bg-amber-600 border-amber-600 hover:bg-amber-700 text-white"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>+ Broadcast Announcement</span>
            </button>
          </div>

          <div className="space-y-3">
            {announcements.length === 0 ? (
              <div className="bg-white border border-[#E5E7EB] p-8 text-center text-xs text-[#6B7280]">
                No announcements broadcasted yet. Click <strong>+ Broadcast Announcement</strong> to post notices to students!
              </div>
            ) : (
              announcements.map((ann) => {
                const isUrgent = ann.priority === "urgent";
                const isImportant = ann.priority === "important";
                return (
                  <div
                    key={ann.id}
                    className={`border p-4 bg-white space-y-2 ${isUrgent ? "border-rose-400 bg-rose-50/20" : isImportant ? "border-amber-300 bg-amber-50/20" : "border-[#E5E7EB]"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${isUrgent ? "bg-rose-100 text-rose-800" : isImportant ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}>
                            {ann.priority || "Notice"}
                          </span>
                          <span className="bg-[#F0F2F5] text-[#374151] border border-[#E5E7EB] px-1.5 py-0.2 text-[10px] font-mono font-bold">
                            Class: {ann.classCode}
                          </span>
                          <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.2 text-[10px] font-bold">
                            {ann.section === "all" ? "All Sections" : ann.section}
                          </span>
                          <span className="text-[11px] text-[#9CA3AF]">
                            &bull; {ann.createdAt || "Just now"}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-[#1A1A1A]">{ann.title}</h4>
                      </div>

                      <button
                        onClick={() => handleDeleteAnnouncement(ann.id)}
                        className="text-[#9CA3AF] hover:text-rose-600 transition-colors p-1"
                        title="Delete Announcement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-[#374151] leading-relaxed whitespace-pre-wrap">
                      {ann.content}
                    </p>

                    <div className="pt-2 border-t border-[#F0F2F5] text-[11px] text-[#6B7280] flex items-center justify-between">
                      <span>Posted by: <strong>{ann.teacherName || currentTeacher?.name}</strong></span>
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Teacher Verified Official Notice
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* View 4: NCERT Mastery Heatmap */}
      {activeViewTab === "heatmap" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {heatmap.map((topic) => (
              <div key={topic.topicId} className="bg-white border border-[#E5E7EB] p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-bold text-xs text-[#1A1A1A]">{topic.topicName}</h4>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 ${topic.cohortMasteryScore < 60 ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"}`}>
                    {topic.cohortMasteryScore}%
                  </span>
                </div>
                <p className="text-[11px] text-[#6B7280]">{topic.subject} &bull; {topic.strugglingStudentsCount} struggling students</p>
                <button
                  onClick={() => handleGenerateLessonPlan(topic)}
                  disabled={isGeneratingPlan}
                  className="w-full clean-button-secondary py-1 text-[11px] flex items-center justify-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  <span>Generate AI Review Plan</span>
                </button>
              </div>
            ))}
          </div>

          {generatedLessonPlan && selectedTopicForPlan && (
            <div className="bg-white border-2 border-black p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#9CA3AF]">AI Remediation Lesson Plan (Gemini Grounded)</span>
                  <h3 className="text-base font-bold text-[#1A1A1A]">15-Minute Concept Review: {selectedTopicForPlan.topicName}</h3>
                </div>
                <button onClick={() => setGeneratedLessonPlan(null)} className="text-xs text-[#6B7280] hover:text-black font-semibold">Close Plan</button>
              </div>
              <div className="text-xs text-[#374151] leading-relaxed whitespace-pre-wrap font-sans max-h-96 overflow-y-auto p-2 bg-[#FAFAFA] border border-[#E5E7EB]">
                {generatedLessonPlan}
              </div>
            </div>
          )}
        </div>
      )}

      {/* View 5: Class Timetables & Details */}
      {activeViewTab === "classes" && (
        <div className="space-y-4">
          {/* Faculty Department & Academic Leadership Card */}
          <div className="bg-[#F8F9FA] border border-[#E5E7EB] p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <Building className="w-5 h-5 text-black shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-[#9CA3AF] block">Faculty Department & Subject Leadership</span>
                <h3 className="font-bold text-sm text-[#1A1A1A]">
                  {currentTeacher?.department || "Senior Science & Mathematics Department"}
                </h3>
              </div>
            </div>
            <div className="text-xs text-[#4B5563]">
              <span>Institution: <strong>{currentTeacher?.school || currentTeacher?.institute || "Kendriya Vidyalaya No. 1"}</strong></span>
              <span className="mx-2 text-[#D1D5DB]">&bull;</span>
              <span>Faculty Lead: <strong>{currentTeacher?.name || "Teacher"}</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teacherClasses.map((c) => (
              <div key={c.classCode} className="bg-white border border-[#E5E7EB] p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="bg-black text-white text-[10px] font-mono font-bold px-2 py-0.5">
                      CODE: {c.classCode}
                    </span>
                    <h3 className="font-bold text-sm text-[#1A1A1A] mt-1.5">{c.className}</h3>
                    <p className="text-xs text-[#6B7280]">{c.school} &bull; {c.stream}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-1 border border-emerald-200">
                    {c.enrolledCount} Students Enrolled
                  </span>
                </div>

                <div className="pt-2 border-t border-[#F0F2F5] text-xs text-[#4B5563] space-y-2">
                  <div><strong>Curriculum:</strong> {c.curriculum || "NCERT National Curriculum"}</div>
                  <div>
                    <strong className="block mb-1">Subjects (3rd Row / Curriculum Track):</strong>
                    <div className="flex flex-wrap gap-1">
                      {(c.subjects && c.subjects.length > 0 ? c.subjects : [
                        "Physics",
                        "Chemistry",
                        "Mathematics",
                        "Biology",
                        "Computer Science & AI",
                        "English & Communication",
                        "Social Science",
                        "Environmental Studies"
                      ]).map((sub) => (
                        <span key={sub} className="bg-[#F3F4F6] border border-[#E5E7EB] text-[#1A1A1A] px-2 py-0.5 text-[11px] font-semibold">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="pt-1 text-[11px] text-[#6B7280]">
                    <strong>Active Sections:</strong> Section A, Section B, Section C, Section D
                  </div>
                </div>

                <button
                  onClick={() => handleCopyCode(c.classCode)}
                  className="w-full clean-button-secondary py-1.5 text-xs flex items-center justify-center gap-1.5"
                >
                  {copiedCode === c.classCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied Code to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Class Code ({c.classCode}) for Students</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Invite Student to Section */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-black max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-[#1A1A1A]">Invite Student & Assign Section</h3>
              </div>
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteStatus(null);
                }}
                className="text-[#6B7280] hover:text-black font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {inviteStatus && (
              <div className={`p-2.5 text-xs font-bold ${inviteStatus.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"}`}>
                {inviteStatus.text}
              </div>
            )}

            <form onSubmit={handleSendInvite} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#374151]">Student Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. aarav.sharma@student.edu.in"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-[#F9FAFB] border border-[#E5E7EB] px-3 py-2 text-xs text-[#1A1A1A] outline-none focus:border-black"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#374151]">Student Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Aarav Sharma"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full bg-[#F9FAFB] border border-[#E5E7EB] px-3 py-2 text-xs text-[#1A1A1A] outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-[#374151]">Target Class Code</label>
                  <select
                    value={inviteClassCode}
                    onChange={(e) => setInviteClassCode(e.target.value)}
                    className="w-full bg-[#F9FAFB] border border-[#E5E7EB] px-2.5 py-2 text-xs text-[#1A1A1A] outline-none focus:border-black font-mono font-bold"
                  >
                    {teacherClasses.map((c) => (
                      <option key={c.classCode} value={c.classCode}>
                        [{c.classCode}] {c.className}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#374151]">Assign Section *</label>
                  <select
                    value={inviteSection}
                    onChange={(e) => setInviteSection(e.target.value)}
                    className="w-full bg-[#F9FAFB] border border-[#E5E7EB] px-2.5 py-2 text-xs text-[#1A1A1A] outline-none focus:border-black font-bold"
                  >
                    <option value="Section A">Section A</option>
                    <option value="Section B">Section B</option>
                    <option value="Section C">Section C</option>
                    <option value="Section D">Section D</option>
                  </select>
                </div>
              </div>

              <p className="text-[11px] text-[#6B7280] leading-relaxed pt-1">
                When the student logs into their dashboard, they will receive an instant <strong>Classroom Invitation card</strong> to join this class and section.
              </p>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 clean-button-secondary py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingInvite}
                  className="flex-1 clean-button-primary py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3 h-3" />
                  <span>{isSendingInvite ? "Sending..." : "Send Invitation"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Broadcast Official Announcement */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-black max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-sm text-[#1A1A1A]">Broadcast Classroom Announcement</h3>
              </div>
              <button
                onClick={() => {
                  setShowAnnouncementModal(false);
                  setAnnouncementStatus(null);
                }}
                className="text-[#6B7280] hover:text-black font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {announcementStatus && (
              <div className={`p-2.5 text-xs font-bold ${announcementStatus.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"}`}>
                {announcementStatus.text}
              </div>
            )}

            <form onSubmit={handleCreateAnnouncement} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#374151]">Announcement Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mid-Term Physics Formula Sheet & Revision Session"
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  className="w-full bg-[#F9FAFB] border border-[#E5E7EB] px-3 py-2 text-xs text-[#1A1A1A] outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-[#374151]">Target Section</label>
                  <select
                    value={announcementSection}
                    onChange={(e) => setAnnouncementSection(e.target.value)}
                    className="w-full bg-[#F9FAFB] border border-[#E5E7EB] px-2.5 py-2 text-xs text-[#1A1A1A] outline-none focus:border-black"
                  >
                    <option value="all">All Sections</option>
                    <option value="Section A">Section A only</option>
                    <option value="Section B">Section B only</option>
                    <option value="Section C">Section C only</option>
                    <option value="Section D">Section D only</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#374151]">Notice Priority</label>
                  <select
                    value={announcementPriority}
                    onChange={(e) => setAnnouncementPriority(e.target.value)}
                    className="w-full bg-[#F9FAFB] border border-[#E5E7EB] px-2.5 py-2 text-xs text-[#1A1A1A] outline-none focus:border-black font-bold"
                  >
                    <option value="normal">Normal Circular</option>
                    <option value="important">Important Notice</option>
                    <option value="urgent">Urgent / Exam Alert</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#374151]">Announcement Details & Instructions *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Write the circular or notice instructions here for all enrolled students..."
                  value={announcementContent}
                  onChange={(e) => setAnnouncementContent(e.target.value)}
                  className="w-full bg-[#F9FAFB] border border-[#E5E7EB] p-2.5 text-xs text-[#1A1A1A] outline-none focus:border-black"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAnnouncementModal(false)}
                  className="flex-1 clean-button-secondary py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPostingAnnouncement}
                  className="flex-1 clean-button-primary py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-1.5"
                >
                  <Megaphone className="w-3 h-3" />
                  <span>{isPostingAnnouncement ? "Broadcasting..." : "Broadcast Notice"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create New Class Code */}
      {showCreateClassModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-black max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-black" />
                <h3 className="font-bold text-sm text-[#1A1A1A]">Generate New Class Code</h3>
              </div>
              <button
                onClick={() => setShowCreateClassModal(false)}
                className="text-[#6B7280] hover:text-black font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#374151]">Class Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 10 - Science & Mathematics"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full bg-[#F9FAFB] border border-[#E5E7EB] px-3 py-2 text-xs text-[#1A1A1A] outline-none focus:border-black"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#374151]">Grade Level</label>
                <select
                  value={newGradeLevel}
                  onChange={(e) => setNewGradeLevel(e.target.value)}
                  className="w-full bg-[#F9FAFB] border border-[#E5E7EB] px-3 py-2 text-xs text-[#1A1A1A] outline-none focus:border-black"
                >
                  <option value="Class 12">Class 12 (Senior Secondary)</option>
                  <option value="Class 11">Class 11 (Senior Secondary)</option>
                  <option value="Class 10">Class 10 (Secondary Standard)</option>
                  <option value="Class 9">Class 9 (Secondary Standard)</option>
                  <option value="Class 8">Class 8 (Middle School)</option>
                  <option value="Class 7">Class 7 (Middle School)</option>
                  <option value="Class 6">Class 6 (Middle School)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#374151]">Academic Stream & Curriculum Track</label>
                <select
                  value={newStream}
                  onChange={(e) => setNewStream(e.target.value)}
                  className="w-full bg-[#F9FAFB] border border-[#E5E7EB] px-3 py-2 text-xs text-[#1A1A1A] outline-none focus:border-black"
                >
                  <option value="Science & Mathematics (Physics, Chemistry, Math, Biology)">Science & Mathematics (Physics, Chemistry, Math, Biology)</option>
                  <option value="Physics, Chemistry & Computer Science">Physics, Chemistry & Computer Science</option>
                  <option value="General Science, EVS & Social Studies">General Science, EVS & Social Studies</option>
                  <option value="Mathematics, Statistics & Informatics">Mathematics, Statistics & Informatics</option>
                  <option value="Languages, English & Environmental Science">Languages, English & Environmental Science</option>
                </select>
              </div>

              {/* 3rd Row: Additional Subjects Grid */}
              <div className="space-y-1">
                <label className="font-bold text-[#374151]">Enrolled Subjects (3rd Row / Core Curriculum)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                  {[
                    "Physics",
                    "Chemistry",
                    "Mathematics",
                    "Biology",
                    "Computer Science",
                    "English",
                    "Social Science",
                    "Environmental Studies"
                  ].map((sub) => (
                    <span
                      key={sub}
                      className="bg-[#F8F9FA] border border-[#E5E7EB] px-2 py-1 text-[11px] font-semibold text-[#1A1A1A] text-center"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-[#6B7280] leading-relaxed pt-1">
                A unique NCERT code (e.g. NCERT-XXX) will be provisioned. Students registering with this code or accepting your invite will immediately join your class and sections.
              </p>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateClassModal(false)}
                  className="flex-1 clean-button-secondary py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 clean-button-primary py-2 text-xs font-bold"
                >
                  Generate Code & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>;
};

export default TeacherDashboard;
