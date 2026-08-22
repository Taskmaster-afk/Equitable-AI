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
  Calendar
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
  const [newGradeLevel, setNewGradeLevel] = useState("Grade 11-12");
  const [newStream, setNewStream] = useState("Science (PCM/PCB)");
  const [copiedCode, setCopiedCode] = useState(null);
  useEffect(() => {
    loadClassesAndInsights();
  }, [selectedClassCode]);
  const loadClassesAndInsights = async () => {
    setIsLoading(true);
    try {
      const [classesRes, insightsRes] = await Promise.all([
        api.getTeacherClasses(currentTeacher?.id || "teacher-1"),
        api.getTeacherInsights(selectedClassCode)
      ]);
      setTeacherClasses(classesRes.classes);
      setFlaggedStudents(insightsRes.flaggedStudents);
      setHeatmap(insightsRes.heatmap);
      setClassOverview(insightsRes.classOverview);
    } catch (err) {
      console.error("Failed to load teacher insights:", err);
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
        teacherId: currentTeacher?.id || "teacher-1",
        teacherName: currentTeacher?.name || "Dr. Rajesh Varma",
        school: currentTeacher?.school || "Kendriya Vidyalaya No. 1"
      });
      setShowCreateClassModal(false);
      setNewClassName("");
      const updatedClasses = await api.getTeacherClasses(currentTeacher?.id);
      setTeacherClasses(updatedClasses.classes);
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
              {currentTeacher?.name || "Dr. Rajesh Varma"} ({currentTeacher?.department || "Senior Science HOD"})
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
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {
    /* Class Code Filter Dropdown */
  }
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-[#9CA3AF]">Class:</span>
            <select
    value={selectedClassCode}
    onChange={(e) => setSelectedClassCode(e.target.value)}
    className="bg-[#F8F9FA] border border-[#E5E7EB] px-2.5 py-1.5 text-xs font-bold text-[#1A1A1A] outline-none focus:border-black"
  >
              <option value="all">All Assigned Classes ({teacherClasses.length})</option>
              {teacherClasses.map((c) => <option key={c.classCode} value={c.classCode}>
                  [{c.classCode}] {c.className} ({c.enrolledCount} students)
                </option>)}
            </select>
          </div>

          <button
    onClick={() => setShowCreateClassModal(true)}
    className="clean-button-primary py-1.5 px-3 text-xs flex items-center gap-1.5"
  >
            <Plus className="w-3.5 h-3.5" />
            <span>Generate Class Code</span>
          </button>

          <button
    onClick={loadClassesAndInsights}
    className="clean-button-secondary py-1.5 px-3 text-xs"
    title="Refresh Diagnostic Signals"
  >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {
    /* Class Codes Quick Distributor Strip */
  }
      <div className="bg-[#F8F9FA] border border-[#E5E7EB] p-3 mb-5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-black" />
          <span className="font-bold text-[#1A1A1A]">Active Class Codes to Share with Students:</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {teacherClasses.map((c) => <div
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
                {copiedCode === c.classCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>)}
        </div>
      </div>

      {
    /* Summary KPI Strip */
  }
      {classOverview && <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
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
            <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold block mb-1">Doubts Grounded</span>
            <span className="text-xl font-bold text-[#1A1A1A] font-mono">{classOverview.totalDoubtsSolvedThisWeek}</span>
            <span className="text-[10px] text-[#6B7280] block mt-0.5">NCERT citations</span>
          </div>

          <div className="p-3 bg-white border border-[#E5E7EB]">
            <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold block mb-1">Practice Accuracy</span>
            <span className="text-xl font-bold text-emerald-700 font-mono">{classOverview.classAverageAccuracy}%</span>
            <span className="text-[10px] text-[#6B7280] block mt-0.5">Class average</span>
          </div>
        </div>}

      {
    /* View Mode Segment Switcher */
  }
      <div className="bg-white border border-[#E5E7EB] p-1 mb-4 flex gap-1 max-w-lg">
        <button
    onClick={() => setActiveViewTab("triage")}
    className={`flex-1 py-1.5 text-center text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${activeViewTab === "triage" ? "bg-black text-white" : "text-[#6B7280] hover:text-black"}`}
  >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Student Roster & Triage ({flaggedStudents.length})</span>
        </button>

        <button
    onClick={() => setActiveViewTab("heatmap")}
    className={`flex-1 py-1.5 text-center text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${activeViewTab === "heatmap" ? "bg-black text-white" : "text-[#6B7280] hover:text-black"}`}
  >
          <Layers className="w-3.5 h-3.5" />
          <span>NCERT Mastery Heatmap ({heatmap.length})</span>
        </button>

        <button
    onClick={() => setActiveViewTab("classes")}
    className={`flex-1 py-1.5 text-center text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${activeViewTab === "classes" ? "bg-black text-white" : "text-[#6B7280] hover:text-black"}`}
  >
          <Calendar className="w-3.5 h-3.5" />
          <span>Class Details ({teacherClasses.length})</span>
        </button>
      </div>

      {
    /* View 1: Student Triage List */
  }
      {activeViewTab === "triage" && <div className="space-y-3">
          {flaggedStudents.length === 0 ? <div className="bg-white border border-[#E5E7EB] p-8 text-center text-xs text-[#6B7280]">
              No registered students found for this class code yet. Share the code with students to register!
            </div> : flaggedStudents.map((flag) => {
    const isHigh = flag.severity === "high_priority";
    const isMedium = flag.severity === "medium_attention";
    const isExpanded = expandedStudentId === flag.studentId;
    return <div
      key={flag.studentId}
      className={`border text-xs transition-colors bg-white ${isHigh ? "border-rose-300" : isMedium ? "border-amber-200" : "border-[#E5E7EB]"}`}
    >
                  {
      /* Header Row */
    }
                  <div
      onClick={() => setExpandedStudentId(isExpanded ? null : flag.studentId)}
      className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#F8F9FA]"
    >
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${isHigh ? "bg-rose-600" : isMedium ? "bg-amber-500" : "bg-emerald-500"}`} />

                      <div>
                        <h4 className="font-bold text-[#1A1A1A] text-sm">
                          {flag.studentName}
                        </h4>
                        <p className="text-[#6B7280] text-xs">
                          {flag.gradeLevel} &bull; {flag.primaryIssue}
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

                  {
      /* Expandable Diagnostic Breakdown */
    }
                  {isExpanded && <div className="p-4 border-t border-[#F0F2F5] bg-[#FAFAFA] space-y-3">
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
                            Actionable Teacher Intervention
                          </span>
                          <p className="text-xs text-[#1A1A1A] font-medium leading-relaxed bg-white border border-[#E5E7EB] p-2.5">
                            {flag.suggestedIntervention}
                          </p>
                        </div>
                      </div>

                      {
      /* Weak Topics Tagging */
    }
                      {flag.weakTopics.length > 0 && <div>
                          <span className="text-[10px] uppercase font-bold text-[#9CA3AF] block mb-1">
                            Weak Subject Concepts:
                          </span>
                          <div className="flex gap-1.5 flex-wrap">
                            {flag.weakTopics.map((t, idx) => <span key={idx} className="bg-rose-50 border border-rose-200 text-rose-800 text-[11px] px-2 py-0.5">
                                {t}
                              </span>)}
                          </div>
                        </div>}

                      <div className="flex items-center justify-between pt-2 border-t border-[#E5E7EB]">
                        <span className="text-[11px] text-[#9CA3AF]">
                          Last active: {flag.lastActive} &bull; Doubts solved: {flag.doubtCountLast7Days}
                        </span>

                        <button
      onClick={() => onSelectStudent(flag.studentId)}
      className="clean-button-primary py-1 px-3 text-xs flex items-center gap-1"
    >
                          <span>Review Student Practice Profile</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>}
                </div>;
  })}
        </div>}

      {
    /* View 2: Curriculum Topic Heatmap */
  }
      {activeViewTab === "heatmap" && <div className="space-y-4">
          <div className="bg-white border border-[#E5E7EB] p-4">
            <h3 className="text-sm font-bold text-[#1A1A1A] mb-1">
              Class Concept Mastery & Remediation Planner
            </h3>
            <p className="text-xs text-[#6B7280] mb-4">
              Aggregated concept comprehension across all student practice sessions in the NCERT syllabus.
            </p>

            <div className="space-y-2.5">
              {heatmap.map((item) => <div
    key={item.topicId}
    className="p-3 bg-[#F8F9FA] border border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3 text-xs"
  >
                  <div className="space-y-0.5 max-w-md">
                    <span className="text-[10px] uppercase font-bold text-[#9CA3AF]">{item.subject}</span>
                    <h4 className="font-bold text-[#1A1A1A]">{item.topicName}</h4>
                    <p className="text-[11px] text-[#6B7280]">
                      {item.strugglingStudentsCount} of {item.totalStudents} students require scaffolding
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-mono font-bold text-sm text-[#1A1A1A]">{item.classAverageMastery}%</div>
                      <div className={`text-[10px] font-bold ${item.recommendedFocus === "Immediate Review Required" ? "text-rose-600" : item.recommendedFocus === "Reinforce Core Concepts" ? "text-amber-600" : "text-emerald-600"}`}>
                        {item.recommendedFocus}
                      </div>
                    </div>

                    <button
    onClick={() => handleGenerateLessonPlan(item)}
    disabled={isGeneratingPlan && selectedTopicForPlan?.topicId === item.topicId}
    className="clean-button-primary py-1.5 px-3 text-xs flex items-center gap-1.5 shrink-0"
  >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isGeneratingPlan && selectedTopicForPlan?.topicId === item.topicId ? "Generating Plan..." : "AI 15-Min Remediation"}</span>
                    </button>
                  </div>
                </div>)}
            </div>
          </div>

          {
    /* Generated Lesson Plan View */
  }
          {generatedLessonPlan && selectedTopicForPlan && <div className="bg-white border-2 border-black p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#9CA3AF]">
                    AI Remediation Lesson Plan (Gemini Grounded)
                  </span>
                  <h3 className="text-base font-bold text-[#1A1A1A]">
                    15-Minute Concept Review: {selectedTopicForPlan.topicName}
                  </h3>
                </div>
                <button
    onClick={() => setGeneratedLessonPlan(null)}
    className="text-xs text-[#6B7280] hover:text-black font-semibold"
  >
                  Close Plan
                </button>
              </div>

              <div className="text-xs text-[#374151] leading-relaxed whitespace-pre-wrap font-sans max-h-96 overflow-y-auto p-2 bg-[#FAFAFA] border border-[#E5E7EB]">
                {generatedLessonPlan}
              </div>
            </div>}
        </div>}

      {
    /* View 3: Class Overview, Timetable & Syllabus */
  }
      {activeViewTab === "classes" && <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teacherClasses.map((c) => <div key={c.classCode} className="bg-white border border-[#E5E7EB] p-4 space-y-3">
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

                <div className="pt-2 border-t border-[#F0F2F5] text-xs text-[#4B5563] space-y-1">
                  <div><strong>Curriculum:</strong> {c.curriculum}</div>
                  <div><strong>Subjects:</strong> {c.subjects.join(", ")}</div>
                  <div><strong>Timetable:</strong> {c.timetable?.length || 5} active day schedules</div>
                  <div><strong>Syllabus Units:</strong> {c.syllabus?.length || 6} units mapped</div>
                </div>

                <button
    onClick={() => handleCopyCode(c.classCode)}
    className="w-full clean-button-secondary py-1.5 text-xs flex items-center justify-center gap-1.5"
  >
                  {copiedCode === c.classCode ? <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied Code to Clipboard!</span>
                    </> : <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Class Code ({c.classCode}) for Students</span>
                    </>}
                </button>
              </div>)}
          </div>
        </div>}

      {
    /* Modal: Create New Class Code */
  }
      {showCreateClassModal && <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
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
                <label className="font-bold text-[#374151]">Class Name / Section *</label>
                <input
    type="text"
    required
    placeholder="e.g. Class 12-B Advanced Physics"
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
                  <option value="Grade 11-12">Grade 11-12 (Senior Secondary)</option>
                  <option value="Grade 9-10">Grade 9-10 (Secondary)</option>
                  <option value="Grade 6-8">Grade 6-8 (Middle)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#374151]">Academic Stream</label>
                <select
    value={newStream}
    onChange={(e) => setNewStream(e.target.value)}
    className="w-full bg-[#F9FAFB] border border-[#E5E7EB] px-3 py-2 text-xs text-[#1A1A1A] outline-none focus:border-black"
  >
                  <option value="Science (PCM/PCB)">Science (PCM & PCB)</option>
                  <option value="Mathematics Core">Mathematics Core</option>
                  <option value="General Science">General Secondary Science</option>
                </select>
              </div>

              <p className="text-[11px] text-[#6B7280] leading-relaxed pt-1">
                A unique NCERT code (e.g. NCERT-XXX) will be provisioned. Students registering with this code will immediately receive your timetable, syllabus, and appear on your intervention radar.
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
        </div>}
    </div>;
};
