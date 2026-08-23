import mongoose from "mongoose";

const InstituteSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  type: { type: String, default: "General Institution" },
  tier: { type: String, default: "Secondary" },
  location: { type: String, default: "National / Global" },
  curriculum: { type: String, default: "National Standards Framework" },
  classesCount: { type: Number, default: 0 },
  teachersCount: { type: Number, default: 0 }
}, { timestamps: true });

const TeacherSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String },
  passwordHash: { type: String },
  role: { type: String, default: "teacher" },
  school: { type: String, default: "" },
  institute: { type: String, default: "" },
  instituteId: { type: String, default: "" },
  department: { type: String, default: "Academic Faculty" },
  curriculum: { type: String, default: "" },
  classes: [{ type: mongoose.Schema.Types.Mixed }],
  firstClassCode: { type: String, default: "" }
}, { timestamps: true, strict: false });

const StudentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String },
  passwordHash: { type: String },
  role: { type: String, default: "student" },
  gradeLevel: { type: String, default: "Grade 11-12" },
  stream: { type: String, default: "Science" },
  classCode: { type: String, index: true },
  school: { type: String, default: "" },
  institute: { type: String, default: "" },
  primaryLanguage: { type: String, default: "en" },
  category: { type: String, default: "General" },
  gender: { type: String, default: "Unspecified" },
  familyIncome: { type: String, default: "" },
  familyIncomeAnnual: { type: Number, default: 150000 },
  academicScorePercent: { type: Number, default: 75 },
  firstGenerationLearner: { type: Boolean, default: false },
  masteryList: [{
    topicId: { type: String, required: true },
    topicName: { type: String, required: true },
    subject: { type: String, required: true },
    gradeLevel: { type: String, default: "Grade 11-12" },
    masteryPercent: { type: Number, default: 50 },
    questionsAttempted: { type: Number, default: 0 },
    questionsCorrect: { type: Number, default: 0 },
    lastAttempted: { type: String, default: "" },
    recentPerformance: { type: String, default: "steady" }
  }],
  practiceStats: {
    totalQuestionsAttempted: { type: Number, default: 0 },
    totalCorrect: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    bestStreak: { type: Number, default: 0 },
    recentAccuracy: { type: Number, default: 0 }
  },
  recentStreak: { type: Number, default: 0 },
  flagged: { type: Boolean, default: false },
  flagReason: { type: String, default: "" },
  flagIntervention: { type: String, default: "" },
  severity: { type: String, default: "on_track" },
  primaryIssue: { type: String, default: "" },
  doubtHistory: [{
    id: { type: String, required: true },
    doubtQuery: { type: String, required: true },
    timestamp: { type: String, default: () => new Date().toISOString() },
    topicId: { type: String, default: "" },
    language: { type: String, default: "en" },
    responseSummary: { type: String, default: "" }
  }],
  practiceLogs: [{
    id: { type: String, required: true },
    topicId: { type: String, required: true },
    difficulty: { type: String, default: "Intermediate" },
    isCorrect: { type: Boolean, default: false },
    timestamp: { type: String, default: () => new Date().toISOString() },
    studentAnswerIndex: { type: Number, default: -1 }
  }],
  section: { type: String, default: "Section A" },
  pendingInvites: [{ type: String }],
  joinedClasses: [{
    classCode: { type: String },
    className: { type: String },
    section: { type: String },
    joinedAt: { type: String }
  }]
}, { timestamps: true, strict: false });

const ClassSchema = new mongoose.Schema({
  classCode: { type: String, required: true, unique: true, index: true },
  className: { type: String, required: true },
  gradeLevel: { type: String, default: "Class 10" },
  stream: { type: String, default: "General" },
  section: { type: String, default: "Section A" },
  availableSections: { type: [String], default: ["Section A", "Section B", "Section C", "Section D"] },
  teacherId: { type: String, index: true },
  teacherName: { type: String, default: "Teacher" },
  school: { type: String, default: "" },
  institute: { type: String, default: "" },
  studentsCount: { type: Number, default: 0 },
  enrolledStudents: [{
    studentId: { type: String },
    studentName: { type: String },
    studentEmail: { type: String },
    section: { type: String, default: "Section A" },
    joinedAt: { type: String }
  }],
  timetable: [{
    day: { type: String, required: true },
    periods: [{
      periodNumber: { type: Number },
      time: { type: String },
      subject: { type: String },
      topic: { type: String },
      teacher: { type: String },
      room: { type: String }
    }]
  }]
}, { timestamps: true, strict: false });

const ClassInviteSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  classCode: { type: String, required: true, index: true },
  className: { type: String, required: true },
  gradeLevel: { type: String, default: "Class 10" },
  section: { type: String, default: "Section A" },
  teacherId: { type: String, required: true, index: true },
  teacherName: { type: String, default: "Teacher" },
  school: { type: String, default: "" },
  studentEmail: { type: String, required: true, lowercase: true, index: true },
  studentName: { type: String, default: "" },
  status: { type: String, default: "pending", enum: ["pending", "accepted", "rejected"] },
  invitedAt: { type: String, default: () => new Date().toISOString() },
  acceptedAt: { type: String, default: "" }
}, { timestamps: true, strict: false });

const ClassAnnouncementSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  classCode: { type: String, required: true, index: true },
  section: { type: String, default: "all" },
  teacherId: { type: String, required: true },
  teacherName: { type: String, default: "Teacher" },
  title: { type: String, required: true },
  content: { type: String, required: true },
  priority: { type: String, default: "normal", enum: ["normal", "important", "urgent"] },
  attachments: [{ type: mongoose.Schema.Types.Mixed }],
  createdAt: { type: String, default: "Just now" }
}, { timestamps: true, strict: false });

const ClassroomResourceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  classCode: { type: String, required: true, index: true },
  title: { type: String, required: true },
  subject: { type: String, default: "General" },
  gradeLevel: { type: String, default: "Class 10" },
  chapter: { type: String, default: "" },
  keyConcepts: [{ type: String }],
  content: { type: String, default: "" },
  finalContent: { type: String, default: "" },
  mediaType: { type: String, default: "text" },
  mediaMeta: {
    fileName: String,
    fileSize: Number,
    mimeType: String,
    uploadedAt: String
  },
  fileData: { type: String, default: null },
  authorName: { type: String, default: "Faculty" },
  authorRole: { type: String, default: "teacher" },
  authorId: { type: String, default: "" },
  isVerified: { type: Boolean, default: false },
  verifiedBy: { type: String, default: "" },
  verifiedAt: { type: String, default: "" }
}, { timestamps: true, strict: false });

const ResourceDumpSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  subject: { type: String, default: "General" },
  gradeLevel: { type: String, default: "Class 10" },
  chapter: { type: String, default: "" },
  tags: [{ type: String }],
  content: { type: String, default: "" },
  finalContent: { type: String, default: "" },
  mediaType: { type: String, default: "text" },
  mediaMeta: {
    fileName: String,
    fileSize: Number,
    mimeType: String,
    uploadedAt: String
  },
  fileData: { type: String, default: null },
  authorName: { type: String, default: "Scholar" },
  authorRole: { type: String, default: "student" },
  authorId: { type: String, default: "" },
  instituteName: { type: String, default: "Open School Education Network" },
  isVerified: { type: Boolean, default: false },
  verifiedBy: { type: String, default: "" },
  verifiedAt: { type: String, default: "" }
}, { timestamps: true, strict: false });

const CommunityPostSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  instituteName: { type: String, required: true, index: true },
  classCode: { type: String, default: "", index: true },
  section: { type: String, default: "all" },
  title: { type: String, required: true },
  content: { type: String, required: true },
  subject: { type: String, default: "General" },
  gradeLevel: { type: String, default: "Class 10" },
  authorName: { type: String, default: "Scholar" },
  authorRole: { type: String, default: "student" },
  authorId: { type: String, default: "" },
  tags: [{ type: String }],
  upvotes: { type: Number, default: 0 },
  upvotedBy: [{ type: String }],
  createdAt: { type: String, default: "Just now" },
  answers: [{
    id: { type: String, required: true },
    authorName: { type: String, default: "Scholar" },
    authorRole: { type: String, default: "student" },
    authorId: { type: String, default: "" },
    content: { type: String, required: true },
    upvotes: { type: Number, default: 0 },
    upvotedBy: [{ type: String }],
    isVerified: { type: Boolean, default: false },
    isTeacherVerified: { type: Boolean, default: false },
    createdAt: { type: String, default: "Just now" }
  }]
}, { timestamps: true, strict: false });

const AiChatHistorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: true, index: true },
  title: { type: String, default: "New Doubt Session" },
  subject: { type: String, default: "General Science" },
  language: { type: String, default: "en" },
  gradeLevel: { type: String, default: "Class 10" },
  summary: { type: String, default: "" },
  messages: [{
    id: { type: String },
    role: { type: String, required: true }, // "user" | "model"
    content: { type: String, required: true },
    timestamp: { type: String },
    ladderLevel: { type: Number, default: 0 },
    ladderLabel: { type: String, default: "" },
    groundingSource: { type: String, default: "" },
    isCurriculumGrounded: { type: Boolean, default: true },
    confidenceScore: { type: Number, default: 95 }
  }],
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true, strict: false });

const DirectMessageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  senderId: { type: String, required: true, index: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, required: true, enum: ["student", "teacher"] },
  recipientId: { type: String, required: true, index: true },
  recipientName: { type: String, required: true },
  recipientRole: { type: String, required: true, enum: ["student", "teacher"] },
  classCode: { type: String, default: "" },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true, strict: false });

const MentalHealthChatSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  studentId: { type: String, required: true, index: true },
  studentName: { type: String, required: true },
  studentEmail: { type: String, default: "" },
  counselorId: { type: String, default: "counselor-1" },
  counselorName: { type: String, default: "Dr. Shalini (Clinical Counselor)" },
  mode: { type: String, default: "human", enum: ["ai", "human"] },
  topic: { type: String, default: "General Academic Well-being & Stress" },
  messages: [{
    id: { type: String, required: true },
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    senderRole: { type: String, required: true, enum: ["student", "counselor", "ai"] },
    text: { type: String, required: true },
    timestamp: { type: String, default: () => new Date().toISOString() }
  }],
  status: { type: String, default: "active", enum: ["active", "resolved"] },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true, strict: false });

const NotificationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, default: "verification", enum: ["verification", "message", "announcement", "achievement"] },
  resourceId: { type: String, default: "" },
  resourceTitle: { type: String, default: "" },
  verifiedBy: { type: String, default: "" },
  isRead: { type: Boolean, default: false },
  createdAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true, strict: false });

export const Institute = mongoose.models.Institute || mongoose.model("Institute", InstituteSchema);
export const Teacher = mongoose.models.Teacher || mongoose.model("Teacher", TeacherSchema);
export const Student = mongoose.models.Student || mongoose.model("Student", StudentSchema);
export const ClassModel = mongoose.models.Class || mongoose.model("Class", ClassSchema);
export const ClassInvite = mongoose.models.ClassInvite || mongoose.model("ClassInvite", ClassInviteSchema);
export const ClassAnnouncement = mongoose.models.ClassAnnouncement || mongoose.model("ClassAnnouncement", ClassAnnouncementSchema);
export const ClassroomResource = mongoose.models.ClassroomResource || mongoose.model("ClassroomResource", ClassroomResourceSchema);
export const ResourceDump = mongoose.models.ResourceDump || mongoose.model("ResourceDump", ResourceDumpSchema);
export const CommunityPost = mongoose.models.CommunityPost || mongoose.model("CommunityPost", CommunityPostSchema);
export const AiChatHistory = mongoose.models.AiChatHistory || mongoose.model("AiChatHistory", AiChatHistorySchema);
export const DirectMessage = mongoose.models.DirectMessage || mongoose.model("DirectMessage", DirectMessageSchema);
export const MentalHealthChat = mongoose.models.MentalHealthChat || mongoose.model("MentalHealthChat", MentalHealthChatSchema);
export const Notification = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
