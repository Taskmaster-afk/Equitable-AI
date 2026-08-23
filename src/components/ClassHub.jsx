import { useState, useEffect, useRef } from "react";
import {
  Calendar,
  BookOpen,
  Clock,
  User,
  Building,
  ShieldCheck,
  Share2,
  Plus,
  FileText,
  Sparkles,
  CheckCircle2,
  Trash2,
  Download,
  Search,
  Tag,
  Image as ImageIcon,
  Video as VideoIcon,
  FileUp,
  X,
  Maximize2,
  Play,
  Film,
  Paperclip,
  Eye,
  AlertCircle,
  Megaphone,
  MessageSquare,
  Users,
  ThumbsUp,
  Send,
  Check,
  Mail,
  UserPlus,
  School,
  KeyRound,
  UploadCloud
} from "lucide-react";
import { api } from "../services/api";

export const ClassHub = ({
  currentStudent,
  currentTeacher,
  classInfo,
  studentClasses = [],
  onSelectClass,
  onJoinClass,
  onNavigateToTutor,
  onNavigateToPractice,
  onNavigateToCommunity
}) => {
  const [teacherTeachingClasses, setTeacherTeachingClasses] = useState([]);
  const [selectedTeacherClass, setSelectedTeacherClass] = useState(null);

  const isTeacher = !!currentTeacher;
  const currentUser = currentTeacher || currentStudent;
  const info = classInfo || selectedTeacherClass || currentStudent?.classInfo;
  const classCode = info?.classCode || currentStudent?.classCode || "";
  const studentSection = currentStudent?.section || info?.section || "Section A";

  const [activeSubTab, setActiveSubTab] = useState("announcements"); // "announcements" | "discussion" | "roster" | "resources" | "schedule"
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [mediaTypeFilter, setMediaTypeFilter] = useState("all");

  // Join Classroom Modal State
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinClassCodeInput, setJoinClassCodeInput] = useState("");
  const [isJoiningClass, setIsJoiningClass] = useState(false);
  const [joinClassError, setJoinClassError] = useState(null);

  // Student School Edit State
  const [showEditSchoolModal, setShowEditSchoolModal] = useState(false);
  const [studentSchoolInput, setStudentSchoolInput] = useState(currentStudent?.school || "");
  const [isUpdatingSchool, setIsUpdatingSchool] = useState(false);

  // Announcements State
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [annSection, setAnnSection] = useState("all");
  const [annPriority, setAnnPriority] = useState("normal");
  const [isPostingAnn, setIsPostingAnn] = useState(false);

  // Class Discussion / Doubt Chat State
  const [classPosts, setClassPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [activePost, setActivePost] = useState(null);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postSubject, setPostSubject] = useState("Physics");
  const [postContent, setPostContent] = useState("");
  const [postTags, setPostTags] = useState("");
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [answerContent, setAnswerContent] = useState("");
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

  // Classmates Roster State
  const [classmates, setClassmates] = useState([]);
  const [loadingClassmates, setLoadingClassmates] = useState(false);
  const [selectedRosterSection, setSelectedRosterSection] = useState(isTeacher ? "all" : studentSection);

  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false);
  const [uploadMode, setUploadMode] = useState("text"); // "text" | "image" | "video" | "file"
  const [formData, setFormData] = useState({
    title: "",
    subject: "Physics",
    gradeLevel: info?.grade || currentStudent?.gradeLevel || "Class 10",
    chapter: "",
    keyConcepts: "",
    content: ""
  });
  
  // File upload state
  const [uploadedFile, setUploadedFile] = useState(null); // { name, size, type, dataUrl }
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef(null);

  // Zoomed media preview modal
  const [zoomedMedia, setZoomedMedia] = useState(null); // { type, url, title }

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [expandedResourceId, setExpandedResourceId] = useState(null);

  // Load teacher classes automatically if teacher is logged in
  useEffect(() => {
    if (isTeacher && currentTeacher?.id) {
      loadTeacherClasses();
    }
  }, [isTeacher, currentTeacher?.id]);

  const loadTeacherClasses = async () => {
    try {
      const res = await api.getTeacherClasses(currentTeacher.id);
      const list = res?.classes || [];
      setTeacherTeachingClasses(list);
      if (list.length > 0 && !selectedTeacherClass && !classInfo) {
        setSelectedTeacherClass(list[0]);
      }
    } catch (e) {
      console.error("Failed to load teacher classes in ClassHub:", e);
    }
  };

  useEffect(() => {
    if (classCode) {
      loadResources();
      loadAnnouncements();
      loadDiscussionPosts();
      loadClassmates();
    }
  }, [classCode]);

  const loadAnnouncements = async () => {
    if (!classCode) return;
    setLoadingAnnouncements(true);
    try {
      const res = await api.getClassAnnouncements(classCode, isTeacher ? "all" : studentSection);
      setAnnouncements(res?.announcements || []);
    } catch (err) {
      console.error("Failed to load announcements:", err);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  const loadDiscussionPosts = async () => {
    if (!classCode) return;
    setLoadingPosts(true);
    try {
      const res = await api.getCommunityPosts({ classCode, section: isTeacher ? "all" : studentSection });
      setClassPosts(res?.posts || []);
      if (res?.posts && res.posts.length > 0 && !activePost) {
        setActivePost(res.posts[0]);
      }
    } catch (err) {
      console.error("Failed to load class posts:", err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const loadClassmates = async () => {
    if (!classCode) return;
    setLoadingClassmates(true);
    try {
      const res = await api.getClassStudents(classCode);
      setClassmates(res?.students || []);
    } catch (err) {
      console.error("Failed to load classmates:", err);
    } finally {
      setLoadingClassmates(false);
    }
  };

  const loadResources = async () => {
    if (!classCode) return;
    setLoadingResources(true);
    try {
      const res = await api.getClassroomResources(classCode);
      setResources(res.resources || []);
    } catch (err) {
      console.error("Failed to load classroom resources:", err);
    } finally {
      setLoadingResources(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 30MB
    if (file.size > 30 * 1024 * 1024) {
      alert("File size exceeds 30MB limit. Please choose a smaller file.");
      return;
    }

    setIsProcessingFile(true);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setUploadedFile({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl
      });
      // Auto-detect mode if not set
      if (file.type.startsWith("image/")) {
        setUploadMode("image");
      } else if (file.type.startsWith("video/")) {
        setUploadMode("video");
      } else {
        setUploadMode("file");
      }
      setIsProcessingFile(false);
    };
    reader.onerror = () => {
      alert("Failed to read file.");
      setIsProcessingFile(false);
    };
    reader.readAsDataURL(file);
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleShareSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setStatusMessage({ type: "error", text: "Please enter a resource title." });
      return;
    }

    if (!formData.content.trim() && !uploadedFile) {
      setStatusMessage({ type: "error", text: "Please provide either notes text or upload an image, video, or document." });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      const payload = {
        title: formData.title,
        subject: formData.subject,
        gradeLevel: formData.gradeLevel,
        chapter: formData.chapter || "General Topic",
        keyConcepts: formData.keyConcepts,
        content: formData.content,
        mediaType: uploadedFile ? uploadMode : "text",
        fileData: uploadedFile?.dataUrl || null,
        mimeType: uploadedFile?.type || "",
        fileName: uploadedFile?.name || "",
        fileSize: uploadedFile?.size || 0,
        sharedBy: currentUser?.name || (isTeacher ? "Class Teacher" : "Class Student"),
        sharedByRole: isTeacher ? "teacher" : "student"
      };

      await api.shareClassroomResource(classCode, payload);
      setStatusMessage({
        type: "success",
        text: `Resource with ${payload.mediaType.toUpperCase()} content shared! AI Multimodal Tutor has analyzed and indexed it for doubts and tests.`
      });
      setFormData({
        title: "",
        subject: "Physics",
        gradeLevel: info?.grade || currentStudent?.gradeLevel || "Class 12",
        chapter: "",
        keyConcepts: "",
        content: ""
      });
      setUploadedFile(null);
      setUploadMode("text");
      setShowShareModal(false);
      loadResources();
    } catch (err) {
      setStatusMessage({ type: "error", text: err.message || "Failed to share resource" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteResource = async (id) => {
    if (!confirm("Are you sure you want to remove this shared classroom resource?")) return;
    try {
      await api.deleteClassroomResource(classCode, id);
      setResources(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error("Failed to delete resource:", err);
    }
  };

  const handleVerifyResource = async (id) => {
    if (!isTeacher) return;
    try {
      await api.verifyClassroomResource(classCode, id, currentUser?.name || "Faculty Lead");
      setResources(prev => prev.map(r => r.id === id ? { ...r, isVerified: true, verifiedBy: currentUser?.name || "Faculty Lead" } : r));
      setStatusMessage({ type: "success", text: "Resource verified and endorsed for this classroom!" });
    } catch (err) {
      console.error("Failed to verify resource:", err);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;
    setIsSubmittingPost(true);
    try {
      const res = await api.createCommunityPost({
        instituteName: info?.school || currentUser?.school || "School",
        classCode: classCode,
        section: studentSection,
        title: postTitle.trim(),
        content: postContent.trim(),
        subject: postSubject,
        gradeLevel: info?.grade || currentStudent?.gradeLevel || "Class 10",
        authorName: currentUser?.name || "Student",
        authorRole: isTeacher ? "teacher" : "student",
        authorId: currentUser?.id || "student-1",
        tags: postTags ? postTags.split(",").map(t => t.trim()).filter(Boolean) : [postSubject]
      });
      setShowCreatePostModal(false);
      setPostTitle("");
      setPostContent("");
      setPostTags("");
      loadDiscussionPosts();
    } catch (err) {
      alert("Failed to submit doubt: " + err.message);
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!activePost || !answerContent.trim()) return;
    setIsSubmittingAnswer(true);
    try {
      const res = await api.answerCommunityPost(activePost.id, {
        authorName: currentUser?.name || "Student",
        authorRole: isTeacher ? "teacher" : "student",
        authorId: currentUser?.id || "student-1",
        content: answerContent.trim()
      });
      setAnswerContent("");
      loadDiscussionPosts();
      if (res.answer) {
        setActivePost(prev => ({
          ...prev,
          answers: [...(prev.answers || []), res.answer]
        }));
      }
    } catch (err) {
      alert("Failed to submit answer: " + err.message);
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleUpvotePost = async (postId) => {
    try {
      const updated = await api.upvoteCommunityPost(postId, currentUser?.id || "user-1");
      setClassPosts(prev => prev.map(p => p.id === postId ? { ...p, upvotes: updated.upvotes, upvotedBy: updated.upvotedBy } : p));
      if (activePost?.id === postId) {
        setActivePost(prev => ({ ...prev, upvotes: updated.upvotes, upvotedBy: updated.upvotedBy }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpvoteAnswer = async (postId, answerId) => {
    try {
      const updated = await api.upvoteAnswer(postId, answerId, currentUser?.id || "user-1");
      if (activePost?.id === postId) {
        setActivePost(updated);
      }
      loadDiscussionPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyAnswer = async (postId, answerId) => {
    if (!isTeacher) return;
    try {
      const updated = await api.verifyAnswer(postId, answerId);
      if (activePost?.id === postId) {
        setActivePost(updated);
      }
      loadDiscussionPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;
    setIsPostingAnn(true);
    try {
      await api.createAnnouncement(classCode, {
        title: annTitle.trim(),
        content: annContent.trim(),
        section: annSection,
        priority: annPriority,
        teacherId: currentUser?.id,
        teacherName: currentUser?.name
      });
      setShowAnnounceModal(false);
      setAnnTitle("");
      setAnnContent("");
      loadAnnouncements();
    } catch (err) {
      alert("Failed to post announcement: " + err.message);
    } finally {
      setIsPostingAnn(false);
    }
  };

  const handleDirectJoinClass = async (e) => {
    e.preventDefault();
    if (!joinClassCodeInput.trim()) return;
    setIsJoiningClass(true);
    setJoinClassError(null);
    try {
      if (onJoinClass) {
        await onJoinClass(joinClassCodeInput.trim());
      } else if (currentStudent?.id) {
        await api.joinClass(currentStudent.id, joinClassCodeInput.trim());
      }
      setShowJoinModal(false);
      setJoinClassCodeInput("");
    } catch (err) {
      setJoinClassError(err.message || "Classroom code not found. Please verify with your instructor.");
    } finally {
      setIsJoiningClass(false);
    }
  };

  const handleUpdateSchool = async (e) => {
    e.preventDefault();
    if (!studentSchoolInput.trim() || !currentStudent?.id) return;
    setIsUpdatingSchool(true);
    try {
      const res = await api.updateStudentSchool(currentStudent.id, studentSchoolInput.trim());
      if (res.student) {
        currentStudent.school = res.student.school;
        currentStudent.institute = res.student.school;
      }
      setShowEditSchoolModal(false);
    } catch (err) {
      alert("Failed to update school: " + err.message);
    } finally {
      setIsUpdatingSchool(false);
    }
  };

  if (!info && !classCode) {
    if (isTeacher) {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 text-center space-y-4">
          <div className="bg-white border-2 border-black p-8 max-w-lg mx-auto shadow-md space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold">
                <School className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#1A1A1A]">Welcome Teacher Lead</h3>
                <p className="text-xs text-[#6B7280]">
                  You have not created or selected an active classroom yet. Go to your Teacher Academic Desk to create a class code.
                </p>
              </div>
            </div>
            <button
              onClick={() => { window.location.hash = "#teacher"; }}
              className="w-full clean-button-primary py-2 text-xs font-bold bg-black text-white"
            >
              Open Teacher Academic Desk &rarr;
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 text-center space-y-4">
        <div className="bg-white border-2 border-black p-8 max-w-lg mx-auto shadow-md space-y-4 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1A1A1A]">Join Your Subject Classroom</h3>
              <p className="text-xs text-[#6B7280]">
                Enter any classroom code provided by your teacher (e.g. <strong>CLS-10A-PHY-42</strong> or <strong>NCERT-12A</strong>)
              </p>
            </div>
          </div>

          <form onSubmit={handleDirectJoinClass} className="space-y-3 pt-2">
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={joinClassCodeInput}
                onChange={(e) => setJoinClassCodeInput(e.target.value.toUpperCase())}
                placeholder="e.g. CLS-10A-PHY-42"
                className="flex-1 uppercase font-mono font-bold bg-[#F9FAFB] border border-[#E5E7EB] px-3 py-2 text-xs text-[#1A1A1A] outline-none focus:border-black"
              />
              <button
                type="submit"
                disabled={isJoiningClass || !joinClassCodeInput.trim()}
                className="clean-button-primary px-4 py-2 text-xs font-bold shrink-0 bg-black text-white"
              >
                {isJoiningClass ? "Joining..." : "Join Classroom"}
              </button>
            </div>
            {joinClassError && (
              <p className="text-xs text-rose-600 font-semibold">{joinClassError}</p>
            )}
          </form>
        </div>
      </div>
    );
  }

  const currentTimetableDay = info?.timetable?.find((t) => t.day === selectedDay) || info?.timetable?.[0];

  const filteredResources = resources.filter(r => {
    const matchesSubject = subjectFilter === "all" || r.subject?.toLowerCase() === subjectFilter.toLowerCase();
    const matchesMediaType = mediaTypeFilter === "all" || (r.mediaType || "text") === mediaTypeFilter;
    const term = searchFilter.toLowerCase();
    const matchesSearch = !term || (
      r.title?.toLowerCase().includes(term) ||
      r.chapter?.toLowerCase().includes(term) ||
      r.content?.toLowerCase().includes(term) ||
      (r.aiExtractedContent && r.aiExtractedContent.toLowerCase().includes(term)) ||
      r.keyConcepts?.some(k => k.toLowerCase().includes(term))
    );
    return matchesSubject && matchesMediaType && matchesSearch;
  });

  const activeClassesList = isTeacher ? teacherTeachingClasses : (studentClasses || []);

  return (
    <div id="class-hub-container" className="max-w-7xl mx-auto px-4 sm:px-8 py-5 space-y-5">
      {/* Multi-Classroom Switcher Bar */}
      {activeClassesList && activeClassesList.length > 0 && (
        <div className="bg-white border border-[#E5E7EB] p-3 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F0F2F5] pb-2 mb-2">
            <div className="flex items-center gap-2">
              <School className="w-4 h-4 text-black" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                {isTeacher ? `Teacher Managed Classrooms (${activeClassesList.length})` : `My Enrolled Classrooms (${activeClassesList.length})`}
              </span>
              <span className="text-[10px] text-[#6B7280]">
                &bull; Click any classroom to switch &bull; Multiple classrooms enabled
              </span>
            </div>
            {!isTeacher ? (
              <button
                onClick={() => setShowJoinModal(true)}
                className="text-xs font-bold px-2.5 py-1 bg-black text-white hover:bg-neutral-800 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>+ Join Another Classroom</span>
              </button>
            ) : (
              <button
                onClick={() => { window.location.hash = "#teacher"; }}
                className="text-xs font-bold px-2.5 py-1 bg-black text-white hover:bg-neutral-800 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>+ Create New Classroom Code</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {activeClassesList.map((cls) => {
              const isSelected = cls.classCode === classCode;
              return (
                <button
                  key={cls.classCode}
                  onClick={() => {
                    if (isTeacher) {
                      setSelectedTeacherClass(cls);
                    }
                    if (onSelectClass) onSelectClass(cls);
                  }}
                  className={`p-2 border text-left transition-all ${
                    isSelected
                      ? "border-2 border-black bg-[#F8F9FA] shadow-xs"
                      : "border-[#E5E7EB] bg-white hover:border-[#9CA3AF]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#1A1A1A]">
                      {cls.className || cls.classCode}
                    </span>
                    {isSelected && (
                      <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-xs">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#6B7280] font-mono flex items-center gap-1.5 mt-0.5">
                    <span>{cls.classCode}</span>
                    <span>&bull;</span>
                    <span>{cls.teacherName || (isTeacher ? "Instructor Admin" : "Faculty Lead")}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Class Header Banner */}
      <div className="bg-white border border-[#E5E7EB] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F0F2F5] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-black text-white text-[10px] font-mono font-bold px-2 py-0.5 uppercase tracking-wider">
                Class Code: {classCode}
              </span>
              <span className="bg-indigo-50 text-indigo-800 text-[10px] font-bold px-2 py-0.5 border border-indigo-200">
                {studentSection}
              </span>
              <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 border border-emerald-300">
                Admin: {info?.teacherName || (isTeacher ? (currentUser?.name || "Teacher") : "Faculty In-Charge")}
              </span>
              {info?.academicYear && (
                <span className="text-xs text-[#6B7280] font-medium">
                  Academic Year {info.academicYear}
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#1A1A1A]">
              {info?.className || `Class ${classCode}`}
            </h1>
            <p className="text-xs text-[#4B5563] flex items-center gap-2 flex-wrap">
              <Building className="w-3.5 h-3.5 text-[#6B7280]" />
              <span>{info?.school || currentUser?.school || currentUser?.institute || "School Campus"}</span>
              {!isTeacher && (
                <button
                  type="button"
                  onClick={() => {
                    setStudentSchoolInput(currentUser?.school || currentUser?.institute || "");
                    setShowEditSchoolModal(true);
                  }}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 underline font-bold transition-colors"
                  title="Update your school on your dashboard"
                >
                  ✎ Edit School
                </button>
              )}
              {info?.teacherName && (
                <>
                  <span className="text-[#D1D5DB]">&bull;</span>
                  <User className="w-3.5 h-3.5 text-[#6B7280]" />
                  <span>Classroom Admin: <strong>{info.teacherName}</strong></span>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {!isTeacher && (
              <button
                onClick={() => setShowJoinModal(true)}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-2 border border-indigo-600 transition-colors shadow-xs"
                title="Join a classroom using the code provided by your teacher"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Join Classroom Code</span>
              </button>
            )}
            {isTeacher && (
              <button
                onClick={() => setShowAnnounceModal(true)}
                className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3 py-2 border border-amber-600 transition-colors"
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>+ Broadcast Announcement</span>
              </button>
            )}
            <button
              onClick={() => onNavigateToCommunity ? onNavigateToCommunity() : (window.location.hash = "#community")}
              className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-2 border border-emerald-700 transition-colors"
              title="Open Community Doubts for this subject"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Shared Community Doubts</span>
            </button>
            <button
              onClick={() => setShowCreatePostModal(true)}
              className="flex items-center gap-1.5 bg-[#4B5563] hover:bg-[#374151] text-white text-xs font-semibold px-3 py-2 border border-[#4B5563] transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>+ Ask Class Doubt</span>
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-1.5 bg-black hover:bg-[#333] text-white text-xs font-semibold px-3 py-2 border border-black transition-colors"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Notes / PDF / Media</span>
            </button>
          </div>
        </div>

        {/* Subjects & AI Grounding Notice */}
        <div className="pt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] uppercase font-bold text-[#9CA3AF]">Core Subjects:</span>
            {(info?.subjects || ["Physics", "Chemistry", "Mathematics", "Biology"]).map((sub) => (
              <span key={sub} className="bg-[#F3F4F6] border border-[#E5E7EB] px-2 py-0.5 text-xs font-semibold text-[#1A1A1A]">
                {sub}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-medium">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>AI Multimodal Engine reads notes, circulars & doubt threads for personalized explanations</span>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className={`p-3 text-xs border flex items-center justify-between ${
          statusMessage.type === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-rose-50 text-rose-800 border-rose-200"
        }`}>
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="font-bold ml-2">&times;</button>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-[#E5E7EB] bg-white text-xs font-medium flex-wrap">
        <button
          onClick={() => setActiveSubTab("announcements")}
          className={`px-4 py-3 font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeSubTab === "announcements" ? "border-amber-600 text-amber-900 bg-amber-50/40" : "border-transparent text-[#6B7280] hover:text-black"
          }`}
        >
          <Megaphone className="w-4 h-4 text-amber-600" />
          <span>Teacher Announcements ({announcements.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("discussion")}
          className={`px-4 py-3 font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeSubTab === "discussion" ? "border-indigo-600 text-indigo-900 bg-indigo-50/40" : "border-transparent text-[#6B7280] hover:text-black"
          }`}
        >
          <MessageSquare className="w-4 h-4 text-indigo-600" />
          <span>Class Community Chat ({classPosts.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("roster")}
          className={`px-4 py-3 font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeSubTab === "roster" ? "border-black text-black bg-[#FAFAFA]" : "border-transparent text-[#6B7280] hover:text-black"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Classmates in {studentSection} ({classmates.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("resources")}
          className={`px-4 py-3 font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeSubTab === "resources" ? "border-black text-black bg-[#FAFAFA]" : "border-transparent text-[#6B7280] hover:text-black"
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Shared Notes & Files ({resources.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("schedule")}
          className={`px-4 py-3 font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeSubTab === "schedule" ? "border-black text-black bg-[#FAFAFA]" : "border-transparent text-[#6B7280] hover:text-black"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Weekly Timetable</span>
        </button>
      </div>

      {/* TAB 1: TEACHER ANNOUNCEMENTS BROADCAST CHANNEL */}
      {activeSubTab === "announcements" && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E5E7EB] p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-sm text-[#1A1A1A]">Official Teacher Broadcast Channel</h3>
              </div>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Official notices, test schedules, and homework circulars broadcasted by your faculty.
              </p>
            </div>

            {isTeacher && (
              <button
                onClick={() => setShowAnnounceModal(true)}
                className="clean-button-primary py-1.5 px-3 text-xs flex items-center gap-1.5 bg-amber-600 border-amber-600 hover:bg-amber-700 text-white"
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>+ Broadcast New Circular</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {announcements.length === 0 ? (
              <div className="bg-white border border-[#E5E7EB] p-8 text-center text-xs text-[#6B7280]">
                No announcements posted for this classroom yet. Check back soon for circulars!
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
                            {ann.priority || "Official Notice"}
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
                    </div>

                    <p className="text-xs text-[#374151] leading-relaxed whitespace-pre-wrap">
                      {ann.content}
                    </p>

                    <div className="pt-2 border-t border-[#F0F2F5] text-[11px] text-[#6B7280] flex items-center justify-between">
                      <span>Posted by Faculty: <strong>{ann.teacherName || info?.teacherName || "Teacher"}</strong></span>
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Teacher Verified Circular
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CLASS COMMUNITY DISCUSSION & DOUBT CHAT */}
      {activeSubTab === "discussion" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Doubt Questions List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="bg-white border border-[#E5E7EB] p-3 flex items-center justify-between">
              <span className="text-xs font-bold text-[#1A1A1A]">
                Doubt Threads ({classPosts.length})
              </span>
              <button
                onClick={() => setShowCreatePostModal(true)}
                className="clean-button-primary py-1 px-2.5 text-xs flex items-center gap-1 bg-indigo-600 border-indigo-600 text-white"
              >
                <Plus className="w-3 h-3" />
                <span>Ask Doubt</span>
              </button>
            </div>

            <div className="space-y-2">
              {classPosts.length === 0 ? (
                <div className="bg-white border border-[#E5E7EB] p-6 text-center text-xs text-[#6B7280]">
                  No doubts asked yet in this class. Click <strong>Ask Doubt</strong> to start a peer discussion!
                </div>
              ) : (
                classPosts.map((post) => {
                  const isSelected = activePost?.id === post.id;
                  const hasTeacherVerified = (post.answers || []).some(a => a.isTeacherVerified);
                  return (
                    <div
                      key={post.id}
                      onClick={() => setActivePost(post)}
                      className={`p-3 border cursor-pointer transition-colors bg-white ${isSelected ? "border-black ring-1 ring-black" : "border-[#E5E7EB] hover:border-[#9CA3AF]"}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 bg-[#F3F4F6] text-[#4B5563]">
                          {post.subject}
                        </span>
                        {hasTeacherVerified && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-xs text-[#1A1A1A] line-clamp-1">{post.title}</h4>
                      <p className="text-[11px] text-[#6B7280] line-clamp-2 mt-0.5">{post.content}</p>
                      <div className="flex items-center justify-between text-[10px] text-[#9CA3AF] mt-2 pt-1 border-t border-[#F0F2F5]">
                        <span>{post.authorName} ({post.authorRole})</span>
                        <span>{(post.answers || []).length} answers &bull; {post.upvotes || 0} upvotes</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Selected Thread & Answers */}
          <div className="lg:col-span-7">
            {activePost ? (
              <div className="bg-white border border-[#E5E7EB] p-5 space-y-4">
                <div className="border-b border-[#F0F2F5] pb-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-[#F3F4F6] text-[#4B5563]">
                        {activePost.subject}
                      </span>
                      <span className="text-xs text-[#6B7280] font-medium">
                        By {activePost.authorName} ({activePost.authorRole}) &bull; {activePost.createdAt || "Just now"}
                      </span>
                    </div>
                    <button
                      onClick={() => handleUpvotePost(activePost.id)}
                      className="clean-button-secondary py-1 px-2.5 text-xs flex items-center gap-1.5"
                    >
                      <ThumbsUp className="w-3 h-3 text-black" />
                      <span>{activePost.upvotes || 0}</span>
                    </button>
                  </div>
                  <h3 className="font-bold text-base text-[#1A1A1A]">{activePost.title}</h3>
                  <p className="text-xs text-[#374151] leading-relaxed whitespace-pre-wrap">{activePost.content}</p>
                </div>

                {/* Answers Section */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-[#1A1A1A] uppercase tracking-wider text-[#9CA3AF]">
                    Class Answers & Teacher Feedback ({(activePost.answers || []).length})
                  </h4>

                  {(activePost.answers || []).length === 0 ? (
                    <p className="text-xs text-[#6B7280] py-2">No peer solutions yet. Be the first to answer!</p>
                  ) : (
                    (activePost.answers || []).map((ans) => (
                      <div
                        key={ans.id}
                        className={`p-3 text-xs space-y-1.5 border ${ans.isTeacherVerified ? "border-emerald-300 bg-emerald-50/20" : "border-[#E5E7EB] bg-[#FAFAFA]"}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#1A1A1A]">{ans.authorName}</span>
                            <span className="text-[10px] text-[#6B7280]">({ans.authorRole})</span>
                            {ans.isTeacherVerified && (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 flex items-center gap-0.5 border border-emerald-300">
                                <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Faculty Verified
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {isTeacher && !ans.isTeacherVerified && (
                              <button
                                onClick={() => handleVerifyAnswer(activePost.id, ans.id)}
                                className="text-[10px] font-bold text-emerald-700 hover:underline"
                              >
                                ✓ Mark Verified
                              </button>
                            )}
                            <button
                              onClick={() => handleUpvoteAnswer(activePost.id, ans.id)}
                              className="text-[11px] text-[#6B7280] hover:text-black flex items-center gap-1"
                            >
                              <ThumbsUp className="w-3 h-3" /> {ans.upvotes || 0}
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-[#374151] leading-relaxed whitespace-pre-wrap">{ans.content}</p>
                      </div>
                    ))
                  )}

                  {/* Answer Input */}
                  <form onSubmit={handleSubmitAnswer} className="space-y-2 pt-2 border-t border-[#F0F2F5]">
                    <textarea
                      rows={3}
                      required
                      placeholder="Write your explanation or step-by-step solution for your classmates..."
                      value={answerContent}
                      onChange={(e) => setAnswerContent(e.target.value)}
                      className="w-full bg-[#F9FAFB] border border-[#E5E7EB] p-2.5 text-xs outline-none focus:border-black"
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingAnswer}
                      className="clean-button-primary py-1.5 px-4 text-xs font-bold flex items-center gap-1.5 ml-auto"
                    >
                      <Send className="w-3 h-3" />
                      <span>{isSubmittingAnswer ? "Posting..." : "Post Solution"}</span>
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-[#E5E7EB] p-12 text-center text-xs text-[#6B7280]">
                Select a doubt from the left to view the thread and solutions.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CLASSMATES IN MY SECTION ROSTER */}
      {activeSubTab === "roster" && (
        <div className="bg-white border border-[#E5E7EB] p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F0F2F5] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-black" />
                <h3 className="font-bold text-sm text-[#1A1A1A]">Classmates Roster</h3>
              </div>
              <p className="text-xs text-[#6B7280]">
                Students enrolled in <strong>{info?.className || `Class ${classCode}`}</strong>.
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              {["all", "Section A", "Section B", "Section C", "Section D"].map((sec) => (
                <button
                  key={sec}
                  onClick={() => setSelectedRosterSection(sec)}
                  className={`px-2.5 py-1 text-xs font-bold border transition-colors ${selectedRosterSection === sec ? "bg-black text-white border-black" : "bg-[#F8F9FA] text-[#4B5563] border-[#E5E7EB]"}`}
                >
                  {sec === "all" ? "All Sections" : sec}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {classmates
              .filter(s => selectedRosterSection === "all" || s.section === selectedRosterSection || (!s.section && selectedRosterSection === "Section A"))
              .map((student) => (
                <div key={student.studentId} className="border border-[#E5E7EB] p-3.5 bg-[#F9FAFB] space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-[#1A1A1A]">{student.studentName}</h4>
                      <span className="text-[10px] text-[#6B7280] font-mono">{student.studentEmail || student.email}</span>
                    </div>
                    <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 border border-indigo-200">
                      {student.section || "Section A"}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#4B5563] pt-1.5 border-t border-[#E5E7EB] flex items-center justify-between">
                    <span>Grade: <strong>{student.gradeLevel || info?.grade || "Class 10"}</strong></span>
                    <span className="text-emerald-700 font-semibold">Active Learner</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 4: CLASSROOM SHARED RESOURCES */}
      {activeSubTab === "resources" && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="bg-white border border-[#E5E7EB] p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md bg-[#F8F9FA] border border-[#E5E7EB] px-3 py-1.5">
              <Search className="w-3.5 h-3.5 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Search classroom notes, formulas, video topics, images..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="bg-transparent border-none outline-none text-xs w-full text-[#1A1A1A]"
              />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-[#6B7280] uppercase">Subject:</span>
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="bg-[#F8F9FA] border border-[#E5E7EB] px-2.5 py-1 text-xs font-semibold outline-none cursor-pointer"
                >
                  <option value="all">All Subjects</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Biology">Biology</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-[#6B7280] uppercase">Type:</span>
                <select
                  value={mediaTypeFilter}
                  onChange={(e) => setMediaTypeFilter(e.target.value)}
                  className="bg-[#F8F9FA] border border-[#E5E7EB] px-2.5 py-1 text-xs font-semibold outline-none cursor-pointer"
                >
                  <option value="all">All Media Types</option>
                  <option value="text">📝 Written Notes</option>
                  <option value="image">🖼️ Diagram / Image</option>
                  <option value="video">🎥 Video Lecture</option>
                  <option value="file">📄 Document File</option>
                </select>
              </div>
            </div>
          </div>

          {/* Resources List */}
          {loadingResources ? (
            <div className="bg-white border border-[#E5E7EB] p-12 text-center text-xs text-[#6B7280]">
              Loading classroom resources...
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="bg-white border border-[#E5E7EB] p-12 text-center space-y-3">
              <FileText className="w-8 h-8 mx-auto text-[#9CA3AF]" />
              <h3 className="font-bold text-sm text-[#1A1A1A]">No Classroom Resources Found</h3>
              <p className="text-xs text-[#6B7280] max-w-md mx-auto">
                Teachers and students can upload notes, diagram photos, video explanations, or PDF files. The AI reads from all shared classroom documents to solve doubts and create practice tests.
              </p>
              <button
                onClick={() => setShowShareModal(true)}
                className="bg-black text-white text-xs font-bold px-4 py-2 hover:bg-[#333] transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload First Resource</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredResources.map((res) => {
                const isExpanded = expandedResourceId === res.id;
                const isImage = res.mediaType === "image" && res.mediaData;
                const isVideo = res.mediaType === "video" && res.mediaData;
                const isFile = res.mediaType === "file" && res.mediaData;

                return (
                  <div
                    key={res.id}
                    className="bg-white border border-[#E5E7EB] p-4 space-y-3 hover:border-[#9CA3AF] transition-colors flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]">
                            {res.subject} &bull; {res.gradeLevel}
                          </span>
                          
                          {/* Media Type Badge */}
                          {res.mediaType === "image" && (
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                              <ImageIcon className="w-3 h-3" /> Diagram / Image
                            </span>
                          )}
                          {res.mediaType === "video" && (
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                              <VideoIcon className="w-3 h-3" /> Video Lecture
                            </span>
                          )}
                          {res.mediaType === "file" && (
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                              <FileText className="w-3 h-3" /> Document File
                            </span>
                          )}
                          {(!res.mediaType || res.mediaType === "text") && (
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-700 border border-gray-200 flex items-center gap-1">
                              <FileText className="w-3 h-3" /> Text Notes
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0 flex-wrap">
                          {res.isVerified || res.sharedByRole === "teacher" || res.authorRole === "teacher" ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Verified {res.verifiedBy ? `by ${res.verifiedBy}` : "by Faculty"}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-300 px-2 py-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Pending Verification</span>
                            </span>
                          )}
                          <span className={`text-[10px] font-bold px-2 py-0.5 ${
                            res.sharedByRole === "teacher" ? "bg-black text-white" : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          }`}>
                            {res.sharedBy || res.authorName} ({res.sharedByRole || res.authorRole})
                          </span>
                        </div>
                      </div>

                      <h3 className="font-bold text-sm text-[#1A1A1A]">
                        {res.title}
                      </h3>

                      <div className="text-[11px] text-[#6B7280] font-medium flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-[#9CA3AF]" />
                        <span>Chapter / Topic: <strong>{res.chapter}</strong></span>
                      </div>

                      {/* Media Display Component */}
                      {isImage && (
                        <div className="relative group border border-[#E5E7EB] bg-black/5 overflow-hidden rounded">
                          <img
                            src={res.mediaData}
                            alt={res.title}
                            referrerPolicy="no-referrer"
                            className="w-full max-h-48 object-contain bg-white cursor-pointer"
                            onClick={() => setZoomedMedia({ type: "image", url: res.mediaData, title: res.title })}
                          />
                          <button
                            onClick={() => setZoomedMedia({ type: "image", url: res.mediaData, title: res.title })}
                            className="absolute bottom-2 right-2 bg-black/80 hover:bg-black text-white text-[10px] px-2 py-1 flex items-center gap-1 opacity-90 transition-opacity"
                          >
                            <Maximize2 className="w-3 h-3" /> Zoom Image
                          </button>
                        </div>
                      )}

                      {isVideo && (
                        <div className="border border-[#E5E7EB] bg-black rounded overflow-hidden">
                          <video
                            controls
                            src={res.mediaData}
                            className="w-full max-h-56 bg-black"
                          >
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      )}

                      {isFile && (
                        <div className="p-2.5 bg-[#F8F9FA] border border-[#E5E7EB] flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileText className="w-4 h-4 text-[#4B5563] shrink-0" />
                            <div className="truncate">
                              <div className="text-xs font-semibold text-[#1A1A1A] truncate">{res.mediaMeta?.fileName || "Uploaded File"}</div>
                              <div className="text-[10px] text-[#6B7280]">
                                {res.mediaMeta?.fileSize ? `${Math.round(res.mediaMeta.fileSize / 1024)} KB` : "Document File"} &bull; AI Analyzed
                              </div>
                            </div>
                          </div>
                          {res.mediaData && (
                            <a
                              href={res.mediaData}
                              download={res.mediaMeta?.fileName || "classroom-resource"}
                              className="bg-white border border-[#E5E7EB] hover:border-black text-[11px] font-bold px-2.5 py-1 text-[#1A1A1A] flex items-center gap-1 shrink-0 transition-colors"
                            >
                              <Download className="w-3 h-3" /> Download
                            </a>
                          )}
                        </div>
                      )}

                      {res.keyConcepts && res.keyConcepts.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap pt-1">
                          <Tag className="w-3 h-3 text-[#9CA3AF]" />
                          {res.keyConcepts.map((k, idx) => (
                            <span key={idx} className="bg-[#F8F9FA] border border-[#E5E7EB] text-[10px] px-1.5 py-0.2 text-[#4B5563]">
                              {k}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Content Preview / Full */}
                      <div className="p-3 bg-[#F8F9FA] border border-[#E5E7EB] text-xs font-mono text-[#374151] whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                        {isExpanded ? res.content : `${res.content.slice(0, 200)}${res.content.length > 200 ? "..." : ""}`}
                      </div>

                      {res.content.length > 200 && (
                        <button
                          onClick={() => setExpandedResourceId(isExpanded ? null : res.id)}
                          className="text-[11px] text-blue-600 hover:underline font-semibold"
                        >
                          {isExpanded ? "Show Less" : "Read Full Notes / AI Transcript"}
                        </button>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="pt-3 border-t border-[#F0F2F5] flex items-center justify-between gap-2 text-xs">
                      <span className="text-[10px] font-mono text-[#9CA3AF] flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        AI Multimodal Grounded
                      </span>

                      <div className="flex items-center gap-2">
                        {isTeacher && !res.isVerified && res.sharedByRole !== "teacher" && (
                          <button
                            onClick={() => handleVerifyResource(res.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 text-[11px] font-bold flex items-center gap-1 transition-colors shadow-xs"
                            title="Endorse and verify student study material for the classroom"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Verify Material</span>
                          </button>
                        )}

                        {onNavigateToPractice && (
                          <button
                            onClick={() => onNavigateToPractice()}
                            title="Generate a practice test testing concepts from this resource"
                            className="bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold flex items-center gap-1 transition-colors"
                          >
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            <span>AI Test</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteResource(res.id)}
                          title="Remove Resource"
                          className="text-[#9CA3AF] hover:text-rose-600 p-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: WEEKLY TIMETABLE */}
      {activeSubTab === "schedule" && (
        <div className="bg-white border border-[#E5E7EB]">
          <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-black" />
              <h2 className="text-sm font-bold text-[#1A1A1A]">
                Weekly Class Timetable
              </h2>
            </div>
            <span className="text-xs font-mono text-[#6B7280]">
              Class {classCode} Schedule
            </span>
          </div>

          <div className="p-4">
            {/* Day Selector */}
            <div className="flex gap-2 overflow-x-auto pb-3 border-b border-[#F0F2F5] text-xs">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 py-1.5 font-bold transition-colors ${
                    selectedDay === day ? "bg-black text-white" : "bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Periods */}
            <div className="mt-4 space-y-2">
              {currentTimetableDay?.periods && currentTimetableDay.periods.length > 0 ? (
                currentTimetableDay.periods.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#F8F9FA] border border-[#E5E7EB] flex items-center justify-between flex-wrap gap-2 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold bg-[#E5E7EB] text-[#1A1A1A] px-2 py-0.5 text-[10px]">
                        Period {p.period}
                      </span>
                      <span className="font-bold text-[#1A1A1A]">{p.subject}</span>
                      <span className="text-[#6B7280]">{p.topic}</span>
                    </div>

                    <div className="flex items-center gap-4 text-[#6B7280] text-[11px]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {p.time}
                      </span>
                      <span>Teacher: <strong>{p.teacher}</strong></span>
                      <span className="bg-white border border-[#E5E7EB] px-1.5 py-0.5 text-[10px]">
                        Room {p.room}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-[#6B7280]">
                  No periods scheduled for {selectedDay}.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SYLLABUS ROADMAP */}
      {activeSubTab === "syllabus" && (
        <div className="bg-white border border-[#E5E7EB]">
          <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-black" />
              <h2 className="text-sm font-bold text-[#1A1A1A]">
                Class Syllabus & Academic Roadmap
              </h2>
            </div>
            <span className="text-xs font-mono text-[#6B7280]">
              Grade 11-12 Academic Track
            </span>
          </div>

          <div className="p-4 space-y-4">
            {(info?.syllabus || [
              { unit: "Unit 1", title: "Electrostatics & Current Electricity", weightageMarks: 16, totalPeriods: 24, keyTopics: ["Coulomb Law", "Electric Field & Potential", "Gauss Theorem", "Ohm Law & Kirchoff Rules", "Wheatstone Bridge"] },
              { unit: "Unit 2", title: "Magnetic Effects of Current & Magnetism", weightageMarks: 17, totalPeriods: 22, keyTopics: ["Biot-Savart Law", "Ampere Circuital Law", "Cyclotron", "Magnetic Dipole Moment", "Electromagnetic Induction"] },
              { unit: "Unit 3", title: "Electromagnetic Waves & Optics", weightageMarks: 18, totalPeriods: 30, keyTopics: ["Displacement Current", "Ray Optics & Optical Instruments", "Wave Optics & Interference", "Diffraction & Polarization"] },
              { unit: "Unit 4", title: "Modern Physics & Electronic Devices", weightageMarks: 19, totalPeriods: 24, keyTopics: ["Photoelectric Effect", "Bohr Atomic Model", "Nuclear Binding Energy", "Semiconductor Diodes & Logic Gates"] }
            ]).map((unit, idx) => (
              <div key={idx} className="p-4 bg-[#F8F9FA] border border-[#E5E7EB] space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-black text-white font-mono text-[10px] font-bold px-2 py-0.5">
                      {unit.unit}
                    </span>
                    <h3 className="font-bold text-xs text-[#1A1A1A]">{unit.title}</h3>
                  </div>
                  <span className="text-[11px] font-semibold text-[#4B5563] bg-white border border-[#E5E7EB] px-2 py-0.5">
                    {unit.weightageMarks} Marks &bull; {unit.totalPeriods} Periods
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] font-bold text-[#9CA3AF] uppercase">Topics:</span>
                  {unit.keyTopics.map((topic, tIdx) => (
                    <span key={tIdx} className="bg-white border border-[#E5E7EB] text-[10px] px-2 py-0.5 text-[#374151]">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MULTIMODAL SHARE RESOURCE MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-black max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div>
                <h3 className="font-bold text-base text-[#1A1A1A]">Share Resource with Class {classCode}</h3>
                <p className="text-xs text-[#6B7280]">
                  Upload handwritten notes, diagram images, lecture clips, PDFs, or formula sheets.
                </p>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-[#6B7280] hover:text-black font-bold text-lg"
              >
                &times;
              </button>
            </div>

            {/* Media Type Selector Tabs */}
            <div className="space-y-1">
              <label className="font-bold text-xs text-[#1A1A1A] block">Select Resource Type:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setUploadMode("text")}
                  className={`p-2.5 border text-xs font-bold flex flex-col items-center gap-1 transition-colors ${
                    uploadMode === "text" ? "border-black bg-black text-white" : "border-[#E5E7EB] bg-[#F8F9FA] text-[#4B5563] hover:bg-[#E5E7EB]"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>📝 Text Notes</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode("image")}
                  className={`p-2.5 border text-xs font-bold flex flex-col items-center gap-1 transition-colors ${
                    uploadMode === "image" ? "border-black bg-black text-white" : "border-[#E5E7EB] bg-[#F8F9FA] text-[#4B5563] hover:bg-[#E5E7EB]"
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>🖼️ Diagram Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode("video")}
                  className={`p-2.5 border text-xs font-bold flex flex-col items-center gap-1 transition-colors ${
                    uploadMode === "video" ? "border-black bg-black text-white" : "border-[#E5E7EB] bg-[#F8F9FA] text-[#4B5563] hover:bg-[#E5E7EB]"
                  }`}
                >
                  <VideoIcon className="w-4 h-4" />
                  <span>🎥 Video Lecture</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode("file")}
                  className={`p-2.5 border text-xs font-bold flex flex-col items-center gap-1 transition-colors ${
                    uploadMode === "file" ? "border-black bg-black text-white" : "border-[#E5E7EB] bg-[#F8F9FA] text-[#4B5563] hover:bg-[#E5E7EB]"
                  }`}
                >
                  <FileUp className="w-4 h-4" />
                  <span>📄 PDF / Document</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleShareSubmit} className="space-y-3 text-xs">
              {/* File Upload Drag & Drop Area if not pure text mode or if file uploaded */}
              {uploadMode !== "text" && (
                <div className="space-y-2">
                  <label className="font-bold text-[#1A1A1A] block">
                    Upload {uploadMode === "image" ? "Image / Diagram (PNG, JPG, WEBP)" : uploadMode === "video" ? "Video Clip (MP4, WEBM)" : "Document File (PDF, DOCX, TXT)"} *
                  </label>

                  {uploadedFile ? (
                    <div className="p-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {uploadMode === "image" ? <ImageIcon className="w-4 h-4 text-blue-600" /> : uploadMode === "video" ? <VideoIcon className="w-4 h-4 text-purple-600" /> : <FileText className="w-4 h-4 text-amber-600" />}
                          <span className="font-semibold text-[#1A1A1A]">{uploadedFile.name}</span>
                          <span className="text-[10px] text-[#6B7280]">({Math.round(uploadedFile.size / 1024)} KB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={removeUploadedFile}
                          className="text-rose-600 hover:text-rose-800 text-xs font-bold flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>

                      {/* Instant Preview */}
                      {uploadMode === "image" && (
                        <div className="max-h-40 overflow-hidden bg-black/5 rounded border border-[#E5E7EB] flex items-center justify-center p-1">
                          <img src={uploadedFile.dataUrl} alt="Preview" className="max-h-36 object-contain" />
                        </div>
                      )}
                      {uploadMode === "video" && (
                        <div className="max-h-48 overflow-hidden bg-black rounded border border-[#E5E7EB]">
                          <video controls src={uploadedFile.dataUrl} className="max-h-44 w-full" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-[#D1D5DB] hover:border-black bg-[#F8F9FA] p-6 text-center rounded cursor-pointer transition-colors space-y-2"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={
                          uploadMode === "image"
                            ? "image/*"
                            : uploadMode === "video"
                            ? "video/*"
                            : ".pdf,.doc,.docx,.txt,.md"
                        }
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <FileUp className="w-8 h-8 mx-auto text-[#6B7280]" />
                      <div className="text-xs font-bold text-[#1A1A1A]">
                        Click to browse or drop your {uploadMode} file here
                      </div>
                      <div className="text-[11px] text-[#6B7280]">
                        Max 30MB &bull; AI Multimodal will analyze and transcribe text, formulas & diagrams
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="font-bold text-[#1A1A1A] block mb-1">Resource Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Wave Optics Formula Sheet & Diagram Derivations"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#F8F9FA] border border-[#E5E7EB] px-3 py-2 text-xs outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-[#1A1A1A] block mb-1">Subject</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] px-2.5 py-2 text-xs outline-none focus:border-black cursor-pointer font-medium"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Biology">Biology</option>
                    <option value="General Science">General Science</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#1A1A1A] block mb-1">Grade Level</label>
                  <input
                    type="text"
                    value={formData.gradeLevel}
                    onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] px-3 py-2 text-xs outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#1A1A1A] block mb-1">Chapter / Unit</label>
                  <input
                    type="text"
                    placeholder="e.g., Chapter 10: Wave Optics"
                    value={formData.chapter}
                    onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] px-3 py-2 text-xs outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#1A1A1A] block mb-1">Key Concepts (Comma separated tags)</label>
                <input
                  type="text"
                  placeholder="e.g., Young Double Slit, Path Difference, Fringe Width, Huygens"
                  value={formData.keyConcepts}
                  onChange={(e) => setFormData({ ...formData, keyConcepts: e.target.value })}
                  className="w-full bg-[#F8F9FA] border border-[#E5E7EB] px-3 py-2 text-xs outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="font-bold text-[#1A1A1A] block mb-1">
                  {uploadMode === "text" ? "Study Notes / Markdown / Formulae *" : "Accompanying Notes / Summary (Optional)"}
                </label>
                <textarea
                  required={uploadMode === "text" && !uploadedFile}
                  rows={uploadMode === "text" ? 6 : 3}
                  placeholder={
                    uploadMode === "text"
                      ? "Paste or write detailed study notes, equations, bullet points, derivations, or step-by-step summary..."
                      : "Add any extra context, timestamps, or instructions for classmates (AI will also auto-transcribe the uploaded file)..."
                  }
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full bg-[#F8F9FA] border border-[#E5E7EB] p-3 text-xs font-mono outline-none focus:border-black"
                />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>
                  The AI Multimodal Engine will parse handwritten notes, diagrams, and video lectures to answer student doubts and build practice tests.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 border border-[#E5E7EB] text-[#4B5563] hover:bg-[#F8F9FA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isProcessingFile}
                  className="bg-black hover:bg-[#333] text-white font-bold px-5 py-2 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      <span>AI Multimodal Processing...</span>
                    </>
                  ) : (
                    <span>Share with Classroom</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ASK CLASS DOUBT */}
      {showCreatePostModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-black max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-[#1A1A1A]">Ask a Doubt to Your Classroom</h3>
              </div>
              <button
                onClick={() => setShowCreatePostModal(false)}
                className="text-[#6B7280] hover:text-black font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#374151]">Question / Doubt Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How does Lens Maker's formula change when immersed in water?"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full bg-[#F9FAFB] border border-[#E5E7EB] px-3 py-2 text-xs outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-[#374151]">Subject</label>
                  <select
                    value={postSubject}
                    onChange={(e) => setPostSubject(e.target.value)}
                    className="w-full bg-[#F9FAFB] border border-[#E5E7EB] px-2.5 py-2 text-xs outline-none focus:border-black"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Biology">Biology</option>
                    <option value="General Science">General Science</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#374151]">Tags (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Optics, Refraction, Focal Length"
                    value={postTags}
                    onChange={(e) => setPostTags(e.target.value)}
                    className="w-full bg-[#F9FAFB] border border-[#E5E7EB] px-3 py-2 text-xs outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#374151]">Detailed Question & What you tried *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your step-by-step confusion so your classmates and teacher can help..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full bg-[#F9FAFB] border border-[#E5E7EB] p-2.5 text-xs outline-none focus:border-black"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreatePostModal(false)}
                  className="flex-1 clean-button-secondary py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPost}
                  className="flex-1 clean-button-primary py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3 h-3" />
                  <span>{isSubmittingPost ? "Posting..." : "Post Doubt"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BROADCAST TEACHER CIRCULAR */}
      {showAnnounceModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-black max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-sm text-[#1A1A1A]">Broadcast Teacher Circular</h3>
              </div>
              <button
                onClick={() => setShowAnnounceModal(false)}
                className="text-[#6B7280] hover:text-black font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#374151]">Circular Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit Test 2 Date Sheet & Syllabus Allocation"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="w-full bg-[#F9FAFB] border border-[#E5E7EB] px-3 py-2 text-xs outline-none focus:border-black"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#374151]">Priority *</label>
                <select
                  value={annPriority}
                  onChange={(e) => setAnnPriority(e.target.value)}
                  className="w-full bg-[#F9FAFB] border border-[#E5E7EB] px-3 py-2 text-xs outline-none focus:border-black font-bold"
                >
                  <option value="normal">Normal Circular</option>
                  <option value="important">Important Notice</option>
                  <option value="urgent">Urgent / Exam Notice</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#374151]">Circular Details *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Type notice message for enrolled students..."
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  className="w-full bg-[#F9FAFB] border border-[#E5E7EB] p-2.5 text-xs outline-none focus:border-black"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAnnounceModal(false)}
                  className="flex-1 clean-button-secondary py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPostingAnn}
                  className="flex-1 clean-button-primary py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-1.5"
                >
                  <Megaphone className="w-3 h-3" />
                  <span>{isPostingAnn ? "Broadcasting..." : "Broadcast Notice"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Join Classroom with Code */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border-2 border-black max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div className="flex items-center gap-2">
                <School className="w-5 h-5 text-black" />
                <div>
                  <h3 className="font-bold text-sm text-[#1A1A1A]">Join Another Classroom</h3>
                  <p className="text-[10px] text-[#6B7280]">
                    Enter the code provided by your teacher for that subject
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setJoinClassError(null);
                }}
                className="text-[#6B7280] hover:text-black font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDirectJoinClass} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#374151]">Classroom Code *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. CLS-10A-PHY-42 or NCERT-12A"
                  value={joinClassCodeInput}
                  onChange={(e) => setJoinClassCodeInput(e.target.value.toUpperCase())}
                  className="w-full uppercase font-mono font-bold bg-[#F9FAFB] border border-[#E5E7EB] px-3 py-2 text-xs outline-none focus:border-black"
                />
                <p className="text-[10px] text-[#6B7280]">
                  Students can join multiple classrooms simultaneously (e.g. Physics, Chemistry, Math, etc.).
                </p>
              </div>

              {joinClassError && (
                <div className="p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {joinClassError}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowJoinModal(false);
                    setJoinClassError(null);
                  }}
                  className="flex-1 clean-button-secondary py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isJoiningClass || !joinClassCodeInput.trim()}
                  className="flex-1 clean-button-primary py-2 text-xs font-bold bg-black hover:bg-neutral-800 text-white"
                >
                  {isJoiningClass ? "Joining..." : "Join Classroom"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student School Modal */}
      {showEditSchoolModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border-2 border-black max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-black" />
                <h3 className="font-bold text-sm text-[#1A1A1A]">Update Your School</h3>
              </div>
              <button
                onClick={() => setShowEditSchoolModal(false)}
                className="text-[#6B7280] hover:text-black font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateSchool} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#374151]">School / Institution Name *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Kendriya Vidyalaya No. 1, Delhi Public School"
                  value={studentSchoolInput}
                  onChange={(e) => setStudentSchoolInput(e.target.value)}
                  className="w-full bg-[#F9FAFB] border border-[#E5E7EB] px-3 py-2 text-xs text-[#1A1A1A] outline-none focus:border-black font-medium"
                />
                <p className="text-[10px] text-[#6B7280]">
                  This updates your school across your dashboard and verified student records.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditSchoolModal(false)}
                  className="flex-1 clean-button-secondary py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingSchool || !studentSchoolInput.trim()}
                  className="flex-1 clean-button-primary py-2 text-xs font-bold bg-black hover:bg-neutral-800 text-white"
                >
                  {isUpdatingSchool ? "Saving..." : "Save School"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
