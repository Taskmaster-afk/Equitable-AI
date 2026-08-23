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
  Globe,
  ShieldCheck
} from "lucide-react";
import { api } from "../services/api";
import { SUPPORTED_LANGUAGES } from "../data/oerKnowledgeBase";
import {
  ACADEMIC_TIERS,
  INSTITUTION_CATEGORIES,
  DEFAULT_CUSTOM_CURRICULUM
} from "../data/curriculumStandards";

export const LoginPage = ({ onLoginSuccess, onOpenAuditModal }) => {
  const [selectedRole, setSelectedRole] = useState("student"); // "student" | "teacher"
  const [studentMode, setStudentMode] = useState("login"); // "login" | "register"
  const [teacherMode, setTeacherMode] = useState("login"); // "login" | "register"

  // Institutes State
  const [institutes, setInstitutes] = useState([]);

  // Student Login State (Manual Credentials Input)
  const [studentLoginIdentifier, setStudentLoginIdentifier] = useState("aarav.sharma@student.edu.in");
  const [studentLoginPassword, setStudentLoginPassword] = useState("password123");
  const [showStudentLoginPassword, setShowStudentLoginPassword] = useState(false);

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

  // Teacher Login State (Manual Credentials Input)
  const [teacherLoginIdentifier, setTeacherLoginIdentifier] = useState("rajesh.varma@school.edu.in");
  const [teacherLoginPassword, setTeacherLoginPassword] = useState("teacher123");
  const [showTeacherLoginPassword, setShowTeacherLoginPassword] = useState(false);

  // Teacher Registration State
  const [teacherRegName, setTeacherRegName] = useState("");
  const [teacherRegEmail, setTeacherRegEmail] = useState("");
  const [teacherRegPassword, setTeacherRegPassword] = useState("");
  const [teacherRegConfirmPassword, setTeacherRegConfirmPassword] = useState("");
  const [showTeacherRegPassword, setShowTeacherRegPassword] = useState(false);
  const [teacherRegDepartment, setTeacherRegDepartment] = useState("Senior Science & Mathematics Faculty");
  const [teacherInstituteChoice, setTeacherInstituteChoice] = useState("existing"); // "existing" | "new"
  const [teacherExistingInstitute, setTeacherExistingInstitute] = useState("Kendriya Vidyalaya No. 1");
  const [teacherNewInstituteName, setTeacherNewInstituteName] = useState("");
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
  }, []);

  const loadInitialData = async () => {
    try {
      const instRes = await api.getInstitutes().catch(() => ({ institutes: [] }));
      if (instRes.institutes && instRes.institutes.length > 0) {
        setInstitutes(instRes.institutes);
        setRegStudentInstitute(instRes.institutes[0].name);
        setTeacherExistingInstitute(instRes.institutes[0].name);
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
        err.message || `Class code "${codeToVerify}" not found. Try NCERT-12A or leave empty to join later.`
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
      if (res.token) api.setToken(res.token);
      onLoginSuccess(res.user, res.studentProfile, void 0, res.classInfo);
    } catch (err) {
      setErrorMessage(err.message || "Login failed. Please check your student credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  // Student Registration (No mandatory subject or class in starting)
  const handleStudentRegister = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!regName.trim() || !regEmail.trim()) {
      setErrorMessage("Please fill in your full name and email address.");
      return;
    }
    if (!regStudentInstitute || !regStudentInstitute.trim()) {
      setErrorMessage("Please select your institute from the dropdown menu.");
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
      const res = await api.registerStudent({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        studentClass: regClassCode && verifiedClass ? (verifiedClass.targetClass || verifiedClass.className) : "General",
        classCode: regClassCode ? regClassCode.trim() : "",
        instituteName: regStudentInstitute,
        primaryLanguage: regLanguage,
        category: regCategory,
        gender: regGender,
        familyIncomeBracket: regIncome,
        academicScorePercent: Number(regScore) || 75,
        firstGenerationLearner: regFirstGen,
        stateOrRegion: regState
      });
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
      if (res.token) api.setToken(res.token);
      onLoginSuccess(res.user, void 0, res.teacherProfile, void 0);
    } catch (err) {
      setErrorMessage(err.message || "Teacher login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  // Teacher Registration (No pre-filled subjects/classes forced; teacher manages classes in their dashboard)
  const handleTeacherRegister = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!teacherRegName.trim()) {
      setErrorMessage("Please enter faculty / teacher full name.");
      return;
    }
    if (!teacherRegEmail.trim()) {
      setErrorMessage("Please enter institutional email address.");
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

    let finalInstituteName = "";
    let isNewInstitute = false;

    if (teacherInstituteChoice === "new") {
      if (!teacherNewInstituteName.trim()) {
        setErrorMessage("Please enter the name of the new institution or school.");
        return;
      }
      finalInstituteName = teacherNewInstituteName.trim();
      isNewInstitute = true;
    } else {
      if (!teacherExistingInstitute.trim()) {
        setErrorMessage("Please select your institute from the list.");
        return;
      }
      finalInstituteName = teacherExistingInstitute.trim();
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
      const res = await api.registerTeacher({
        name: teacherRegName.trim(),
        email: teacherRegEmail.trim(),
        password: teacherRegPassword,
        department: teacherRegDepartment.trim(),
        instituteName: finalInstituteName,
        isNewInstitute,
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
      setErrorMessage(err.message || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center items-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl bg-white border border-[#E5E7EB] shadow-sm my-auto">
        {/* Top Header */}
        <div className="border-b border-[#E5E7EB] p-5 sm:p-6 bg-[#FAFAFA] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black flex items-center justify-center shadow-xs">
              <div className="w-4 h-4 bg-white rotate-45" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#1A1A1A]">
                AI for Equitable Education Access
              </h1>
              <p className="text-xs text-[#6B7280]">
                National Open Curriculum Portal &bull; Multi-Role Verification & Academic Desk
              </p>
            </div>
          </div>

          {/* Role Selector & Briefing Button */}
          <div className="flex items-center gap-2">
            {onOpenAuditModal && (
              <button
                type="button"
                onClick={onOpenAuditModal}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition-colors"
                title="View Architectural Provenance, Semantic RAG & Security Transparency Audit"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span className="hidden sm:inline">Evaluator Briefing</span>
                <span className="sm:hidden">Audit</span>
              </button>
            )}

            <div className="inline-flex border border-[#E5E7EB] bg-white p-1">
              <button
                id="btn-role-student"
                onClick={() => {
                  setSelectedRole("student");
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors ${
                  selectedRole === "student"
                    ? "bg-black text-white"
                    : "text-[#4B5563] hover:text-black hover:bg-[#F3F4F6]"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student Portal</span>
              </button>
              <button
                id="btn-role-teacher"
                onClick={() => {
                  setSelectedRole("teacher");
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors ${
                  selectedRole === "teacher"
                    ? "bg-black text-white"
                    : "text-[#4B5563] hover:text-black hover:bg-[#F3F4F6]"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Teacher Portal</span>
              </button>
            </div>
          </div>
        </div>

        {/* Notification Banners */}
        {errorMessage && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-3 text-xs text-rose-700 flex items-start gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-3 text-xs text-emerald-800 flex items-start gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span className="leading-relaxed">{successMessage}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 sm:p-8">
          {selectedRole === "student" ? (
            <div>
              {/* Student Mode Switcher */}
              <div className="flex border-b border-[#E5E7EB] mb-6">
                <button
                  id="tab-student-signin"
                  onClick={() => {
                    setStudentMode("login");
                    setErrorMessage(null);
                  }}
                  className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all ${
                    studentMode === "login"
                      ? "border-black text-[#1A1A1A]"
                      : "border-transparent text-[#6B7280] hover:text-black"
                  }`}
                >
                  Existing Student Sign In
                </button>
                <button
                  id="tab-student-register"
                  onClick={() => {
                    setStudentMode("register");
                    setErrorMessage(null);
                  }}
                  className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                    studentMode === "register"
                      ? "border-black text-[#1A1A1A]"
                      : "border-transparent text-[#6B7280] hover:text-black"
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5 text-black" />
                  <span>Register New Student Profile</span>
                </button>
              </div>

              {studentMode === "login" ? (
                /* Student Existing Sign In */
                <form onSubmit={handleStudentLogin} className="max-w-xl space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#374151]">
                      Student Email Address or ID *
                    </label>
                    <p className="text-[11px] text-[#6B7280]">
                      Enter your registered email address or assigned student ID.
                    </p>
                    <input
                      id="student-login-identifier"
                      type="text"
                      value={studentLoginIdentifier}
                      onChange={(e) => setStudentLoginIdentifier(e.target.value)}
                      placeholder="e.g. aarav.sharma@student.edu.in"
                      required
                      className="w-full bg-[#F9FAFB] border border-[#E5E7EB] px-3 py-2 text-xs font-medium text-[#1A1A1A] outline-none hover:border-[#9CA3AF] focus:border-black transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#374151] flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-black" />
                        <span>Profile Password *</span>
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        id="student-login-password"
                        type={showStudentLoginPassword ? "text" : "password"}
                        value={studentLoginPassword}
                        onChange={(e) => setStudentLoginPassword(e.target.value)}
                        placeholder="Enter your student password"
                        required
                        className="w-full bg-[#F9FAFB] border border-[#E5E7EB] px-3 py-2 text-xs text-[#1A1A1A] pr-9 outline-none focus:border-black"
                      />
                      <button
                        type="button"
                        onClick={() => setShowStudentLoginPassword(!showStudentLoginPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-black"
                      >
                        {showStudentLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Demo Profile Shortcuts */}
                  <div className="p-3 bg-[#F9FAFB] border border-[#E5E7EB] text-[11px] text-[#6B7280] space-y-2">
                    <div className="flex items-center justify-between font-bold text-[#1A1A1A]">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Quick Demo Student Profiles:</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setStudentLoginIdentifier("aarav.sharma@student.edu.in");
                          setStudentLoginPassword("password123");
                        }}
                        className="text-left p-2 bg-white border border-[#E5E7EB] hover:border-black transition-colors"
                      >
                        <div className="font-bold text-black text-[11px]">Aarav Sharma (Senior Secondary)</div>
                        <div className="text-[10px] text-[#6B7280]">Kendriya Vidyalaya No. 1</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setStudentLoginIdentifier("rohan.das@student.edu.in");
                          setStudentLoginPassword("password123");
                        }}
                        className="text-left p-2 bg-white border border-[#E5E7EB] hover:border-black transition-colors"
                      >
                        <div className="font-bold text-black text-[11px]">Rohan Das (Secondary Standard)</div>
                        <div className="text-[10px] text-[#6B7280]">Kendriya Vidyalaya No. 1</div>
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-[#F8F9FA] border border-[#E5E7EB] text-xs text-[#4B5563] space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-[#1A1A1A]">
                      <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Student Equal Access & Privacy Isolation</span>
                    </div>
                    <p className="text-[11px] text-[#6B7280] leading-relaxed">
                      Your doubt logs, multimodal ladder history, and study progress remain private to you and your assigned teachers.
                    </p>
                  </div>

                  <button
                    id="btn-student-login-submit"
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-black text-white hover:bg-[#222] py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <span>Enter My Student Desk</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                /* Student Registration (No mandatory subject or class in starting) */
                <form onSubmit={handleStudentRegister} className="space-y-6">
                  {/* Step 1: Institute Affiliation */}
                  <div className="bg-[#F8F9FA] border border-[#E5E7EB] p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-black" />
                        <span>1. Select Your School or Registered Institute *</span>
                      </label>
                      <span className="text-[10px] font-mono text-[#6B7280] bg-white border border-[#E5E7EB] px-1.5 py-0.5">
                        {institutes.length} Institutes Available
                      </span>
                    </div>

                    <p className="text-[11px] text-[#6B7280]">
                      Choose your school / educational institution from the verified registry below.
                    </p>

                    <div>
                      <select
                        id="reg-student-institute"
                        value={regStudentInstitute}
                        onChange={(e) => setRegStudentInstitute(e.target.value)}
                        required
                        className="w-full bg-white border border-[#E5E7EB] px-3 py-2 text-xs font-bold text-[#1A1A1A] outline-none focus:border-black hover:border-[#9CA3AF] transition-colors"
                      >
                        {institutes.map((inst) => (
                          <option key={inst.id} value={inst.name}>
                            {inst.name} — ({inst.type || "School"} &bull; {inst.location || "India"})
                          </option>
                        ))}
                      </select>
                    </div>

                    {regStudentInstitute && (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div className="text-[11px]">
                          <span className="font-bold">Affiliated with Registered Institute:</span>{" "}
                          <span className="font-semibold">{regStudentInstitute}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Step 2: Optional Classroom Code */}
                  <div className="bg-[#F8F9FA] border border-[#E5E7EB] p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
                        <School className="w-3.5 h-3.5 text-black" />
                        <span>2. Classroom / Teacher Code (Optional)</span>
                      </label>
                      <span className="text-[10px] text-[#6B7280] font-medium">Optional</span>
                    </div>

                    <p className="text-[11px] text-[#6B7280]">
                      If your teacher provided you a class code (e.g. <strong>NCERT-12A</strong>), you can enter it now to join immediately. If you don't have a code yet, you can skip this step and join or accept invites later from your dashboard.
                    </p>

                    <div className="flex gap-2">
                      <input
                        id="reg-class-code-input"
                        type="text"
                        value={regClassCode}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase();
                          setRegClassCode(val);
                        }}
                        onBlur={() => verifyClassCode(regClassCode)}
                        placeholder="e.g. NCERT-12A (Optional - can be joined later)"
                        className="flex-1 uppercase font-mono font-bold bg-white border border-[#E5E7EB] px-3 py-2 text-xs text-[#1A1A1A] outline-none focus:border-black"
                      />
                      <button
                        id="btn-verify-class-code"
                        type="button"
                        onClick={() => verifyClassCode(regClassCode)}
                        disabled={isVerifyingCode || !regClassCode.trim()}
                        className="clean-button-secondary px-3 py-2 text-xs font-semibold shrink-0"
                      >
                        {isVerifyingCode ? "Checking..." : "Verify Code"}
                      </button>
                    </div>

                    {classCodeError && (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-1.5 font-medium">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{classCodeError}</span>
                      </div>
                    )}

                    {verifiedClass && (
                      <div className="p-3 bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold">✓ Class Code Linked: {verifiedClass.className}</div>
                          <p className="text-[11px] text-emerald-800 mt-0.5">
                            Teacher: <strong>{verifiedClass.teacherName}</strong> &bull; School: <strong>{verifiedClass.school}</strong>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Step 3: Account Credentials */}
                  <div className="bg-white border border-[#E5E7EB] p-4 sm:p-5 space-y-4">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-black" />
                      <span>3. Student Profile & Credentials *</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#374151]">Full Name *</label>
                        <input
                          id="reg-name-input"
                          type="text"
                          required
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="e.g. Aarav Sharma"
                          className="w-full bg-[#F9FAFB] border border-[#E5E7EB] px-3 py-2 text-xs text-[#1A1A1A] outline-none focus:border-black"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#374151]">Email Address *</label>
                        <input
                          id="reg-email-input"
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="student@school.edu.in"
                          className="w-full bg-[#F9FAFB] border border-[#E5E7EB] px-3 py-2 text-xs text-[#1A1A1A] outline-none focus:border-black"
                        />
                      </div>

                      {/* Password Field */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#374151]">Create Password *</label>
                        <div className="relative">
                          <input
                            id="reg-password-input"
                            type={showRegPassword ? "text" : "password"}
                            required
                            minLength={6}
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder="Minimum 6 characters"
                            className="w-full bg-[#F9FAFB] border border-[#E5E7EB] px-3 py-2 text-xs text-[#1A1A1A] pr-9 outline-none focus:border-black"
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-black"
                          >
                            {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Confirm Password Field */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#374151]">Confirm Password *</label>
                        <input
                          id="reg-confirm-password-input"
                          type={showRegPassword ? "text" : "password"}
                          required
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className="w-full bg-[#F9FAFB] border border-[#E5E7EB] px-3 py-2 text-xs text-[#1A1A1A] outline-none focus:border-black"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Step 4: Equal Access & Language Preferences */}
                  <div className="bg-white border border-[#E5E7EB] p-4 sm:p-5 space-y-4">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-black" />
                      <span>4. Learning Preferences & Equal Access Details</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#374151]">Primary Tutoring Language</label>
                        <select
                          value={regLanguage}
                          onChange={(e) => setRegLanguage(e.target.value)}
                          className="w-full bg-[#F9FAFB] border border-[#E5E7EB] px-3 py-2 text-xs text-[#1A1A1A] outline-none focus:border-black"
                        >
                          {SUPPORTED_LANGUAGES.map((l) => (
                            <option key={l.code} value={l.code}>
                              {l.name} ({l.nativeName})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#374151]">Social Category (Aid Matcher)</label>
                        <select
                          value={regCategory}
                          onChange={(e) => setRegCategory(e.target.value)}
                          className="w-full bg-[#F9FAFB] border border-[#E5E7EB] px-3 py-2 text-xs text-[#1A1A1A] outline-none focus:border-black"
                        >
                          <option value="General">General</option>
                          <option value="OBC">OBC (Other Backward Class)</option>
                          <option value="SC">SC (Scheduled Caste)</option>
                          <option value="ST">ST (Scheduled Tribe)</option>
                          <option value="EWS">EWS (Economically Weaker Section)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#374151]">Annual Family Income</label>
                        <select
                          value={regIncome}
                          onChange={(e) => setRegIncome(e.target.value)}
                          className="w-full bg-[#F9FAFB] border border-[#E5E7EB] px-3 py-2 text-xs text-[#1A1A1A] outline-none focus:border-black"
                        >
                          <option value="< 1.5 Lakhs/yr">&lt; ₹1.5 Lakhs/yr (Full Fee Waiver Eligible)</option>
                          <option value="1.5 - 3.0 Lakhs/yr">₹1.5 - 3.0 Lakhs/yr</option>
                          <option value="3.0 - 6.0 Lakhs/yr">₹3.0 - 6.0 Lakhs/yr</option>
                          <option value="6.0 - 8.0 Lakhs/yr">₹6.0 - 8.0 Lakhs/yr</option>
                          <option value="> 8.0 Lakhs/yr">&gt; ₹8.0 Lakhs/yr</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#374151]">Recent Exam / Board Score (%)</label>
                        <input
                          type="number"
                          min="30"
                          max="100"
                          value={regScore}
                          onChange={(e) => setRegScore(Number(e.target.value))}
                          className="w-full bg-[#F9FAFB] border border-[#E5E7EB] px-3 py-2 text-xs text-[#1A1A1A] outline-none focus:border-black"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-[#F0F2F5]">
                      <input
                        type="checkbox"
                        id="first-gen-check"
                        checked={regFirstGen}
                        onChange={(e) => setRegFirstGen(e.target.checked)}
                        className="w-4 h-4 text-black border-[#E5E7EB] rounded-none focus:ring-0 cursor-pointer"
                      />
                      <label htmlFor="first-gen-check" className="text-xs text-[#374151] cursor-pointer">
                        I am a <strong>First-Generation Learner</strong> (Unlock dedicated mentoring & National scholarship eligibility)
                      </label>
                    </div>
                  </div>

                  {/* Submission Button */}
                  <button
                    id="btn-complete-registration"
                    type="submit"
                    disabled={
                      isLoading ||
                      !regName.trim() ||
                      !regEmail.trim() ||
                      regPassword.length < 6 ||
                      regPassword !== regConfirmPassword ||
                      !regStudentInstitute
                    }
                    className="w-full bg-black text-white hover:bg-[#222] py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                  >
                    <span>
                      {!regStudentInstitute
                        ? "Please Select Your Institute"
                        : !regName.trim()
                        ? "Enter Your Full Name"
                        : regPassword.length < 6
                        ? "Please Set a Password (min 6 chars)"
                        : regPassword !== regConfirmPassword
                        ? "Passwords Do Not Match"
                        : "Complete Registration & Access Student Desk"}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* TEACHER PORTAL */
            <div>
              {/* Teacher Mode Switcher */}
              <div className="flex border-b border-[#E5E7EB] mb-6">
                <button
                  id="tab-teacher-signin"
                  onClick={() => {
                    setTeacherMode("login");
                    setErrorMessage(null);
                  }}
                  className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all ${
                    teacherMode === "login"
                      ? "border-black text-[#1A1A1A]"
                      : "border-transparent text-[#6B7280] hover:text-black"
                  }`}
                >
                  Existing Teacher Sign In
                </button>
                <button
                  id="tab-teacher-register"
                  onClick={() => {
                    setTeacherMode("register");
                    setErrorMessage(null);
                  }}
                  className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                    teacherMode === "register"
                      ? "border-black text-[#1A1A1A]"
                      : "border-transparent text-[#6B7280] hover:text-black"
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5 text-black" />
                  <span>Register New Teacher & Institute</span>
                </button>
              </div>

              {teacherMode === "login" ? (
                /* Teacher Existing Sign In */
                <form onSubmit={handleTeacherLogin} className="max-w-xl space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#374151]">
                      Teacher Email Address or Staff ID *
                    </label>
                    <p className="text-[11px] text-[#6B7280]">
                      Enter your registered school email address or teacher identifier.
                    </p>
                    <input
                      id="teacher-login-identifier"
                      type="text"
                      value={teacherLoginIdentifier}
                      onChange={(e) => setTeacherLoginIdentifier(e.target.value)}
                      placeholder="e.g. rajesh.varma@school.edu.in"
                      required
                      className="w-full bg-[#F9FAFB] border border-[#E5E7EB] px-3 py-2 text-xs font-medium text-[#1A1A1A] outline-none hover:border-[#9CA3AF] focus:border-black transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#374151] flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-black" />
                        <span>Teacher Access Key / Password *</span>
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        id="teacher-login-password"
                        type={showTeacherLoginPassword ? "text" : "password"}
                        value={teacherLoginPassword}
                        onChange={(e) => setTeacherLoginPassword(e.target.value)}
                        placeholder="Enter teacher password"
                        required
                        className="w-full bg-[#F9FAFB] border border-[#E5E7EB] px-3 py-2 text-xs text-[#1A1A1A] pr-9 outline-none focus:border-black"
                      />
                      <button
                        type="button"
                        onClick={() => setShowTeacherLoginPassword(!showTeacherLoginPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-black"
                      >
                        {showTeacherLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Demo Teacher Profiles */}
                  <div className="p-3 bg-[#F9FAFB] border border-[#E5E7EB] text-[11px] text-[#6B7280] space-y-2">
                    <div className="flex items-center justify-between font-bold text-[#1A1A1A]">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Quick Demo Teacher Profiles:</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setTeacherLoginIdentifier("rajesh.varma@school.edu.in");
                          setTeacherLoginPassword("teacher123");
                        }}
                        className="text-left p-2 bg-white border border-[#E5E7EB] hover:border-black transition-colors"
                      >
                        <div className="font-bold text-black text-[11px]">Dr. Rajesh Varma</div>
                        <div className="text-[10px] text-[#6B7280]">Kendriya Vidyalaya No. 1</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTeacherLoginIdentifier("sunita.sharma@school.edu.in");
                          setTeacherLoginPassword("teacher123");
                        }}
                        className="text-left p-2 bg-white border border-[#E5E7EB] hover:border-black transition-colors"
                      >
                        <div className="font-bold text-black text-[11px]">Mrs. Sunita Sharma</div>
                        <div className="text-[10px] text-[#6B7280]">Kendriya Vidyalaya No. 1</div>
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#F8F9FA] border border-[#E5E7EB] text-xs text-[#4B5563] space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-[#1A1A1A]">
                      <Users className="w-3.5 h-3.5 text-black" />
                      <span>Teacher Dashboard Capabilities</span>
                    </div>
                    <ul className="text-[11px] text-[#6B7280] space-y-1 list-disc pl-4">
                      <li>Create and manage custom classes & custom subjects dynamically inside your dashboard.</li>
                      <li>Send invite links to students and categorize them across sections.</li>
                      <li>Broadcast circulars and official classroom announcements.</li>
                      <li>Review diagnostic flags and topic heatmaps across enrolled students.</li>
                    </ul>
                  </div>

                  <button
                    id="btn-teacher-login-submit"
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-black text-white hover:bg-[#222] py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-xs"
                  >
                    <span>Enter Teacher Academic Desk</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                /* TEACHER SIGN UP (No mandatory class/subject selection at start; managed in dashboard) */
                <form onSubmit={handleTeacherRegister} className="space-y-6">
                  {/* Step 1: Teacher Credentials & Department */}
                  <div className="bg-[#F8F9FA] border border-[#E5E7EB] p-4 sm:p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-black" />
                        <span>1. Teacher Credentials & Department *</span>
                      </label>
                      <span className="text-[10px] text-[#6B7280] font-medium">Step 1 of 2</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#374151]">Teacher Full Name *</label>
                        <input
                          id="teacher-reg-name"
                          type="text"
                          required
                          value={teacherRegName}
                          onChange={(e) => setTeacherRegName(e.target.value)}
                          placeholder="e.g. Dr. Rajesh Varma"
                          className="w-full bg-white border border-[#E5E7EB] px-3 py-2 text-xs text-[#1A1A1A] outline-none focus:border-black"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#374151]">Institutional Email *</label>
                        <input
                          id="teacher-reg-email"
                          type="email"
                          required
                          value={teacherRegEmail}
                          onChange={(e) => setTeacherRegEmail(e.target.value)}
                          placeholder="teacher@school.edu.in"
                          className="w-full bg-white border border-[#E5E7EB] px-3 py-2 text-xs text-[#1A1A1A] outline-none focus:border-black"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#374151]">Create Teacher Password *</label>
                        <div className="relative">
                          <input
                            id="teacher-reg-password"
                            type={showTeacherRegPassword ? "text" : "password"}
                            required
                            minLength={6}
                            value={teacherRegPassword}
                            onChange={(e) => setTeacherRegPassword(e.target.value)}
                            placeholder="Min 6 characters"
                            className="w-full bg-white border border-[#E5E7EB] px-3 py-2 text-xs text-[#1A1A1A] pr-9 outline-none focus:border-black"
                          />
                          <button
                            type="button"
                            onClick={() => setShowTeacherRegPassword(!showTeacherRegPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-black"
                          >
                            {showTeacherRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#374151]">Confirm Password *</label>
                        <input
                          id="teacher-reg-confirm-password"
                          type={showTeacherRegPassword ? "text" : "password"}
                          required
                          value={teacherRegConfirmPassword}
                          onChange={(e) => setTeacherRegConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className="w-full bg-white border border-[#E5E7EB] px-3 py-2 text-xs text-[#1A1A1A] outline-none focus:border-black"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-[#374151]">Department / Academic Designation</label>
                        <input
                          type="text"
                          value={teacherRegDepartment}
                          onChange={(e) => setTeacherRegDepartment(e.target.value)}
                          placeholder="e.g. Senior Science & Mathematics Faculty"
                          className="w-full bg-white border border-[#E5E7EB] px-3 py-2 text-xs text-[#1A1A1A] outline-none focus:border-black"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Institute Selection */}
                  <div className="bg-white border-2 border-black p-4 sm:p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E7EB] pb-3">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
                          <Building className="w-4 h-4 text-black" />
                          <span>2. Institute Selection & Sign-Up *</span>
                        </label>
                        <p className="text-[11px] text-[#6B7280] mt-0.5">
                          Select an existing registered school or register a new institution into the platform.
                        </p>
                      </div>

                      <div className="inline-flex border border-[#E5E7EB] p-0.5 bg-[#F9FAFB]">
                        <button
                          type="button"
                          id="btn-choose-existing-institute"
                          onClick={() => setTeacherInstituteChoice("existing")}
                          className={`px-2.5 py-1 text-xs font-bold transition-colors ${
                            teacherInstituteChoice === "existing"
                              ? "bg-black text-white"
                              : "text-[#4B5563] hover:text-black"
                          }`}
                        >
                          Select Existing ({institutes.length})
                        </button>
                        <button
                          type="button"
                          id="btn-choose-new-institute"
                          onClick={() => setTeacherInstituteChoice("new")}
                          className={`px-2.5 py-1 text-xs font-bold transition-colors flex items-center gap-1 ${
                            teacherInstituteChoice === "new"
                              ? "bg-black text-white"
                              : "text-[#4B5563] hover:text-black"
                          }`}
                        >
                          <PlusCircle className="w-3 h-3" />
                          <span>+ Register New Institution</span>
                        </button>
                      </div>
                    </div>

                    {teacherInstituteChoice === "existing" ? (
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-[#374151] block">
                          Choose From Available Institutes in Database:
                        </label>
                        <select
                          id="teacher-existing-institute-select"
                          value={teacherExistingInstitute}
                          onChange={(e) => setTeacherExistingInstitute(e.target.value)}
                          className="w-full bg-[#F9FAFB] border border-[#E5E7EB] px-3 py-2 text-xs font-bold text-[#1A1A1A] outline-none focus:border-black"
                        >
                          {institutes.map((inst) => (
                            <option key={inst.id} value={inst.name}>
                              {inst.name} &bull; ({inst.type || "School"} &bull; {inst.location || "India"})
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="bg-[#F8F9FA] border border-[#E5E7EB] p-4 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="sm:col-span-2 space-y-1">
                            <label className="text-[11px] font-bold text-[#374151]">
                              Institution / School Full Name *
                            </label>
                            <input
                              id="teacher-new-institute-name"
                              type="text"
                              required={teacherInstituteChoice === "new"}
                              value={teacherNewInstituteName}
                              onChange={(e) => setTeacherNewInstituteName(e.target.value)}
                              placeholder="e.g. Delhi Public School R.K. Puram"
                              className="w-full bg-white border border-[#E5E7EB] px-3 py-2 text-xs text-[#1A1A1A] outline-none focus:border-black font-bold"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-[#374151]">
                              Academic Tier / Standard
                            </label>
                            <select
                              id="teacher-institute-tier"
                              value={teacherInstituteTier}
                              onChange={(e) => setTeacherInstituteTier(e.target.value)}
                              className="w-full bg-white border border-[#E5E7EB] px-3 py-2 text-xs font-bold text-[#1A1A1A] outline-none focus:border-black"
                            >
                              {ACADEMIC_TIERS.map((tier) => (
                                <option key={tier.id} value={tier.name}>
                                  {tier.name} — {tier.description}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-[#374151]">
                              Institution Classification
                            </label>
                            <select
                              id="teacher-new-institute-type"
                              value={teacherNewInstituteType}
                              onChange={(e) => setTeacherNewInstituteType(e.target.value)}
                              className="w-full bg-white border border-[#E5E7EB] px-3 py-2 text-xs text-[#1A1A1A] outline-none focus:border-black"
                            >
                              {INSTITUTION_CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="sm:col-span-2 space-y-1">
                            <label className="text-[11px] font-bold text-[#374151]">
                              Campus City & Location
                            </label>
                            <input
                              id="teacher-new-institute-location"
                              type="text"
                              value={teacherNewInstituteLocation}
                              onChange={(e) => setTeacherNewInstituteLocation(e.target.value)}
                              placeholder="e.g. New Delhi, India"
                              className="w-full bg-white border border-[#E5E7EB] px-3 py-2 text-xs text-[#1A1A1A] outline-none focus:border-black"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="p-3 bg-[#F9FAFB] border border-[#E5E7EB] text-[11px] text-[#6B7280]">
                      💡 <strong>Flexible Classroom & Subject Setup:</strong> You can create and customize any number of classes and custom subjects directly inside your teacher dashboard anytime after sign in.
                    </div>
                  </div>

                  {/* Submission Button */}
                  <button
                    id="btn-teacher-complete-registration"
                    type="submit"
                    disabled={
                      isLoading ||
                      !teacherRegName.trim() ||
                      !teacherRegEmail.trim() ||
                      teacherRegPassword.length < 6 ||
                      teacherRegPassword !== teacherRegConfirmPassword ||
                      (teacherInstituteChoice === "new" && !teacherNewInstituteName.trim())
                    }
                    className="w-full bg-black text-white hover:bg-[#222] py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                  >
                    <span>
                      {!teacherRegName.trim()
                        ? "Enter Faculty / Teacher Name"
                        : teacherRegPassword.length < 6
                        ? "Password Must Be At Least 6 Characters"
                        : teacherRegPassword !== teacherRegConfirmPassword
                        ? "Passwords Do Not Match"
                        : teacherInstituteChoice === "new" && !teacherNewInstituteName.trim()
                        ? "Enter Institution Name"
                        : "Complete Sign Up & Enter Teacher Dashboard"}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* About the Platform & Mission Section */}
      <section id="about" className="max-w-4xl w-full bg-white border border-[#E5E7EB] p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="border-b border-[#E5E7EB] pb-4 space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-black text-white text-[10px] font-mono font-bold px-2 py-0.5 uppercase tracking-wider">
              Platform Overview
            </span>
            <span className="text-xs text-[#6B7280] font-semibold">
              National Open Curriculum Grounded Learning Engine
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#1A1A1A]">
            About AI for Equitable Education Access
          </h2>
          <p className="text-xs text-[#4B5563] leading-relaxed">
            A comprehensive, open, and multilingual educational ecosystem designed to bridge the digital and socioeconomic divide in school education across India.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Pillar 1 */}
          <div className="p-4 bg-[#F9FAFB] border border-[#E5E7EB] space-y-2">
            <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-[#1A1A1A]">Multilingual Socratic AI Tutor</h3>
            <p className="text-[11px] text-[#6B7280] leading-relaxed">
              Step-by-step doubt resolution in 10+ Indian languages (Hindi, Tamil, Telugu, Bengali, Marathi, etc.) strictly grounded in verified NCERT & State curricula to eliminate hallucinations.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-4 bg-[#F9FAFB] border border-[#E5E7EB] space-y-2">
            <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold">
              <School className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-[#1A1A1A]">Multi-Classroom Architecture</h3>
            <p className="text-[11px] text-[#6B7280] leading-relaxed">
              Teachers create dedicated subject & section classrooms with unique codes (e.g. <code>CLS-10A-PHY</code>). Students can join and participate in multiple classrooms simultaneously.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-4 bg-[#F9FAFB] border border-[#E5E7EB] space-y-2">
            <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-[#1A1A1A]">Doubts & Teacher Circulars</h3>
            <p className="text-[11px] text-[#6B7280] leading-relaxed">
              Open peer discussion and shared subject community doubt chats paired with an isolated, official announcement broadcast feed reserved exclusively for teacher notices.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
          {/* Pillar 4 */}
          <div className="p-4 bg-emerald-50/60 border border-emerald-200 space-y-1.5">
            <div className="font-bold text-emerald-950 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Diagnostic Gap Detection & Faculty Intervention</span>
            </div>
            <p className="text-[11px] text-emerald-900 leading-relaxed">
              Identifies real-time student struggle topics through cognitive heatmaps and empowers teachers to auto-generate customized remedial lesson plans with a single click.
            </p>
          </div>

          {/* Pillar 5 */}
          <div className="p-4 bg-indigo-50/60 border border-indigo-200 space-y-1.5">
            <div className="font-bold text-indigo-950 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-indigo-700" />
              <span>Automated Financial Aid & Scholarship Matcher</span>
            </div>
            <p className="text-[11px] text-indigo-900 leading-relaxed">
              Instant rule-based eligibility evaluation matching first-generation, low-income, and marginalized students directly with central, state, and institutional scholarship schemes.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;
