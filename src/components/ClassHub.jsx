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
  AlertCircle
} from "lucide-react";
import { api } from "../services/api";

export const ClassHub = ({ currentStudent, currentTeacher, classInfo, onNavigateToTutor, onNavigateToPractice }) => {
  const info = classInfo || currentStudent?.classInfo;
  const isTeacher = !!currentTeacher;
  const currentUser = currentTeacher || currentStudent;
  const classCode = info?.classCode || currentStudent?.classCode || "";

  const [activeSubTab, setActiveSubTab] = useState("resources"); // "resources" | "schedule" | "syllabus"
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [mediaTypeFilter, setMediaTypeFilter] = useState("all");
  
  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false);
  const [uploadMode, setUploadMode] = useState("text"); // "text" | "image" | "video" | "file"
  const [formData, setFormData] = useState({
    title: "",
    subject: "Physics",
    gradeLevel: info?.grade || currentStudent?.gradeLevel || "Class 12",
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

  useEffect(() => {
    if (classCode) {
      loadResources();
    }
  }, [classCode]);

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

  if (!info && !classCode) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 text-center">
        <div className="bg-white border border-[#E5E7EB] p-8 max-w-md mx-auto">
          <BookOpen className="w-8 h-8 mx-auto text-[#6B7280] mb-3" />
          <h3 className="font-bold text-sm text-[#1A1A1A]">No Class Linked</h3>
          <p className="text-xs text-[#6B7280] mt-1">
            Link to a class code to access your classroom timetable, shared notes, and peer study resources.
          </p>
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

  return (
    <div id="class-hub-container" className="max-w-7xl mx-auto px-4 sm:px-8 py-5 space-y-5">
      {/* Class Header Banner */}
      <div className="bg-white border border-[#E5E7EB] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F0F2F5] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-black text-white text-[10px] font-mono font-bold px-2 py-0.5 uppercase tracking-wider">
                Class Code: {classCode}
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
              <span>{info?.school || currentUser?.institute || currentUser?.school || "Institution Campus"}</span>
              {info?.teacherName && (
                <>
                  <span className="text-[#D1D5DB]">&bull;</span>
                  <User className="w-3.5 h-3.5 text-[#6B7280]" />
                  <span>Teacher In-Charge: <strong>{info.teacherName}</strong></span>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 bg-black hover:bg-[#333] text-white text-xs font-semibold px-4 py-2 border border-black transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload Notes / Media / Files</span>
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
            <span>AI Multimodal Engine reads text notes, diagram images, lecture videos & files uploaded here</span>
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
      <div className="flex border-b border-[#E5E7EB] bg-white text-xs font-medium">
        <button
          onClick={() => setActiveSubTab("resources")}
          className={`px-5 py-3 font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeSubTab === "resources" ? "border-black text-black bg-[#FAFAFA]" : "border-transparent text-[#6B7280] hover:text-black"
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Classroom Shared Resources ({resources.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab("schedule")}
          className={`px-5 py-3 font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeSubTab === "schedule" ? "border-black text-black bg-[#FAFAFA]" : "border-transparent text-[#6B7280] hover:text-black"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Weekly Timetable</span>
        </button>
        <button
          onClick={() => setActiveSubTab("syllabus")}
          className={`px-5 py-3 font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeSubTab === "syllabus" ? "border-black text-black bg-[#FAFAFA]" : "border-transparent text-[#6B7280] hover:text-black"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Syllabus Roadmap</span>
        </button>
      </div>

      {/* TAB 1: CLASSROOM SHARED RESOURCES */}
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

                        <span className={`text-[10px] font-bold px-2 py-0.5 shrink-0 ${
                          res.sharedByRole === "teacher" ? "bg-black text-white" : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        }`}>
                          {res.sharedBy} ({res.sharedByRole})
                        </span>
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

      {/* ZOOMED MEDIA MODAL */}
      {zoomedMedia && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setZoomedMedia(null)}>
          <div className="bg-white p-4 max-w-4xl max-h-[90vh] overflow-auto rounded space-y-2" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-bold text-sm text-[#1A1A1A]">{zoomedMedia.title}</h4>
              <button onClick={() => setZoomedMedia(null)} className="text-xl font-bold">&times;</button>
            </div>
            <div className="flex items-center justify-center bg-black/5 p-2">
              <img src={zoomedMedia.url} alt={zoomedMedia.title} className="max-h-[75vh] object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
