import { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  Shield,
  UploadCloud,
  FileText,
  Sparkles,
  BookOpen,
  Plus,
  Trash2,
  Tag,
  Building,
  User,
  CheckCircle2,
  Clock,
  Trophy,
  Award,
  Medal,
  Image as ImageIcon,
  Video as VideoIcon,
  FileUp,
  X,
  Maximize2,
  Download,
  Eye,
  Film
} from "lucide-react";
import { api } from "../services/api";

export const OerLibrary = ({ currentStudent, currentTeacher, onNavigateToTutor, onNavigateToPractice }) => {
  const currentUser = currentTeacher || currentStudent;
  const isTeacher = !!currentTeacher;

  const [activeTab, setActiveTab] = useState("dumps"); // "dumps" | "core"
  const [corpus, setCorpus] = useState([]);
  const [dumps, setDumps] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedGrade, setSelectedGrade] = useState(
    currentStudent?.gradeLevel || "all"
  );
  const [selectedMediaType, setSelectedMediaType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedDump, setSelectedDump] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDumps, setIsLoadingDumps] = useState(false);
  const [contributorModal, setContributorModal] = useState(null);
  const [hoveredContributor, setHoveredContributor] = useState(null);

  // Upload Dump Modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadMode, setUploadMode] = useState("text"); // "text" | "image" | "video" | "file"
  const [dumpFormData, setDumpFormData] = useState({
    title: "",
    subject: "Physics",
    gradeLevel: currentStudent?.gradeLevel || "Class 12",
    chapter: "",
    tags: "",
    content: "",
    instituteName: currentUser?.institute || currentUser?.school || "Open Education Network"
  });

  // File upload state
  const [uploadedFile, setUploadedFile] = useState(null); // { name, size, type, dataUrl }
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef(null);

  // Zoomed media preview modal
  const [zoomedMedia, setZoomedMedia] = useState(null);

  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    if (currentStudent?.gradeLevel) {
      setSelectedGrade(currentStudent.gradeLevel);
    }
  }, [currentStudent?.id, currentStudent?.gradeLevel]);

  useEffect(() => {
    loadCorpus();
    loadDumps();
  }, [selectedSubject]);

  const loadCorpus = async () => {
    setIsLoading(true);
    try {
      const data = await api.getOerCorpus({
        subject: selectedSubject !== "all" ? selectedSubject : void 0
      });
      setCorpus(data.corpus);
      if (data.corpus.length > 0 && !selectedDoc) {
        setSelectedDoc(data.corpus[0]);
      }
    } catch (err) {
      console.error("Failed to load curriculum corpus:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDumps = async () => {
    setIsLoadingDumps(true);
    try {
      const data = await api.getResourceDumps({
        subject: selectedSubject !== "all" ? selectedSubject : void 0
      });
      setDumps(data.dumps || []);
      if (data.dumps && data.dumps.length > 0 && !selectedDump) {
        setSelectedDump(data.dumps[0]);
      }
    } catch (err) {
      console.error("Failed to load resource dumps:", err);
    } finally {
      setIsLoadingDumps(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 30 * 1024 * 1024) {
      alert("File size exceeds 30MB limit.");
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

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!dumpFormData.title.trim()) {
      setStatusMessage({ type: "error", text: "Please enter a title." });
      return;
    }

    if (!dumpFormData.content.trim() && !uploadedFile) {
      setStatusMessage({ type: "error", text: "Please provide either notes text or upload an image, video, or document." });
      return;
    }

    setIsUploading(true);
    setStatusMessage(null);
    try {
      const payload = {
        title: dumpFormData.title,
        subject: dumpFormData.subject,
        gradeLevel: dumpFormData.gradeLevel,
        chapter: dumpFormData.chapter || "Community Study Reference",
        tags: dumpFormData.tags,
        content: dumpFormData.content,
        mediaType: uploadedFile ? uploadMode : "text",
        fileData: uploadedFile?.dataUrl || null,
        mimeType: uploadedFile?.type || "",
        fileName: uploadedFile?.name || "",
        fileSize: uploadedFile?.size || 0,
        uploadedBy: currentUser?.name || (isTeacher ? "Teacher" : "Student"),
        uploadedByRole: isTeacher ? "teacher" : "student",
        authorName: currentUser?.name || (isTeacher ? "Teacher" : "Student"),
        authorRole: isTeacher ? "teacher" : "student",
        authorId: currentUser?.id || "user-1",
        instituteName: dumpFormData.instituteName || currentUser?.institute || currentUser?.school || "Open Education Network"
      };

      const res = await api.uploadResourceDump(payload);
      setStatusMessage({
        type: "success",
        text: isTeacher
          ? `Verified study resource published to Knowledge Dump!`
          : `Resource uploaded to Knowledge Dump! It will earn verified scholar status upon faculty review.`
      });
      setDumpFormData({
        title: "",
        subject: "Physics",
        gradeLevel: currentStudent?.gradeLevel || "Class 12",
        chapter: "",
        tags: "",
        content: "",
        instituteName: currentUser?.institute || currentUser?.school || "Open Education Network"
      });
      setUploadedFile(null);
      setUploadMode("text");
      setShowUploadModal(false);
      await loadDumps();
      if (res.dump) setSelectedDump(res.dump);
      setActiveTab("dumps");
    } catch (err) {
      setStatusMessage({ type: "error", text: err.message || "Failed to upload resource dump" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleVerifyDump = async (id) => {
    if (!isTeacher) return;
    try {
      await api.verifyResourceDump(id, currentUser?.name || "Faculty Lead");
      setDumps(prev => prev.map(d => d.id === id ? { ...d, isVerified: true, verifiedBy: currentUser?.name || "Faculty Lead", verifiedAt: "Just now" } : d));
      if (selectedDump?.id === id) {
        setSelectedDump(prev => ({ ...prev, isVerified: true, verifiedBy: currentUser?.name || "Faculty Lead", verifiedAt: "Just now" }));
      }
      setStatusMessage({ type: "success", text: "Resource verified and endorsed by faculty! Top contributor rankings updated." });
    } catch (err) {
      console.error("Failed to verify dump:", err);
      setStatusMessage({ type: "error", text: err.message || "Failed to verify dump" });
    }
  };

  const handleDeleteDump = async (id) => {
    if (!confirm("Are you sure you want to remove this resource dump?")) return;
    try {
      await api.deleteResourceDump(id);
      setDumps(prev => prev.filter(d => d.id !== id));
      if (selectedDump?.id === id) {
        setSelectedDump(null);
      }
    } catch (err) {
      console.error("Failed to delete dump:", err);
    }
  };

  const topContributors = useMemo(() => {
    const map = new Map();
    dumps.forEach((d) => {
      const author = d.uploadedBy || d.authorName || "Scholar";
      const role = d.uploadedByRole || d.authorRole || "student";
      const institute = d.instituteName || "Open Education Network";
      const isVer = typeof d.isVerified === "boolean" ? d.isVerified : role === "teacher";

      if (!map.has(author)) {
        map.set(author, {
          name: author,
          role,
          institute,
          totalUploads: 0,
          verifiedUploads: 0,
          uploads: [],
          subjects: new Set()
        });
      }
      const item = map.get(author);
      item.totalUploads += 1;
      item.uploads.push(d);
      if (d.subject) item.subjects.add(d.subject);
      if (isVer) {
        item.verifiedUploads += 1;
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      if (b.verifiedUploads !== a.verifiedUploads) {
        return b.verifiedUploads - a.verifiedUploads;
      }
      return b.totalUploads - a.totalUploads;
    });
  }, [dumps]);

  const filteredCoreDocs = corpus.filter((doc) => {
    const matchesSubject = selectedSubject === "all" || doc.subject.toLowerCase() === selectedSubject.toLowerCase();
    const matchesGrade = selectedGrade === "all" || doc.gradeLevel.toLowerCase().includes(selectedGrade.toLowerCase().slice(0, 7));
    const term = searchQuery.toLowerCase();
    const matchesSearch = !term || (
      doc.title.toLowerCase().includes(term) ||
      doc.chapter.toLowerCase().includes(term) ||
      doc.content.toLowerCase().includes(term) ||
      doc.keyConcepts.some(k => k.toLowerCase().includes(term))
    );
    return matchesSubject && matchesGrade && matchesSearch;
  });

  const filteredDumps = dumps.filter((dump) => {
    const matchesSubject = selectedSubject === "all" || dump.subject.toLowerCase() === selectedSubject.toLowerCase();
    const matchesGrade = selectedGrade === "all" || dump.gradeLevel === selectedGrade;
    const matchesMediaType = selectedMediaType === "all" || (dump.mediaType || "text") === selectedMediaType;
    const term = searchQuery.toLowerCase();
    const matchesSearch = !term || (
      dump.title.toLowerCase().includes(term) ||
      dump.chapter.toLowerCase().includes(term) ||
      dump.content.toLowerCase().includes(term) ||
      (dump.aiExtractedContent && dump.aiExtractedContent.toLowerCase().includes(term)) ||
      (dump.tags && dump.tags.some(t => t.toLowerCase().includes(term)))
    );
    return matchesSubject && matchesGrade && matchesMediaType && matchesSearch;
  });

  return (
    <div id="oer-library-container" className="max-w-7xl mx-auto px-4 sm:px-8 py-5 space-y-5">
      {/* Header Banner */}
      <div className="bg-white border border-[#E5E7EB] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F0F2F5] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-black text-white text-[10px] font-mono font-bold px-2 py-0.5 uppercase tracking-wider">
                Multimodal Open Repository
              </span>
              <span className="text-xs text-[#6B7280]">
                All Learning Materials &bull; AI Grounded
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#1A1A1A]">
              Open Educational Knowledge Library
            </h1>
            <p className="text-xs text-[#4B5563]">
              Upload and explore text notes, diagram images, lecture clips, and PDF study sheets. AI reads directly from these resources.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 bg-black hover:bg-[#333] text-white text-xs font-semibold px-4 py-2 border border-black transition-colors"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload to Knowledge Dump</span>
            </button>
          </div>
        </div>

        {/* AI Multimodal Status */}
        <div className="pt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-[#4B5563]">
            <BookOpen className="w-3.5 h-3.5 text-[#6B7280]" />
            <span>Community Knowledge Dump ({dumps.length}) &bull; Core Curriculum ({corpus.length})</span>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-medium">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>AI Multimodal reads handwritten notes, equations & video slides for doubts & tests</span>
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

      {/* Tabs */}
      <div className="flex border-b border-[#E5E7EB] bg-white text-xs font-medium">
        <button
          onClick={() => setActiveTab("dumps")}
          className={`px-5 py-3 font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "dumps" ? "border-black text-black bg-[#FAFAFA]" : "border-transparent text-[#6B7280] hover:text-black"
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Knowledge Dump Repository ({dumps.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("core")}
          className={`px-5 py-3 font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "core" ? "border-black text-black bg-[#FAFAFA]" : "border-transparent text-[#6B7280] hover:text-black"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Core Educational Curriculum ({corpus.length})</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-[#E5E7EB] p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md bg-[#F8F9FA] border border-[#E5E7EB] px-3 py-1.5">
          <Search className="w-3.5 h-3.5 text-[#6B7280]" />
          <input
            type="text"
            placeholder={activeTab === "dumps" ? "Search resource dumps, tags, formulas, diagrams..." : "Search curriculum, concepts, chapters..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-xs w-full text-[#1A1A1A]"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-[#6B7280] uppercase">Subject:</span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-[#F8F9FA] border border-[#E5E7EB] px-2.5 py-1 text-xs font-semibold outline-none cursor-pointer"
            >
              <option value="all">All Subjects</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Biology">Biology</option>
            </select>
          </div>

          {activeTab === "dumps" && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-[#6B7280] uppercase">Format:</span>
              <select
                value={selectedMediaType}
                onChange={(e) => setSelectedMediaType(e.target.value)}
                className="bg-[#F8F9FA] border border-[#E5E7EB] px-2.5 py-1 text-xs font-semibold outline-none cursor-pointer"
              >
                <option value="all">All Formats</option>
                <option value="text">📝 Written Notes</option>
                <option value="image">🖼️ Images / Diagrams</option>
                <option value="video">🎥 Video Lectures</option>
                <option value="file">📄 PDF / Documents</option>
              </select>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-[#6B7280] uppercase">Grade:</span>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="bg-[#F8F9FA] border border-[#E5E7EB] px-2.5 py-1 text-xs font-semibold outline-none cursor-pointer"
            >
              <option value="all">All Grades</option>
              <option value="Class 10">Class 9-10</option>
              <option value="Class 11">Class 11</option>
              <option value="Class 12">Class 12</option>
            </select>
          </div>
        </div>
      </div>

      {/* VIEW 1: RESOURCE DUMP REPOSITORY */}
      {activeTab === "dumps" && (
        <div className="space-y-4">
          {/* TOP CONTRIBUTORS & VERIFIED SCHOLARS LEADERBOARD */}
          <div className="bg-gradient-to-r from-amber-50/80 via-white to-indigo-50/80 border border-[#E5E7EB] p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#F0F2F5] pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  🏆
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#1A1A1A] flex items-center gap-2">
                    <span>Top Academic Contributors & Verified Scholars</span>
                    <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-mono px-1.5 py-0.2 font-bold uppercase">
                      Hall of Fame
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#6B7280]">
                    Ranked by faculty-verified uploads & endorsed materials. Teacher uploads are pre-verified; student uploads earn verified ranking upon teacher endorsement.
                  </p>
                </div>
              </div>
              <div className="text-[11px] font-mono text-[#6B7280]">
                {topContributors.length} Active Contributors
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-1">
              {topContributors.slice(0, 4).map((contributor, idx) => {
                const isGold = idx === 0;
                const isSilver = idx === 1;
                const isBronze = idx === 2;
                const rankBadge = isGold ? "🥇 Rank 1" : isSilver ? "🥈 Rank 2" : isBronze ? "🥉 Rank 3" : `#${idx + 1}`;
                const medalColor = isGold
                  ? "bg-amber-100 border-amber-300 text-amber-900 font-bold"
                  : isSilver
                  ? "bg-slate-100 border-slate-300 text-slate-900 font-bold"
                  : isBronze
                  ? "bg-orange-100 border-orange-300 text-orange-900 font-bold"
                  : "bg-gray-50 border-gray-200 text-gray-700 font-medium";

                return (
                  <div
                    key={contributor.name}
                    onClick={() => setContributorModal(contributor)}
                    onMouseEnter={() => setHoveredContributor(contributor.name)}
                    onMouseLeave={() => setHoveredContributor(null)}
                    className={`bg-white dark:bg-[#1A1A1A] border p-3 flex flex-col justify-between gap-2.5 transition-all cursor-pointer hover:shadow-md ${
                      isGold ? "border-amber-400 ring-1 ring-amber-200" : "border-[#E5E7EB] dark:border-[#2A2A2A] hover:border-black dark:hover:border-white"
                    }`}
                    title="Click to view detailed contributor statistics and uploaded study materials"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs font-mono shrink-0 ${
                          contributor.role === "teacher" ? "bg-black text-white dark:bg-white dark:text-black" : "bg-emerald-600 text-white"
                        }`}>
                          {contributor.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <div className="font-bold text-xs text-[#1A1A1A] dark:text-white truncate flex items-center gap-1">
                            <span>{contributor.name}</span>
                            <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-mono font-normal">🔍</span>
                          </div>
                          <div className="text-[10px] text-[#6B7280] dark:text-[#AAA] capitalize truncate">{contributor.role} &bull; {contributor.institute}</div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 border shrink-0 ${medalColor}`}>
                        {rankBadge}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-[#F0F2F5] dark:border-[#2A2A2A]">
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{contributor.verifiedUploads} Verified</span>
                      </span>
                      <span className="text-[#6B7280] dark:text-[#AAA] font-mono text-[10px]">
                        {contributor.totalUploads} total &bull; View details &rarr;
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Resource Dumps Directory List (5 cols) */}
            <div className="lg:col-span-5 space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
              {isLoadingDumps ? (
                <div className="bg-white border border-[#E5E7EB] p-8 text-center text-xs text-[#6B7280]">
                  Loading resource dumps...
                </div>
              ) : filteredDumps.length === 0 ? (
                <div className="bg-white border border-[#E5E7EB] p-8 text-center space-y-2">
                  <UploadCloud className="w-8 h-8 mx-auto text-[#9CA3AF]" />
                  <h3 className="font-bold text-xs text-[#1A1A1A]">No Dump Resources Found</h3>
                  <p className="text-[11px] text-[#6B7280]">
                    Be the first to upload revision sheets, handwritten notes, diagrams, or video lectures.
                  </p>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="bg-black text-white text-xs font-bold px-3 py-1.5 mt-2"
                  >
                    Upload Resource
                  </button>
                </div>
              ) : (
                filteredDumps.map((dump) => {
                  const isSelected = selectedDump?.id === dump.id;
                  const isVerified = typeof dump.isVerified === "boolean" ? dump.isVerified : dump.uploadedByRole === "teacher";
                  return (
                    <div
                      key={dump.id}
                      onClick={() => setSelectedDump(dump)}
                      className={`p-3 border text-xs cursor-pointer transition-colors ${
                        isSelected ? "border-black bg-[#F8F9FA]" : "border-[#E5E7EB] bg-white hover:border-[#9CA3AF]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-[#1A1A1A] text-sm">{dump.title}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          {dump.mediaType === "image" && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-blue-100 text-blue-800 flex items-center gap-0.5">
                              <ImageIcon className="w-2.5 h-2.5" /> IMG
                            </span>
                          )}
                          {dump.mediaType === "video" && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-purple-100 text-purple-800 flex items-center gap-0.5">
                              <VideoIcon className="w-2.5 h-2.5" /> VID
                            </span>
                          )}
                          {dump.mediaType === "file" && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-amber-100 text-amber-800 flex items-center gap-0.5">
                              <FileText className="w-2.5 h-2.5" /> DOC
                            </span>
                          )}
                          <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            dump.uploadedByRole === "teacher" ? "bg-black text-white" : "bg-gray-100 text-gray-800"
                          }`}>
                            {dump.uploadedByRole}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {isVerified ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-1.5 py-0.2 flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                            <span>Verified Material</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-300 px-1.5 py-0.2 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-amber-600" />
                            <span>Pending Verification</span>
                          </span>
                        )}
                        <span className="text-[#4B5563] text-xs">
                          {dump.subject} &bull; <span className="text-[#6B7280]">{dump.gradeLevel}</span>
                        </span>
                      </div>

                      <div className="text-[11px] text-[#6B7280] flex items-center gap-2 mb-1.5">
                        <Building className="w-3 h-3 text-[#9CA3AF]" />
                        <span className="truncate">{dump.instituteName}</span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {dump.tags && dump.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="bg-[#F0F2F5] text-[#374151] px-1.5 py-0.5 text-[10px] font-mono">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Selected Dump Document Full View (7 cols) */}
            <div className="lg:col-span-7 bg-white border border-[#E5E7EB] p-5">
              {selectedDump ? (
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-[#9CA3AF]">
                          {selectedDump.subject} &bull; {selectedDump.gradeLevel}
                        </span>
                        {selectedDump.isVerified || selectedDump.uploadedByRole === "teacher" ? (
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Verified {selectedDump.verifiedBy ? `by ${selectedDump.verifiedBy}` : "Faculty Endorsed"}</span>
                          </span>
                        ) : (
                          <span className="bg-amber-50 text-amber-800 border border-amber-300 text-[10px] font-bold px-2 py-0.5 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Pending Faculty Verification</span>
                          </span>
                        )}
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-bold px-1.5 py-0.2 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          AI Grounded & Indexed
                        </span>
                        {selectedDump.mediaType && selectedDump.mediaType !== "text" && (
                          <span className="bg-purple-50 text-purple-800 border border-purple-200 text-[9px] font-bold px-1.5 py-0.2 uppercase">
                            {selectedDump.mediaType} Resource
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-[#1A1A1A]">
                        {selectedDump.title}
                      </h3>
                      <p className="text-xs text-[#6B7280] mt-0.5 flex items-center gap-2 flex-wrap">
                        <span>Contributed by: <strong>{selectedDump.uploadedBy || selectedDump.authorName}</strong> ({selectedDump.uploadedByRole || selectedDump.authorRole})</span>
                        <span className="text-[#D1D5DB]">&bull;</span>
                        <span>{selectedDump.instituteName}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isTeacher && !selectedDump.isVerified && selectedDump.uploadedByRole !== "teacher" && (
                        <button
                          onClick={() => handleVerifyDump(selectedDump.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 text-xs font-bold flex items-center gap-1 transition-colors shadow-xs"
                          title="Endorse and verify this student material"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verify & Endorse</span>
                        </button>
                      )}

                      {(isTeacher || (currentUser && (
                        selectedDump.uploadedBy === currentUser.name ||
                        selectedDump.authorName === currentUser.name ||
                        selectedDump.authorId === currentUser.id
                      ))) && (
                        <button
                          onClick={() => handleDeleteDump(selectedDump.id)}
                          title="Delete My Uploaded Resource Dump"
                          className="text-[#9CA3AF] hover:text-rose-600 p-1 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                {/* Media Playback / Preview */}
                {selectedDump.mediaType === "image" && selectedDump.mediaData && (
                  <div className="border border-[#E5E7EB] bg-black/5 rounded p-2 text-center space-y-2">
                    <img
                      src={selectedDump.mediaData}
                      alt={selectedDump.title}
                      className="max-h-72 mx-auto object-contain bg-white rounded border cursor-pointer"
                      onClick={() => setZoomedMedia({ type: "image", url: selectedDump.mediaData, title: selectedDump.title })}
                    />
                    <button
                      onClick={() => setZoomedMedia({ type: "image", url: selectedDump.mediaData, title: selectedDump.title })}
                      className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      <Maximize2 className="w-3 h-3" /> View High-Resolution Diagram
                    </button>
                  </div>
                )}

                {selectedDump.mediaType === "video" && selectedDump.mediaData && (
                  <div className="border border-[#E5E7EB] bg-black rounded overflow-hidden">
                    <video controls src={selectedDump.mediaData} className="w-full max-h-72 bg-black">
                      Your browser does not support video playback.
                    </video>
                  </div>
                )}

                {selectedDump.mediaType === "file" && selectedDump.mediaData && (
                  <div className="p-3 bg-[#F8F9FA] border border-[#E5E7EB] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-amber-600" />
                      <div>
                        <div className="text-xs font-bold text-[#1A1A1A]">{selectedDump.mediaMeta?.fileName || "Uploaded Document"}</div>
                        <div className="text-[10px] text-[#6B7280]">
                          {selectedDump.mediaMeta?.fileSize ? `${Math.round(selectedDump.mediaMeta.fileSize / 1024)} KB` : "Document File"} &bull; Transcribed by AI
                        </div>
                      </div>
                    </div>
                    <a
                      href={selectedDump.mediaData}
                      download={selectedDump.mediaMeta?.fileName || "knowledge-dump-file"}
                      className="bg-white border border-black text-xs font-bold px-3 py-1 text-black flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> Download File
                    </a>
                  </div>
                )}

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold block mb-1">
                    Origin & Topic Reference:
                  </span>
                  <p className="text-xs text-[#1A1A1A] bg-[#F8F9FA] p-2 border border-[#E5E7EB] font-mono">
                    {selectedDump.chapter} &bull; Shared on {selectedDump.createdAt}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold block mb-1">
                    Study Material Notes & AI Multimodal Transcription:
                  </span>
                  <div className="whitespace-pre-wrap font-mono text-xs text-[#1A1A1A] leading-relaxed bg-[#F8F9FA] p-3.5 border border-[#E5E7EB] overflow-x-auto max-h-80">
                    {selectedDump.content}
                  </div>
                </div>

                {selectedDump.tags && selectedDump.tags.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold block mb-1">
                      Resource Tags:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedDump.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-white text-[#1A1A1A] border border-[#E5E7EB] px-2 py-0.5 text-xs font-mono"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>The AI tutor and practice generator continuously pull from this dump to ground answers.</span>
                  </div>
                  {onNavigateToPractice && (
                    <button
                      onClick={() => onNavigateToPractice()}
                      className="bg-black text-white text-xs font-bold px-3 py-1 shrink-0 ml-2"
                    >
                      AI Practice Test
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-[#9CA3AF] text-xs">
                Select an uploaded resource dump from the list to view its contents, formulas, and study notes.
              </div>
            )}
          </div>
        </div>
        </div>
      )}

      {/* VIEW 2: CORE EDUCATIONAL CURRICULUM */}
      {activeTab === "core" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Document Directory List (5 cols) */}
          <div className="lg:col-span-5 space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {filteredCoreDocs.map((doc) => {
              const isSelected = selectedDoc?.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-3 border text-xs cursor-pointer transition-colors ${
                    isSelected ? "border-black bg-[#F8F9FA]" : "border-[#E5E7EB] bg-white hover:border-[#9CA3AF]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-[#1A1A1A] text-sm">{doc.title}</span>
                    <span className="bg-black text-white px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider shrink-0">
                      {doc.publisher}
                    </span>
                  </div>
                  <p className="text-[#4B5563] text-xs mb-1.5">
                    {doc.chapter} &bull; <span className="text-[#6B7280]">{doc.section}</span>
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {(doc.keyConcepts || []).slice(0, 3).map((concept, i) => (
                      <span key={i} className="bg-[#F0F2F5] text-[#374151] px-1.5 py-0.5 text-[10px] font-mono">
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Document Full View (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-[#E5E7EB] p-5">
            {selectedDoc ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#9CA3AF]">
                      {selectedDoc.subject} &bull; {selectedDoc.gradeLevel}
                    </span>
                    <h3 className="text-base font-bold text-[#1A1A1A] mt-0.5">
                      {selectedDoc.title}
                    </h3>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      {selectedDoc.chapter} &bull; {selectedDoc.section}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-[#9CA3AF] shrink-0">
                    {selectedDoc.license}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold block mb-1">
                    Reference Identification:
                  </span>
                  <p className="text-xs text-[#1A1A1A] bg-[#F8F9FA] p-2 border border-[#E5E7EB] font-mono">
                    {selectedDoc.pageOrRef}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold block mb-1">
                    Summary & Learning Outcomes:
                  </span>
                  <p className="text-xs text-[#374151] leading-relaxed bg-[#F8F9FA] p-3 border border-[#E5E7EB] font-sans">
                    {selectedDoc.summary}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold block mb-1">
                    Curriculum Framework Content:
                  </span>
                  <div className="whitespace-pre-wrap font-mono text-xs text-[#1A1A1A] leading-relaxed bg-[#F8F9FA] p-3.5 border border-[#E5E7EB] overflow-x-auto max-h-72">
                    {selectedDoc.content}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold block mb-1">
                    Indexed Concept Tags:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedDoc.keyConcepts || []).map((concept, idx) => (
                      <span
                        key={idx}
                        className="bg-white text-[#1A1A1A] border border-[#E5E7EB] px-2 py-0.5 text-xs font-mono"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-[#9CA3AF] text-xs">
                Select a curriculum topic from the list to view the verified textbook passage and formulas.
              </div>
            )}
          </div>
        </div>
      )}

      {/* UPLOAD DUMP MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-black max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div>
                <h3 className="font-bold text-base text-[#1A1A1A]">Deposit Resource into Knowledge Dump</h3>
                <p className="text-xs text-[#6B7280]">
                  Upload study materials, diagram photos, video lectures, or PDF guides.
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-[#6B7280] hover:text-black font-bold text-lg"
              >
                &times;
              </button>
            </div>

            {/* Media Type Selector */}
            <div className="space-y-1">
              <label className="font-bold text-xs text-[#1A1A1A] block">Select Resource Format:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setUploadMode("text")}
                  className={`p-2.5 border text-xs font-bold flex flex-col items-center gap-1 transition-colors ${
                    uploadMode === "text" ? "border-black bg-black text-white" : "border-[#E5E7EB] bg-[#F8F9FA] text-[#4B5563] hover:bg-[#E5E7EB]"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>📝 Written Notes</span>
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

            <form onSubmit={handleUploadSubmit} className="space-y-3 text-xs">
              {/* File Upload Area */}
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
                  placeholder="e.g., Complete Organic Chemistry Reaction Mechanisms & Solved Examples"
                  value={dumpFormData.title}
                  onChange={(e) => setDumpFormData({ ...dumpFormData, title: e.target.value })}
                  className="w-full bg-[#F8F9FA] border border-[#E5E7EB] px-3 py-2 text-xs outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-[#1A1A1A] block mb-1">Subject</label>
                  <select
                    value={dumpFormData.subject}
                    onChange={(e) => setDumpFormData({ ...dumpFormData, subject: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] px-2.5 py-2 text-xs outline-none focus:border-black cursor-pointer font-medium"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Biology">Biology</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#1A1A1A] block mb-1">Target Grade</label>
                  <input
                    type="text"
                    value={dumpFormData.gradeLevel}
                    onChange={(e) => setDumpFormData({ ...dumpFormData, gradeLevel: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] px-3 py-2 text-xs outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#1A1A1A] block mb-1">Chapter / Origin</label>
                  <input
                    type="text"
                    placeholder="e.g., Haloalkanes & Aldehydes"
                    value={dumpFormData.chapter}
                    onChange={(e) => setDumpFormData({ ...dumpFormData, chapter: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] px-3 py-2 text-xs outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#1A1A1A] block mb-1">Institution Affiliation</label>
                <input
                  type="text"
                  placeholder="e.g., Kendriya Vidyalaya No. 1 / Open Education Network"
                  value={dumpFormData.instituteName}
                  onChange={(e) => setDumpFormData({ ...dumpFormData, instituteName: e.target.value })}
                  className="w-full bg-[#F8F9FA] border border-[#E5E7EB] px-3 py-2 text-xs outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="font-bold text-[#1A1A1A] block mb-1">Tags (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g., nucleophilic-substitution, sn1-sn2, board-exam-prep"
                  value={dumpFormData.tags}
                  onChange={(e) => setDumpFormData({ ...dumpFormData, tags: e.target.value })}
                  className="w-full bg-[#F8F9FA] border border-[#E5E7EB] px-3 py-2 text-xs outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="font-bold text-[#1A1A1A] block mb-1">
                  {uploadMode === "text" ? "Study Material Content / Notes / Markdown *" : "Accompanying Notes / Summary (Optional)"}
                </label>
                <textarea
                  required={uploadMode === "text" && !uploadedFile}
                  rows={uploadMode === "text" ? 6 : 3}
                  placeholder={
                    uploadMode === "text"
                      ? "Paste or write detailed study notes, chemical reactions, formulas, explanations, worked questions..."
                      : "Add any extra context, timestamps, or summary for learners (AI will auto-transcribe the uploaded file)..."
                  }
                  value={dumpFormData.content}
                  onChange={(e) => setDumpFormData({ ...dumpFormData, content: e.target.value })}
                  className="w-full bg-[#F8F9FA] border border-[#E5E7EB] p-3 text-xs font-mono outline-none focus:border-black"
                />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>
                  The AI Multimodal Engine will transcribe handwritten equations, diagrams, and video lectures from this deposit.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-[#E5E7EB] text-[#4B5563] hover:bg-[#F8F9FA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || isProcessingFile}
                  className="bg-black hover:bg-[#333] text-white font-bold px-5 py-2 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      <span>AI Multimodal Processing...</span>
                    </>
                  ) : (
                    <span>Deposit into Knowledge Dump</span>
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
          <div className="bg-white dark:bg-[#1A1A1A] p-4 max-w-4xl max-h-[90vh] overflow-auto rounded space-y-2" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#333] pb-2">
              <h4 className="font-bold text-sm text-[#1A1A1A] dark:text-white">{zoomedMedia.title}</h4>
              <button onClick={() => setZoomedMedia(null)} className="text-xl font-bold text-[#6B7280] dark:text-[#AAA]">&times;</button>
            </div>
            <div className="flex items-center justify-center bg-black/5 p-2">
              <img src={zoomedMedia.url} alt={zoomedMedia.title} className="max-h-[75vh] object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* CONTRIBUTOR PROFILE & CONTRIBUTIONS MODAL */}
      {contributorModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setContributorModal(null)}>
          <div className="bg-white dark:bg-[#1A1A1A] border-2 border-black dark:border-white max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between border-b border-[#E5E7EB] dark:border-[#333] pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg font-mono text-white ${
                  contributorModal.role === "teacher" ? "bg-black dark:bg-white dark:text-black" : "bg-emerald-600"
                }`}>
                  {contributorModal.name.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#1A1A1A] dark:text-white flex items-center gap-2">
                    <span>{contributorModal.name}</span>
                    <span className={`text-[10px] uppercase font-mono px-2 py-0.5 font-bold ${
                      contributorModal.role === "teacher" ? "bg-black text-white dark:bg-white dark:text-black" : "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200"
                    }`}>
                      {contributorModal.role}
                    </span>
                  </h3>
                  <p className="text-xs text-[#6B7280] dark:text-[#AAA]">
                    🏫 {contributorModal.institute}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setContributorModal(null)}
                className="text-xs text-[#6B7280] hover:text-black dark:hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            {/* Contributor Stats Badges */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-[#F8F9FA] dark:bg-[#222] border border-[#E5E7EB] dark:border-[#333] text-center space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-[#9CA3AF]">Verified Uploads</span>
                <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400 font-mono">{contributorModal.verifiedUploads}</p>
              </div>
              <div className="p-3 bg-[#F8F9FA] dark:bg-[#222] border border-[#E5E7EB] dark:border-[#333] text-center space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-[#9CA3AF]">Total Deposits</span>
                <p className="text-lg font-bold text-[#1A1A1A] dark:text-white font-mono">{contributorModal.totalUploads}</p>
              </div>
              <div className="p-3 bg-[#F8F9FA] dark:bg-[#222] border border-[#E5E7EB] dark:border-[#333] text-center space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-[#9CA3AF]">Academic Subjects</span>
                <p className="text-sm font-bold text-indigo-700 dark:text-indigo-400 font-mono mt-1">
                  {contributorModal.subjects ? Array.from(contributorModal.subjects).join(", ") || "General" : "Physics, Chemistry"}
                </p>
              </div>
            </div>

            {/* List of Uploaded Study Materials */}
            <div className="space-y-2 pt-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#1A1A1A] dark:text-white">
                Contributed Study Materials & Resources ({contributorModal.uploads?.length || 0})
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {(contributorModal.uploads || []).map((u) => (
                  <div
                    key={u.id}
                    onClick={() => {
                      setSelectedDump(u);
                      setContributorModal(null);
                    }}
                    className="p-3 bg-[#F9FAFB] dark:bg-[#252525] border border-[#E5E7EB] dark:border-[#333] hover:border-black dark:hover:border-white cursor-pointer transition-all flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-[#1A1A1A] dark:text-white truncate">{u.title}</div>
                      <div className="text-[10px] text-[#6B7280] dark:text-[#AAA]">
                        {u.subject} &bull; {u.gradeLevel} &bull; {u.mediaType?.toUpperCase() || "TEXT"}
                      </div>
                    </div>
                    {u.isVerified ? (
                      <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-[10px] font-bold px-2 py-0.5 border border-emerald-200 dark:border-emerald-800 shrink-0 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Verified</span>
                      </span>
                    ) : (
                      <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 text-[10px] font-bold px-2 py-0.5 border border-amber-200 dark:border-amber-800 shrink-0">
                        Pending Verification
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
