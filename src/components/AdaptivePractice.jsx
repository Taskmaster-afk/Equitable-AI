import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Zap,
  ExternalLink,
  Star,
  Bookmark,
  Edit3,
  Search,
  Sparkles,
  X
} from "lucide-react";
import { api } from "../services/api";

const CURRICULUM_PRACTICE_TOPICS = [
  { id: "calculus-integrals", name: "Calculus: Integration by Parts & Integrals", subject: "Mathematics", grade: "Class 12" },
  { id: "matrices-determinants", name: "Matrices & Determinants (Inverses & Adjoint)", subject: "Mathematics", grade: "Class 12" },
  { id: "calculus-derivatives", name: "Derivatives from First Principle & Limits", subject: "Mathematics", grade: "Class 11-12" },
  { id: "vectors-3d", name: "Vectors & 3D Geometry (Shortest Distance)", subject: "Mathematics", grade: "Class 12" },
  { id: "quadratic-equations", name: "Quadratic Equations & Discriminant Formula", subject: "Mathematics", grade: "Class 10" },
  { id: "wave-optics", name: "Wave Optics: Young's Double Slit & Fringe Width", subject: "Physics", grade: "Class 12" },
  { id: "projectile-motion", name: "Kinematics: 2D Projectile Range & Max Height", subject: "Physics", grade: "Class 11" },
  { id: "current-electricity", name: "Current Electricity: Kirchhoff's Loop Laws", subject: "Physics", grade: "Class 12" },
  { id: "electromagnetism", name: "Electromagnetism: Faraday & Lenz's Induction", subject: "Physics", grade: "Class 12" },
  { id: "newton-laws", name: "Laws of Motion & Rate of Momentum Change", subject: "Physics", grade: "Class 9-10" },
  { id: "optics-mirrors", name: "Ray Optics: Mirror Formula & Lens Sign Convention", subject: "Physics", grade: "Class 10" },
  { id: "organic-haloalkanes", name: "Organic: SN1 vs SN2 Nucleophilic Substitution", subject: "Chemistry", grade: "Class 12" },
  { id: "electrochemistry", name: "Electrochemistry: Nernst Equation & Cell Potential", subject: "Chemistry", grade: "Class 12" },
  { id: "chemical-bonding", name: "Chemical Bonding: VSEPR, Hybridization & Bond Angle", subject: "Chemistry", grade: "Class 11" },
  { id: "coordination-chemistry", name: "Coordination Compounds & Crystal Field Splitting", subject: "Chemistry", grade: "Class 12" },
  { id: "genetics-dna", name: "Genetics: Meselson-Stahl DNA Replication", subject: "Biology", grade: "Class 12" },
  { id: "biotechnology", name: "Biotechnology: Recombinant DNA & Restriction Enzymes", subject: "Biology", grade: "Class 12" },
  { id: "photosynthesis-calvin", name: "Photosynthesis: Light Reactions & Calvin Cycle", subject: "Biology", grade: "Class 11" },
  { id: "digestive-system", name: "Human Physiology: Digestive Enzymes & Emulsification", subject: "Biology", grade: "Class 10" },
  { id: "data-structures", name: "Computer Science: Stacks, Queues & Algorithms", subject: "Computer Science", grade: "Class 11-12" }
];

