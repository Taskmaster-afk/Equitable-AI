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
  Check,
  X,
  Building,
  PlusCircle,
  Sparkles,
  BookOpen,
  HelpCircle
} from "lucide-react";
import { api } from "../services/api";
import { SUPPORTED_LANGUAGES } from "../data/oerKnowledgeBase";

export const LoginPage = ({ onLoginSuccess }) => {
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
  const [regStudentClass, setRegStudentClass] = useState("Class 12");
  const [regClassCode, setRegClassCode] = useState("NCERT-12A");
  const [regStudentInstitute, setRegStudentInstitute] = useState("Kendriya Vidyalaya No. 1, Model Cluster");
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
  const [teacherRegDepartment, setTeacherRegDepartment] = useState("Senior Science & Physics Lead");
  const [teacherInstituteChoice, setTeacherInstituteChoice] = useState("existing"); // "existing" | "new"
  const [teacherExistingInstitute, setTeacherExistingInstitute] = useState("Kendriya Vidyalaya No. 1, Model Cluster");
  const [teacherNewInstituteName, setTeacherNewInstituteName] = useState("");
  const [teacherNewInstituteType, setTeacherNewInstituteType] = useState("Government School (KVS/JNV)");
  const [teacherNewInstituteLocation, setTeacherNewInstituteLocation] = useState("Bhopal, Madhya Pradesh");
  const [teacherInitialGrade, setTeacherInitialGrade] = useState("Class 12");
  const [teacherInitialStream, setTeacherInitialStream] = useState("Science (PCM / PCB)");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    loadInitialData();
    verifyClassCode("NCERT-12A");
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
    if (!codeToVerify.trim()) {
      setVerifiedClass(null);
      setClassCodeError("Please enter a class code provided by your teacher.");
      return;
    }
    setIsVerifyingCode(true);
    setClassCodeError(null);
    try {
      const res = await api.lookupClassCode(codeToVerify);
      setVerifiedClass(res.classInfo);
    } catch (err) {
      setVerifiedClass(null);
      setClassCodeError(
        err.message || `Class code "${codeToVerify}" not found. Try NCERT-12A, NCERT-11B, or NCERT-10A.`
      );
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const checkClassMatch = () => {
    if (!verifiedClass) {
      return { matches: false, message: "Class code has not been verified yet." };
    }
    const studentDigits = regStudentClass.match(/\b(12|11|10|9|8|7|6)\b/i)?.[1] || "";
    const targetDigits =
      (verifiedClass.targetClass || "").match(/\b(12|11|10|9|8|7|6)\b/i)?.[1] ||
      verifiedClass.classCode.match(/(12|11|10|9|8|7|6)/i)?.[1] ||
      verifiedClass.className.match(/\bclass\s*(12|11|10|9|8|7|6)\b/i)?.[1] ||
      "";

    if (studentDigits && targetDigits) {
      if (studentDigits === targetDigits) {
        return {
          matches: true,
          message: `Class match verified: Your selected Class ${studentDigits} matches Class Code "${verifiedClass.classCode}" (${verifiedClass.className}).`
        };
      } else {
        return {
          matches: false,
          message: `Class Mismatch: You selected Class ${studentDigits}, but class code "${verifiedClass.classCode}" is for Class ${targetDigits} (${verifiedClass.className}). You are NOT allowed to join this class. Please select your matching class or ask your teacher for your class code.`
        };
      }
    }

    if (
      verifiedClass.targetClass &&
      regStudentClass.trim().toLowerCase() !== verifiedClass.targetClass.trim().toLowerCase()
    ) {
      return {
        matches: false,
        message: `Class Mismatch: You selected "${regStudentClass}", but class code "${verifiedClass.classCode}" is for "${verifiedClass.targetClass}".`
      };
    }
    return { matches: true, message: `Class matches code ${verifiedClass.classCode}.` };
  };

  const classMatchStatus = verifiedClass ? checkClassMatch() : null;

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
      onLoginSuccess(res.user, res.studentProfile, void 0, res.classInfo);
    } catch (err) {
      setErrorMessage(err.message || "Login failed. Please check your student credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  // Student Registration (With strict institute dropdown menu)
  const handleStudentRegister = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!regName.trim() || !regEmail.trim() || !regClassCode.trim()) {
      setErrorMessage("Please fill in your name, email, and class code.");
      return;
    }
    if (!regStudentInstitute || !regStudentInstitute.trim()) {
      setErrorMessage("Please select your institute from the dropdown menu of available institutes.");
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
    if (!verifiedClass) {
      setErrorMessage("Please enter and verify a valid teacher class code.");
      return;
    }
    const matchCheck = checkClassMatch();
    if (!matchCheck.matches) {
      setErrorMessage(matchCheck.message);
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.registerStudent({
        name: regName,
        email: regEmail,
        password: regPassword,
        studentClass: regStudentClass,
        classCode: regClassCode,
        instituteName: regStudentInstitute,
        primaryLanguage: regLanguage,
        category: regCategory,
        gender: regGender,
        familyIncomeBracket: regIncome,
        academicScorePercent: Number(regScore),
        firstGenerationLearner: regFirstGen,
        stateOrRegion: regState
      });
      onLoginSuccess(res.user, res.student, void 0, res.classInfo);
    } catch (err) {
      setErrorMessage(err.message || "Registration failed. Check your class code and credentials.");
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
      onLoginSuccess(res.user, void 0, res.teacherProfile, void 0);
    } catch (err) {
      setErrorMessage(err.message || "Teacher login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  // Teacher Registration (With capability to sign up an institute if not already in database)
  const handleTeacherRegister = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!teacherRegName.trim()) {
      setErrorMessage("Please enter teacher full name.");
      return;
    }
    if (!teacherRegEmail.trim()) {
      setErrorMessage("Please enter teacher email address.");
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
        setErrorMessage("Please enter the name of the new institute you want to register.");
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

    setIsLoading(true);
    try {
      const res = await api.registerTeacher({
        name: teacherRegName,
        email: teacherRegEmail,
        password: teacherRegPassword,
        department: teacherRegDepartment,
        instituteName: finalInstituteName,
        isNewInstitute,
        instituteType: teacherNewInstituteType,
        instituteLocation: teacherNewInstituteLocation,
        initialClassGrade: teacherInitialGrade,
        initialStream: teacherInitialStream
      });

      // Refresh institutes list so student registration instantly sees any newly created institute
      await refreshInstitutesList();

      onLoginSuccess(res.user, void 0, res.teacherProfile, void 0);
    } catch (err) {
      setErrorMessage(err.message || "Teacher registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const quickSetClassAndCode = (cls, code) => {
    setRegStudentClass(cls);
    setRegClassCode(code);
    verifyClassCode(code);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-4xl bg-white border border-[#E5E7EB] shadow-sm">
        {/* Top Minimalist Header */}
        <div className="border-b border-[#E5E7EB] p-5 sm:p-6 bg-[#FAFAFA] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-black flex items-center justify-center">
              <div className="w-4 h-4 bg-white rotate-45" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#1A1A1A]">
                AI for Equitable Education Access
              </h1>
              <p className="text-xs text-[#6B7280]">
                National NCERT Curriculum Portal &bull; Multi-Role Verification & Institute Registry
              </p>
            </div>
          </div>

          {/* Role Selector Tabs */}
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
                  <span>Register Profile & Enter Class Code</span>
                </button>
              </div>

              {studentMode === "login" ? (
                /* Student Existing Sign In (Manual Credentials Entry) */
                <form onSubmit={handleStudentLogin} className="max-w-md space-y-4">
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
                      placeholder="e.g. aarav.sharma@student.edu.in or student-1"
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

                  <div className="p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] text-[11px] text-[#6B7280]">
                    <span className="font-bold text-[#1A1A1A]">Demo Account:</span>{" "}
                    <code className="bg-white border border-[#E5E7EB] px-1 py-0.5 text-black font-mono">aarav.sharma@student.edu.in</code> &bull; Password: <code className="bg-white border border-[#E5E7EB] px-1 py-0.5 text-black font-mono">password123</code>
                  </div>

                  <div className="p-3 bg-[#F8F9FA] border border-[#E5E7EB] text-xs text-[#4B5563] space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-[#1A1A1A]">
                      <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Strict Student Privacy Isolation Enforced</span>
                    </div>
                    <p className="text-[11px] text-[#6B7280] leading-relaxed">
                      Your doubt history, adaptive practice ladders, and syllabus progress remain private to you and your assigned class teacher.
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
                /* Student Registration with Institute Selection Dropdown */
                <form onSubmit={handleStudentRegister} className="space-y-6">
                  {/* Step 1: Institute Affiliation (Strict Dropdown Menu of available institutes) */}
                  <div className="bg-[#F8F9FA] border border-[#E5E7EB] p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-black" />
                        <span>1. Select Your Registered Institute *</span>
                      </label>
                      <span className="text-[10px] font-mono text-[#6B7280] bg-white border border-[#E5E7EB] px-1.5 py-0.5">
                        {institutes.length} Institutes Registered
                      </span>
                    </div>

                    <p className="text-[11px] text-[#6B7280]">
                      Choose your school / educational institute from the registered list below. Students can only enroll in existing institutes verified in the database.
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

                    {/* Institute Selected Verification Badge */}
                    {regStudentInstitute && (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div className="text-[11px]">
                          <span className="font-bold">Affiliated with Registered Institute:</span>{" "}
                          <span className="font-semibold">{regStudentInstitute}</span>
                        </div>
                      </div>
                    )}

                    {/* Helpful guidance note for unlisted institutes */}
                    <div className="p-2.5 bg-white border border-[#E5E7EB] text-[11px] text-[#6B7280] flex items-start gap-2">
                      <HelpCircle className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0 mt-0.5" />
                      <p>
                        <strong>Cannot find your school or institute?</strong> In accordance with role permissions, only verified teachers can register new institutes. Please request your teacher to sign up your institute on the Teacher Portal.
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Class Selection & Class Code Reader with strict match validation */}
                  <div className="bg-[#F8F9FA] border border-[#E5E7EB] p-4 sm:p-5 space-y-4">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
                          <School className="w-3.5 h-3.5 text-black" />
                          <span>2. Select Your Class & Teacher's Class Code *</span>
                        </label>
                      </div>
                      <p className="text-[11px] text-[#6B7280] mb-3">
                        Your selected class <strong>must match</strong> the class code issued by your teacher. If they mismatch, enrollment will be blocked.
                      </p>

                      {/* Quick preset links for demo convenience */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[11px] text-[#6B7280]">
                        <span className="font-medium">Quick Test Scenarios:</span>
                        <button
                          type="button"
                          onClick={() => quickSetClassAndCode("Class 12", "NCERT-12A")}
                          className="px-2 py-0.5 bg-white border border-[#E5E7EB] font-mono text-[10px] text-black hover:border-black transition-colors"
                        >
                          Match: Class 12 &rarr; NCERT-12A
                        </button>
                        <button
                          type="button"
                          onClick={() => quickSetClassAndCode("Class 11", "NCERT-11B")}
                          className="px-2 py-0.5 bg-white border border-[#E5E7EB] font-mono text-[10px] text-black hover:border-black transition-colors"
                        >
                          Match: Class 11 &rarr; NCERT-11B
                        </button>
                        <button
                          type="button"
                          onClick={() => quickSetClassAndCode("Class 10", "NCERT-10A")}
                          className="px-2 py-0.5 bg-white border border-[#E5E7EB] font-mono text-[10px] text-black hover:border-black transition-colors"
                        >
                          Match: Class 10 &rarr; NCERT-10A
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRegStudentClass("Class 10");
                            setRegClassCode("NCERT-12A");
                            verifyClassCode("NCERT-12A");
                          }}
                          className="px-2 py-0.5 bg-rose-50 border border-rose-200 font-mono text-[10px] text-rose-700 hover:border-rose-400 transition-colors"
                        >
                          Test Mismatch: Class 10 with NCERT-12A
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Student Class Select */}
                        <div>
                          <label className="text-[11px] font-bold text-[#374151] block mb-1">
                            Your Enrolled Class *
                          </label>
                          <select
                            id="reg-student-class"
                            value={regStudentClass}
                            onChange={(e) => setRegStudentClass(e.target.value)}
                            className="w-full bg-white border border-[#E5E7EB] px-3 py-2 text-xs font-bold text-[#1A1A1A] outline-none focus:border-black"
                          >
                            <option value="Class 12">Class 12 (Senior Secondary)</option>
                            <option value="Class 11">Class 11 (Senior Secondary)</option>
                            <option value="Class 10">Class 10 (Secondary Standard)</option>
                            <option value="Class 9">Class 9 (Secondary Standard)</option>
                            <option value="Class 8">Class 8 (Middle School)</option>
                            <option value="Class 7">Class 7 (Middle School)</option>
                            <option value="Class 6">Class 6 (Middle School)</option>
                          </select>
                        </div>

                        {/* Class Code Input */}
                        <div>
                          <label className="text-[11px] font-bold text-[#374151] block mb-1">
                            Teacher's Class Code *
                          </label>
                          <div className="flex gap-1.5">
                            <input
                              id="reg-class-code-input"
                              type="text"
                              value={regClassCode}
                              onChange={(e) => {
                                const val = e.target.value.toUpperCase();
                                setRegClassCode(val);
                              }}
                              onBlur={() => verifyClassCode(regClassCode)}
                              placeholder="e.g. NCERT-12A"
                              className="flex-1 uppercase font-mono font-bold bg-white border border-[#E5E7EB] px-3 py-2 text-xs text-[#1A1A1A] outline-none focus:border-black"
                            />
                            <button
                              id="btn-verify-class-code"
                              type="button"
                              onClick={() => verifyClassCode(regClassCode)}
                              disabled={isVerifyingCode}
                              className="clean-button-primary px-3 py-2 text-xs font-semibold shrink-0"
                            >
                              {isVerifyingCode ? "Reading..." : "Verify Code"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Class Code Lookup Error */}
                    {classCodeError && (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-1.5 font-medium">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{classCodeError}</span>
                      </div>
                    )}

                    {/* Live Class Matching Indicator */}
                    {verifiedClass && (
                      <div className="space-y-2">
                        {classMatchStatus?.matches ? (
                          <div
                            id="class-match-success"
                            className="p-3 bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 flex items-start gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <div className="font-bold">✓ Class Match Verified & Authorized</div>
                              <p className="text-[11px] text-emerald-800 mt-0.5">
                                Your selected <strong>{regStudentClass}</strong> matches class code{" "}
                                <strong>{verifiedClass.classCode}</strong> ({verifiedClass.className}). Dashboard content will be strictly scoped to your {regStudentClass} curriculum.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div
                            id="class-match-mismatch"
                            className="p-3 bg-rose-50 border-2 border-rose-500 text-xs text-rose-900 flex items-start gap-2 animate-pulse"
                          >
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            <div>
                              <div className="font-bold text-rose-800">
                                ❌ Class Mismatch &bull; Enrollment Restricted
                              </div>
                              <p className="text-[11px] text-rose-800 mt-0.5 leading-relaxed">
                                {classMatchStatus?.message}
                              </p>
                              <p className="text-[10px] text-rose-700 font-semibold mt-1">
                                Action Required: Change your selected class to match this class code, or enter your correct class teacher's code.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Class Details Card */}
                        <div className="p-3 bg-white border border-[#E5E7EB] text-xs space-y-2">
                          <div className="flex items-center justify-between border-b border-[#F0F2F5] pb-2">
                            <div className="flex items-center gap-2">
                              <span className="bg-black text-white text-[10px] font-mono font-bold px-1.5 py-0.5">
                                {verifiedClass.classCode}
                              </span>
                              <span className="font-bold text-xs text-[#1A1A1A]">
                                {verifiedClass.className}
                              </span>
                            </div>
                            <span className="text-[11px] text-[#6B7280]">
                              Target: {verifiedClass.targetClass || verifiedClass.gradeLevel}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                            <div>
                              <span className="text-[#9CA3AF] block text-[10px] uppercase font-bold">Teacher</span>
                              <span className="font-semibold text-[#1A1A1A]">{verifiedClass.teacherName}</span>
                            </div>
                            <div>
                              <span className="text-[#9CA3AF] block text-[10px] uppercase font-bold">School</span>
                              <span className="font-semibold text-[#1A1A1A] truncate block">{verifiedClass.school}</span>
                            </div>
                            <div>
                              <span className="text-[#9CA3AF] block text-[10px] uppercase font-bold">Curriculum</span>
                              <span className="font-semibold text-[#1A1A1A]">{verifiedClass.curriculum}</span>
                            </div>
                            <div>
                              <span className="text-[#9CA3AF] block text-[10px] uppercase font-bold">Subjects</span>
                              <span className="font-semibold text-[#1A1A1A]">{verifiedClass.subjects?.join(", ")}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Step 3: Account Security / Create Password */}
                  <div className="bg-white border border-[#E5E7EB] p-4 sm:p-5 space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-black" />
                      <span>3. Create Password for Your Student Profile *</span>
                    </label>
                    <p className="text-[11px] text-[#6B7280]">
                      Set a confidential password to protect your doubt solving history and academic profile.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        {regPassword && (
                          <div className="flex items-center gap-1 text-[10px] mt-0.5">
                            {regPassword.length >= 6 ? (
                              <span className="text-emerald-600 flex items-center gap-0.5">
                                <Check className="w-3 h-3" /> Minimum 6 characters met
                              </span>
                            ) : (
                              <span className="text-amber-600 flex items-center gap-0.5">
                                <AlertCircle className="w-3 h-3" /> Needs {6 - regPassword.length} more characters
                              </span>
                            )}
                          </div>
                        )}
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
                        {regConfirmPassword && (
                          <div className="flex items-center gap-1 text-[10px] mt-0.5">
                            {regPassword === regConfirmPassword ? (
                              <span className="text-emerald-600 flex items-center gap-0.5">
                                <Check className="w-3 h-3" /> Passwords match
                              </span>
                            ) : (
                              <span className="text-rose-600 flex items-center gap-0.5">
                                <X className="w-3 h-3" /> Passwords do not match
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Step 4: Personal & Equal Access Details */}
                  <div className="bg-white border border-[#E5E7EB] p-4 sm:p-5 space-y-4">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-black" />
                      <span>4. Personal & Equal Access Details</span>
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
                        <label className="text-xs font-bold text-[#374151]">Social Category (For Aid Matcher)</label>
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
                        <label className="text-xs font-bold text-[#374151]">Recent Board/Exam Score (%)</label>
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
                      !verifiedClass ||
                      !classMatchStatus?.matches ||
                      regPassword.length < 6 ||
                      regPassword !== regConfirmPassword ||
                      !regStudentInstitute
                    }
                    className="w-full bg-black text-white hover:bg-[#222] py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>
                      {!regStudentInstitute
                        ? "Please Select Your Institute"
                        : !verifiedClass
                        ? "Please Verify Teacher Class Code First"
                        : !classMatchStatus?.matches
                        ? "Cannot Join: Class Mismatch with Code"
                        : regPassword.length < 6
                        ? "Please Set a Password (min 6 chars)"
                        : regPassword !== regConfirmPassword
                        ? "Passwords Do Not Match"
                        : `Complete Registration & Access ${regStudentClass} Dashboard`}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* TEACHER PORTAL (Sign In & Sign Up with Institute Creation Capability) */
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
                /* Teacher Existing Sign In (Manual Credentials Entry) */
                <form onSubmit={handleTeacherLogin} className="max-w-md space-y-4">
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
                      placeholder="e.g. rajesh.varma@school.edu.in or teacher-1"
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

                  <div className="p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] text-[11px] text-[#6B7280]">
                    <span className="font-bold text-[#1A1A1A]">Demo Teacher Account:</span>{" "}
                    <code className="bg-white border border-[#E5E7EB] px-1 py-0.5 text-black font-mono">rajesh.varma@school.edu.in</code> &bull; Password: <code className="bg-white border border-[#E5E7EB] px-1 py-0.5 text-black font-mono">teacher123</code>
                  </div>

                  <div className="p-3.5 bg-[#F8F9FA] border border-[#E5E7EB] text-xs text-[#4B5563] space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-[#1A1A1A]">
                      <Users className="w-3.5 h-3.5 text-black" />
                      <span>Teacher Monitoring Capabilities</span>
                    </div>
                    <ul className="text-[11px] text-[#6B7280] space-y-1 list-disc pl-4">
                      <li>Monitor every student registered for your class codes in real time.</li>
                      <li>Review diagnostic flags and topic heatmaps across enrolled batches.</li>
                      <li>Generate AI-crafted NCERT remediation lesson plans for struggling concepts.</li>
                      <li>Register and add new educational institutes to the platform.</li>
                      <li>Create and distribute new batch class codes.</li>
                    </ul>
                  </div>

                  <button
                    id="btn-teacher-login-submit"
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-black text-white hover:bg-[#222] py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <span>Enter Teacher Classroom Radar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                /* TEACHER SIGN UP (With Institute Creation Capability) */
                <form onSubmit={handleTeacherRegister} className="space-y-6">
                  {/* Step 1: Teacher Identity & Account Credentials */}
                  <div className="bg-[#F8F9FA] border border-[#E5E7EB] p-4 sm:p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-black" />
                        <span>1. Teacher Credentials & Department *</span>
                      </label>
                      <span className="text-[10px] text-[#6B7280] font-medium">Step 1 of 3</span>
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
                          placeholder="e.g. Dr. Rajesh Varma or Ms. Priya Sen"
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
                        <label className="text-xs font-bold text-[#374151]">Department / Subject Faculty Lead</label>
                        <select
                          id="teacher-reg-department"
                          value={teacherRegDepartment}
                          onChange={(e) => setTeacherRegDepartment(e.target.value)}
                          className="w-full bg-white border border-[#E5E7EB] px-3 py-2 text-xs text-[#1A1A1A] outline-none focus:border-black"
                        >
                          <option value="Senior Physics & Science Lead">Senior Physics & Science Lead</option>
                          <option value="Secondary Mathematics Faculty">Secondary Mathematics Faculty</option>
                          <option value="Senior Chemistry Department Head">Senior Chemistry Department Head</option>
                          <option value="Biology & Life Sciences Lead">Biology & Life Sciences Lead</option>
                          <option value="Computer Science & Informatics">Computer Science & Informatics</option>
                          <option value="General Science & Mathematics Lead">General Science & Mathematics Lead</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Institute Management (Select Existing or Sign-up New Institute) */}
                  <div className="bg-white border-2 border-black p-4 sm:p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E7EB] pb-3">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
                          <Building className="w-4 h-4 text-black" />
                          <span>2. Institute Selection & Sign-Up *</span>
                        </label>
                        <p className="text-[11px] text-[#6B7280] mt-0.5">
                          Teachers have authority to select an existing institute or <strong>sign up a new institute</strong> if not in the database.
                        </p>
                      </div>

                      {/* Toggle Options: Existing vs New */}
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
                          <span>+ Register New Institute</span>
                        </button>
                      </div>
                    </div>

                    {teacherInstituteChoice === "existing" ? (
                      /* Select Existing Institute */
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
                              {inst.name} — ({inst.type || "School"} &bull; {inst.location || "India"})
                            </option>
                          ))}
                        </select>
                        <p className="text-[11px] text-[#6B7280]">
                          Can't find your institute in this list? Click the <strong>"+ Register New Institute"</strong> button above to add it!
                        </p>
                      </div>
                    ) : (
                      /* Register a New Institute into the Database */
                      <div className="bg-[#F8F9FA] border border-[#E5E7EB] p-4 space-y-3">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-[#1A1A1A]">
                          <Sparkles className="w-4 h-4 text-emerald-600" />
                          <span>Registering a New Institute to the Platform</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="sm:col-span-2 space-y-1">
                            <label className="text-[11px] font-bold text-[#374151]">
                              New Institute Name *
                            </label>
                            <input
                              id="teacher-new-institute-name"
                              type="text"
                              required
                              value={teacherNewInstituteName}
                              onChange={(e) => setTeacherNewInstituteName(e.target.value)}
                              placeholder="e.g. Kendriya Vidyalaya No. 2, Cantonment or Modern Public Academy"
                              className="w-full bg-white border border-[#E5E7EB] px-3 py-2 text-xs font-bold text-[#1A1A1A] outline-none focus:border-black"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-[#374151]">
                              Institute Category / Board
                            </label>
                            <select
                              id="teacher-new-institute-type"
                              value={teacherNewInstituteType}
                              onChange={(e) => setTeacherNewInstituteType(e.target.value)}
                              className="w-full bg-white border border-[#E5E7EB] px-3 py-2 text-xs text-[#1A1A1A] outline-none focus:border-black"
                            >
                              <option value="Government School (KVS/JNV)">Government School (KVS/JNV)</option>
                              <option value="State Govt Model Secondary School">State Govt Model Secondary School</option>
                              <option value="Private CBSE / ICSE School">Private CBSE / ICSE School</option>
                              <option value="Higher Secondary / Inter College">Higher Secondary / Inter College</option>
                              <option value="Coaching & Remedial Academy">Coaching & Remedial Academy</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-[#374151]">
                              City & State / Location
                            </label>
                            <input
                              id="teacher-new-institute-location"
                              type="text"
                              value={teacherNewInstituteLocation}
                              onChange={(e) => setTeacherNewInstituteLocation(e.target.value)}
                              placeholder="e.g. Bhopal, Madhya Pradesh"
                              className="w-full bg-white border border-[#E5E7EB] px-3 py-2 text-xs text-[#1A1A1A] outline-none focus:border-black"
                            />
                          </div>
                        </div>

                        <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <p>
                            <strong>Instant Global Availability:</strong> Once you complete sign up, this new institute will automatically appear in the student registration dropdown menu for all your students across the app!
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Step 3: Initial Class Code Generation */}
                  <div className="bg-[#F8F9FA] border border-[#E5E7EB] p-4 sm:p-5 space-y-4">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-black" />
                      <span>3. Initial Classroom Batch & Subject Stream</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-[#374151]">Target Grade Batch</label>
                        <select
                          id="teacher-initial-grade"
                          value={teacherInitialGrade}
                          onChange={(e) => setTeacherInitialGrade(e.target.value)}
                          className="w-full bg-white border border-[#E5E7EB] px-3 py-2 text-xs font-bold text-[#1A1A1A] outline-none focus:border-black"
                        >
                          <option value="Class 12">Class 12 (Senior Secondary)</option>
                          <option value="Class 11">Class 11 (Senior Secondary)</option>
                          <option value="Class 10">Class 10 (Secondary Standard)</option>
                          <option value="Class 9">Class 9 (Secondary Standard)</option>
                          <option value="Class 8">Class 8 (Middle School)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-[#374151]">Subject Stream</label>
                        <select
                          id="teacher-initial-stream"
                          value={teacherInitialStream}
                          onChange={(e) => setTeacherInitialStream(e.target.value)}
                          className="w-full bg-white border border-[#E5E7EB] px-3 py-2 text-xs font-bold text-[#1A1A1A] outline-none focus:border-black"
                        >
                          <option value="Science (PCM / PCB)">Science (Physics, Chem, Math, Bio)</option>
                          <option value="Mathematics & Applied Science">Mathematics & Applied Science</option>
                          <option value="General Science Core">General Science Core</option>
                        </select>
                      </div>
                    </div>

                    <div className="p-3 bg-white border border-[#E5E7EB] text-xs text-[#4B5563] space-y-1">
                      <div className="font-bold text-[#1A1A1A]">Automatic Class Code Provisioning</div>
                      <p className="text-[11px] text-[#6B7280]">
                        Your first batch class code will be auto-generated and linked to your institute upon completing registration. You can create additional class codes any time from your Teacher Dashboard.
                      </p>
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
                    className="w-full bg-black text-white hover:bg-[#222] py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>
                      {!teacherRegName.trim()
                        ? "Enter Teacher Name"
                        : teacherRegPassword.length < 6
                        ? "Password Must Be At Least 6 Characters"
                        : teacherRegPassword !== teacherRegConfirmPassword
                        ? "Passwords Do Not Match"
                        : teacherInstituteChoice === "new" && !teacherNewInstituteName.trim()
                        ? "Enter New Institute Name"
                        : "Complete Teacher Sign Up & Launch Classroom Radar"}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
