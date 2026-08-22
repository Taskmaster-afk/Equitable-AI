export type GradeLevel = 'Grade 6-8' | 'Grade 9-10' | 'Grade 11-12';

export type LanguageCode = 'en' | 'hi' | 'es' | 'mr' | 'bn' | 'ta' | 'te' | 'gu';

export type UserRole = 'teacher' | 'student';

export interface TimetablePeriod {
  periodNumber: number;
  time: string;
  subject: string;
  topic: string;
  teacher: string;
  room: string;
}

export interface DayTimetable {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  periods: TimetablePeriod[];
}

export interface SyllabusUnit {
  unitNumber: number;
  unitTitle: string;
  subject: string;
  chapters: string[];
  weightageMarks: number;
  totalPeriods: number;
  status: 'Completed' | 'In Progress' | 'Upcoming';
}

export interface ClassroomInfo {
  classCode: string;
  className: string;
  targetClass?: string; // e.g. "Class 12", "Class 11", "Class 10", "Class 9", "Class 8"
  gradeLevel: GradeLevel;
  stream: string; // e.g. "Science (PCM/PCB)", "General"
  curriculum: string;
  school: string;
  teacherId: string;
  teacherName: string;
  academicYear: string;
  subjects: string[];
  timetable: DayTimetable[];
  syllabus: SyllabusUnit[];
  enrolledStudentIds: string[];
  enrolledCount: number;
}

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
}

export interface OerCitation {
  id: string;
  sourceName: string; // e.g. "NCERT Class 12 Mathematics"
  publisher: 'NCERT' | 'State Board Open Curriculum';
  chapter: string; // e.g. "Chapter 7: Integrals"
  section: string; // e.g. "Section 7.4 - Integration by Parts"
  pageOrRef: string; // e.g. "Pages 305-318"
  license: string; // e.g. "CC BY-NC-SA 4.0 / NCERT Open National Curriculum"
  verifiableUrl?: string;
  excerptSnippet: string;
  relevanceScore: number;
}

export interface GroundedDoubtMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  gradeLevel?: GradeLevel;
  language?: LanguageCode;
  explanationStyle?: 'step-by-step' | 'simple-analogy' | 'prerequisite-basics' | 'visual-diagram';
  imageAttachment?: string; // base64 or preview url
  citations?: OerCitation[];
  groundingStatus: 'verified_grounded' | 'partially_grounded' | 'unsupported_in_corpus';
  groundingReasoning?: string;
  suggestedFollowUps?: string[];
  followUpTrigger?: string;
}

export interface TopicMastery {
  topicId: string;
  topicName: string;
  subject: string;
  gradeLevel: GradeLevel;
  masteryPercentage: number; // 0 to 100
  recentStreak: number; // e.g. +2, -2
  weakConcepts: string[];
  attemptsCount: number;
  lastAttemptedAt: string;
}

export interface PracticeQuestion {
  id: string;
  topicId: string;
  topicName: string;
  subject: string;
  difficulty: 'Foundational' | 'Intermediate' | 'Advanced';
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  prerequisiteHint?: string;
  groundedCitation: OerCitation;
  isStepDownPrerequisite?: boolean;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'student';
  classCode: string;
  studentClass?: string; // e.g. "Class 12", "Class 11", "Class 10", "Class 9", "Class 8"
  classInfo?: ClassroomInfo;
  gradeLevel: GradeLevel;
  primaryLanguage: LanguageCode;
  avatarSeed: string;
  familyIncomeBracket: string; // e.g. "< 1.5 Lakhs/yr", "1.5 - 3.0 Lakhs/yr"
  category: 'General' | 'OBC' | 'SC' | 'ST' | 'EWS' | 'Minority';
  gender: 'Female' | 'Male' | 'Other' | 'Prefer not to say';
  academicScorePercent: number;
  stateOrRegion: string;
  firstGenerationLearner: boolean;
  totalDoubtsAsked: number;
  totalPracticeCompleted: number;
  avgPracticeScore: number;
  lastActive: string;
  masteryList: TopicMastery[];
}

export interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  role: 'teacher';
  department: string;
  school: string;
  classes: ClassroomInfo[];
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  classCode?: string;
  studentProfile?: StudentProfile;
  teacherProfile?: TeacherProfile;
}

export interface TeacherStudentFlag {
  studentId: string;
  studentName: string;
  gradeLevel: GradeLevel;
  severity: 'high_priority' | 'medium_attention' | 'on_track';
  primaryIssue: string;
  plainLanguageReason: string;
  weakTopics: string[];
  doubtCountLast7Days: number;
  practiceAccuracyRate: number; // percentage
  suggestedIntervention: string;
  lastActive: string;
}

export interface TopicHeatmapItem {
  topicId: string;
  topicName: string;
  subject: string;
  classAverageMastery: number; // 0 to 100
  strugglingStudentsCount: number;
  totalStudents: number;
  recommendedFocus: 'Immediate Review Required' | 'Reinforce Core Concepts' | 'Mastered Well';
  prerequisiteTopic?: string;
}

export interface ScholarshipScheme {
  id: string;
  title: string;
  provider: string; // e.g. "Ministry of Education / National Scholarship Portal"
  providerType: 'Government' | 'NGO' | 'Philanthropic Trust';
  amountOrBenefit: string; // e.g. "₹12,000 / year + Tuition waiver"
  deadline: string;
  minAcademicScore?: number;
  maxFamilyIncomeAnnual?: number; // In INR or standard currency equivalent
  maxFamilyIncomeLabel: string;
  eligibleGrades: GradeLevel[];
  eligibleCategories: string[];
  eligibleGenders: string[];
  firstGenLearnerOnly?: boolean;
  stateSpecific?: string[]; // empty means all states / national
  officialPortalUrl: string;
  requiredDocuments: string[];
  description: string;
  selectionCriteria: string;
}

export interface ScholarshipMatchResult {
  scheme: ScholarshipScheme;
  isEligible: boolean;
  matchScore: number; // 0 to 100
  matchedCriteria: string[];
  unmetCriteria: string[];
  plainLanguageReasoning: string;
}

export interface OerCorpusDoc {
  id: string;
  title: string;
  publisher: 'NCERT' | 'State Board Open Curriculum';
  subject: string;
  gradeLevel: GradeLevel;
  chapter: string;
  section: string;
  pageOrRef: string;
  license: string;
  content: string;
  keyConcepts: string[];
  summary: string;
}
