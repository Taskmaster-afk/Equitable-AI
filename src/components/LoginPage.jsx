import { useState, useEffect } from "react";
import {
  GraduationCap,
  Users,
  KeyRound,
  School,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Lock,
  Eye,
  EyeOff,
  Building,
  PlusCircle,
  Sparkles,
  ShieldCheck,
  Search,
  Plus,
  BookOpen,
  Award,
  Zap,
  TrendingUp,
  Brain,
  Compass
} from "lucide-react";
import { api } from "../services/api";
import { getTranslation } from "../data/translations";
import {
  ACADEMIC_TIERS,
  INSTITUTION_CATEGORIES,
  DEFAULT_CUSTOM_CURRICULUM
} from "../data/curriculumStandards";

const DAILY_SPARKS = [
  {
    topic: "Wave-Particle Duality (De Broglie)",
    subject: "Class 12 Physics",
    formula: "λ = h / p = h / (mv)",
    insight: "Every moving particle exhibits wave properties. The faster an electron moves, the shorter its wavelength, enabling electron microscopes to resolve atomic details.",
    tag: "Modern Physics"
  },
  {
    topic: "Quadratic Nature of Projectile Motion",
    subject: "Class 11 Physics & Math",
    formula: "y = x·tan(θ) - (g·x²) / (2·u²·cos²θ)",
    insight: "Because gravity acts solely downwards with zero horizontal deceleration, a projectile traces a perfect inverted parabola under ideal vacuum conditions.",
    tag: "Kinematics"
  },
  {
    topic: "Chemical Equilibrium & Le Chatelier",
    subject: "Class 11-12 Chemistry",
    formula: "K_eq = [Products]^c / [Reactants]^a",
    insight: "When stress is applied to a dynamic equilibrium, the reaction shifts to counteract that disturbance, optimizing industrial yields in Haber's ammonia process.",
    tag: "Physical Chemistry"
  }
];

