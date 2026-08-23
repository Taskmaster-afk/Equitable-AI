import { useState, useEffect } from "react";
import {
  MessageSquare,
  Building,
  Plus,
  ThumbsUp,
  CheckCircle2,
  Send,
  User,
  Search,
  Tag,
  Sparkles,
  Award,
  BookOpen,
  Filter,
  School,
  Globe,
  Users,
  AlertCircle,
  Share2,
  ArrowRight,
  Trash2,
  Flag,
  AlertTriangle
} from "lucide-react";
import { api } from "../services/api";

export const CommunityForum = ({ currentUser, currentStudent, currentTeacher, onNavigateToTutor }) => {
  const user = currentTeacher || currentStudent || currentUser;
  const isTeacher = currentUser?.role === "teacher";
  const userInstitute = currentUser?.institute || currentUser?.school || currentStudent?.institute || currentTeacher?.school || "Kendriya Vidyalaya No. 1";

  const [classesList, setClassesList] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState("global"); // "global" | classCode
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [sortBy, setSortBy] = useState("unanswered"); // "unanswered" | "newest" | "upvotes" | "most_answers"
  const [activePost, setActivePost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Ask Doubt Modal
  const [showAskModal, setShowAskModal] = useState(false);
  const [newPostData, setNewPostData] = useState({
    title: "",
    subject: "Physics",
    gradeLevel: currentStudent?.gradeLevel || "Class 10",
    content: "",
    tags: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Answer Input State
  const [answerContent, setAnswerContent] = useState("");
  const [isAnswering, setIsAnswering] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Teacher Flag Modal State
  const [flagModal, setFlagModal] = useState({ open: false, postId: null, answerId: null, reason: "" });

  // Load classrooms for the current user
  useEffect(() => {
    loadUserClasses();
  }, [currentUser?.id, currentStudent?.id, currentTeacher?.id]);

  const loadUserClasses = async () => {
    try {
      if (isTeacher && currentTeacher?.id) {
        const res = await api.getTeacherClasses(currentTeacher.id);
        setClassesList(res?.classes || []);
      } else if (currentStudent?.id) {
        const res = await api.getStudentClasses(currentStudent.id, currentStudent.email);
        setClassesList(res?.classes || []);
      }
    } catch (err) {
      console.error("Failed to load user classes in community forum:", err);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [selectedChannel]);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const data = await api.getCommunityPosts({
        classCode: selectedChannel
      });
      const fetchedPosts = data.posts || [];
      const sorted = [...fetchedPosts].reverse();
      setPosts(sorted);
      if (sorted.length > 0 && (!activePost || !sorted.some(p => p.id === activePost.id))) {
        setActivePost(sorted[0]);
      } else if (sorted.length === 0) {
        setActivePost(null);
      }
    } catch (err) {
      console.error("Failed to load community posts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const activeClassObj = classesList.find(c => c.classCode === selectedChannel);

  const handleAskSubmit = async (e) => {
    e.preventDefault();
    if (!newPostData.title.trim() || !newPostData.content.trim()) {
      setStatusMessage({ type: "error", text: "Please enter your doubt title and description." });
      return;
    }

    setIsSubmitting(true);
    try {
      const isGlobal = selectedChannel === "global";
      const payload = {
        instituteName: activeClassObj?.school || userInstitute,
        classCode: !isGlobal ? selectedChannel : "",
        section: activeClassObj?.section || currentStudent?.section || "All",
        title: newPostData.title.trim(),
        content: newPostData.content.trim(),
        subject: newPostData.subject || activeClassObj?.subject || "General",
        gradeLevel: newPostData.gradeLevel || activeClassObj?.gradeLevel || "Class 10",
        authorName: user?.name || (isTeacher ? "Teacher" : "Student"),
        authorRole: isTeacher ? "teacher" : "student",
        authorId: user?.id || "user-1",
        tags: newPostData.tags ? newPostData.tags.split(",").map(t => t.trim()).filter(Boolean) : [newPostData.subject || "General"]
      };

      await api.createCommunityPost(payload);
      setStatusMessage({
        type: "success",
        text: isGlobal ? "Doubt posted to Global Forum!" : `Doubt posted to classroom ${selectedChannel}!`
      });
      setNewPostData({
        title: "",
        subject: activeClassObj?.subject || "Physics",
        gradeLevel: currentStudent?.gradeLevel || "Class 10",
        content: "",
        tags: ""
      });
      setShowAskModal(false);
      loadPosts();
    } catch (err) {
      setStatusMessage({ type: "error", text: err.message || "Failed to post doubt" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (!answerContent.trim() || !activePost) return;

    setIsAnswering(true);
    try {
      const payload = {
        authorName: user?.name || (isTeacher ? "Teacher" : "Student"),
        authorRole: isTeacher ? "teacher" : "student",
        authorId: user?.id || "user-1",
        content: answerContent.trim()
      };

      const res = await api.answerCommunityPost(activePost.id, payload);
      setAnswerContent("");
      // Update local state
      setActivePost(res.post);
      setPosts(prev => prev.map(p => p.id === res.post.id ? res.post : p));
      setStatusMessage({ type: "success", text: "Your answer has been posted!" });
    } catch (err) {
      setStatusMessage({ type: "error", text: err.message || "Failed to submit answer" });
    } finally {
      setIsAnswering(false);
    }
  };

  const handleUpvotePost = async (postId) => {
    try {
      const res = await api.upvoteCommunityPost(postId, user?.id || "anon");
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return { ...p, upvotes: res.upvotes };
        }
        return p;
      }));
      if (activePost?.id === postId) {
        setActivePost(prev => ({ ...prev, upvotes: res.upvotes }));
      }
    } catch (err) {
      console.error("Upvote failed:", err);
    }
  };

  const handleUpvoteAnswer = async (postId, answerId) => {
    try {
      const res = await api.upvoteAnswer(postId, answerId, user?.id || "anon");
      if (activePost && activePost.id === postId) {
        const updatedAnswers = activePost.answers.map(a => {
          if (a.id === answerId) {
            return { ...a, upvotes: res.upvotes };
          }
          return a;
        });
        const updatedPost = { ...activePost, answers: updatedAnswers };
        setActivePost(updatedPost);
        setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
      }
    } catch (err) {
      console.error("Answer upvote failed:", err);
    }
  };

  const handleVerifyAnswer = async (postId, answerId) => {
    if (!isTeacher) return;
    try {
      const res = await api.verifyAnswer(postId, answerId);
      if (activePost && activePost.id === postId) {
        const updatedAnswers = activePost.answers.map((a) => {
          if (a.id === answerId) {
            return { ...a, isVerified: res.isVerified, isFlagged: false };
          }
          return a;
        });
        const updatedPost = { ...activePost, answers: updatedAnswers };
        setActivePost(updatedPost);
        setPosts((prev) => prev.map((p) => (p.id === postId ? updatedPost : p)));
      }
    } catch (err) {
      console.error("Verification failed:", err);
    }
  };

  const handleFlagAnswerSubmit = async () => {
    if (!flagModal.postId || !flagModal.answerId) return;
    try {
      const res = await api.flagCommunityAnswer(
        flagModal.postId,
        flagModal.answerId,
        currentUser?.name || "Faculty Instructor",
        flagModal.reason || "Conceptually incorrect or needs critical revision."
      );
      if (res?.post) {
        setActivePost(res.post);
        setPosts((prev) => prev.map((p) => (p.id === flagModal.postId ? res.post : p)));
      }
      setFlagModal({ open: false, postId: null, answerId: null, reason: "" });
      alert("Answer flagged as incorrect. Warning banner attached for student review.");
    } catch (err) {
      alert(err.message || "Failed to flag answer");
    }
  };

  const filteredPosts = posts
    .filter((p) => {
      // 1. Search Query
      const term = searchQuery.toLowerCase().trim();
      if (term) {
        const matchesSearch =
          p.title?.toLowerCase().includes(term) ||
          p.content?.toLowerCase().includes(term) ||
          p.subject?.toLowerCase().includes(term) ||
          p.authorName?.toLowerCase().includes(term) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(term)));
        if (!matchesSearch) return false;
      }
      // 2. Subject Filter
      if (selectedSubject !== "all") {
        if (!p.subject || !p.subject.toLowerCase().includes(selectedSubject.toLowerCase())) {
          return false;
        }
      }
      // 3. Grade Filter
      if (selectedGrade !== "all") {
        if (!p.gradeLevel || !p.gradeLevel.toLowerCase().includes(selectedGrade.toLowerCase())) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "unanswered") {
        const aCount = a.answers?.length || 0;
        const bCount = b.answers?.length || 0;
        if (aCount === 0 && bCount > 0) return -1;
        if (bCount === 0 && aCount > 0) return 1;
        return (b.upvotes || 0) - (a.upvotes || 0);
      }
      if (sortBy === "upvotes") {
        return (b.upvotes || 0) - (a.upvotes || 0);
      }
      if (sortBy === "most_answers") {
        return (b.answers?.length || 0) - (a.answers?.length || 0);
      }
      return 0; // Newest first
    });

  return (
    <div id="community-forum-container" className="max-w-7xl mx-auto px-4 sm:px-8 py-5 space-y-5">
      {/* Classroom & Global Channels Switcher Ribbon */}
      <div className="bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-zinc-800 dark:border-[#2A2A2A] p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 dark:border-[#2A2A2A] pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-black dark:text-white" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white dark:text-white">
                {isTeacher ? "Teacher Classroom Doubts & Global Chat" : "My Classroom Doubts & Global Chat"}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 dark:text-[#AAA]">
                {isTeacher
                  ? "Manage and answer student doubts by subject & grade level, or access the national global community"
                  : "Collaborate on questions with classmates and teachers, filtered by your exact subject and class"}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAskModal(true)}
            className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black hover:bg-[#333] dark:hover:bg-neutral-200 text-xs font-semibold px-4 py-2 border border-black dark:border-white transition-colors shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Ask a Doubt {selectedChannel !== "global" ? `in ${selectedChannel}` : "in Global"}</span>
          </button>
        </div>

        {/* Channel Selection Buttons */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#9CA3AF] mr-1">
            Active Channel:
          </span>

          {/* Global Channel Tab */}
          <button
            type="button"
            onClick={() => setSelectedChannel("global")}
            className={`px-3 py-1.5 text-xs font-bold transition-all border flex items-center gap-1.5 ${
              selectedChannel === "global"
                ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs"
                : "bg-[#F8F9FA] dark:bg-[#252525] text-slate-600 dark:text-zinc-300 dark:text-[#CCC] border-slate-200 dark:border-zinc-800 dark:border-[#333] hover:border-black"
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>🌐 Global Chat (All Questions)</span>
          </button>

          {/* User's Specific Classrooms Tabs */}
          {classesList.map((cls) => {
            const isSelected = selectedChannel === cls.classCode;
            return (
              <button
                key={cls.classCode}
                type="button"
                onClick={() => setSelectedChannel(cls.classCode)}
                className={`px-3 py-1.5 text-xs font-bold transition-all border flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs"
                    : "bg-[#F8F9FA] dark:bg-[#252525] text-slate-600 dark:text-zinc-300 dark:text-[#CCC] border-slate-200 dark:border-zinc-800 dark:border-[#333] hover:border-black"
                }`}
              >
                <School className="w-3.5 h-3.5 text-indigo-500" />
                <span>{cls.className || cls.classCode}</span>
                <span className="text-[10px] font-mono text-neutral-400">({cls.classCode})</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Multi-Filter Bar: Subject, Grade Level & Sort By */}
        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 dark:border-[#2A2A2A] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase font-bold text-[#9CA3AF] flex items-center gap-1">
              <Filter className="w-3 h-3" />
              <span>Filter By:</span>
            </span>

            {/* Subject Selector */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-[#F8F9FA] dark:bg-[#252525] border border-slate-200 dark:border-zinc-800 dark:border-[#333] text-slate-900 dark:text-white dark:text-[#E5E7EB] px-2 py-1 text-xs font-medium outline-none cursor-pointer"
            >
              <option value="all">All Subjects</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Biology">Biology</option>
              <option value="Computer Science">Computer Science & IT</option>
              <option value="English">English</option>
              <option value="Social Science">Social Science / History / Geography</option>
              <option value="Economics">Economics & Commerce</option>
            </select>

            {/* Grade Selector */}
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="bg-[#F8F9FA] dark:bg-[#252525] border border-slate-200 dark:border-zinc-800 dark:border-[#333] text-slate-900 dark:text-white dark:text-[#E5E7EB] px-2 py-1 text-xs font-medium outline-none cursor-pointer"
            >
              <option value="all">All Class Levels</option>
              <option value="Class 12">Class 12</option>
              <option value="Class 11">Class 11</option>
              <option value="Class 10">Class 10</option>
              <option value="Class 9">Class 9</option>
              <option value="Class 8">Class 8</option>
              <option value="Class 7">Class 7</option>
              <option value="Class 6">Class 6</option>
              <option value="Undergraduate">Undergraduate</option>
            </select>
          </div>

          {/* Sort By Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-[#9CA3AF]">Sort Order:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#F8F9FA] dark:bg-[#252525] border border-slate-200 dark:border-zinc-800 dark:border-[#333] text-slate-900 dark:text-white dark:text-[#E5E7EB] px-2 py-1 text-xs font-bold outline-none cursor-pointer text-indigo-700 dark:text-indigo-300"
            >
              <option value="unanswered">⚡ Unanswered First (Ready to Answer)</option>
              <option value="newest">🕒 Newest Questions First</option>
              <option value="upvotes">🔥 Most Upvoted</option>
              <option value="most_answers">💬 Most Answered</option>
            </select>
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

      {/* Main Two-Column Community Chat Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Doubts Thread List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {/* Search Header */}
          <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xs p-3 flex items-center gap-2">
            <Search className="w-4 h-4 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search doubts, topics, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-xs text-slate-900 dark:text-white"
            />
          </div>

          {/* Threads List */}
          <div className="space-y-2.5 max-h-[660px] overflow-y-auto pr-1">
            {isLoading ? (
              <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xs p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
                Loading institutional community doubts...
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xs p-8 text-center space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-[#9CA3AF]" />
                <h3 className="font-bold text-xs text-slate-900 dark:text-white">No Doubts Posted Yet</h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Post the first doubt from your class or study group to start the discussion.
                </p>
                <button
                  onClick={() => setShowAskModal(true)}
                  className="bg-black text-white text-xs font-bold px-3 py-1.5 mt-2"
                >
                  Ask Doubt
                </button>
              </div>
            ) : (
              filteredPosts.map((post) => {
                const isSelected = activePost?.id === post.id;
                const hasTeacherAnswer = post.answers?.some(a => a.authorRole === "teacher" || a.isVerified);
                return (
                  <div
                    key={post.id}
                    onClick={() => setActivePost(post)}
                    className={`p-3 border text-xs cursor-pointer transition-colors ${
                      isSelected ? "border-indigo-600 dark:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30" : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18181b] hover:border-slate-400 dark:hover:border-zinc-600"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="bg-[#F3F4F6] text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 text-[10px] font-bold px-1.5 py-0.2">
                          {post.subject} &bull; {post.gradeLevel}
                        </span>
                        {hasTeacherAnswer && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>Teacher Verified</span>
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] font-mono text-[#9CA3AF]">
                        {post.createdAt}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1 line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-slate-500 dark:text-zinc-400 text-xs line-clamp-2 mb-2 font-mono">
                      {post.content}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 pt-2 border-t border-slate-100 dark:border-zinc-800">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3 text-[#9CA3AF]" />
                        <span>{post.authorName} ({post.authorRole})</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 text-[#9CA3AF]" />
                          <span>{post.answers?.length || 0} answers</span>
                        </span>
                        <span className="flex items-center gap-1 font-bold">
                          <ThumbsUp className="w-3 h-3 text-[#9CA3AF]" />
                          <span>{post.upvotes || 0}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Thread & Answers (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xs p-5 space-y-4">
          {activePost ? (
            <div className="space-y-4">
              {/* Question Details Header */}
              <div className="border-b border-slate-200 dark:border-zinc-800 pb-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-[#9CA3AF]">
                        {activePost.subject} &bull; {activePost.gradeLevel}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                        🏫 {activePost.instituteName}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      {activePost.title}
                    </h2>
                  </div>

                  <button
                    onClick={() => handleUpvotePost(activePost.id)}
                    className="flex items-center gap-1.5 bg-[#F8F9FA] hover:bg-[#E5E7EB] border border-slate-200 dark:border-zinc-800 px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white transition-colors"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{activePost.upvotes || 0}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
                  <span className="font-semibold text-slate-900 dark:text-white">{activePost.authorName}</span>
                  <span className="text-[#D1D5DB]">&bull;</span>
                  <span className="capitalize">{activePost.authorRole}</span>
                  <span className="text-[#D1D5DB]">&bull;</span>
                  <span>{activePost.createdAt}</span>
                </div>

                {/* Full Question Content */}
                <div className="p-3.5 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-mono text-slate-900 dark:text-white whitespace-pre-wrap leading-relaxed">
                  {activePost.content}
                </div>

                {activePost.tags && activePost.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {activePost.tags.map((tag, idx) => (
                      <span key={idx} className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xs text-[10px] px-2 py-0.5 font-mono text-slate-600 dark:text-zinc-300">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Answers List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-black" />
                    <span>Community Answers ({activePost.answers?.length || 0})</span>
                  </h3>
                  {isTeacher && (
                    <span className="text-[10px] text-emerald-700 font-medium">
                      Teacher Privileges Active: Click 'Verify' to endorse correct answers
                    </span>
                  )}
                </div>

                {activePost.answers && activePost.answers.length > 0 ? (
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {activePost.answers.map((ans) => (
                      <div
                        key={ans.id}
                        className={`p-3.5 border text-xs space-y-2 ${
                          ans.isVerified || ans.authorRole === "teacher"
                            ? "border-emerald-300 bg-emerald-50/40"
                            : "border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">{ans.authorName}</span>
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 ${
                              ans.authorRole === "teacher" ? "bg-black text-white" : "bg-[#E5E7EB] text-slate-600 dark:text-zinc-300"
                            }`}>
                              {ans.authorRole}
                            </span>
                            {(ans.isVerified || ans.authorRole === "teacher") && (
                              <span className="text-emerald-700 font-bold text-[10px] flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Verified Solution</span>
                              </span>
                            )}
                          </div>

                          <span className="text-[10px] font-mono text-[#9CA3AF]">{ans.createdAt}</span>
                        </div>

                        {ans.isFlagged && (
                          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 p-2.5 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold">🚩 Flagged as Inaccurate by Faculty ({ans.flaggedBy || "Instructor"}):</p>
                              <p className="text-[11px] mt-0.5">{ans.flagReason || "Conceptually flawed or needs critical revision."}</p>
                            </div>
                          </div>
                        )}

                        <div className="font-mono text-[#1F2937] dark:text-[#E5E7EB] whitespace-pre-wrap leading-relaxed">
                          {ans.content}
                        </div>

                        <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 dark:border-[#333] flex items-center justify-between">
                          <button
                            onClick={() => handleUpvoteAnswer(activePost.id, ans.id)}
                            className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-zinc-400 dark:text-[#AAA] hover:text-black dark:hover:text-white font-semibold"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>Helpful ({ans.upvotes || 0})</span>
                          </button>

                          {isTeacher && (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setFlagModal({ open: true, postId: activePost.id, answerId: ans.id, reason: "" })}
                                className="text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 flex items-center gap-1 border border-rose-200 dark:border-rose-900 px-2 py-0.5 bg-rose-50 dark:bg-rose-950/20"
                                title="Flag answer as incorrect"
                              >
                                <Flag className="w-3 h-3" />
                                <span>Flag Incorrect</span>
                              </button>
                              <button
                                onClick={() => handleVerifyAnswer(activePost.id, ans.id)}
                                className={`text-[10px] font-bold px-2 py-0.5 border transition-colors ${
                                  ans.isVerified
                                    ? "bg-emerald-600 text-white border-emerald-600"
                                    : "bg-white dark:bg-[#1E1E1E] text-slate-600 dark:text-zinc-300 dark:text-[#CCC] border-slate-200 dark:border-zinc-800 dark:border-[#333] hover:border-emerald-600 hover:text-emerald-700"
                                }`}
                              >
                                {ans.isVerified ? "Endorsed by You" : "Endorse / Verify"}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#9CA3AF] p-4 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-lg text-center">
                    No community answers yet. Be the first classmate or teacher to post a worked solution!
                  </p>
                )}
              </div>

              {/* Submit Answer Box */}
              <form onSubmit={handleAnswerSubmit} className="space-y-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
                <label className="font-bold text-xs text-slate-900 dark:text-white block">
                  Post Your Answer or Explanation:
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain step-by-step or share formula steps to solve this doubt..."
                  value={answerContent}
                  onChange={(e) => setAnswerContent(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-lg p-2.5 text-xs font-mono outline-none focus:border-black"
                />

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Posting as: <strong>{user?.name}</strong> ({isTeacher ? "Teacher" : "Student"})
                  </span>
                  <button
                    type="submit"
                    disabled={isAnswering || !answerContent.trim()}
                    className="bg-black hover:bg-[#333] text-white text-xs font-bold px-4 py-2 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Send className="w-3 h-3" />
                    <span>{isAnswering ? "Posting..." : "Post Answer"}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="text-center py-20 text-[#9CA3AF] text-xs">
              Select a doubt thread from the left to view the question details, answers, and contribute solutions.
            </div>
          )}
        </div>
      </div>

      {/* ASK DOUBT MODAL */}
      {showAskModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#18181b] border border-slate-300 dark:border-zinc-700 max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Ask a Community Doubt</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Post your question to peers and faculty at {userInstitute}.
                </p>
              </div>
              <button
                onClick={() => setShowAskModal(false)}
                className="text-slate-500 dark:text-zinc-400 hover:text-black font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAskSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-900 dark:text-white block mb-1">Question / Doubt Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Why does fringe width decrease in Young's Double Slit experiment when placed in water?"
                  value={newPostData.title}
                  onChange={(e) => setNewPostData({ ...newPostData, title: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-900 dark:text-white block mb-1">Subject</label>
                  <select
                    value={newPostData.subject}
                    onChange={(e) => setNewPostData({ ...newPostData, subject: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-2 text-xs outline-none focus:border-black cursor-pointer font-medium"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Biology">Biology</option>
                    <option value="General Science">General Science</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-900 dark:text-white block mb-1">Class / Grade Level</label>
                  <input
                    type="text"
                    value={newPostData.gradeLevel}
                    onChange={(e) => setNewPostData({ ...newPostData, gradeLevel: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-900 dark:text-white block mb-1">Detailed Explanation of Your Doubt *</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Describe where you are stuck, what formula you tried, and what step is confusing..."
                  value={newPostData.content}
                  onChange={(e) => setNewPostData({ ...newPostData, content: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-lg p-3 text-xs font-mono outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="font-bold text-slate-900 dark:text-white block mb-1">Tags (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g., optics, fringe-width, refractive-index, class12"
                  value={newPostData.tags}
                  onChange={(e) => setNewPostData({ ...newPostData, tags: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs outline-none focus:border-black"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAskModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-[#F8F9FA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-black hover:bg-[#333] text-white font-bold px-5 py-2 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Posting..." : "Post Doubt to Community"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teacher Flag Modal */}
      {flagModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-[#1A1A1A] border-2 border-rose-600 max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 dark:border-[#333] pb-3">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white dark:text-white">Flag Answer as Incorrect</h3>
              </div>
              <button
                type="button"
                onClick={() => setFlagModal({ open: false, postId: null, answerId: null, reason: "" })}
                className="text-xs text-slate-500 dark:text-zinc-400 hover:text-black dark:hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 dark:text-zinc-300 dark:text-[#CCC] leading-relaxed">
                As a faculty instructor, flagging this answer will attach an official warning banner and remove any verification badges.
              </p>

              <div>
                <label className="font-bold text-slate-900 dark:text-white dark:text-white block mb-1">
                  Reason for Flagging / Instructor Note:
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g., Formula applied incorrectly in step 2; missing negative sign in EMF equation..."
                  value={flagModal.reason}
                  onChange={(e) => setFlagModal({ ...flagModal, reason: e.target.value })}
                  className="w-full bg-[#F8F9FA] dark:bg-[#252525] border border-slate-200 dark:border-zinc-800 dark:border-[#333] p-2.5 text-xs text-slate-900 dark:text-white dark:text-white outline-none focus:border-rose-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800 dark:border-[#333]">
              <button
                type="button"
                onClick={() => setFlagModal({ open: false, postId: null, answerId: null, reason: "" })}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-zinc-300 dark:text-[#AAA] border border-slate-200 dark:border-zinc-800 dark:border-[#333] hover:bg-[#F3F4F6] dark:hover:bg-[#252525]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFlagAnswerSubmit}
                className="px-4 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors"
              >
                Confirm Flag
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
