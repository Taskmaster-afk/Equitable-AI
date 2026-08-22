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
  Filter
} from "lucide-react";
import { api } from "../services/api";

export const CommunityForum = ({ currentUser, currentStudent, currentTeacher, onNavigateToTutor }) => {
  const user = currentTeacher || currentStudent || currentUser;
  const isTeacher = currentUser?.role === "teacher";
  const userInstitute = currentUser?.institute || currentUser?.school || currentStudent?.institute || currentTeacher?.school || "National Open Education Network";

  const [posts, setPosts] = useState([]);
  const [selectedInstitute, setSelectedInstitute] = useState(userInstitute);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activePost, setActivePost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Ask Doubt Modal
  const [showAskModal, setShowAskModal] = useState(false);
  const [newPostData, setNewPostData] = useState({
    title: "",
    subject: "Physics",
    gradeLevel: currentStudent?.gradeLevel || "Class 12",
    content: "",
    tags: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Answer Input State
  const [answerContent, setAnswerContent] = useState("");
  const [isAnswering, setIsAnswering] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    loadPosts();
  }, [selectedInstitute, selectedSubject]);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const data = await api.getCommunityPosts({
        institute: selectedInstitute !== "all" ? selectedInstitute : void 0,
        subject: selectedSubject !== "all" ? selectedSubject : void 0
      });
      setPosts(data.posts || []);
      if (data.posts && data.posts.length > 0 && !activePost) {
        setActivePost(data.posts[0]);
      }
    } catch (err) {
      console.error("Failed to load community posts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskSubmit = async (e) => {
    e.preventDefault();
    if (!newPostData.title.trim() || !newPostData.content.trim()) {
      setStatusMessage({ type: "error", text: "Please enter your doubt title and description." });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        instituteName: userInstitute,
        title: newPostData.title,
        content: newPostData.content,
        subject: newPostData.subject,
        gradeLevel: newPostData.gradeLevel,
        authorName: user?.name || "Community Scholar",
        authorRole: isTeacher ? "teacher" : "student",
        authorId: user?.id || "user-1",
        tags: newPostData.tags
      };

      const res = await api.createCommunityPost(payload);
      setStatusMessage({ type: "success", text: "Doubt posted to your institution's community chat!" });
      setNewPostData({
        title: "",
        subject: "Physics",
        gradeLevel: currentStudent?.gradeLevel || "Class 12",
        content: "",
        tags: ""
      });
      setShowAskModal(false);
      loadPosts();
      if (res.post) {
        setActivePost(res.post);
      }
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
        authorName: user?.name || (isTeacher ? "Faculty Member" : "Class Peer"),
        authorRole: isTeacher ? "teacher" : "student",
        authorId: user?.id || "user-1",
        content: answerContent
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
        const updatedAnswers = activePost.answers.map(a => {
          if (a.id === answerId) {
            return { ...a, isVerified: res.isVerified };
          }
          return a;
        });
        const updatedPost = { ...activePost, answers: updatedAnswers };
        setActivePost(updatedPost);
        setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
      }
    } catch (err) {
      console.error("Verification failed:", err);
    }
  };

  const filteredPosts = posts.filter(p => {
    const term = searchQuery.toLowerCase();
    return (
      !term ||
      p.title?.toLowerCase().includes(term) ||
      p.content?.toLowerCase().includes(term) ||
      p.subject?.toLowerCase().includes(term) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(term)))
    );
  });

  return (
    <div id="community-forum-container" className="max-w-7xl mx-auto px-4 sm:px-8 py-5 space-y-5">
      {/* Community Banner */}
      <div className="bg-white border border-[#E5E7EB] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F0F2F5] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-black text-white text-[10px] font-mono font-bold px-2 py-0.5 uppercase tracking-wider">
                Institutional Community Forum
              </span>
              <span className="text-xs text-[#6B7280]">
                Peer & Teacher Doubt Resolution Network
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#1A1A1A] flex items-center gap-2">
              <Building className="w-5 h-5 text-black" />
              <span>{userInstitute}</span>
            </h1>
            <p className="text-xs text-[#6B7280]">
              Ask doubts, share problem approaches, and get verified answers from your classmates and school faculty.
            </p>
          </div>

          <button
            onClick={() => setShowAskModal(true)}
            className="flex items-center gap-2 bg-black hover:bg-[#333] text-white text-xs font-semibold px-4 py-2 border border-black transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Ask a Doubt</span>
          </button>
        </div>

        {/* Institution Scope & Filtering Filter Bar */}
        <div className="pt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-[#6B7280] uppercase">Filter Institute:</span>
            <button
              onClick={() => setSelectedInstitute(userInstitute)}
              className={`px-2.5 py-1 text-xs font-semibold border transition-colors ${
                selectedInstitute === userInstitute ? "bg-black text-white border-black" : "bg-[#F8F9FA] text-[#4B5563] border-[#E5E7EB]"
              }`}
            >
              My Campus ({userInstitute.split(",")[0]})
            </button>
            <button
              onClick={() => setSelectedInstitute("all")}
              className={`px-2.5 py-1 text-xs font-semibold border transition-colors ${
                selectedInstitute === "all" ? "bg-black text-white border-black" : "bg-[#F8F9FA] text-[#4B5563] border-[#E5E7EB]"
              }`}
            >
              All Partner Institutes
            </button>
          </div>

          <div className="flex items-center gap-2">
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
          <div className="bg-white border border-[#E5E7EB] p-3 flex items-center gap-2">
            <Search className="w-4 h-4 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search doubts, topics, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-xs text-[#1A1A1A]"
            />
          </div>

          {/* Threads List */}
          <div className="space-y-2.5 max-h-[660px] overflow-y-auto pr-1">
            {isLoading ? (
              <div className="bg-white border border-[#E5E7EB] p-8 text-center text-xs text-[#6B7280]">
                Loading institutional community doubts...
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="bg-white border border-[#E5E7EB] p-8 text-center space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-[#9CA3AF]" />
                <h3 className="font-bold text-xs text-[#1A1A1A]">No Doubts Posted Yet</h3>
                <p className="text-[11px] text-[#6B7280]">
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
                      isSelected ? "border-black bg-[#F8F9FA]" : "border-[#E5E7EB] bg-white hover:border-[#9CA3AF]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB] text-[10px] font-bold px-1.5 py-0.2">
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

                    <h3 className="font-bold text-sm text-[#1A1A1A] mb-1 line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-[#6B7280] text-xs line-clamp-2 mb-2 font-mono">
                      {post.content}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-[#6B7280] pt-2 border-t border-[#F0F2F5]">
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
        <div className="lg:col-span-7 bg-white border border-[#E5E7EB] p-5 space-y-4">
          {activePost ? (
            <div className="space-y-4">
              {/* Question Details Header */}
              <div className="border-b border-[#E5E7EB] pb-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-[#9CA3AF]">
                        {activePost.subject} &bull; {activePost.gradeLevel}
                      </span>
                      <span className="text-[11px] text-[#6B7280]">
                        🏫 {activePost.instituteName}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-[#1A1A1A]">
                      {activePost.title}
                    </h2>
                  </div>

                  <button
                    onClick={() => handleUpvotePost(activePost.id)}
                    className="flex items-center gap-1.5 bg-[#F8F9FA] hover:bg-[#E5E7EB] border border-[#E5E7EB] px-3 py-1.5 text-xs font-bold text-[#1A1A1A] transition-colors"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{activePost.upvotes || 0}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                  <span className="font-semibold text-[#1A1A1A]">{activePost.authorName}</span>
                  <span className="text-[#D1D5DB]">&bull;</span>
                  <span className="capitalize">{activePost.authorRole}</span>
                  <span className="text-[#D1D5DB]">&bull;</span>
                  <span>{activePost.createdAt}</span>
                </div>

                {/* Full Question Content */}
                <div className="p-3.5 bg-[#F8F9FA] border border-[#E5E7EB] text-xs font-mono text-[#1A1A1A] whitespace-pre-wrap leading-relaxed">
                  {activePost.content}
                </div>

                {activePost.tags && activePost.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {activePost.tags.map((tag, idx) => (
                      <span key={idx} className="bg-white border border-[#E5E7EB] text-[10px] px-2 py-0.5 font-mono text-[#4B5563]">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Answers List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#1A1A1A] flex items-center gap-2">
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
                            : "border-[#E5E7EB] bg-[#FAFAFA]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#1A1A1A]">{ans.authorName}</span>
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 ${
                              ans.authorRole === "teacher" ? "bg-black text-white" : "bg-[#E5E7EB] text-[#4B5563]"
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

                        <div className="font-mono text-[#1F2937] whitespace-pre-wrap leading-relaxed">
                          {ans.content}
                        </div>

                        <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between">
                          <button
                            onClick={() => handleUpvoteAnswer(activePost.id, ans.id)}
                            className="flex items-center gap-1 text-[11px] text-[#6B7280] hover:text-black font-semibold"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>Helpful ({ans.upvotes || 0})</span>
                          </button>

                          {isTeacher && (
                            <button
                              onClick={() => handleVerifyAnswer(activePost.id, ans.id)}
                              className={`text-[10px] font-bold px-2 py-0.5 border transition-colors ${
                                ans.isVerified
                                  ? "bg-emerald-600 text-white border-emerald-600"
                                  : "bg-white text-[#4B5563] border-[#E5E7EB] hover:border-emerald-600 hover:text-emerald-700"
                              }`}
                            >
                              {ans.isVerified ? "Endorsed by You" : "Endorse / Verify"}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#9CA3AF] p-4 bg-[#F8F9FA] border border-[#E5E7EB] text-center">
                    No community answers yet. Be the first classmate or teacher to post a worked solution!
                  </p>
                )}
              </div>

              {/* Submit Answer Box */}
              <form onSubmit={handleAnswerSubmit} className="space-y-2 pt-2 border-t border-[#E5E7EB]">
                <label className="font-bold text-xs text-[#1A1A1A] block">
                  Post Your Answer or Explanation:
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain step-by-step or share formula steps to solve this doubt..."
                  value={answerContent}
                  onChange={(e) => setAnswerContent(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-[#E5E7EB] p-2.5 text-xs font-mono outline-none focus:border-black"
                />

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#6B7280]">
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
          <div className="bg-white border border-black max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div>
                <h3 className="font-bold text-base text-[#1A1A1A]">Ask a Community Doubt</h3>
                <p className="text-xs text-[#6B7280]">
                  Post your question to peers and faculty at {userInstitute}.
                </p>
              </div>
              <button
                onClick={() => setShowAskModal(false)}
                className="text-[#6B7280] hover:text-black font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAskSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#1A1A1A] block mb-1">Question / Doubt Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Why does fringe width decrease in Young's Double Slit experiment when placed in water?"
                  value={newPostData.title}
                  onChange={(e) => setNewPostData({ ...newPostData, title: e.target.value })}
                  className="w-full bg-[#F8F9FA] border border-[#E5E7EB] px-3 py-2 text-xs outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#1A1A1A] block mb-1">Subject</label>
                  <select
                    value={newPostData.subject}
                    onChange={(e) => setNewPostData({ ...newPostData, subject: e.target.value })}
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
                  <label className="font-bold text-[#1A1A1A] block mb-1">Class / Grade Level</label>
                  <input
                    type="text"
                    value={newPostData.gradeLevel}
                    onChange={(e) => setNewPostData({ ...newPostData, gradeLevel: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] px-3 py-2 text-xs outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#1A1A1A] block mb-1">Detailed Explanation of Your Doubt *</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Describe where you are stuck, what formula you tried, and what step is confusing..."
                  value={newPostData.content}
                  onChange={(e) => setNewPostData({ ...newPostData, content: e.target.value })}
                  className="w-full bg-[#F8F9FA] border border-[#E5E7EB] p-3 text-xs font-mono outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="font-bold text-[#1A1A1A] block mb-1">Tags (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g., optics, fringe-width, refractive-index, class12"
                  value={newPostData.tags}
                  onChange={(e) => setNewPostData({ ...newPostData, tags: e.target.value })}
                  className="w-full bg-[#F8F9FA] border border-[#E5E7EB] px-3 py-2 text-xs outline-none focus:border-black"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAskModal(false)}
                  className="px-4 py-2 border border-[#E5E7EB] text-[#4B5563] hover:bg-[#F8F9FA]"
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
    </div>
  );
};
