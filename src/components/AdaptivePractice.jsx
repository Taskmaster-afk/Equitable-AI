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
  Zap
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

  const loadNextQuestion = async (topicId, forcedDifficulty) => {
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
        requestedDifficulty: forcedDifficulty
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
            Select any syllabus topic to practice diagnostic problems with automatic prerequisite step-down scaffolding.
          </p>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-3 bg-[#F8F9FA] dark:bg-[#222] border border-[#E5E7EB] dark:border-[#333] px-3 py-1.5 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-[#1A1A1A] dark:text-white">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Streak: {sessionStreak}</span>
          </div>
          <span className="text-[#D1D5DB] dark:text-[#444]">|</span>
          <span className="text-[#6B7280] dark:text-[#AAA]">
            Completed: <strong className="text-black dark:text-white font-mono">{currentStudent?.totalPracticeCompleted || 0}</strong> Questions
          </span>
        </div>
      </div>

      {/* Interactive Topic Selector Bar */}
      <div className="bg-white dark:bg-[#1A1A1A] border border-[#E5E7EB] dark:border-[#2A2A2A] p-3.5 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-bold text-[#1A1A1A] dark:text-white">
              Choose Topic to Practice:
            </span>
          </div>

          {/* Subject Switcher */}
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
        {
    /* Active Question Workspace (8 Columns) */
  }
        <div className="lg:col-span-8 space-y-4">
          <div className="p-5 min-h-[480px] flex flex-col justify-between bg-white border border-[#E5E7EB]">
            {isLoading ? <div className="h-64 flex flex-col items-center justify-center text-[#6B7280] gap-3">
                <RefreshCw className="w-6 h-6 animate-spin text-black" />
                <p className="text-xs font-semibold uppercase tracking-wider">Retrieving curriculum question...</p>
              </div> : currentQuestion ? <div>
                {
    /* Question Metadata Header */
  }
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-[#E5E7EB]">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-[#1A1A1A]">
                      {currentQuestion.subject}: {currentQuestion.topicName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {getDifficultyBadge(currentQuestion.difficulty)}
                    {currentQuestion.isStepDownPrerequisite && <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Prerequisite Step-Down
                      </span>}
                  </div>
                </div>

                {
    /* Step-Down Alert Banner */
  }
                {currentQuestion.isStepDownPrerequisite && <div className="mb-4 bg-[#FFFBEB] border-l-2 border-amber-500 p-3 text-xs text-[#92400E] flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                    <div>
                      <strong className="font-bold">Adaptive Intervention: </strong>
                      Recent attempts indicated a foundational gap. This problem tests the prerequisite concept from earlier foundational units before climbing back up.
                    </div>
                  </div>}

                {
    /* Question Statement */
  }
                <div className="text-sm font-medium text-[#1A1A1A] mb-5 leading-relaxed bg-[#F8F9FA] p-4 border border-[#E5E7EB]">
                  {currentQuestion.questionText}
                </div>

                {
    /* Multiple Choice Options (A, B, C, D) */
  }
                <div className="space-y-2.5 mb-5">
                  {(currentQuestion?.options || []).map((option, idx) => {
                    const isSelected = selectedOptionIndex === idx;
                    const isCorrect = idx === currentQuestion.correctOptionIndex;
                    let optionStyle = "bg-white border-[#E5E7EB] text-[#1A1A1A] hover:bg-[#F8F9FA]";
                    if (isAnswerSubmitted) {
                      if (isCorrect) {
                        optionStyle = "bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold";
                      } else if (isSelected && !isCorrect) {
                        optionStyle = "bg-rose-50 border-rose-400 text-rose-900";
                      } else {
                        optionStyle = "bg-[#F8F9FA] border-[#E5E7EB] text-[#9CA3AF] opacity-60";
                      }
                    } else if (isSelected) {
                      optionStyle = "bg-black border-black text-white font-medium";
                    }
                    return (
                      <button
                        key={idx}
                        disabled={isAnswerSubmitted}
                        onClick={() => setSelectedOptionIndex(idx)}
                        className={`w-full text-left p-3 border text-xs transition-colors flex items-center justify-between ${optionStyle}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`w-5 h-5 flex items-center justify-center text-xs font-mono font-bold ${isSelected && !isAnswerSubmitted ? "bg-white text-black" : "bg-[#E5E7EB] text-[#4B5563]"}`}>
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

                {
    /* Worked Solution & Grounded Citation */
  }
                {showExplanation && <div className="mt-4 p-4 bg-[#F8F9FA] border border-[#E5E7EB] text-xs text-[#1A1A1A] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs uppercase tracking-wider">
                        {selectedOptionIndex === currentQuestion.correctOptionIndex ? <span className="text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Correct &bull; Curriculum Derivation
                          </span> : <span className="text-rose-700 flex items-center gap-1">
                            <XCircle className="w-4 h-4" /> Solution &bull; Step-by-Step Method
                          </span>}
                      </span>
                    </div>

                    <div className="whitespace-pre-wrap font-sans text-[#374151] leading-relaxed bg-white p-3 border border-[#E5E7EB]">
                      {currentQuestion.explanation}
                    </div>

                    {currentQuestion.groundedCitation && <div className="pt-2 border-t border-[#E5E7EB] text-[11px] text-[#6B7280] flex flex-wrap items-center justify-between gap-1">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-black" />
                          Curriculum Source: <strong className="text-black">{currentQuestion.groundedCitation.sourceName}</strong> ({currentQuestion.groundedCitation.chapter})
                        </span>
                        <span className="font-mono text-[10px] text-[#9CA3AF]">
                          {currentQuestion.groundedCitation.pageOrRef}
                        </span>
                      </div>}
                  </div>}
              </div> : null}

            {
    /* Bottom Actions Bar */
  }
            <div className="mt-6 pt-3 border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3">
              {!isAnswerSubmitted ? <button
    id="btn-submit-practice"
    disabled={selectedOptionIndex === null || isLoading}
    onClick={handleSubmitAnswer}
    className="clean-button-primary px-5 py-2 text-xs uppercase tracking-wider font-bold"
  >
                  <span>Submit Answer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button> : <button
    id="btn-next-practice"
    onClick={() => loadNextQuestion()}
    className="clean-button-primary px-5 py-2 text-xs uppercase tracking-wider font-bold"
  >
                  <span>Next Adaptive Question</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>}

              {
    /* Difficulty Step Overrides */
  }
              <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                <span>Ladder:</span>
                <button
    onClick={() => loadNextQuestion(void 0, "Foundational")}
    className="px-2 py-1 bg-[#F8F9FA] hover:bg-[#E5E7EB] text-black border border-[#E5E7EB] text-[11px] font-medium"
  >
                  L1 Foundational
                </button>
                <button
    onClick={() => loadNextQuestion(void 0, "Intermediate")}
    className="px-2 py-1 bg-[#F8F9FA] hover:bg-[#E5E7EB] text-black border border-[#E5E7EB] text-[11px] font-medium"
  >
                  L2 Intermediate
                </button>
                <button
    onClick={() => loadNextQuestion(void 0, "Advanced")}
    className="px-2 py-1 bg-[#F8F9FA] hover:bg-[#E5E7EB] text-black border border-[#E5E7EB] text-[11px] font-medium"
  >
                  L3 Advanced
                </button>
              </div>
            </div>
          </div>
        </div>

        {
    /* Right Side: Topic Mastery Profile with Subject Tabs (4 Columns) */
  }
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-[#E5E7EB] p-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB] mb-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold block">
                  Curriculum Mastery
                </span>
                <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                  Topic Diagnostic Ladder
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#6B7280]">Live</span>
            </div>

            {
    /* Subject Filter Pills */
  }
            <div className="flex flex-wrap gap-1 mb-3">
              {["all", "Mathematics", "Physics", "Chemistry", "Biology"].map((subj) => <button
    key={subj}
    onClick={() => setSelectedSubjectFilter(subj)}
    className={`text-[10px] px-2 py-0.5 border transition-colors uppercase tracking-wider font-semibold ${selectedSubjectFilter === subj ? "bg-black text-white border-black" : "bg-[#F8F9FA] text-[#4B5563] border-[#E5E7EB] hover:bg-[#E5E7EB]"}`}
  >
                  {subj === "all" ? "All" : subj.substring(0, 4)}
                </button>)}
            </div>

            {
    /* Topic List */
  }
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
                    className={`p-3 border text-xs cursor-pointer transition-colors ${isSelectedTopic ? "border-black bg-[#F8F9FA]" : "border-[#E5E7EB] bg-white hover:border-[#9CA3AF]"}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[#1A1A1A]">{topic.topicName}</span>
                      <span className={`font-mono font-bold text-xs ${isLow ? "text-rose-600" : isMed ? "text-amber-600" : "text-emerald-600"}`}>
                        {topic.masteryPercentage}%
                      </span>
                    </div>

                    <p className="text-[10px] text-[#6B7280] mb-1.5">{topic.subject}</p>

                    {
      /* Progress Bar */
    }
                    <div className="w-full bg-[#F0F2F5] h-1.5 overflow-hidden mb-1.5">
                      <div
      className={`h-full transition-all duration-300 ${isLow ? "bg-rose-500" : isMed ? "bg-amber-500" : "bg-black"}`}
      style={{ width: `${topic.masteryPercentage}%` }}
    />
                    </div>

                    <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#9CA3AF]">
                      <span className="flex items-center gap-1 text-[#4B5563]">
                        {topic.recentStreak > 0 ? <TrendingUp className="w-3 h-3 text-emerald-600" /> : <TrendingDown className="w-3 h-3 text-rose-600" />}
                        Streak: {topic.recentStreak > 0 ? `+${topic.recentStreak}` : topic.recentStreak}
                      </span>
                      <span>{topic.attemptsCount} solved</span>
                    </div>

                    {topic.weakConcepts && topic.weakConcepts.length > 0 && (
                      <div className="mt-1.5 text-[10px] text-rose-800 bg-rose-50 p-1.5 border border-rose-100">
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
    </div>
  );
};