export const AdaptivePractice = ({
  currentStudent,
  onUpdateStudent,
  preselectedTopicId
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTopicId, setActiveTopicId] = useState(
    preselectedTopicId || currentStudent?.masteryList?.[0]?.topicId || "calculus-integrals"
  );
  const [sessionStreak, setSessionStreak] = useState(0);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState("all");
  const [showExplanation, setShowExplanation] = useState(false);

  // Manual Custom Topic & Subject Typing State
  const [customSubjectInput, setCustomSubjectInput] = useState("Mathematics");
  const [customTopicInput, setCustomTopicInput] = useState("");
  const [showCustomTopicForm, setShowCustomTopicForm] = useState(false);

  // Bookmarked / Important Questions State
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState(() => {
    try {
      const saved = localStorage.getItem("equitable_bookmarked_questions");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [showBookmarksModal, setShowBookmarksModal] = useState(false);

  const loadNextQuestion = async (topicId, forcedDifficulty, customSubj, customTop) => {
    setIsLoading(true);
    setSelectedOptionIndex(null);
    setIsAnswerSubmitted(false);
    setShowExplanation(false);
    const targetTopicId = topicId || activeTopicId;
    setActiveTopicId(targetTopicId);
    try {
      const res = await api.generatePractice({
        studentId: currentStudent?.id || "student-1",
        topicId: targetTopicId,
        requestedDifficulty: forcedDifficulty,
        customSubject: customSubj,
        customTopic: customTop
      });
      setCurrentQuestion(res.question);
      if (res.targetTopic) {
        setActiveTopicId(res.targetTopic.topicId);
      }
    } catch (err) {
      console.error("Failed to load practice question:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNextQuestion(activeTopicId);
  }, [currentStudent?.id]);

  const handleSelectTopicFromPicker = (tId) => {
    setActiveTopicId(tId);
    loadNextQuestion(tId);
  };

  const handleStartCustomTopic = (e) => {
    if (e) e.preventDefault();
    if (!customTopicInput.trim()) return;
    const subj = customSubjectInput.trim() || "General Science & Mathematics";
    const top = customTopicInput.trim();
    loadNextQuestion(top, "Intermediate", subj, top);
  };

  const handleToggleBookmark = (question) => {
    if (!question) return;
    setBookmarkedQuestions((prev) => {
      const exists = prev.some((q) => q.id === question.id || q.questionText === question.questionText);
      let updated;
      if (exists) {
        updated = prev.filter((q) => q.id !== question.id && q.questionText !== question.questionText);
      } else {
        updated = [{ ...question, bookmarkedAt: new Date().toISOString() }, ...prev];
      }
      localStorage.setItem("equitable_bookmarked_questions", JSON.stringify(updated));
      return updated;
    });
  };

  const isCurrentQuestionBookmarked = currentQuestion
    ? bookmarkedQuestions.some((q) => q.id === currentQuestion.id || q.questionText === currentQuestion.questionText)
    : false;

  const handleSubmitAnswer = async () => {
    if (selectedOptionIndex === null || !currentQuestion || isAnswerSubmitted) return;
    const isCorrect = selectedOptionIndex === currentQuestion.correctOptionIndex;
    setIsAnswerSubmitted(true);
    setShowExplanation(true);
    if (isCorrect) {
      setSessionStreak((prev) => prev + 1);
    } else {
      setSessionStreak(0);
    }
    try {
      const res = await api.submitPractice({
        studentId: currentStudent?.id || "student-1",
        topicId: currentQuestion.topicId,
        isCorrect,
        difficulty: currentQuestion.difficulty
      });
      if (res.updatedProfile) {
        onUpdateStudent(res.updatedProfile);
      }
    } catch (err) {
      console.error("Error recording answer:", err);
    }
  };

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty) {
      case "Foundational":
        return <span className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">Level 1 &bull; Foundational</span>;
      case "Intermediate":
        return <span className="bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">Level 2 &bull; Intermediate</span>;
      case "Advanced":
        return <span className="bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">Level 3 &bull; Advanced</span>;
      default:
        return null;
    }
  };

  const filteredTopics = (currentStudent?.masteryList || []).filter((topic) => {
    if (selectedSubjectFilter === "all") return true;
    return topic.subject.toLowerCase() === selectedSubjectFilter.toLowerCase();
  });

  return (
    <div id="adaptive-practice-container" className="max-w-7xl mx-auto px-4 sm:px-8 py-5 space-y-5">
      {/* Streamlined Header */}
      <div className="bg-white dark:bg-[#1A1A1A] border border-[#E5E7EB] dark:border-[#2A2A2A] p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold block mb-0.5">
            Adaptive Diagnostic Engine
          </span>
          <h2 className="text-lg font-bold text-[#1A1A1A] dark:text-white tracking-tight">
            Curriculum Adaptive Practice & Diagnostic Ladder
          </h2>
          <p className="text-xs text-[#6B7280] dark:text-[#AAA] mt-0.5">
            Practice pre-curated topics or type any custom subject and topic freely with step-down prerequisite scaffolding.
          </p>
        </div>

        {/* Live Counters & Bookmarks Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowBookmarksModal(true)}
            className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700 px-3 py-1.5 text-xs font-bold transition-colors hover:bg-amber-100 dark:hover:bg-amber-900"
          >
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>Important Questions ({bookmarkedQuestions.length})</span>
          </button>

          <div className="flex items-center gap-3 bg-[#F8F9FA] dark:bg-[#222] border border-[#E5E7EB] dark:border-[#333] px-3 py-1.5 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-[#1A1A1A] dark:text-white">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Streak: {sessionStreak}</span>
            </div>
            <span className="text-[#D1D5DB] dark:text-[#444]">|</span>
            <span className="text-[#6B7280] dark:text-[#AAA]">
              Solved: <strong className="text-black dark:text-white font-mono">{currentStudent?.totalPracticeCompleted || 0}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Topic Selector & Custom Topic Input Bar */}
      <div className="bg-white dark:bg-[#1A1A1A] border border-[#E5E7EB] dark:border-[#2A2A2A] p-3.5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-bold text-[#1A1A1A] dark:text-white">
              Practice Topics & Custom Concept Generator:
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowCustomTopicForm(!showCustomTopicForm)}
              className={`text-xs px-2.5 py-1 border transition-colors font-bold flex items-center gap-1 ${
                showCustomTopicForm
                  ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                  : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{showCustomTopicForm ? "Hide Custom Topic" : "✏️ Type Custom Subject & Topic"}</span>
            </button>

            {/* Subject Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {["all", "Mathematics", "Physics", "Chemistry", "Biology", "Computer Science"].map((subj) => (
                <button
                  key={subj}
                  type="button"
                  onClick={() => setSelectedSubjectFilter(subj)}
                  className={`text-[11px] px-2.5 py-1 border transition-colors font-medium ${
                    selectedSubjectFilter === subj
                      ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-semibold"
                      : "bg-[#F8F9FA] dark:bg-[#252525] text-[#4B5563] dark:text-[#CCC] border-[#E5E7EB] dark:border-[#333] hover:border-black"
                  }`}
                >
                  {subj === "all" ? "All Subjects" : subj}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Subject & Topic Manual Form */}
        {showCustomTopicForm && (
          <form
            onSubmit={handleStartCustomTopic}
            className="p-3.5 bg-[#F9FAFB] dark:bg-[#202020] border border-indigo-200 dark:border-indigo-900 flex flex-wrap items-end gap-3 rounded-xs"
          >
            <div className="flex-1 min-w-[200px] space-y-1">
              <label className="text-[11px] font-bold text-[#1A1A1A] dark:text-white uppercase tracking-wider block">
                1. Subject:
              </label>
              <input
                type="text"
                value={customSubjectInput}
                onChange={(e) => setCustomSubjectInput(e.target.value)}
                placeholder="e.g. Physics, Mathematics, Chemistry, History, Economics..."
                className="w-full bg-white dark:bg-[#141414] border border-[#E5E7EB] dark:border-[#333] text-[#1A1A1A] dark:text-white px-3 py-1.5 text-xs outline-none focus:border-black dark:focus:border-white"
              />
            </div>

            <div className="flex-[2] min-w-[260px] space-y-1">
              <label className="text-[11px] font-bold text-[#1A1A1A] dark:text-white uppercase tracking-wider block">
                2. Topic / Chapter Name / Concept:
              </label>
              <input
                type="text"
                value={customTopicInput}
                onChange={(e) => setCustomTopicInput(e.target.value)}
                placeholder="e.g. AC Generator Principle, Optimization Word Problems, Aldol Condensation..."
                className="w-full bg-white dark:bg-[#141414] border border-[#E5E7EB] dark:border-[#333] text-[#1A1A1A] dark:text-white px-3 py-1.5 text-xs outline-none focus:border-black dark:focus:border-white"
              />
            </div>

            <button
              type="submit"
              disabled={!customTopicInput.trim() || isLoading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Generate Practice on My Topic</span>
            </button>
          </form>
        )}

        {/* Topic Quick-Chips */}
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-[#F0F2F5] dark:border-[#2A2A2A]">
          {CURRICULUM_PRACTICE_TOPICS
            .filter((t) => selectedSubjectFilter === "all" || t.subject.toLowerCase() === selectedSubjectFilter.toLowerCase())
            .map((t) => {
              const isSelected = t.id === activeTopicId;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSelectTopicFromPicker(t.id)}
                  className={`text-xs px-2.5 py-1 border transition-all text-left font-medium flex items-center gap-1 ${
                    isSelected
                      ? "bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs"
                      : "bg-[#F8F9FA] dark:bg-[#222] hover:bg-white dark:hover:bg-[#282828] text-[#1A1A1A] dark:text-[#DDD] border-[#E5E7EB] dark:border-[#333] hover:border-black"
                  }`}
                  title={`${t.subject} (${t.grade})`}
                >
                  <span>{t.name}</span>
                  {isSelected && <CheckCircle2 className="w-3 h-3 text-white ml-0.5" />}
                </button>
              );
            })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Active Question Workspace (8 Columns) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-5 min-h-[480px] flex flex-col justify-between bg-white dark:bg-[#1A1A1A] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs">
            {isLoading ? (
              <div className="h-64 flex flex-col items-center justify-center text-[#6B7280] dark:text-[#AAA] gap-3">
                <RefreshCw className="w-6 h-6 animate-spin text-black dark:text-white" />
                <p className="text-xs font-semibold uppercase tracking-wider">Retrieving curriculum question...</p>
              </div>
            ) : currentQuestion ? (
              <div>
                {/* Question Metadata Header with Bookmark Button */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-[#E5E7EB] dark:border-[#2A2A2A]">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-[#1A1A1A] dark:text-white">
                      {currentQuestion.subject}: {currentQuestion.topicName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Star / Bookmark Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleBookmark(currentQuestion)}
                      title={isCurrentQuestionBookmarked ? "Remove from Important Questions" : "Mark as Important Question"}
                      className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 border transition-colors ${
                        isCurrentQuestionBookmarked
                          ? "bg-amber-100 dark:bg-amber-950 border-amber-400 text-amber-900 dark:text-amber-200"
                          : "bg-white dark:bg-[#252525] border-[#E5E7EB] dark:border-[#333] text-[#6B7280] dark:text-[#AAA] hover:text-amber-600 hover:border-amber-300"
                      }`}
                    >
                      <Star className={`w-3 h-3 ${isCurrentQuestionBookmarked ? "fill-amber-500 text-amber-500" : ""}`} />
                      <span>{isCurrentQuestionBookmarked ? "★ Important" : "☆ Bookmark"}</span>
                    </button>

                    {getDifficultyBadge(currentQuestion.difficulty)}
                    {currentQuestion.isStepDownPrerequisite && (
                      <span className="bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Prerequisite Step-Down
                      </span>
                    )}
                  </div>
                </div>

                {/* Step-Down Alert Banner */}
                {currentQuestion.isStepDownPrerequisite && (
                  <div className="mb-4 bg-[#FFFBEB] dark:bg-amber-950/40 border-l-2 border-amber-500 p-3 text-xs text-[#92400E] dark:text-amber-200 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                    <div>
                      <strong className="font-bold">Adaptive Intervention: </strong>
                      Recent attempts indicated a foundational gap. This problem tests the prerequisite concept from earlier foundational units before climbing back up.
                    </div>
                  </div>
                )}

                {/* Question Statement */}
                <div className="text-sm font-medium text-[#1A1A1A] dark:text-white mb-5 leading-relaxed bg-[#F8F9FA] dark:bg-[#202020] p-4 border border-[#E5E7EB] dark:border-[#333]">
                  {currentQuestion.questionText}
                </div>

                {/* Multiple Choice Options (A, B, C, D) */}
                <div className="space-y-2.5 mb-5">
                  {(currentQuestion?.options || []).map((option, idx) => {
                    const isSelected = selectedOptionIndex === idx;
                    const isCorrect = idx === currentQuestion.correctOptionIndex;
                    let optionStyle = "bg-white dark:bg-[#1E1E1E] border-[#E5E7EB] dark:border-[#333] text-[#1A1A1A] dark:text-[#E5E7EB] hover:bg-[#F8F9FA] dark:hover:bg-[#252525]";
                    if (isAnswerSubmitted) {
                      if (isCorrect) {
                        optionStyle = "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-semibold";
                      } else if (isSelected && !isCorrect) {
                        optionStyle = "bg-rose-50 dark:bg-rose-950/50 border-rose-400 text-rose-900 dark:text-rose-200";
                      } else {
                        optionStyle = "bg-[#F8F9FA] dark:bg-[#1A1A1A] border-[#E5E7EB] dark:border-[#333] text-[#9CA3AF] opacity-60";
                      }
                    } else if (isSelected) {
                      optionStyle = "bg-black dark:bg-white border-black dark:border-white text-white dark:text-black font-medium";
                    }
                    return (
                      <button
                        key={idx}
                        disabled={isAnswerSubmitted}
                        onClick={() => setSelectedOptionIndex(idx)}
                        className={`w-full text-left p-3 border text-xs transition-colors flex items-center justify-between ${optionStyle}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`w-5 h-5 flex items-center justify-center text-xs font-mono font-bold ${isSelected && !isAnswerSubmitted ? "bg-white dark:bg-black text-black dark:text-white" : "bg-[#E5E7EB] dark:bg-[#333] text-[#4B5563] dark:text-[#CCC]"}`}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{option}</span>
                        </div>

                        {isAnswerSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                        {isAnswerSubmitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-600" />}
                      </button>
                    );
                  })}
                </div>

                {/* Worked Solution & Grounded Citation */}
                {showExplanation && (
                  <div className="mt-4 p-4 bg-[#F8F9FA] dark:bg-[#1E1E1E] border border-[#E5E7EB] dark:border-[#333] text-xs text-[#1A1A1A] dark:text-white space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs uppercase tracking-wider">
                        {selectedOptionIndex === currentQuestion.correctOptionIndex ? (
                          <span className="text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Correct &bull; Curriculum Derivation
                          </span>
                        ) : (
                          <span className="text-rose-700 dark:text-rose-300 flex items-center gap-1">
                            <XCircle className="w-4 h-4" /> Solution &bull; Step-by-Step Method
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="whitespace-pre-wrap font-sans text-[#374151] dark:text-[#CCC] leading-relaxed bg-white dark:bg-[#141414] p-3 border border-[#E5E7EB] dark:border-[#333]">
                      {currentQuestion.explanation}
                    </div>

                    {currentQuestion.groundedCitation && (
                      <div className="pt-2.5 border-t border-[#E5E7EB] dark:border-[#333] text-[11px] text-[#6B7280] dark:text-[#AAA] flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <BookOpen className="w-3.5 h-3.5 text-black dark:text-white shrink-0" />
                          <span>Curriculum Source: <strong className="text-black dark:text-white">{currentQuestion.groundedCitation.sourceName}</strong> ({currentQuestion.groundedCitation.chapter})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-[#9CA3AF]">
                            {currentQuestion.groundedCitation.pageOrRef}
                          </span>
                          <a
                            href={currentQuestion.groundedCitation.bookUrl || currentQuestion.groundedCitation.accessLink || "#/oer"}
                            target={currentQuestion.groundedCitation.bookUrl?.startsWith("http") ? "_blank" : "_self"}
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-white dark:text-black bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 px-2 py-0.5"
                          >
                            <span>Open Book</span>
                            <ExternalLink className="w-2.5 h-2.5 ml-0.5 text-neutral-300 dark:text-neutral-700" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : null}

            {/* Bottom Actions Bar */}
            <div className="mt-6 pt-3 border-t border-[#E5E7EB] dark:border-[#2A2A2A] flex flex-wrap items-center justify-between gap-3">
              {!isAnswerSubmitted ? (
                <button
                  id="btn-submit-practice"
                  disabled={selectedOptionIndex === null || isLoading}
                  onClick={handleSubmitAnswer}
                  className="clean-button-primary px-5 py-2 text-xs uppercase tracking-wider font-bold bg-black dark:bg-white text-white dark:text-black"
                >
                  <span>Submit Answer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  id="btn-next-practice"
                  onClick={() => loadNextQuestion()}
                  className="clean-button-primary px-5 py-2 text-xs uppercase tracking-wider font-bold bg-black dark:bg-white text-white dark:text-black"
                >
                  <span>Next Adaptive Question</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Difficulty Step Overrides */}
              <div className="flex items-center gap-2 text-xs text-[#6B7280] dark:text-[#AAA]">
                <span>Ladder:</span>
                <button
                  onClick={() => loadNextQuestion(undefined, "Foundational")}
                  className="px-2 py-1 bg-[#F8F9FA] dark:bg-[#252525] hover:bg-[#E5E7EB] dark:hover:bg-[#333] text-black dark:text-white border border-[#E5E7EB] dark:border-[#333] text-[11px] font-medium"
                >
                  L1 Foundational
                </button>
                <button
                  onClick={() => loadNextQuestion(undefined, "Intermediate")}
                  className="px-2 py-1 bg-[#F8F9FA] dark:bg-[#252525] hover:bg-[#E5E7EB] dark:hover:bg-[#333] text-black dark:text-white border border-[#E5E7EB] dark:border-[#333] text-[11px] font-medium"
                >
                  L2 Intermediate
                </button>
                <button
                  onClick={() => loadNextQuestion(undefined, "Advanced")}
                  className="px-2 py-1 bg-[#F8F9FA] dark:bg-[#252525] hover:bg-[#E5E7EB] dark:hover:bg-[#333] text-black dark:text-white border border-[#E5E7EB] dark:border-[#333] text-[11px] font-medium"
                >
                  L3 Advanced
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Topic Mastery Profile with Subject Tabs (4 Columns) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-[#1A1A1A] border border-[#E5E7EB] dark:border-[#2A2A2A] p-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB] dark:border-[#2A2A2A] mb-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold block">
                  Curriculum Mastery
                </span>
                <h3 className="text-xs font-bold text-[#1A1A1A] dark:text-white uppercase tracking-wider">
                  Topic Diagnostic Ladder
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#6B7280] dark:text-[#AAA]">Live</span>
            </div>

            {/* Subject Filter Pills */}
            <div className="flex flex-wrap gap-1 mb-3">
              {["all", "Mathematics", "Physics", "Chemistry", "Biology"].map((subj) => (
                <button
                  key={subj}
                  onClick={() => setSelectedSubjectFilter(subj)}
                  className={`text-[10px] px-2 py-0.5 border transition-colors uppercase tracking-wider font-semibold ${
                    selectedSubjectFilter === subj
                      ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                      : "bg-[#F8F9FA] dark:bg-[#252525] text-[#4B5563] dark:text-[#CCC] border-[#E5E7EB] dark:border-[#333] hover:bg-[#E5E7EB]"
                  }`}
                >
                  {subj === "all" ? "All" : subj.substring(0, 4)}
                </button>
              ))}
            </div>

            {/* Topic List */}
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {(filteredTopics || []).map((topic) => {
                const isSelectedTopic = topic.topicId === activeTopicId;
                const isLow = topic.masteryPercentage < 50;
                const isMed = topic.masteryPercentage >= 50 && topic.masteryPercentage < 75;
                return (
                  <div
                    key={topic.topicId}
                    onClick={() => {
                      setActiveTopicId(topic.topicId);
                      loadNextQuestion(topic.topicId);
                    }}
                    className={`p-3 border text-xs cursor-pointer transition-colors ${
                      isSelectedTopic
                        ? "border-black dark:border-white bg-[#F8F9FA] dark:bg-[#222]"
                        : "border-[#E5E7EB] dark:border-[#333] bg-white dark:bg-[#1E1E1E] hover:border-[#9CA3AF]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[#1A1A1A] dark:text-white">{topic.topicName}</span>
                      <span className={`font-mono font-bold text-xs ${isLow ? "text-rose-600 dark:text-rose-400" : isMed ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                        {topic.masteryPercentage}%
                      </span>
                    </div>

                    <p className="text-[10px] text-[#6B7280] dark:text-[#AAA] mb-1.5">{topic.subject}</p>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#F0F2F5] dark:bg-[#333] h-1.5 overflow-hidden mb-1.5">
                      <div
                        className={`h-full transition-all duration-300 ${isLow ? "bg-rose-500" : isMed ? "bg-amber-500" : "bg-black dark:bg-white"}`}
                        style={{ width: `${topic.masteryPercentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#9CA3AF]">
                      <span className="flex items-center gap-1 text-[#4B5563] dark:text-[#AAA]">
                        {topic.recentStreak > 0 ? <TrendingUp className="w-3 h-3 text-emerald-600" /> : <TrendingDown className="w-3 h-3 text-rose-600" />}
                        Streak: {topic.recentStreak > 0 ? `+${topic.recentStreak}` : topic.recentStreak}
                      </span>
                      <span>{topic.attemptsCount} solved</span>
                    </div>

                    {topic.weakConcepts && topic.weakConcepts.length > 0 && (
                      <div className="mt-1.5 text-[10px] text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 p-1.5 border border-rose-100 dark:border-rose-900">
                        <span className="font-bold block">Gap:</span>
                        {topic.weakConcepts[0]}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bookmarked / Important Questions Review Modal */}
      {showBookmarksModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-white w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-[#E5E7EB] dark:border-[#333] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <h3 className="font-bold text-sm text-[#1A1A1A] dark:text-white">
                  Important Bookmarked Questions ({bookmarkedQuestions.length})
                </h3>
              </div>
              <button
                onClick={() => setShowBookmarksModal(false)}
                className="text-xs text-[#6B7280] dark:text-[#AAA] hover:text-black dark:hover:text-white font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              {bookmarkedQuestions.length === 0 ? (
                <div className="text-center py-10 text-xs text-[#6B7280] dark:text-[#AAA]">
                  <Star className="w-8 h-8 text-neutral-300 dark:text-neutral-700 mx-auto mb-2" />
                  <p className="font-semibold">No important questions bookmarked yet.</p>
                  <p className="text-[11px] text-neutral-400 mt-1">Click the "☆ Bookmark" button on any diagnostic problem to save it for revision!</p>
                </div>
              ) : (
                bookmarkedQuestions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="p-4 bg-[#F9FAFB] dark:bg-[#252525] border border-[#E5E7EB] dark:border-[#333] space-y-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-[#1A1A1A] dark:text-white">
                        {idx + 1}. {q.subject}: {q.topicName}
                      </span>
                      <div className="flex items-center gap-2">
                        {getDifficultyBadge(q.difficulty)}
                        <button
                          type="button"
                          onClick={() => handleToggleBookmark(q)}
                          className="text-rose-600 dark:text-rose-400 text-[11px] font-bold hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <p className="text-[#374151] dark:text-[#DDD] leading-relaxed bg-white dark:bg-[#1E1E1E] p-2.5 border border-[#E5E7EB] dark:border-[#333]">
                      {q.questionText}
                    </p>

                    <div className="text-[11px] space-y-1">
                      <p className="font-bold text-emerald-700 dark:text-emerald-400">
                        ✓ Correct Answer: {q.options?.[q.correctOptionIndex]}
                      </p>
                      {q.explanation && (
                        <p className="text-[#6B7280] dark:text-[#AAA] italic">
                          Method: {q.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-[#E5E7EB] dark:border-[#333] bg-[#F8F9FA] dark:bg-[#181818] flex justify-end">
              <button
                onClick={() => setShowBookmarksModal(false)}
                className="clean-button-primary py-1.5 px-4 text-xs font-bold bg-black dark:bg-white text-white dark:text-black"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
