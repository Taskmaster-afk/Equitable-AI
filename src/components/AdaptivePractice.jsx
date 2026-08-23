import { useState, useEffect, useRef } from "react";
import {
  Sparkles, BookOpen, CheckCircle2, XCircle, AlertTriangle,
  ArrowRight, RefreshCw, Star, Brain, TrendingUp, TrendingDown,
  ChevronRight, Zap, Award, BarChart2, Send, StopCircle, X
} from "lucide-react";
import { api } from "../services/api";

// Difficulty levels in adaptive ladder order
const DIFFICULTY_LEVELS = ["Foundational", "Intermediate", "Advanced"];
const LEVEL_COLORS = {
  Foundational: { badge: "foundational", icon: "🌱", label: "Level 1" },
  Intermediate: { badge: "intermediate", icon: "⚡", label: "Level 2" },
  Advanced:     { badge: "advanced",     icon: "🚀", label: "Level 3" }
};

export const AdaptivePractice = ({ currentStudent, onUpdateStudent }) => {
  // Session config
  const [subject, setSubject]   = useState("");
  const [topic,   setTopic]     = useState("");
  const [classLevel, setClassLevel] = useState(currentStudent?.gradeLevel || "Class 10");

  // Session state
  const [sessionActive, setSessionActive]     = useState(false);
  const [isLoading, setIsLoading]             = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedOption, setSelectedOption]   = useState(null);
  const [isSubmitted, setIsSubmitted]         = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Adaptive tracking
  const [questionNumber, setQuestionNumber]       = useState(0);
  const [sessionStreak, setSessionStreak]         = useState(0);
  const [correctCount, setCorrectCount]           = useState(0);
  const [currentDifficulty, setCurrentDifficulty] = useState("Foundational");
  const [sessionHistory, setSessionHistory]       = useState([]); // [{q, correct, difficulty}]

  // Important questions
  const [bookmarks, setBookmarks] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ap_bookmarks") || "[]"); } catch { return []; }
  });
  const [showBookmarks, setShowBookmarks] = useState(false);

  // Teacher feedback
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [sendingFeedback, setSendingFeedback] = useState(false);

  const questionRef = useRef(null);

  const isBookmarked = currentQuestion
    ? bookmarks.some(b => b.questionText === currentQuestion.questionText)
    : false;

  const toggleBookmark = () => {
    if (!currentQuestion) return;
    const updated = isBookmarked
      ? bookmarks.filter(b => b.questionText !== currentQuestion.questionText)
      : [{ ...currentQuestion, difficulty: currentDifficulty, subject, topic, savedAt: new Date().toISOString() }, ...bookmarks];
    setBookmarks(updated);
    localStorage.setItem("ap_bookmarks", JSON.stringify(updated));
  };

  // Calculate next difficulty based on performance
  const getNextDifficulty = (wasCorrect, streak) => {
    const idx = DIFFICULTY_LEVELS.indexOf(currentDifficulty);
    if (wasCorrect && streak >= 2 && idx < 2) return DIFFICULTY_LEVELS[idx + 1];
    if (!wasCorrect && streak <= -2 && idx > 0) return DIFFICULTY_LEVELS[idx - 1];
    return currentDifficulty;
  };

  const startSession = () => {
    if (!subject.trim() || !topic.trim()) return;
    setSessionActive(true);
    setQuestionNumber(0);
    setSessionStreak(0);
    setCorrectCount(0);
    setCurrentDifficulty("Foundational");
    setSessionHistory([]);
    setFeedbackSent(false);
    loadQuestion("Foundational", 1);
  };

  const stopSession = async () => {
    setSessionActive(false);
    setCurrentQuestion(null);
    if (sessionHistory.length > 0) {
      try {
        await sendFeedbackToTeacher();
      } catch (e) {
        console.warn("Feedback auto-dispatch completed:", e);
      }
    }
  };

  const loadQuestion = async (difficulty, qNum) => {
    setIsLoading(true);
    setSelectedOption(null);
    setIsSubmitted(false);
    setShowExplanation(false);

    try {
      const res = await api.generatePractice({
        studentId:   currentStudent?.id || "student-1",
        topicId:     topic,
        customSubject: subject,
        customTopic: topic,
        requestedDifficulty: difficulty,
        classLevel,
        questionNumber: qNum
      });

      if (res?.question) {
        setCurrentQuestion(res.question);
        setQuestionNumber(qNum);
        // Scroll to question
        setTimeout(() => questionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      }
    } catch (err) {
      console.error("Failed to load question:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedOption === null || !currentQuestion || isSubmitted) return;
    const wasCorrect = selectedOption === currentQuestion.correctOptionIndex;
    setIsSubmitted(true);
    setShowExplanation(true);

    const newStreak = wasCorrect ? sessionStreak + 1 : sessionStreak - 1;
    setSessionStreak(newStreak);
    if (wasCorrect) setCorrectCount(c => c + 1);

    const nextDiff = getNextDifficulty(wasCorrect, newStreak);
    setCurrentDifficulty(nextDiff);

    setSessionHistory(prev => [...prev, {
      questionText: currentQuestion.questionText,
      selectedOption,
      correctOptionIndex: currentQuestion.correctOptionIndex,
      wasCorrect,
      difficulty: currentDifficulty,
      explanation: currentQuestion.explanation
    }]);

    // Record to server
    try {
      const res = await api.submitPractice({
        studentId: currentStudent?.id || "student-1",
        topicId:   topic,
        isCorrect: wasCorrect,
        difficulty: currentDifficulty
      });
      if (res?.updatedProfile) onUpdateStudent(res.updatedProfile);
    } catch (e) { /* non-blocking */ }
  };

  const handleNext = () => {
    loadQuestion(currentDifficulty, questionNumber + 1);
  };

  const sendFeedbackToTeacher = async () => {
    if (sessionHistory.length === 0) return;
    setSendingFeedback(true);
    try {
      const correct = sessionHistory.filter(h => h.wasCorrect).length;
      const total   = sessionHistory.length;
      const summary = {
        studentId:   currentStudent?.id,
        studentName: currentStudent?.name || "Student",
        subject,
        topic,
        classLevel,
        totalQuestions: total,
        correctAnswers: correct,
        accuracy: Math.round((correct / total) * 100),
        highestDifficulty: currentDifficulty,
        sessionDate: new Date().toISOString(),
        weakAreas: sessionHistory
          .filter(h => !h.wasCorrect)
          .map(h => h.questionText.slice(0, 80))
          .slice(0, 3)
      };
      await api.sendPracticeFeedback(summary);
      setFeedbackSent(true);
    } catch (e) {
      console.warn("Could not send teacher feedback:", e);
    } finally {
      setSendingFeedback(false);
    }
  };

  const accuracy = sessionHistory.length > 0
    ? Math.round((correctCount / sessionHistory.length) * 100)
    : 0;

  const diffInfo = LEVEL_COLORS[currentDifficulty];

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f4f6f9] dark:bg-[#0f0f0f] py-6 px-4">
      <div className="max-w-3xl mx-auto space-y-5">

        {/* Header */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-[#e2e8f0] dark:border-[#2a2a2a] p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-[#111827] dark:text-white leading-tight">Adaptive Practice Desk</h1>
                <p className="text-[11px] text-[#6b7280] dark:text-[#9ca3af]">Adaptive Socratic Engine · Adjusts to your level</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowBookmarks(true)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors"
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              Important ({bookmarks.length})
            </button>
          </div>
        </div>

        {/* Setup / Config Card */}
        {!sessionActive && (
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-[#e2e8f0] dark:border-[#2a2a2a] p-6 animate-fade-in-up">
            <h2 className="text-sm font-bold text-[#111827] dark:text-white mb-1">Start a Practice Session</h2>
            <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] mb-5">
              Enter your subject and topic. Socratic Engine will generate questions starting from foundational level and adapt as you progress.
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#374151] dark:text-[#d1d5db] mb-1.5">Subject *</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="e.g. Mathematics, Physics, Chemistry..."
                    className="clean-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] dark:text-[#d1d5db] mb-1.5">Topic / Chapter *</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    placeholder="e.g. Quadratic Equations, Ray Optics..."
                    className="clean-input"
                    onKeyDown={e => e.key === "Enter" && startSession()}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#374151] dark:text-[#d1d5db] mb-1.5">Class Level</label>
                <select
                  value={classLevel}
                  onChange={e => setClassLevel(e.target.value)}
                  className="clean-input"
                >
                  {["Class 6","Class 7","Class 8","Class 9","Class 10","Class 11","Class 12"].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="pt-1">
                <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-800 dark:text-indigo-300 space-y-1 mb-4">
                  <p className="font-semibold flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> How it works:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-indigo-700 dark:text-indigo-400">
                    <li>Starts at <strong>Foundational</strong> level (Level 1)</li>
                    <li>Advances to <strong>Intermediate → Advanced</strong> on 2 correct in a row</li>
                    <li>Steps back down if you get 2 wrong in a row</li>
                    <li>Session summary is <strong>sent to your teacher</strong> automatically</li>
                    <li>Continues until <strong>you stop</strong> the session</li>
                  </ul>
                </div>

                <button
                  type="button"
                  disabled={!subject.trim() || !topic.trim()}
                  onClick={startSession}
                  className="clean-button-primary w-full py-3 text-sm font-bold"
                >
                  <Sparkles className="w-4 h-4" />
                  Start Adaptive Practice Session
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active Session */}
        {sessionActive && (
          <>
            {/* Session Stats Bar */}
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-[#e2e8f0] dark:border-[#2a2a2a] px-5 py-3 flex flex-wrap items-center justify-between gap-3 animate-slide-down">
              <div className="flex items-center gap-3 text-xs flex-wrap">
                <div className="flex items-center gap-1.5 font-semibold text-[#111827] dark:text-white">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-[#6b7280] dark:text-[#9ca3af] font-normal">Topic:</span>
                  <span>{subject} — {topic}</span>
                </div>
                <span className="text-[#e2e8f0] dark:text-[#374151]">|</span>
                <span className="text-[#6b7280] dark:text-[#9ca3af]">{classLevel}</span>
              </div>

              <div className="flex items-center gap-2 text-xs flex-wrap">
                <span className={`level-badge ${diffInfo.badge}`}>{diffInfo.icon} {diffInfo.label} · {currentDifficulty}</span>
                <div className="flex items-center gap-1 text-[#6b7280] dark:text-[#9ca3af]">
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span>Streak: <strong className="text-[#111827] dark:text-white">{sessionStreak > 0 ? `+${sessionStreak}` : sessionStreak}</strong></span>
                </div>
                <div className="flex items-center gap-1 text-[#6b7280] dark:text-[#9ca3af]">
                  <BarChart2 className="w-3 h-3 text-emerald-500" />
                  <span>Score: <strong className="text-[#111827] dark:text-white">{correctCount}/{sessionHistory.length}</strong></span>
                </div>
                <button
                  type="button"
                  onClick={stopSession}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors font-semibold"
                >
                  <StopCircle className="w-3 h-3" />
                  End Session
                </button>
              </div>
            </div>

            {/* Question Card */}
            <div ref={questionRef} className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-[#e2e8f0] dark:border-[#2a2a2a] p-6 animate-fade-in-up">
              {isLoading ? (
                <div className="py-16 flex flex-col items-center justify-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-indigo-600 dark:text-indigo-400 animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-[#111827] dark:text-white">Generating Question #{questionNumber}</p>
                    <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] mt-1">Socratic Engine is crafting a {currentDifficulty.toLowerCase()} question on {topic}...</p>
                  </div>
                  <div className="flex gap-1">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              ) : currentQuestion ? (
                <div>
                  {/* Question Header */}
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-[#9ca3af] dark:text-[#6b7280]">Q{questionNumber}</span>
                      <span className={`level-badge ${diffInfo.badge}`}>{diffInfo.icon} {currentDifficulty}</span>
                      {currentQuestion.isStepDownPrerequisite && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3" /> Prerequisite Step-Down
                        </span>
                      )}
                    </div>

                    {/* Bookmark */}
                    <button
                      type="button"
                      onClick={toggleBookmark}
                      title={isBookmarked ? "Remove from Important" : "Mark as Important"}
                      className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors shrink-0 ${
                        isBookmarked
                          ? "bg-amber-100 dark:bg-amber-950 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300"
                          : "bg-white dark:bg-[#252535] border-[#e2e8f0] dark:border-[#374151] text-[#6b7280] dark:text-[#9ca3af] hover:border-amber-300 hover:text-amber-600"
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${isBookmarked ? "fill-amber-400 text-amber-400" : ""}`} />
                      {isBookmarked ? "Saved" : "Save"}
                    </button>
                  </div>

                  {/* Question Text */}
                  <div className="bg-[#f8fafc] dark:bg-[#0f0f1a] rounded-xl border border-[#e2e8f0] dark:border-[#2a2a2a] p-4 mb-5">
                    <p className="text-sm font-medium text-[#111827] dark:text-white leading-relaxed">
                      {currentQuestion.questionText}
                    </p>
                  </div>

                  {/* Options */}
                  <div className="space-y-2.5 mb-5">
                    {(currentQuestion.options || []).map((option, idx) => {
                      const isSelected = selectedOption === idx;
                      const isCorrect  = idx === currentQuestion.correctOptionIndex;
                      let cls = "option-btn";
                      if (isSubmitted) {
                        if (isCorrect) cls += " correct";
                        else if (isSelected && !isCorrect) cls += " wrong";
                        else cls += " faded";
                      } else if (isSelected) {
                        cls += " selected";
                      }
                      return (
                        <button
                          key={idx}
                          disabled={isSubmitted}
                          onClick={() => setSelectedOption(idx)}
                          className={cls}
                        >
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            isSubmitted
                              ? isCorrect ? "bg-emerald-200 text-emerald-800" : isSelected ? "bg-rose-200 text-rose-800" : "bg-[#e5e7eb] dark:bg-[#374151] text-[#9ca3af]"
                              : isSelected ? "bg-blue-600 text-white" : "bg-[#e5e7eb] dark:bg-[#374151] text-[#4b5563] dark:text-[#9ca3af]"
                          }`}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="flex-1">{option}</span>
                          {isSubmitted && isCorrect  && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                          {isSubmitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Result + Explanation */}
                  {showExplanation && (
                    <div className={`rounded-xl border p-4 mb-5 animate-fade-in-up ${
                      selectedOption === currentQuestion.correctOptionIndex
                        ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
                        : "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800"
                    }`}>
                      <div className="flex items-center gap-2 mb-2.5">
                        {selectedOption === currentQuestion.correctOptionIndex ? (
                          <><CheckCircle2 className="w-4 h-4 text-emerald-600" /><span className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Correct!</span></>
                        ) : (
                          <><XCircle className="w-4 h-4 text-rose-600" /><span className="text-sm font-bold text-rose-800 dark:text-rose-300">Incorrect</span></>
                        )}
                        {sessionStreak > 1 && selectedOption === currentQuestion.correctOptionIndex && (
                          <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
                            🔥 {sessionStreak} streak!
                          </span>
                        )}
                        {sessionStreak < -1 && selectedOption !== currentQuestion.correctOptionIndex && (
                          <span className="text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                            ↓ Stepping to easier level
                          </span>
                        )}
                        {sessionStreak > 1 && selectedOption === currentQuestion.correctOptionIndex && sessionStreak % 2 === 0 && DIFFICULTY_LEVELS.indexOf(currentDifficulty) < 2 && (
                          <span className="text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-full font-bold">
                            ↑ Level Up coming!
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#374151] dark:text-[#d1d5db] leading-relaxed whitespace-pre-wrap">
                        {currentQuestion.explanation}
                      </p>
                      {currentQuestion.prerequisiteHint && (
                        <p className="mt-2 text-xs text-[#6b7280] dark:text-[#9ca3af] italic">
                          💡 Hint: {currentQuestion.prerequisiteHint}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    {!isSubmitted ? (
                      <button
                        type="button"
                        disabled={selectedOption === null}
                        onClick={handleSubmit}
                        className="clean-button-primary flex-1 sm:flex-none py-2.5 text-sm"
                      >
                        <Send className="w-4 h-4" />
                        Submit Answer
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="clean-button-primary flex-1 sm:flex-none py-2.5 text-sm"
                      >
                        <span>Next Question</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={stopSession}
                      className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-lg border border-[#e2e8f0] dark:border-[#374151] text-[#6b7280] dark:text-[#9ca3af] hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-800 transition-colors"
                    >
                      <StopCircle className="w-3.5 h-3.5" />
                      End Session
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-sm text-[#6b7280] dark:text-[#9ca3af]">Something went wrong loading the question.</p>
                  <button onClick={() => loadQuestion(currentDifficulty, questionNumber || 1)} className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Try again</button>
                </div>
              )}
            </div>

            {/* Session Progress */}
            {sessionHistory.length > 0 && (
              <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-[#e2e8f0] dark:border-[#2a2a2a] p-5 animate-fade-in-up">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-[#111827] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart2 className="w-3.5 h-3.5 text-indigo-500" />
                    Session Progress
                  </h3>
                  <span className="text-xs text-[#6b7280] dark:text-[#9ca3af]">{accuracy}% accuracy</span>
                </div>
                <div className="progress-track mb-3">
                  <div className="progress-fill bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${accuracy}%` }} />
                </div>
                <div className="flex gap-1 flex-wrap">
                  {sessionHistory.map((h, i) => (
                    <div
                      key={i}
                      title={`Q${i+1}: ${h.difficulty} — ${h.wasCorrect ? "Correct" : "Wrong"}`}
                      className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${
                        h.wasCorrect
                          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                          : "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                      }`}
                    >
                      {h.wasCorrect ? "✓" : "✗"}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback status */}
            {feedbackSent && (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-emerald-800 dark:text-emerald-300 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Session summary sent to your teacher!</span>
              </div>
            )}
          </>
        )}

        {/* Bookmarks Modal */}
        {showBookmarks && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl border border-[#e2e8f0] dark:border-[#2a2a2a] w-full max-w-xl max-h-[80vh] flex flex-col animate-scale-in">
              <div className="p-4 border-b border-[#e2e8f0] dark:border-[#2a2a2a] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <h3 className="font-bold text-sm text-[#111827] dark:text-white">Important Questions ({bookmarks.length})</h3>
                </div>
                <button onClick={() => setShowBookmarks(false)} className="text-[#6b7280] hover:text-[#111827] dark:hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {bookmarks.length === 0 ? (
                  <div className="text-center py-10 text-sm text-[#6b7280] dark:text-[#9ca3af]">
                    <Star className="w-8 h-8 mx-auto mb-2 text-[#d1d5db] dark:text-[#374151]" />
                    No saved questions yet. Tap "Save" on any question.
                  </div>
                ) : bookmarks.map((b, i) => (
                  <div key={i} className="p-3 bg-[#f8fafc] dark:bg-[#252535] rounded-xl border border-[#e2e8f0] dark:border-[#374151] text-xs space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`level-badge ${(LEVEL_COLORS[b.difficulty] || LEVEL_COLORS.Intermediate).badge}`}>
                        {(LEVEL_COLORS[b.difficulty] || LEVEL_COLORS.Intermediate).icon} {b.difficulty}
                      </span>
                      <span className="text-[#9ca3af] dark:text-[#6b7280]">{b.subject} — {b.topic}</span>
                      <button
                        onClick={() => {
                          const updated = bookmarks.filter((_, j) => j !== i);
                          setBookmarks(updated);
                          localStorage.setItem("ap_bookmarks", JSON.stringify(updated));
                        }}
                        className="text-rose-400 hover:text-rose-600 font-semibold"
                      >Remove</button>
                    </div>
                    <p className="text-[#374151] dark:text-[#d1d5db] font-medium leading-snug">{b.questionText}</p>
                    {b.options && (
                      <p className="text-emerald-700 dark:text-emerald-400 font-semibold">
                        ✓ {b.options[b.correctOptionIndex]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-[#e2e8f0] dark:border-[#2a2a2a] flex justify-end">
                <button onClick={() => setShowBookmarks(false)} className="clean-button-primary text-xs px-5 py-2">Done</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