export const LoginPage = ({
  onLoginSuccess,
  isDarkMode,
  setIsDarkMode,
  selectedLanguage = "en",
  setSelectedLanguage
}) => {
  const t = (key, fallback) => getTranslation(selectedLanguage, key, fallback);
  const [selectedRole, setSelectedRole] = useState("student"); // "student" | "teacher"
  const [studentMode, setStudentMode] = useState("login"); // "login" | "register"
  const [teacherMode, setTeacherMode] = useState("login"); // "login" | "register"
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [activeSparkIndex, setActiveSparkIndex] = useState(0);

  // Institutes State
  const [institutes, setInstitutes] = useState([]);
  const [studentInstituteSearch, setStudentInstituteSearch] = useState("");
  const [showStudentInstDropdown, setShowStudentInstDropdown] = useState(false);
  const [teacherInstituteSearch, setTeacherInstituteSearch] = useState("");
  const [showTeacherInstDropdown, setShowTeacherInstDropdown] = useState(false);

  // Student Login State
  const [studentLoginIdentifier, setStudentLoginIdentifier] = useState("aarav.sharma@student.edu.in");
  const [studentLoginPassword, setStudentLoginPassword] = useState("password123");
  const [showStudentLoginPassword, setShowStudentLoginPassword] = useState(false);
  const [rememberStudent, setRememberStudent] = useState(true);

  // Student Registration State
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regStudentInstitute, setRegStudentInstitute] = useState("Kendriya Vidyalaya No. 1");
  const [regClassCode, setRegClassCode] = useState("");
  const [regLanguage, setRegLanguage] = useState("en");
  const [regCategory, setRegCategory] = useState("General");
  const [regGender, setRegGender] = useState("Male");
  const [regIncome, setRegIncome] = useState("< 1.5 Lakhs/yr");
  const [regScore, setRegScore] = useState(78);
  const [regFirstGen, setRegFirstGen] = useState(true);
  const [regState, setRegState] = useState("National");
  const [verifiedClass, setVerifiedClass] = useState(null);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [classCodeError, setClassCodeError] = useState(null);

  // Teacher Login State
  const [teacherLoginIdentifier, setTeacherLoginIdentifier] = useState("rajesh.varma@school.edu.in");
  const [teacherLoginPassword, setTeacherLoginPassword] = useState("teacher123");
  const [showTeacherLoginPassword, setShowTeacherLoginPassword] = useState(false);
  const [rememberTeacher, setRememberTeacher] = useState(true);

  // Teacher Registration State
  const [teacherRegName, setTeacherRegName] = useState("");
  const [teacherRegEmail, setTeacherRegEmail] = useState("");
  const [teacherRegPassword, setTeacherRegPassword] = useState("");
  const [teacherRegConfirmPassword, setTeacherRegConfirmPassword] = useState("");
  const [showTeacherRegPassword, setShowTeacherRegPassword] = useState(false);
  const [teacherRegDepartment, setTeacherRegDepartment] = useState("Senior Science & Mathematics Faculty");
  const [teacherExistingInstitute, setTeacherExistingInstitute] = useState("Kendriya Vidyalaya No. 1");
  const [teacherNewInstituteType, setTeacherNewInstituteType] = useState("Kendriya Vidyalaya / Central School (K-12)");
  const [teacherInstituteTier, setTeacherInstituteTier] = useState("Secondary Standard");
  const [teacherNewInstituteLocation, setTeacherNewInstituteLocation] = useState("National / Regional Campus");

  // Curriculum Selection State
  const [teacherCurriculum, setTeacherCurriculum] = useState("CBSE / NCERT National Curriculum (Class 1-12)");
  const [isCustomCurriculum, setIsCustomCurriculum] = useState(false);
  const [customCurriculumData, setCustomCurriculumData] = useState({ ...DEFAULT_CUSTOM_CURRICULUM });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    loadInitialData();
    loadSavedCredentials();
  }, []);

  const loadSavedCredentials = () => {
    try {
      const savedStudent = localStorage.getItem("saved_student_creds");
      if (savedStudent) {
        const parsed = JSON.parse(savedStudent);
        if (parsed.email) setStudentLoginIdentifier(parsed.email);
        if (parsed.password) setStudentLoginPassword(parsed.password);
        setRememberStudent(true);
      }
      const savedTeacher = localStorage.getItem("saved_teacher_creds");
      if (savedTeacher) {
        const parsed = JSON.parse(savedTeacher);
        if (parsed.email) setTeacherLoginIdentifier(parsed.email);
        if (parsed.password) setTeacherLoginPassword(parsed.password);
        setRememberTeacher(true);
      }
    } catch (e) {
      console.warn("Could not parse saved credentials", e);
    }
  };

  const loadInitialData = async () => {
    try {
      const instRes = await api.getInstitutes().catch(() => ({ institutes: [] }));
      if (instRes.institutes && instRes.institutes.length > 0) {
        setInstitutes(instRes.institutes);
        setRegStudentInstitute(instRes.institutes[0].name);
        setStudentInstituteSearch(instRes.institutes[0].name);
        setTeacherExistingInstitute(instRes.institutes[0].name);
        setTeacherInstituteSearch(instRes.institutes[0].name);
      }
    } catch (e) {
      console.error("Failed to load institutes metadata", e);
    }
  };

  const refreshInstitutesList = async () => {
    try {
      const instRes = await api.getInstitutes();
      if (instRes.institutes) {
        setInstitutes(instRes.institutes);
      }
    } catch (e) {
      console.error("Failed to refresh institutes", e);
    }
  };

  const verifyClassCode = async (codeToVerify) => {
    if (!codeToVerify || !codeToVerify.trim()) {
      setVerifiedClass(null);
      setClassCodeError(null);
      return;
    }
    setIsVerifyingCode(true);
    setClassCodeError(null);
    try {
      const res = await api.lookupClassCode(codeToVerify.trim());
      setVerifiedClass(res.classInfo);
    } catch (err) {
      setVerifiedClass(null);
      setClassCodeError(
        err.message || `Class code "${codeToVerify}" not found. Try NCERT-10A or leave empty to join later.`
      );
    } finally {
      setIsVerifyingCode(false);
    }
  };

  // Student Sign In
  const handleStudentLogin = async (e) => {
    e.preventDefault();
    if (!studentLoginIdentifier.trim()) {
      setErrorMessage("Please enter your Student Email or ID.");
      return;
    }
    if (!studentLoginPassword) {
      setErrorMessage("Please enter your student password.");
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await api.login({
        role: "student",
        identifier: studentLoginIdentifier.trim(),
        password: studentLoginPassword
      });
      if (rememberStudent) {
        localStorage.setItem(
          "saved_student_creds",
          JSON.stringify({ email: studentLoginIdentifier.trim(), password: studentLoginPassword })
        );
        localStorage.setItem("remember_student", "true");
      } else {
        localStorage.removeItem("saved_student_creds");
        localStorage.setItem("remember_student", "false");
      }
      if (res.token) api.setToken(res.token);
      onLoginSuccess(res.user, res.studentProfile, void 0, res.classInfo);
    } catch (err) {
      setErrorMessage(err.message || "Login failed. Please check your student credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  // Student Registration (Search or Add New Institute)
  const handleStudentRegister = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const instituteToUse = regStudentInstitute.trim() || studentInstituteSearch.trim();

    if (!regName.trim() || !regEmail.trim()) {
      setErrorMessage("Please fill in your full name and email address.");
      return;
    }
    if (!instituteToUse) {
      setErrorMessage("Please select or type your school name.");
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setErrorMessage("Please create a password with at least 6 characters.");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage("Password and Confirm Password do not match. Please re-enter.");
      return;
    }

    setIsLoading(true);
    try {
      const instituteExists = institutes.some(
        (i) => i.name.toLowerCase() === instituteToUse.toLowerCase()
      );
      if (!instituteExists) {
        try {
          await api.createInstitute({
            name: instituteToUse,
            type: "School / Institution",
            location: regState || "India"
          });
          await refreshInstitutesList();
        } catch (e) {
          console.warn("Institute auto-creation notice:", e.message);
        }
      }

      const res = await api.registerStudent({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        studentClass: regClassCode && verifiedClass ? (verifiedClass.targetClass || verifiedClass.className) : "General",
        classCode: regClassCode ? regClassCode.trim() : "",
        instituteName: instituteToUse,
        primaryLanguage: "en",
        category: regCategory,
        gender: regGender,
        familyIncomeBracket: regIncome,
        academicScorePercent: Number(regScore) || 75,
        firstGenerationLearner: regFirstGen,
        stateOrRegion: regState
      });
      if (rememberStudent) {
        localStorage.setItem(
          "saved_student_creds",
          JSON.stringify({ email: regEmail.trim(), password: regPassword })
        );
        localStorage.setItem("remember_student", "true");
      }
      if (res.token) api.setToken(res.token);
      onLoginSuccess(res.user, res.student, void 0, res.classInfo);
    } catch (err) {
      setErrorMessage(err.message || "Registration failed. Please check your inputs.");
    } finally {
      setIsLoading(false);
    }
  };

  // Teacher Sign In
  const handleTeacherLogin = async (e) => {
    e.preventDefault();
    if (!teacherLoginIdentifier.trim()) {
      setErrorMessage("Please enter your Teacher Email or Staff ID.");
      return;
    }
    if (!teacherLoginPassword) {
      setErrorMessage("Please enter your teacher access password.");
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await api.login({
        role: "teacher",
        identifier: teacherLoginIdentifier.trim(),
        password: teacherLoginPassword
      });
      if (rememberTeacher) {
        localStorage.setItem(
          "saved_teacher_creds",
          JSON.stringify({ email: teacherLoginIdentifier.trim(), password: teacherLoginPassword })
        );
        localStorage.setItem("remember_teacher", "true");
      } else {
        localStorage.removeItem("saved_teacher_creds");
        localStorage.setItem("remember_teacher", "false");
      }
      if (res.token) api.setToken(res.token);
      onLoginSuccess(res.user, void 0, res.teacherProfile, void 0);
    } catch (err) {
      setErrorMessage(err.message || "Teacher login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  // Teacher Registration
  const handleTeacherRegister = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const instituteToUse = teacherExistingInstitute.trim() || teacherInstituteSearch.trim();

    if (!teacherRegName.trim()) {
      setErrorMessage("Please enter faculty / teacher full name.");
      return;
    }
    if (!teacherRegEmail.trim()) {
      setErrorMessage("Please enter institutional email address.");
      return;
    }
    if (!instituteToUse) {
      setErrorMessage("Please select or enter your institution name.");
      return;
    }
    if (!teacherRegPassword || teacherRegPassword.length < 6) {
      setErrorMessage("Please create a password with at least 6 characters.");
      return;
    }
    if (teacherRegPassword !== teacherRegConfirmPassword) {
      setErrorMessage("Teacher password and confirmation do not match.");
      return;
    }

    if (isCustomCurriculum && !customCurriculumData.name.trim()) {
      setErrorMessage("Please enter a title / name for your custom curriculum framework.");
      return;
    }

    const finalCurriculumName = isCustomCurriculum
      ? customCurriculumData.name.trim()
      : teacherCurriculum;

    setIsLoading(true);
    try {
      const instituteExists = institutes.some(
        (i) => i.name.toLowerCase() === instituteToUse.toLowerCase()
      );
      if (!instituteExists) {
        try {
          await api.createInstitute({
            name: instituteToUse,
            type: teacherNewInstituteType,
            location: teacherNewInstituteLocation || "India"
          });
          await refreshInstitutesList();
        } catch (e) {
          console.warn("Institute auto-creation notice:", e.message);
        }
      }

      const res = await api.registerTeacher({
        name: teacherRegName.trim(),
        email: teacherRegEmail.trim(),
        password: teacherRegPassword,
        department: teacherRegDepartment.trim(),
        instituteName: instituteToUse,
        isNewInstitute: !instituteExists,
        instituteType: teacherNewInstituteType,
        tier: teacherInstituteTier,
        instituteLocation: teacherNewInstituteLocation,
        curriculum: finalCurriculumName,
        customCurriculum: isCustomCurriculum ? customCurriculumData : null
      });

      await refreshInstitutesList();
      if (res.token) api.setToken(res.token);
      onLoginSuccess(res.user, void 0, res.teacherProfile, void 0);
    } catch (err) {
      setErrorMessage(err.message || "Registration failed: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudentInstitutes = institutes.filter((i) =>
    i.name.toLowerCase().includes((studentInstituteSearch || "").toLowerCase())
  );

  const filteredTeacherInstitutes = institutes.filter((i) =>
    i.name.toLowerCase().includes((teacherInstituteSearch || "").toLowerCase())
  );

  const currentSpark = DAILY_SPARKS[activeSparkIndex];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0c0c0e] flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      
      {/* Platform Impact Stats Bar */}
      <div className="w-full max-w-5xl mb-4 flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-slate-200/80 dark:border-zinc-800/80 rounded-xl text-xs text-slate-600 dark:text-zinc-400 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-slate-900 dark:text-white">Live Platform Network:</span>
          <span>10,000+ Socratic Doubts Solved</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-medium">
          <span className="hidden sm:inline">📖 28+ Verified NCERT & CBSE Textbooks</span>
          <span className="hidden md:inline">🏛️ Multi-Classroom Code Infrastructure</span>
          <span className="text-emerald-700 dark:text-emerald-400 font-bold">100% Free & Open Access</span>
        </div>
      </div>

      <div className="w-full max-w-5xl bg-white dark:bg-[#141416] border border-slate-200/90 dark:border-zinc-800/90 rounded-2xl shadow-xl overflow-hidden my-auto grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Column: Interactive Innovation & Daily Spark Hub (40%) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-zinc-900 to-indigo-950 text-white p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-zinc-800">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white text-slate-950 rounded-xl flex items-center justify-center font-bold shadow-md">
                <School className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold tracking-tight text-white">
                  Equitable Platform
                </h2>
                <p className="text-[11px] text-zinc-300">
                  National Open Curriculum Initiative
                </p>
              </div>
            </div>

            {/* Daily Academic Spark (Innovative interactive element) */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  <Zap className="w-3.5 h-3.5" />
                  Daily Learning Spark
                </span>
                <button
                  type="button"
                  onClick={() => setActiveSparkIndex((prev) => (prev + 1) % DAILY_SPARKS.length)}
                  className="text-[10px] text-indigo-200 hover:text-white underline font-semibold transition-colors"
                >
                  Next Concept →
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs text-white">{currentSpark.topic}</span>
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono text-zinc-200">{currentSpark.tag}</span>
                </div>
                <div className="mt-1 font-mono text-xs font-bold text-amber-200 bg-black/30 p-1.5 rounded border border-white/10">
                  {currentSpark.formula}
                </div>
                <p className="text-[11px] text-zinc-300 mt-2 leading-relaxed">
                  {currentSpark.insight}
                </p>
              </div>
            </div>

            {/* Platform Innovation Badges */}
            <div className="space-y-2.5 pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                Platform Innovations Built-In:
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2.5 p-2.5 bg-white/5 border border-white/10 rounded-lg">
                  <Brain className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Socratic Step Tutor</span>
                    <span className="text-[11px] text-zinc-300 leading-snug">Strict step-by-step mathematical reasoning without rote answers.</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 bg-white/5 border border-white/10 rounded-lg">
                  <School className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Subject Classrooms by Code</span>
                    <span className="text-[11px] text-zinc-300 leading-snug">Join multiple subjects with isolated rosters & announcements.</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 bg-white/5 border border-white/10 rounded-lg">
                  <Award className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Automated Aid Discovery</span>
                    <span className="text-[11px] text-zinc-300 leading-snug">Automated scholarship matching for low-income & first-gen students.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
            <span>CBSE • NCERT • Higher Ed</span>
            <span>v2.4 Grounded Core</span>
          </div>
        </div>

        {/* Right Column: Sign In & Registration Form (60%) */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          {/* Header Controls */}
          <div className="p-6 border-b border-slate-200 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-zinc-900/30">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {selectedRole === "student" ? "Student Learning Desk" : "Teacher Academic Portal"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Sign in to continue or create a new profile
              </p>
            </div>

            <div className="flex items-center gap-2">
              {setIsDarkMode && (
                <button
                  type="button"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="px-2.5 py-1.5 text-xs font-semibold bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors shadow-2xs"
                >
                  {isDarkMode ? "☀️ Light" : "🌙 Dark"}
                </button>
              )}

              <div className="inline-flex border border-slate-300 dark:border-zinc-700 bg-slate-200/60 dark:bg-zinc-800 p-1 rounded-xl">
                <button
                  id="btn-role-student"
                  onClick={() => {
                    setSelectedRole("student");
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    selectedRole === "student"
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-xs"
                      : "text-slate-700 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white"
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Student</span>
                </button>
                <button
                  id="btn-role-teacher"
                  onClick={() => {
                    setSelectedRole("teacher");
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    selectedRole === "teacher"
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-xs"
                      : "text-slate-700 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Teacher</span>
                </button>
              </div>
            </div>
          </div>

          {/* Notification Banners */}
          {errorMessage && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-800 px-6 py-2.5 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800 px-6 py-2.5 text-xs text-emerald-800 dark:text-emerald-200 flex items-start gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form Content */}
          <div className="p-6 sm:p-8 flex-1">
            {selectedRole === "student" ? (
              <div>
                {/* Student Mode Switcher */}
                <div className="flex border-b border-slate-200 dark:border-zinc-800 mb-5 gap-5">
                  <button
                    id="tab-student-signin"
                    onClick={() => {
                      setStudentMode("login");
                      setErrorMessage(null);
                    }}
                    className={`pb-2.5 text-xs font-bold border-b-2 transition-all ${
                      studentMode === "login"
                        ? "border-slate-900 dark:border-white text-slate-950 dark:text-white"
                        : "border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Student Sign In
                  </button>
                  <button
                    id="tab-student-register"
                    onClick={() => {
                      setStudentMode("register");
                      setErrorMessage(null);
                    }}
                    className={`pb-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                      studentMode === "register"
                        ? "border-slate-900 dark:border-white text-slate-950 dark:text-white"
                        : "border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Register New Student</span>
                  </button>
                </div>

                {studentMode === "login" ? (
                  <form onSubmit={handleStudentLogin} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-900 dark:text-zinc-200">
                        Student Email or ID *
                      </label>
                      <input
                        id="student-login-identifier"
                        type="text"
                        value={studentLoginIdentifier}
                        onChange={(e) => setStudentLoginIdentifier(e.target.value)}
                        placeholder="e.g. aarav.sharma@student.edu.in"
                        required
                        className="clean-input"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-900 dark:text-zinc-200 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Profile Password *</span>
                      </label>
                      <div className="relative">
                        <input
                          id="student-login-password"
                          type={showStudentLoginPassword ? "text" : "password"}
                          value={studentLoginPassword}
                          onChange={(e) => setStudentLoginPassword(e.target.value)}
                          placeholder="Enter your password"
                          required
                          className="clean-input pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowStudentLoginPassword(!showStudentLoginPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200"
                        >
                          {showStudentLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Quick Demo Shortcuts */}
                    <div className="p-3 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs space-y-2">
                      <span className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5 text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Quick Demo Profiles (1-Click Auto Fill):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setStudentLoginIdentifier("aarav.sharma@student.edu.in");
                            setStudentLoginPassword("password123");
                          }}
                          className="text-left p-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg hover:border-slate-800 dark:hover:border-white transition-all shadow-2xs"
                        >
                          <div className="font-bold text-slate-900 dark:text-white text-xs">Aarav Sharma</div>
                          <div className="text-[10px] text-slate-500 dark:text-zinc-400">Class 12 • Senior Science</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setStudentLoginIdentifier("rohan.das@student.edu.in");
                            setStudentLoginPassword("password123");
                          }}
                          className="text-left p-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg hover:border-slate-800 dark:hover:border-white transition-all shadow-2xs"
                        >
                          <div className="font-bold text-slate-900 dark:text-white text-xs">Rohan Das</div>
                          <div className="text-[10px] text-slate-500 dark:text-zinc-400">Class 10 • Secondary Math</div>
                        </button>
                      </div>
                    </div>

                    <button
                      id="btn-student-login-submit"
                      type="submit"
                      disabled={isLoading}
                      className="clean-button-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2"
                    >
                      <span>{isLoading ? "Signing In..." : "Enter Student Desk"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleStudentRegister} className="space-y-4">
                    {/* Search & Add School */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-900 dark:text-zinc-200 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5" />
                        <span>School / Educational Institution *</span>
                      </label>
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
                        <input
                          type="text"
                          value={studentInstituteSearch}
                          onFocus={() => setShowStudentInstDropdown(true)}
                          onChange={(e) => {
                            setStudentInstituteSearch(e.target.value);
                            setRegStudentInstitute(e.target.value);
                            setShowStudentInstDropdown(true);
                          }}
                          placeholder="Search or type school name..."
                          required
                          className="clean-input pl-8"
                        />
                      </div>

                      {showStudentInstDropdown && studentInstituteSearch.trim() && (
                        <div className="absolute z-30 mt-1 max-h-40 overflow-y-auto bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg shadow-lg divide-y divide-slate-100 dark:divide-zinc-700 w-80">
                          {filteredStudentInstitutes.slice(0, 5).map((inst) => (
                            <div
                              key={inst.id}
                              onClick={() => {
                                setRegStudentInstitute(inst.name);
                                setStudentInstituteSearch(inst.name);
                                setShowStudentInstDropdown(false);
                              }}
                              className="p-2 text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-700 flex items-center justify-between text-slate-900 dark:text-white"
                            >
                              <span className="font-semibold">{inst.name}</span>
                              <span className="text-[10px] text-slate-400 dark:text-zinc-400">{inst.type || "School"}</span>
                            </div>
                          ))}
                          {!institutes.some((i) => i.name.toLowerCase() === studentInstituteSearch.trim().toLowerCase()) && (
                            <div
                              onClick={() => {
                                setRegStudentInstitute(studentInstituteSearch.trim());
                                setShowStudentInstDropdown(false);
                              }}
                              className="p-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 cursor-pointer flex items-center gap-1.5"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>+ Add &quot;{studentInstituteSearch.trim()}&quot; as New School</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-900 dark:text-zinc-200">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="e.g. Aarav Sharma"
                          className="clean-input"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-900 dark:text-zinc-200">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="student@school.edu.in"
                          className="clean-input"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-900 dark:text-zinc-200">Password (Min 6) *</label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="••••••••"
                          className="clean-input"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-900 dark:text-zinc-200">Confirm Password *</label>
                        <input
                          type="password"
                          required
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="clean-input"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !regName.trim() || !regEmail.trim() || regPassword.length < 6 || regPassword !== regConfirmPassword}
                      className="clean-button-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2"
                    >
                      <span>{isLoading ? "Creating Profile..." : "Complete Registration"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div>
                {/* Teacher Mode Switcher */}
                <div className="flex border-b border-slate-200 dark:border-zinc-800 mb-5 gap-5">
                  <button
                    id="tab-teacher-signin"
                    onClick={() => {
                      setTeacherMode("login");
                      setErrorMessage(null);
                    }}
                    className={`pb-2.5 text-xs font-bold border-b-2 transition-all ${
                      teacherMode === "login"
                        ? "border-slate-900 dark:border-white text-slate-950 dark:text-white"
                        : "border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Teacher Sign In
                  </button>
                  <button
                    id="tab-teacher-register"
                    onClick={() => {
                      setTeacherMode("register");
                      setErrorMessage(null);
                    }}
                    className={`pb-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                      teacherMode === "register"
                        ? "border-slate-900 dark:border-white text-slate-950 dark:text-white"
                        : "border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Register New Teacher</span>
                  </button>
                </div>

                {teacherMode === "login" ? (
                  <form onSubmit={handleTeacherLogin} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-900 dark:text-zinc-200">
                        Teacher Email or Staff ID *
                      </label>
                      <input
                        id="teacher-login-identifier"
                        type="text"
                        value={teacherLoginIdentifier}
                        onChange={(e) => setTeacherLoginIdentifier(e.target.value)}
                        placeholder="e.g. rajesh.varma@school.edu.in"
                        required
                        className="clean-input"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-900 dark:text-zinc-200 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Teacher Password *</span>
                      </label>
                      <div className="relative">
                        <input
                          id="teacher-login-password"
                          type={showTeacherLoginPassword ? "text" : "password"}
                          value={teacherLoginPassword}
                          onChange={(e) => setTeacherLoginPassword(e.target.value)}
                          placeholder="Enter password"
                          required
                          className="clean-input pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowTeacherLoginPassword(!showTeacherLoginPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200"
                        >
                          {showTeacherLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Quick Demo Shortcuts */}
                    <div className="p-3 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs space-y-2">
                      <span className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5 text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Quick Demo Teacher Profiles:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setTeacherLoginIdentifier("rajesh.varma@school.edu.in");
                            setTeacherLoginPassword("teacher123");
                          }}
                          className="text-left p-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg hover:border-slate-800 dark:hover:border-white transition-all shadow-2xs"
                        >
                          <div className="font-bold text-slate-900 dark:text-white text-xs">Dr. Rajesh Varma</div>
                          <div className="text-[10px] text-slate-500 dark:text-zinc-400">Senior Physics HOD</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTeacherLoginIdentifier("sunita.sharma@school.edu.in");
                            setTeacherLoginPassword("teacher123");
                          }}
                          className="text-left p-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg hover:border-slate-800 dark:hover:border-white transition-all shadow-2xs"
                        >
                          <div className="font-bold text-slate-900 dark:text-white text-xs">Mrs. Sunita Sharma</div>
                          <div className="text-[10px] text-slate-500 dark:text-zinc-400">Secondary Math Lead</div>
                        </button>
                      </div>
                    </div>

                    <button
                      id="btn-teacher-login-submit"
                      type="submit"
                      disabled={isLoading}
                      className="clean-button-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2"
                    >
                      <span>{isLoading ? "Signing In..." : "Enter Teacher Academic Desk"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleTeacherRegister} className="space-y-3.5">
                    {/* School / Institute Searchable */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-900 dark:text-zinc-200 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5" />
                        <span>Institution / School Campus *</span>
                      </label>
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
                        <input
                          type="text"
                          value={teacherInstituteSearch}
                          onFocus={() => setShowTeacherInstDropdown(true)}
                          onChange={(e) => {
                            setTeacherInstituteSearch(e.target.value);
                            setTeacherExistingInstitute(e.target.value);
                            setShowTeacherInstDropdown(true);
                          }}
                          placeholder="Search or type school/institute name..."
                          required
                          className="clean-input pl-8"
                        />
                      </div>

                      {showTeacherInstDropdown && teacherInstituteSearch.trim() && (
                        <div className="absolute z-30 mt-1 max-h-40 overflow-y-auto bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg shadow-lg divide-y divide-slate-100 dark:divide-zinc-700 w-80">
                          {filteredTeacherInstitutes.slice(0, 5).map((inst) => (
                            <div
                              key={inst.id}
                              onClick={() => {
                                setTeacherExistingInstitute(inst.name);
                                setTeacherInstituteSearch(inst.name);
                                setShowTeacherInstDropdown(false);
                              }}
                              className="p-2 text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-700 flex items-center justify-between text-slate-900 dark:text-white"
                            >
                              <span className="font-semibold">{inst.name}</span>
                              <span className="text-[10px] text-slate-400 dark:text-zinc-400">{inst.type || "School"}</span>
                            </div>
                          ))}
                          {!institutes.some((i) => i.name.toLowerCase() === teacherInstituteSearch.trim().toLowerCase()) && (
                            <div
                              onClick={() => {
                                setTeacherExistingInstitute(teacherInstituteSearch.trim());
                                setShowTeacherInstDropdown(false);
                              }}
                              className="p-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 cursor-pointer flex items-center gap-1.5"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>+ Add &quot;{teacherInstituteSearch.trim()}&quot; as New Institution</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-900 dark:text-zinc-200">Faculty Full Name *</label>
                        <input
                          type="text"
                          required
                          value={teacherRegName}
                          onChange={(e) => setTeacherRegName(e.target.value)}
                          placeholder="e.g. Dr. Rajesh Varma"
                          className="clean-input"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-900 dark:text-zinc-200">Institutional Email *</label>
                        <input
                          type="email"
                          required
                          value={teacherRegEmail}
                          onChange={(e) => setTeacherRegEmail(e.target.value)}
                          placeholder="teacher@school.edu.in"
                          className="clean-input"
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-slate-900 dark:text-zinc-200">Department / Role Title *</label>
                        <input
                          type="text"
                          required
                          value={teacherRegDepartment}
                          onChange={(e) => setTeacherRegDepartment(e.target.value)}
                          placeholder="e.g. Senior Science & Mathematics Faculty"
                          className="clean-input"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-900 dark:text-zinc-200">Password (Min 6) *</label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={teacherRegPassword}
                          onChange={(e) => setTeacherRegPassword(e.target.value)}
                          placeholder="••••••••"
                          className="clean-input"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-900 dark:text-zinc-200">Confirm Password *</label>
                        <input
                          type="password"
                          required
                          value={teacherRegConfirmPassword}
                          onChange={(e) => setTeacherRegConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="clean-input"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !teacherRegName.trim() || !teacherRegEmail.trim() || teacherRegPassword.length < 6 || teacherRegPassword !== teacherRegConfirmPassword}
                      className="clean-button-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2"
                    >
                      <span>{isLoading ? "Creating Faculty Account..." : "Complete Teacher Sign Up"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
