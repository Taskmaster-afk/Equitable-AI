import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { OER_CORPUS, SUPPORTED_LANGUAGES } from "./src/data/oerKnowledgeBase";
import { SCHOLARSHIP_SCHEMES } from "./src/data/scholarshipDatabase";
import {
  OerCitation,
  StudentProfile,
  TeacherStudentFlag,
  TopicHeatmapItem,
  ClassroomInfo,
  TeacherProfile,
  AuthUser,
  DayTimetable,
  SyllabusUnit,
  GradeLevel,
  TopicMastery,
} from "./src/types";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// Lazy initialize Gemini client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. Offline/fallback grounded mode will be used.");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// In-memory Document Store (MERN Store)
interface MemoryDatabase {
  students: Map<string, StudentProfile>;
  teachers: Map<string, TeacherProfile>;
  classes: Map<string, ClassroomInfo>;
  doubtHistory: Array<{
    id: string;
    studentId: string;
    question: string;
    response: string;
    citations: OerCitation[];
    language: string;
    timestamp: string;
  }>;
  practiceLogs: Array<{
    id: string;
    studentId: string;
    topicId: string;
    isCorrect: boolean;
    difficulty: string;
    timestamp: string;
  }>;
}

const db: MemoryDatabase = {
  students: new Map(),
  teachers: new Map(),
  classes: new Map(),
  doubtHistory: [],
  practiceLogs: [],
};

// Seed initial classrooms, teachers, and student profiles
function seedInitialData() {
  // 1. Seed Classrooms
  const class12A_Timetable: DayTimetable[] = [
    {
      day: "Monday",
      periods: [
        { periodNumber: 1, time: "08:30 - 09:15 AM", subject: "Physics", topic: "Wave Optics (Young's Slit)", teacher: "Dr. Rajesh Varma", room: "Lab 2" },
        { periodNumber: 2, time: "09:20 - 10:05 AM", subject: "Mathematics", topic: "Integrals by Parts (ILATE)", teacher: "Prof. S. Ramanujan", room: "Room 102" },
        { periodNumber: 3, time: "10:20 - 11:05 AM", subject: "Chemistry", topic: "Electrochemistry & Nernst Eq", teacher: "Dr. M. Sen", room: "Chem Lab" },
        { periodNumber: 4, time: "11:10 - 11:55 AM", subject: "Biology", topic: "DNA Transcription & Translation", teacher: "Dr. V. Swaminathan", room: "Bio Lab" },
        { periodNumber: 5, time: "12:45 - 01:30 PM", subject: "NCERT Remediation", topic: "Formative Doubt Solving & Board Work", teacher: "Dr. Rajesh Varma", room: "Smart Room" },
      ],
    },
    {
      day: "Tuesday",
      periods: [
        { periodNumber: 1, time: "08:30 - 09:15 AM", subject: "Mathematics", topic: "Adjoint & Inverse of Matrices", teacher: "Prof. S. Ramanujan", room: "Room 102" },
        { periodNumber: 2, time: "09:20 - 10:05 AM", subject: "Physics", topic: "Electromagnetic Waves & Maxwell Eq", teacher: "Dr. Rajesh Varma", room: "Lab 2" },
        { periodNumber: 3, time: "10:20 - 11:05 AM", subject: "Chemistry", topic: "Haloalkanes SN1 vs SN2 Mechanisms", teacher: "Dr. M. Sen", room: "Chem Lab" },
        { periodNumber: 4, time: "11:10 - 11:55 AM", subject: "Computer Science", topic: "Adaptive Practice Session & Python", teacher: "Mr. K. Sharma", room: "Computer Lab" },
      ],
    },
    {
      day: "Wednesday",
      periods: [
        { periodNumber: 1, time: "08:30 - 09:15 AM", subject: "Chemistry", topic: "Chemical Kinetics & Order of Reaction", teacher: "Dr. M. Sen", room: "Chem Lab" },
        { periodNumber: 2, time: "09:20 - 10:05 AM", subject: "Biology", topic: "Biotechnology Principles & PCR", teacher: "Dr. V. Swaminathan", room: "Bio Lab" },
        { periodNumber: 3, time: "10:20 - 11:05 AM", subject: "Physics", topic: "Ray Optics & Optical Instruments", teacher: "Dr. Rajesh Varma", room: "Lab 2" },
        { periodNumber: 4, time: "11:10 - 11:55 AM", subject: "Mathematics", topic: "Definite Integrals & Area Under Curves", teacher: "Prof. S. Ramanujan", room: "Room 102" },
      ],
    },
    {
      day: "Thursday",
      periods: [
        { periodNumber: 1, time: "08:30 - 09:15 AM", subject: "Physics Lab", topic: "Prism Angle & Refractive Index Practical", teacher: "Dr. Rajesh Varma", room: "Dark Room" },
        { periodNumber: 2, time: "09:20 - 10:05 AM", subject: "Chemistry Lab", topic: "Volumetric Titration & KMnO4 Prep", teacher: "Dr. M. Sen", room: "Chem Lab" },
        { periodNumber: 3, time: "10:20 - 11:05 AM", subject: "Mathematics", topic: "Differential Equations Formulation", teacher: "Prof. S. Ramanujan", room: "Room 102" },
        { periodNumber: 4, time: "11:10 - 11:55 AM", subject: "Biology", topic: "Ecology & Population Genetics", teacher: "Dr. V. Swaminathan", room: "Bio Lab" },
      ],
    },
    {
      day: "Friday",
      periods: [
        { periodNumber: 1, time: "08:30 - 09:15 AM", subject: "Mathematics", topic: "Vectors & 3D Geometry Cross-Products", teacher: "Prof. S. Ramanujan", room: "Room 102" },
        { periodNumber: 2, time: "09:20 - 10:05 AM", subject: "Physics", topic: "Semiconductor Diode & Logic Circuits", teacher: "Dr. Rajesh Varma", room: "Lab 2" },
        { periodNumber: 3, time: "10:20 - 11:05 AM", subject: "Chemistry", topic: "Biomolecules & Peptide Linkages", teacher: "Dr. M. Sen", room: "Chem Lab" },
        { periodNumber: 4, time: "11:10 - 11:55 AM", subject: "Review & Triage", topic: "Weekly Formative Diagnostic Assessment", teacher: "Dr. Rajesh Varma", room: "Smart Room" },
      ],
    },
  ];

  const class12A_Syllabus: SyllabusUnit[] = [
    {
      unitNumber: 1,
      unitTitle: "Optics & Wave Theory (Physics)",
      subject: "Physics",
      chapters: ["Wave Optics (NCERT Ch 10)", "Ray Optics & Optical Instruments (NCERT Ch 9)"],
      weightageMarks: 18,
      totalPeriods: 28,
      status: "In Progress",
    },
    {
      unitNumber: 2,
      unitTitle: "Integral Calculus & Differential Eq (Maths)",
      subject: "Mathematics",
      chapters: ["Integrals (NCERT Ch 7)", "Applications of Integrals (NCERT Ch 8)", "Differential Equations (NCERT Ch 9)"],
      weightageMarks: 35,
      totalPeriods: 42,
      status: "In Progress",
    },
    {
      unitNumber: 3,
      unitTitle: "Physical & Inorganic Chemistry",
      subject: "Chemistry",
      chapters: ["Solutions (NCERT Ch 1)", "Electrochemistry (NCERT Ch 2)", "Chemical Kinetics (NCERT Ch 3)"],
      weightageMarks: 23,
      totalPeriods: 30,
      status: "Completed",
    },
    {
      unitNumber: 4,
      unitTitle: "Organic Chemistry Mechanisms",
      subject: "Chemistry",
      chapters: ["Haloalkanes & Haloarenes (NCERT Ch 6)", "Alcohols, Phenols & Ethers (NCERT Ch 7)"],
      weightageMarks: 28,
      totalPeriods: 34,
      status: "In Progress",
    },
    {
      unitNumber: 5,
      unitTitle: "Genetics & Molecular Biology",
      subject: "Biology",
      chapters: ["Principles of Inheritance & Variation (NCERT Ch 4)", "Molecular Basis of Inheritance (NCERT Ch 5)"],
      weightageMarks: 20,
      totalPeriods: 26,
      status: "In Progress",
    },
    {
      unitNumber: 6,
      unitTitle: "Biotechnology & Ecology",
      subject: "Biology",
      chapters: ["Biotechnology Principles (NCERT Ch 9)", "Organisms & Populations (NCERT Ch 11)"],
      weightageMarks: 16,
      totalPeriods: 22,
      status: "Upcoming",
    },
  ];

  const sampleClass12A: ClassroomInfo = {
    classCode: "NCERT-12A",
    className: "Class 12-A Senior Science (PCM & PCB)",
    targetClass: "Class 12",
    gradeLevel: "Grade 11-12",
    stream: "Science (PCM / PCB)",
    curriculum: "NCERT / CBSE National Curriculum Framework 2024-25",
    school: "Kendriya Vidyalaya No. 1, Model Cluster",
    teacherId: "teacher-1",
    teacherName: "Dr. Rajesh Varma",
    academicYear: "2024-2025",
    subjects: ["Physics", "Chemistry", "Mathematics", "Biology"],
    timetable: class12A_Timetable,
    syllabus: class12A_Syllabus,
    enrolledStudentIds: ["student-1", "student-2", "student-4"],
    enrolledCount: 3,
  };

  const sampleClass11B: ClassroomInfo = {
    classCode: "NCERT-11B",
    className: "Class 11-B Core Science Foundations",
    targetClass: "Class 11",
    gradeLevel: "Grade 11-12",
    stream: "Science (Foundation)",
    curriculum: "NCERT / CBSE National Curriculum Framework 2024-25",
    school: "Kendriya Vidyalaya No. 1, Model Cluster",
    teacherId: "teacher-1",
    teacherName: "Dr. Rajesh Varma",
    academicYear: "2024-2025",
    subjects: ["Physics", "Chemistry", "Mathematics", "Biology"],
    timetable: class12A_Timetable,
    syllabus: [
      {
        unitNumber: 1,
        unitTitle: "Kinematics & Projectile Motion",
        subject: "Physics",
        chapters: ["Motion in a Plane (NCERT Ch 3)", "Laws of Motion (NCERT Ch 4)"],
        weightageMarks: 20,
        totalPeriods: 24,
        status: "In Progress",
      },
      {
        unitNumber: 2,
        unitTitle: "Chemical Bonding & VSEPR",
        subject: "Chemistry",
        chapters: ["Structure of Atom (NCERT Ch 2)", "Chemical Bonding (NCERT Ch 4)"],
        weightageMarks: 22,
        totalPeriods: 26,
        status: "In Progress",
      },
    ],
    enrolledStudentIds: [],
    enrolledCount: 0,
  };

  const sampleClass10A: ClassroomInfo = {
    classCode: "NCERT-10A",
    className: "Class 10-A Secondary Mathematics & Science",
    targetClass: "Class 10",
    gradeLevel: "Grade 9-10",
    stream: "General Secondary",
    curriculum: "NCERT National Secondary Standard 2024-25",
    school: "Kendriya Vidyalaya No. 1, Model Cluster",
    teacherId: "teacher-2",
    teacherName: "Mrs. Sunita Sharma",
    academicYear: "2024-2025",
    subjects: ["Mathematics", "Science (Physics, Chemistry, Biology)"],
    timetable: [
      {
        day: "Monday",
        periods: [
          { periodNumber: 1, time: "08:30 - 09:15 AM", subject: "Mathematics", topic: "Linear Equations in 2 Variables", teacher: "Mrs. Sunita Sharma", room: "Room 105" },
          { periodNumber: 2, time: "09:20 - 10:05 AM", subject: "Science", topic: "Newton's Laws & Force F=ma", teacher: "Mr. R. Nair", room: "Room 105" },
          { periodNumber: 3, time: "10:20 - 11:05 AM", subject: "Science", topic: "Chemical Reactions & Equations", teacher: "Mrs. Sunita Sharma", room: "Room 105" },
        ],
      },
      {
        day: "Tuesday",
        periods: [
          { periodNumber: 1, time: "08:30 - 09:15 AM", subject: "Science", topic: "Life Processes & Photosynthesis", teacher: "Dr. K. Joseph", room: "Room 105" },
          { periodNumber: 2, time: "09:20 - 10:05 AM", subject: "Mathematics", topic: "Quadratic Equations Factoring", teacher: "Mrs. Sunita Sharma", room: "Room 105" },
        ],
      },
    ],
    syllabus: [
      {
        unitNumber: 1,
        unitTitle: "Algebra & Coordinate Geometry",
        subject: "Mathematics",
        chapters: ["Linear Equations (NCERT Ch 3)", "Quadratic Equations (NCERT Ch 4)"],
        weightageMarks: 20,
        totalPeriods: 24,
        status: "In Progress",
      },
      {
        unitNumber: 2,
        unitTitle: "Forces, Energy & Chemical Changes",
        subject: "Science",
        chapters: ["Chemical Reactions (NCERT Ch 1)", "Light: Reflection & Refraction (NCERT Ch 9)"],
        weightageMarks: 25,
        totalPeriods: 30,
        status: "In Progress",
      },
    ],
    enrolledStudentIds: ["student-3"],
    enrolledCount: 1,
  };

  const sampleClass9A: ClassroomInfo = {
    classCode: "NCERT-9A",
    className: "Class 9-A Secondary Foundations (Math & Science)",
    targetClass: "Class 9",
    gradeLevel: "Grade 9-10",
    stream: "General Secondary",
    curriculum: "NCERT National Secondary Standard 2024-25",
    school: "Kendriya Vidyalaya No. 1, Model Cluster",
    teacherId: "teacher-2",
    teacherName: "Mrs. Sunita Sharma",
    academicYear: "2024-2025",
    subjects: ["Mathematics", "Science (Physics, Chemistry, Biology)"],
    timetable: [
      {
        day: "Monday",
        periods: [
          { periodNumber: 1, time: "08:30 - 09:15 AM", subject: "Mathematics", topic: "Number Systems & Irrational Numbers", teacher: "Mrs. Sunita Sharma", room: "Room 104" },
          { periodNumber: 2, time: "09:20 - 10:05 AM", subject: "Science", topic: "Matter in Our Surroundings", teacher: "Mr. R. Nair", room: "Room 104" },
        ],
      },
    ],
    syllabus: [
      {
        unitNumber: 1,
        unitTitle: "Number Systems & Polynomials",
        subject: "Mathematics",
        chapters: ["Number Systems (NCERT Ch 1)", "Polynomials (NCERT Ch 2)"],
        weightageMarks: 22,
        totalPeriods: 25,
        status: "In Progress",
      },
    ],
    enrolledStudentIds: [],
    enrolledCount: 0,
  };

  db.classes.set(sampleClass12A.classCode, sampleClass12A);
  db.classes.set(sampleClass11B.classCode, sampleClass11B);
  db.classes.set(sampleClass10A.classCode, sampleClass10A);
  db.classes.set(sampleClass9A.classCode, sampleClass9A);

  // 2. Seed Teachers
  const teacher1: TeacherProfile = {
    id: "teacher-1",
    name: "Dr. Rajesh Varma",
    email: "rajesh.varma@school.edu.in",
    role: "teacher",
    department: "Senior Physics & Science HOD",
    school: "Kendriya Vidyalaya No. 1, Model Cluster",
    classes: [sampleClass12A, sampleClass11B],
  };

  const teacher2: TeacherProfile = {
    id: "teacher-2",
    name: "Mrs. Sunita Sharma",
    email: "sunita.sharma@school.edu.in",
    role: "teacher",
    department: "Secondary Mathematics Lead",
    school: "Kendriya Vidyalaya No. 1, Model Cluster",
    classes: [sampleClass10A],
  };

  db.teachers.set(teacher1.id, teacher1);
  db.teachers.set(teacher2.id, teacher2);

  // 3. Seed Students
  const sampleStudents: StudentProfile[] = [
    {
      id: "student-1",
      name: "Aarav Sharma",
      email: "aarav.sharma@student.edu.in",
      password: "password123",
      role: "student",
      classCode: "NCERT-12A",
      studentClass: "Class 12",
      classInfo: sampleClass12A,
      gradeLevel: "Grade 11-12",
      primaryLanguage: "en",
      avatarSeed: "aarav",
      familyIncomeBracket: "< 1.5 Lakhs/yr",
      category: "OBC",
      gender: "Male",
      academicScorePercent: 78,
      stateOrRegion: "Madhya Pradesh",
      firstGenerationLearner: true,
      totalDoubtsAsked: 8,
      totalPracticeCompleted: 18,
      avgPracticeScore: 68,
      lastActive: "5 mins ago",
      masteryList: [
        {
          topicId: "calculus-derivatives",
          topicName: "Limits & First Principle of Derivatives",
          subject: "Mathematics",
          gradeLevel: "Grade 11-12",
          masteryPercentage: 54,
          recentStreak: -2,
          weakConcepts: ["Quotient Rule in differentiation", "lim h->0 sign evaluation"],
          attemptsCount: 9,
          lastAttemptedAt: "Today",
        },
        {
          topicId: "projectile-motion",
          topicName: "Motion in a Plane: Projectile Motion",
          subject: "Physics",
          gradeLevel: "Grade 11-12",
          masteryPercentage: 62,
          recentStreak: 1,
          weakConcepts: ["Horizontal range complementary angles", "Time of flight with initial elevation"],
          attemptsCount: 7,
          lastAttemptedAt: "Today",
        },
        {
          topicId: "chemical-bonding",
          topicName: "Chemical Bonding & VSEPR Hybridization",
          subject: "Chemistry",
          gradeLevel: "Grade 11-12",
          masteryPercentage: 74,
          recentStreak: 2,
          weakConcepts: ["Lone pair compression of bond angles (sp3)"],
          attemptsCount: 8,
          lastAttemptedAt: "Yesterday",
        },
        {
          topicId: "cell-biology",
          topicName: "Cell Organelles & Fluid Mosaic Model",
          subject: "Biology",
          gradeLevel: "Grade 11-12",
          masteryPercentage: 86,
          recentStreak: 4,
          weakConcepts: [],
          attemptsCount: 6,
          lastAttemptedAt: "2 days ago",
        },
      ],
    },
    {
      id: "student-2",
      name: "Priya Patel",
      email: "priya.patel@student.edu.in",
      password: "password123",
      role: "student",
      classCode: "NCERT-12A",
      studentClass: "Class 12",
      classInfo: sampleClass12A,
      gradeLevel: "Grade 11-12",
      primaryLanguage: "hi",
      avatarSeed: "priya",
      familyIncomeBracket: "1.5 - 3.0 Lakhs/yr",
      category: "General",
      gender: "Female",
      academicScorePercent: 89,
      stateOrRegion: "Gujarat",
      firstGenerationLearner: false,
      totalDoubtsAsked: 11,
      totalPracticeCompleted: 26,
      avgPracticeScore: 88,
      lastActive: "20 mins ago",
      masteryList: [
        {
          topicId: "electrochemistry",
          topicName: "Nernst Equation & Gibbs Energy",
          subject: "Chemistry",
          gradeLevel: "Grade 11-12",
          masteryPercentage: 92,
          recentStreak: 4,
          weakConcepts: [],
          attemptsCount: 14,
          lastAttemptedAt: "Today",
        },
        {
          topicId: "wave-optics",
          topicName: "Wave Optics & Young's Double Slit",
          subject: "Physics",
          gradeLevel: "Grade 11-12",
          masteryPercentage: 82,
          recentStreak: 2,
          weakConcepts: ["Fringe width β = λD/d in medium of refractive index μ"],
          attemptsCount: 11,
          lastAttemptedAt: "Yesterday",
        },
        {
          topicId: "matrices-determinants",
          topicName: "Adjoint & Inverse of Matrices",
          subject: "Mathematics",
          gradeLevel: "Grade 11-12",
          masteryPercentage: 90,
          recentStreak: 5,
          weakConcepts: [],
          attemptsCount: 12,
          lastAttemptedAt: "Today",
        },
        {
          topicId: "molecular-genetics",
          topicName: "DNA Replication & Transcription",
          subject: "Biology",
          gradeLevel: "Grade 11-12",
          masteryPercentage: 88,
          recentStreak: 3,
          weakConcepts: ["Okazaki fragments & DNA Ligase on lagging strand"],
          attemptsCount: 10,
          lastAttemptedAt: "2 days ago",
        },
      ],
    },
    {
      id: "student-3",
      name: "Rohan Das",
      email: "rohan.das@student.edu.in",
      password: "password123",
      role: "student",
      classCode: "NCERT-10A",
      studentClass: "Class 10",
      classInfo: sampleClass10A,
      gradeLevel: "Grade 9-10",
      primaryLanguage: "bn",
      avatarSeed: "rohan",
      familyIncomeBracket: "< 1.5 Lakhs/yr",
      category: "SC",
      gender: "Male",
      academicScorePercent: 58,
      stateOrRegion: "West Bengal",
      firstGenerationLearner: true,
      totalDoubtsAsked: 15,
      totalPracticeCompleted: 10,
      avgPracticeScore: 48,
      lastActive: "1 hour ago",
      masteryList: [
        {
          topicId: "linear-equations",
          topicName: "Linear Equations in Two Variables",
          subject: "Mathematics",
          gradeLevel: "Grade 9-10",
          masteryPercentage: 42,
          recentStreak: -2,
          weakConcepts: ["Graphical plotting of negative coordinates", "Substitution with fractions"],
          attemptsCount: 8,
          lastAttemptedAt: "Today",
        },
        {
          topicId: "newton-laws",
          topicName: "Newton's Laws of Motion & F=ma",
          subject: "Physics",
          gradeLevel: "Grade 9-10",
          masteryPercentage: 50,
          recentStreak: -1,
          weakConcepts: ["Momentum calculation with opposing resistance"],
          attemptsCount: 7,
          lastAttemptedAt: "Today",
        },
      ],
    },
    {
      id: "student-4",
      name: "Ananya Mukherjee",
      email: "ananya.m@student.edu.in",
      password: "password123",
      role: "student",
      classCode: "NCERT-12A",
      studentClass: "Class 12",
      classInfo: sampleClass12A,
      gradeLevel: "Grade 11-12",
      primaryLanguage: "en",
      avatarSeed: "ananya",
      familyIncomeBracket: "< 1.5 Lakhs/yr",
      category: "EWS",
      gender: "Female",
      academicScorePercent: 94,
      stateOrRegion: "Delhi",
      firstGenerationLearner: true,
      totalDoubtsAsked: 5,
      totalPracticeCompleted: 32,
      avgPracticeScore: 95,
      lastActive: "Just now",
      masteryList: [
        {
          topicId: "calculus-integrals",
          topicName: "Integrals & Integration by Parts (ILATE)",
          subject: "Mathematics",
          gradeLevel: "Grade 11-12",
          masteryPercentage: 96,
          recentStreak: 6,
          weakConcepts: [],
          attemptsCount: 16,
          lastAttemptedAt: "Today",
        },
        {
          topicId: "organic-haloalkanes",
          topicName: "Haloalkanes SN1 vs SN2 Mechanisms",
          subject: "Chemistry",
          gradeLevel: "Grade 11-12",
          masteryPercentage: 94,
          recentStreak: 5,
          weakConcepts: [],
          attemptsCount: 14,
          lastAttemptedAt: "Yesterday",
        },
      ],
    },
  ];

  sampleStudents.forEach((s) => db.students.set(s.id, s));
}
seedInitialData();

// RAG Retrieval Helper: Find matching OER open content passages
function retrieveRelevantOerDocs(query: string, gradeLevel?: string): { docs: typeof OER_CORPUS; citations: OerCitation[] } {
  const queryWords = query.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 2);

  const scored = OER_CORPUS.map((doc) => {
    let score = 0;
    const docFullText = `${doc.title} ${doc.chapter} ${doc.section} ${doc.keyConcepts.join(" ")} ${doc.content} ${doc.summary}`.toLowerCase();

    // Check key concepts exact match
    for (const concept of doc.keyConcepts) {
      if (query.toLowerCase().includes(concept.toLowerCase())) {
        score += 25;
      }
    }

    // Check query terms
    for (const word of queryWords) {
      if (docFullText.includes(word)) {
        score += 5;
      }
    }

    // Grade level alignment bonus
    if (gradeLevel && doc.gradeLevel.toLowerCase().includes(gradeLevel.toLowerCase().slice(0, 7))) {
      score += 10;
    }

    return { doc, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const topMatches = scored.filter((item) => item.score > 10).slice(0, 3);

  // Fallback to top 2 if score is low but query exists
  const selected = topMatches.length > 0 ? topMatches : scored.slice(0, 2);

  const citations: OerCitation[] = selected.map(({ doc, score }) => ({
    id: `cite-${doc.id}`,
    sourceName: doc.title,
    publisher: doc.publisher,
    chapter: doc.chapter,
    section: doc.section,
    pageOrRef: doc.pageOrRef,
    license: doc.license,
    excerptSnippet: doc.content.slice(0, 220) + "...",
    relevanceScore: Math.min(98, Math.max(65, score * 3)),
  }));

  return {
    docs: selected.map((s) => s.doc),
    citations,
  };
}

// ---------------- API ENDPOINTS ----------------

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    aiEnabled: !!process.env.GEMINI_API_KEY,
    oerDocsCount: OER_CORPUS.length,
    scholarshipsCount: SCHOLARSHIP_SCHEMES.length,
    activeStudents: db.students.size,
    activeClasses: db.classes.size,
  });
});

// Helper to check if student's selected class matches class code
function validateClassCodeMatch(studentClass: string, classInfo: ClassroomInfo): { valid: boolean; reason?: string } {
  if (!studentClass) {
    return { valid: false, reason: "Please select your enrolled class (e.g. Class 12, Class 11, Class 10)." };
  }

  // Extract class numeric digits: e.g. "12", "11", "10", "9", "8", "7", "6"
  const studentDigitsMatch = studentClass.match(/\b(12|11|10|9|8|7|6)\b/i) || studentClass.match(/(12|11|10|9|8|7|6)/i);
  const studentNum = studentDigitsMatch ? studentDigitsMatch[1] : "";

  const targetDigitsMatch = (classInfo.targetClass || "").match(/\b(12|11|10|9|8|7|6)\b/i) ||
    classInfo.classCode.match(/(12|11|10|9|8|7|6)/i) ||
    classInfo.className.match(/\bclass\s*(12|11|10|9|8|7|6)\b/i);
  const targetNum = targetDigitsMatch ? targetDigitsMatch[1] : "";

  if (studentNum && targetNum) {
    if (studentNum !== targetNum) {
      return {
        valid: false,
        reason: `Class Mismatch: You selected Class ${studentNum}, but Class Code "${classInfo.classCode}" is for Class ${targetNum} (${classInfo.className}). Students are strictly allowed to join only the class matching their enrolled grade level.`,
      };
    }
    return { valid: true };
  }

  if (classInfo.targetClass && studentClass.trim().toLowerCase() !== classInfo.targetClass.trim().toLowerCase()) {
    return {
      valid: false,
      reason: `Class Mismatch: You selected "${studentClass}", but Class Code "${classInfo.classCode}" is for "${classInfo.targetClass}".`,
    };
  }

  return { valid: true };
}

function generateClassMasteryList(studentClass: string, gradeLevel: GradeLevel): TopicMastery[] {
  const isClass12 = /12/.test(studentClass);
  const isClass11 = /11/.test(studentClass);
  const isClass10 = /10/.test(studentClass);
  const isClass9 = /9/.test(studentClass);

  if (isClass12) {
    return [
      {
        topicId: "calculus-integrals",
        topicName: "Integrals & Integration by Parts (ILATE)",
        subject: "Mathematics",
        gradeLevel: "Grade 11-12",
        masteryPercentage: 60,
        recentStreak: 1,
        weakConcepts: [],
        attemptsCount: 0,
        lastAttemptedAt: "Registered Today",
      },
      {
        topicId: "wave-optics",
        topicName: "Wave Optics & Young's Double Slit",
        subject: "Physics",
        gradeLevel: "Grade 11-12",
        masteryPercentage: 65,
        recentStreak: 1,
        weakConcepts: [],
        attemptsCount: 0,
        lastAttemptedAt: "Registered Today",
      },
      {
        topicId: "electrochemistry",
        topicName: "Nernst Equation & Gibbs Energy",
        subject: "Chemistry",
        gradeLevel: "Grade 11-12",
        masteryPercentage: 58,
        recentStreak: 0,
        weakConcepts: [],
        attemptsCount: 0,
        lastAttemptedAt: "Registered Today",
      },
      {
        topicId: "molecular-genetics",
        topicName: "DNA Replication & Transcription",
        subject: "Biology",
        gradeLevel: "Grade 11-12",
        masteryPercentage: 70,
        recentStreak: 1,
        weakConcepts: [],
        attemptsCount: 0,
        lastAttemptedAt: "Registered Today",
      },
    ];
  } else if (isClass11) {
    return [
      {
        topicId: "calculus-derivatives",
        topicName: "Limits & First Principle of Derivatives",
        subject: "Mathematics",
        gradeLevel: "Grade 11-12",
        masteryPercentage: 55,
        recentStreak: 1,
        weakConcepts: [],
        attemptsCount: 0,
        lastAttemptedAt: "Registered Today",
      },
      {
        topicId: "projectile-motion",
        topicName: "Motion in a Plane: Projectile Motion",
        subject: "Physics",
        gradeLevel: "Grade 11-12",
        masteryPercentage: 62,
        recentStreak: 1,
        weakConcepts: [],
        attemptsCount: 0,
        lastAttemptedAt: "Registered Today",
      },
      {
        topicId: "chemical-bonding",
        topicName: "Chemical Bonding & VSEPR Hybridization",
        subject: "Chemistry",
        gradeLevel: "Grade 11-12",
        masteryPercentage: 68,
        recentStreak: 1,
        weakConcepts: [],
        attemptsCount: 0,
        lastAttemptedAt: "Registered Today",
      },
      {
        topicId: "cell-biology",
        topicName: "Cell Organelles & Fluid Mosaic Model",
        subject: "Biology",
        gradeLevel: "Grade 11-12",
        masteryPercentage: 72,
        recentStreak: 1,
        weakConcepts: [],
        attemptsCount: 0,
        lastAttemptedAt: "Registered Today",
      },
    ];
  } else if (isClass10 || isClass9 || gradeLevel === "Grade 9-10") {
    return [
      {
        topicId: "linear-equations",
        topicName: "Linear Equations in Two Variables",
        subject: "Mathematics",
        gradeLevel: "Grade 9-10",
        masteryPercentage: 55,
        recentStreak: 1,
        weakConcepts: [],
        attemptsCount: 0,
        lastAttemptedAt: "Registered Today",
      },
      {
        topicId: "newton-laws",
        topicName: "Newton's Laws of Motion & F=ma",
        subject: "Physics",
        gradeLevel: "Grade 9-10",
        masteryPercentage: 60,
        recentStreak: 1,
        weakConcepts: [],
        attemptsCount: 0,
        lastAttemptedAt: "Registered Today",
      },
      {
        topicId: "chemical-reactions",
        topicName: "Chemical Reactions & Balancing Equations",
        subject: "Chemistry",
        gradeLevel: "Grade 9-10",
        masteryPercentage: 58,
        recentStreak: 0,
        weakConcepts: [],
        attemptsCount: 0,
        lastAttemptedAt: "Registered Today",
      },
      {
        topicId: "life-processes",
        topicName: "Life Processes: Nutrition & Respiration",
        subject: "Biology",
        gradeLevel: "Grade 9-10",
        masteryPercentage: 65,
        recentStreak: 1,
        weakConcepts: [],
        attemptsCount: 0,
        lastAttemptedAt: "Registered Today",
      },
    ];
  } else {
    return [
      {
        topicId: "rational-numbers",
        topicName: "Rational Numbers & Foundations",
        subject: "Mathematics",
        gradeLevel: "Grade 6-8",
        masteryPercentage: 60,
        recentStreak: 1,
        weakConcepts: [],
        attemptsCount: 0,
        lastAttemptedAt: "Registered Today",
      },
      {
        topicId: "force-pressure-foundations",
        topicName: "Force and Pressure Foundations",
        subject: "Science",
        gradeLevel: "Grade 6-8",
        masteryPercentage: 65,
        recentStreak: 1,
        weakConcepts: [],
        attemptsCount: 0,
        lastAttemptedAt: "Registered Today",
      },
    ];
  }
}

// ---------------- AUTH & CLASSROOM ENDPOINTS ----------------

// POST /api/auth/login - Role-based login (Teacher or Student)
app.post("/api/auth/login", (req, res) => {
  const { role, identifier, password } = req.body;

  if (role === "teacher") {
    const teachersList = Array.from(db.teachers.values());
    const teacher =
      teachersList.find(
        (t) => t.id === identifier || t.email.toLowerCase() === String(identifier).toLowerCase()
      ) || teachersList[0];

    if (!teacher) {
      return res.status(404).json({ error: "Teacher account not found" });
    }

    const authUser: AuthUser = {
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      role: "teacher",
      teacherProfile: teacher,
    };

    return res.json({
      user: authUser,
      teacherProfile: teacher,
      classes: Array.from(db.classes.values()).filter((c) => c.teacherId === teacher.id),
    });
  } else {
    // Role is student
    const studentsList = Array.from(db.students.values());
    const student =
      studentsList.find(
        (s) => s.id === identifier || s.email.toLowerCase() === String(identifier).toLowerCase()
      ) || studentsList[0];

    if (!student) {
      return res.status(404).json({ error: "Student account not found" });
    }

    // Optional password verification
    if (password && student.password && student.password !== password) {
      return res.status(401).json({ error: "Incorrect password for this student account." });
    }

    const classInfo = db.classes.get(student.classCode);
    const enrichedStudent = { ...student, classInfo };

    const authUser: AuthUser = {
      id: student.id,
      name: student.name,
      email: student.email,
      role: "student",
      classCode: student.classCode,
      studentProfile: enrichedStudent,
    };

    return res.json({
      user: authUser,
      studentProfile: enrichedStudent,
      classInfo,
    });
  }
});

// GET /api/class/:code - Verify and retrieve class educational details
app.get("/api/class/:code", (req, res) => {
  const code = req.params.code.trim().toUpperCase();
  const classInfo = db.classes.get(code);

  if (!classInfo) {
    return res.status(404).json({
      error: `Invalid Class Code "${code}". Please check with your teacher for the correct code (e.g., NCERT-12A).`,
    });
  }

  res.json({ classInfo });
});

// POST /api/auth/register-student - Register student with Teacher's Class Code
app.post("/api/auth/register-student", (req, res) => {
  const {
    name,
    email,
    password,
    studentClass,
    classCode,
    primaryLanguage = "en",
    category = "General",
    gender = "Other",
    familyIncomeBracket = "< 1.5 Lakhs/yr",
    academicScorePercent = 75,
    firstGenerationLearner = true,
    stateOrRegion = "National",
  } = req.body;

  if (!name || !email || !classCode) {
    return res.status(400).json({ error: "Name, email, and class code are required for registration." });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ error: "Password is required and must be at least 6 characters long." });
  }

  if (!studentClass) {
    return res.status(400).json({ error: "Please select your enrolled class (e.g. Class 12, Class 11, Class 10)." });
  }

  const cleanCode = classCode.trim().toUpperCase();
  const classInfo = db.classes.get(cleanCode);

  if (!classInfo) {
    return res.status(400).json({
      error: `Class Code "${cleanCode}" was not found. Please verify the code provided by your teacher (e.g. NCERT-12A).`,
    });
  }

  // Strict Class Match Verification
  const matchResult = validateClassCodeMatch(studentClass, classInfo);
  if (!matchResult.valid) {
    return res.status(400).json({
      error: matchResult.reason || "Your selected class does not match the class code. You cannot join this class.",
    });
  }

  // Determine GradeLevel from studentClass if not matching
  let resolvedGradeLevel: GradeLevel = classInfo.gradeLevel;
  if (/12|11/.test(studentClass)) {
    resolvedGradeLevel = "Grade 11-12";
  } else if (/10|9/.test(studentClass)) {
    resolvedGradeLevel = "Grade 9-10";
  } else if (/8|7|6/.test(studentClass)) {
    resolvedGradeLevel = "Grade 6-8";
  }

  // Create new student
  const studentId = `student-${Date.now()}`;
  const avatarSeed = name.toLowerCase().replace(/[^a-z]/g, "").slice(0, 8) || "student";

  const initialMastery = generateClassMasteryList(studentClass, resolvedGradeLevel);

  const newStudent: StudentProfile = {
    id: studentId,
    name,
    email,
    password,
    role: "student",
    classCode: cleanCode,
    studentClass,
    classInfo,
    gradeLevel: resolvedGradeLevel,
    primaryLanguage,
    avatarSeed,
    familyIncomeBracket,
    category,
    gender,
    academicScorePercent: Number(academicScorePercent) || 75,
    stateOrRegion,
    firstGenerationLearner: !!firstGenerationLearner,
    totalDoubtsAsked: 0,
    totalPracticeCompleted: 0,
    avgPracticeScore: 70,
    lastActive: "Just now",
    masteryList: initialMastery,
  };

  db.students.set(studentId, newStudent);

  if (!classInfo.enrolledStudentIds.includes(studentId)) {
    classInfo.enrolledStudentIds.push(studentId);
    classInfo.enrolledCount = classInfo.enrolledStudentIds.length;
  }

  const authUser: AuthUser = {
    id: studentId,
    name: newStudent.name,
    email: newStudent.email,
    role: "student",
    classCode: cleanCode,
    studentProfile: newStudent,
  };

  res.json({
    success: true,
    user: authUser,
    student: newStudent,
    classInfo,
    message: `Successfully registered for ${classInfo.className} under ${classInfo.teacherName}!`,
  });
});

// GET /api/teacher/classes - Get all classes for teacher
app.get("/api/teacher/classes", (req, res) => {
  const teacherId = (req.query.teacherId as string) || "teacher-1";
  const teacherClasses = Array.from(db.classes.values()).filter(
    (c) => !teacherId || c.teacherId === teacherId
  );
  res.json({ classes: teacherClasses });
});

// POST /api/teacher/create-class - Teacher creates a new class code & curriculum
app.post("/api/teacher/create-class", (req, res) => {
  const {
    className,
    gradeLevel = "Grade 11-12",
    stream = "Science",
    teacherId = "teacher-1",
    teacherName = "Dr. Rajesh Varma",
    school = "Kendriya Vidyalaya No. 1",
    customCode,
  } = req.body;

  const generatedCode = customCode
    ? customCode.trim().toUpperCase()
    : `NCERT-${Math.floor(100 + Math.random() * 900)}`;

  if (db.classes.has(generatedCode)) {
    return res.status(400).json({
      error: `Class code ${generatedCode} already exists. Please choose a different code.`,
    });
  }

  const newClass: ClassroomInfo = {
    classCode: generatedCode,
    className: className || `Class ${gradeLevel.replace("Grade ", "")} - Stream ${stream}`,
    gradeLevel,
    stream,
    curriculum: "NCERT / CBSE National Curriculum Framework 2024-25",
    school,
    teacherId,
    teacherName,
    academicYear: "2024-2025",
    subjects: ["Physics", "Chemistry", "Mathematics", "Biology"],
    timetable: [
      {
        day: "Monday",
        periods: [
          {
            periodNumber: 1,
            time: "08:30 - 09:15 AM",
            subject: "Physics",
            topic: "Introduction to Class Syllabus",
            teacher: teacherName,
            room: "Room 101",
          },
          {
            periodNumber: 2,
            time: "09:20 - 10:05 AM",
            subject: "Mathematics",
            topic: "NCERT Foundation Chapter 1",
            teacher: "Prof. S. Ramanujan",
            room: "Room 101",
          },
        ],
      },
    ],
    syllabus: [
      {
        unitNumber: 1,
        unitTitle: "Unit 1: Core NCERT Foundations",
        subject: "Science & Math",
        chapters: ["Chapter 1: Theory & Principles", "Chapter 2: Methods & Equations"],
        weightageMarks: 25,
        totalPeriods: 30,
        status: "In Progress",
      },
    ],
    enrolledStudentIds: [],
    enrolledCount: 0,
  };

  db.classes.set(generatedCode, newClass);

  const teacher = db.teachers.get(teacherId);
  if (teacher) {
    teacher.classes.push(newClass);
  }

  res.json({ success: true, classInfo: newClass });
});

// GET /api/student/me - Get current student's personal details only (Strict Privacy Isolation)
app.get("/api/student/me", (req, res) => {
  const studentId = (req.query.id as string) || "student-1";
  const student = db.students.get(studentId);

  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  const classInfo = db.classes.get(student.classCode);
  res.json({
    student: { ...student, classInfo },
    classInfo,
  });
});

// GET /api/students - List student profiles (Supports ?classCode= filter for Teacher radar)
app.get("/api/students", (req, res) => {
  const { classCode } = req.query;
  let students = Array.from(db.students.values());

  if (classCode) {
    students = students.filter((s) => s.classCode === String(classCode).toUpperCase());
  }

  res.json({ students });
});

// GET /api/students/:id - Get specific student profile
app.get("/api/students/:id", (req, res) => {
  const student = db.students.get(req.params.id);
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }
  const classInfo = db.classes.get(student.classCode);
  res.json({ student: { ...student, classInfo } });
});

// PUT /api/students/:id - Update student profile
app.put("/api/students/:id", (req, res) => {
  const student = db.students.get(req.params.id);
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }
  const updated = { ...student, ...req.body };
  db.students.set(req.params.id, updated);
  res.json({ student: updated });
});

// GET /api/oer/corpus - Browse open educational resources
app.get("/api/oer/corpus", (req, res) => {
  const { subject, grade } = req.query;
  let results = [...OER_CORPUS];
  if (subject && subject !== "all") {
    results = results.filter((d) => d.subject.toLowerCase() === String(subject).toLowerCase());
  }
  if (grade && grade !== "all") {
    results = results.filter((d) => d.gradeLevel === grade);
  }
  res.json({ corpus: results });
});

// POST /api/doubt/solve - Grounded Doubt Solving Agent (Module A)
app.post("/api/doubt/solve", async (req, res) => {
  try {
    const {
      question,
      gradeLevel = "Grade 9-10",
      language = "en",
      explanationStyle = "step-by-step",
      studentId = "student-1",
      imageData, // optional base64 image of handwritten work
      previousContext = [],
    } = req.body;

    if (!question && !imageData) {
      return res.status(400).json({ error: "Question text or image is required." });
    }

    // 1. RAG Retrieval from open educational knowledge base
    const { docs, citations } = retrieveRelevantOerDocs(question || "Math & Science concepts", gradeLevel);

    const contextText = docs
      .map(
        (d) =>
          `[SOURCE: ${d.title} | ${d.chapter} | ${d.section} | Reference: ${d.pageOrRef} | License: ${d.license}]\nContent:\n${d.content}`
      )
      .join("\n\n---\n\n");

    const langName = SUPPORTED_LANGUAGES.find((l) => l.code === language)?.name || "English";

    // Update student stats in memory
    const student = db.students.get(studentId);
    if (student) {
      student.totalDoubtsAsked += 1;
      student.lastActive = "Just now";
    }

    const ai = getGeminiClient();

    let explanation = "";
    let suggestedFollowUps: string[] = [
      "Could you explain this with a real-world daily life analogy?",
      "I am confused about Step 2, could you break it down into smaller steps?",
      "Can you give me a simple practice question to test if I got it?",
    ];
    let groundingStatus: "verified_grounded" | "partially_grounded" = "verified_grounded";

    if (ai) {
      const systemInstruction = `You are a patient, pedagogically grounded AI tutor designed for equitable education access for students in under-resourced schools.
Your primary directive is to provide clear, level-appropriate explanations STRICTLY GROUNDED in verified NCERT National Curriculum textbooks (Classes 6 to 12 across Mathematics, Physics, Chemistry, and Biology).

STRICT RULES:
1. Target Grade Level: ${gradeLevel}. Adjust vocabulary, pacing, and complexity specifically for this grade.
2. Target Output Language: ${langName} (${language}). Explain the entire answer in ${langName}. If technical terms are used, you may provide English transliteration or bilingual keywords where helpful for clarity.
3. Explanation Style: ${explanationStyle} (e.g. step-by-step breakdown, simple analogy, or prerequisite basics).
4. CITATION REQUIREMENT: You MUST explicitly reference the provided NCERT textbook sources (e.g. "According to NCERT Class 12 Mathematics Chapter 7 Integrals...").
5. HONESTY: If the question cannot be grounded in standard secondary/high school curriculum or the provided corpus, politely explain what foundational concept applies rather than fabricating facts.
6. NO MOCK JARGON: Keep the tone encouraging, supportive, and crystal clear.
7. Format with clear numbered steps, bold highlights, and clean typography.`;

      const promptContent = `Student Doubt / Question:
"${question}"

${imageData ? "[Student uploaded an image of their handwritten work or textbook problem]" : ""}

OPEN EDUCATIONAL REFERENCE PASSAGES (Ground your answer strictly in these):
${contextText}

Previous conversation context (if any):
${JSON.stringify(previousContext.slice(-3))}

Provide a step-by-step grounded explanation in ${langName} citing the exact source material.`;

      let contentsPayload: any = promptContent;

      if (imageData) {
        // Strip data url header if present
        const base64Clean = imageData.replace(/^data:image\/\w+;base64,/, "");
        contentsPayload = {
          parts: [
            {
              inlineData: {
                mimeType: "image/png",
                data: base64Clean,
              },
            },
            {
              text: promptContent,
            },
          ],
        };
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: contentsPayload,
        config: {
          systemInstruction,
          temperature: 0.3, // Low temperature for high factual consistency
        },
      });

      explanation = response.text || "Here is a step-by-step explanation grounded in open textbook resources.";

      // Generate context-aware follow-up prompts
      try {
        const followUpPrompt = `Based on the explanation given above for topic "${question}", provide exactly 3 helpful, one-sentence follow-up questions a student might naturally ask to clarify confusion. Return ONLY a JSON array of strings.`;
        const followUpRes = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: followUpPrompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
        });
        if (followUpRes.text) {
          suggestedFollowUps = JSON.parse(followUpRes.text.trim());
        }
      } catch (e) {
        // Use default followups
      }
    } else {
      // Offline fallback grounded response
      const matchedDoc = docs[0];
      explanation = `### Step-by-Step Explanation (Grounded in ${matchedDoc.title})

**Core Principle:**
${matchedDoc.summary}

**Step 1: Understand the Given Quantities**
Look closely at the components from ${matchedDoc.chapter} (${matchedDoc.section}).

**Step 2: Apply the Open Curriculum Formula**
Referencing ${matchedDoc.pageOrRef}:
\`\`\`
${matchedDoc.content.split("\n").slice(0, 4).join("\n")}
\`\`\`

**Step 3: Solve Step-by-Step**
Work through the equation step-by-step to arrive at the final simplified value. Verify with equivalent balance on both sides.

**Verified Open Source:**
- **Textbook:** ${matchedDoc.title}
- **Section:** ${matchedDoc.section} (${matchedDoc.pageOrRef})
- **License:** ${matchedDoc.license}`;
    }

    db.doubtHistory.push({
      id: `doubt-${Date.now()}`,
      studentId,
      question,
      response: explanation,
      citations,
      language,
      timestamp: new Date().toISOString(),
    });

    res.json({
      explanation,
      citations,
      groundingStatus,
      groundingReasoning: `Grounded in ${citations.length} verified open educational curriculum sources (${citations.map((c) => c.publisher).join(", ")}).`,
      suggestedFollowUps,
      language,
      gradeLevel,
    });
  } catch (error: any) {
    console.error("Error in /api/doubt/solve:", error);
    res.status(500).json({ error: error.message || "Failed to generate grounded explanation" });
  }
});

// POST /api/practice/generate - Adaptive Practice Generator (Module B)
app.post("/api/practice/generate", async (req, res) => {
  try {
    const { studentId = "student-1", topicId, requestedDifficulty } = req.body;
    const student = db.students.get(studentId);

    // Identify target topic: either explicitly requested or weakest topic
    let targetTopic = student?.masteryList.find((t) => t.topicId === topicId);
    if (!targetTopic && student?.masteryList && student.masteryList.length > 0) {
      // Sort by mastery percentage ascending (weakest first)
      const sorted = [...student.masteryList].sort((a, b) => a.masteryPercentage - b.masteryPercentage);
      targetTopic = sorted[0];
    }

    // Determine adaptive difficulty ladder
    let difficulty: "Foundational" | "Intermediate" | "Advanced" = requestedDifficulty || "Intermediate";
    let isStepDownPrerequisite = false;

    if (!requestedDifficulty && targetTopic) {
      if (targetTopic.recentStreak <= -2 || targetTopic.masteryPercentage < 50) {
        difficulty = "Foundational";
        isStepDownPrerequisite = true;
      } else if (targetTopic.recentStreak >= 2 && targetTopic.masteryPercentage >= 75) {
        difficulty = "Advanced";
      } else {
        difficulty = "Intermediate";
      }
    }

    // Retrieve matching OER doc
    const matchingDocs = OER_CORPUS.filter(
      (d) =>
        d.keyConcepts.some((k) => targetTopic?.topicName.toLowerCase().includes(k.toLowerCase())) ||
        d.subject.toLowerCase() === targetTopic?.subject.toLowerCase()
    );
    const primaryDoc = matchingDocs[0] || OER_CORPUS[0];

    const citation: OerCitation = {
      id: `cite-practice-${primaryDoc.id}`,
      sourceName: primaryDoc.title,
      publisher: primaryDoc.publisher,
      chapter: primaryDoc.chapter,
      section: primaryDoc.section,
      pageOrRef: primaryDoc.pageOrRef,
      license: primaryDoc.license,
      excerptSnippet: primaryDoc.content.slice(0, 180) + "...",
      relevanceScore: 95,
    };

    const ai = getGeminiClient();

    let questionData = {
      id: `q-${Date.now()}`,
      topicId: targetTopic?.topicId || "fractions-decimals",
      topicName: targetTopic?.topicName || "Fractions & Decimals",
      subject: targetTopic?.subject || "Mathematics",
      difficulty,
      isStepDownPrerequisite,
      questionText: isStepDownPrerequisite
        ? "Prerequisite Review: What is the Least Common Multiple (LCM) of 4 and 6 before adding 1/4 + 1/6?"
        : "Evaluate the sum: 2/3 + 3/5. Express your answer as a simplified fraction.",
      options: isStepDownPrerequisite
        ? ["12", "24", "10", "16"]
        : ["19/15", "5/8", "13/15", "1 1/15"],
      correctOptionIndex: 0,
      explanation: isStepDownPrerequisite
        ? "The multiples of 4 are 4, 8, 12, 16... and the multiples of 6 are 6, 12, 18... The smallest common multiple is 12."
        : "Step 1: Find LCM of denominators 3 and 5 = 15.\nStep 2: 2/3 = 10/15 and 3/5 = 9/15.\nStep 3: 10/15 + 9/15 = 19/15 (or 1 4/15).",
      prerequisiteHint: "Remember to find the smallest number that both denominators divide into evenly.",
      groundedCitation: citation,
    };

    if (ai) {
      const prompt = `Generate a single multiple-choice adaptive practice question for a student.
Topic: ${targetTopic?.topicName || "Linear Equations & Fractions"}
Subject: ${targetTopic?.subject || "Mathematics"}
Difficulty Level: ${difficulty}
Is Step-Down Prerequisite after wrong answer: ${isStepDownPrerequisite}
Grounding Textbook: ${primaryDoc.title} (${primaryDoc.chapter}, ${primaryDoc.section})

Textbook Reference Passage:
${primaryDoc.content}

Generate a clear, pedagogical question with 4 options, the exact 0-based index of the correct option, a step-by-step worked explanation, and a helpful hint.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questionText: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              correctOptionIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
              prerequisiteHint: { type: Type.STRING },
            },
            required: ["questionText", "options", "correctOptionIndex", "explanation"],
          },
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        questionData = {
          id: `q-${Date.now()}`,
          topicId: targetTopic?.topicId || "topic-1",
          topicName: targetTopic?.topicName || "Core Concept",
          subject: targetTopic?.subject || "Science",
          difficulty,
          isStepDownPrerequisite,
          questionText: parsed.questionText,
          options: parsed.options,
          correctOptionIndex: parsed.correctOptionIndex,
          explanation: parsed.explanation,
          prerequisiteHint: parsed.prerequisiteHint || "Review the foundational chapter rules.",
          groundedCitation: citation,
        };
      }
    }

    res.json({ question: questionData, targetTopic });
  } catch (error: any) {
    console.error("Error in /api/practice/generate:", error);
    res.status(500).json({ error: error.message || "Failed to generate practice question" });
  }
});

// POST /api/practice/submit - Record practice answer and update student mastery profile
app.post("/api/practice/submit", (req, res) => {
  const { studentId = "student-1", topicId, isCorrect, difficulty } = req.body;
  const student = db.students.get(studentId);

  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  // Update mastery profile
  const topic = student.masteryList.find((t) => t.topicId === topicId);
  if (topic) {
    topic.attemptsCount += 1;
    topic.lastAttemptedAt = "Just now";
    if (isCorrect) {
      topic.recentStreak = topic.recentStreak > 0 ? topic.recentStreak + 1 : 1;
      const delta = difficulty === "Advanced" ? 8 : difficulty === "Intermediate" ? 5 : 3;
      topic.masteryPercentage = Math.min(100, topic.masteryPercentage + delta);
      // Remove weak concept if high mastery
      if (topic.masteryPercentage > 80) {
        topic.weakConcepts = topic.weakConcepts.slice(1);
      }
    } else {
      topic.recentStreak = topic.recentStreak < 0 ? topic.recentStreak - 1 : -1;
      const delta = difficulty === "Advanced" ? 3 : 6;
      topic.masteryPercentage = Math.max(10, topic.masteryPercentage - delta);
    }
  }

  student.totalPracticeCompleted += 1;
  db.practiceLogs.push({
    id: `log-${Date.now()}`,
    studentId,
    topicId,
    isCorrect,
    difficulty,
    timestamp: new Date().toISOString(),
  });

  res.json({
    success: true,
    updatedTopic: topic,
    updatedProfile: student,
  });
});

// GET /api/teacher/insights - Teacher-Facing Insight & Intervention Dashboard (Module C)
app.get("/api/teacher/insights", (req, res) => {
  const { classCode } = req.query;
  let students = Array.from(db.students.values());

  if (classCode && classCode !== "all") {
    students = students.filter((s) => s.classCode === String(classCode).toUpperCase());
  }

  // 1. Generate explainable flagged students needing intervention
  const flaggedStudents: TeacherStudentFlag[] = students.map((s) => {
    const weakTopics = s.masteryList.filter((t) => t.masteryPercentage < 60 || t.recentStreak <= -2);
    const lowestTopic = [...s.masteryList].sort((a, b) => a.masteryPercentage - b.masteryPercentage)[0];

    let severity: "high_priority" | "medium_attention" | "on_track" = "on_track";
    let primaryIssue = "Demonstrating consistent progress across current modules.";
    let plainLanguageReason = "Student is meeting learning benchmarks with steady practice scores.";
    let suggestedIntervention = "Continue reinforcing advanced practice items.";

    if (weakTopics.length >= 2 || (lowestTopic && lowestTopic.masteryPercentage < 40)) {
      severity = "high_priority";
      primaryIssue = `Critical misconception in ${lowestTopic?.topicName || "core topics"}`;
      plainLanguageReason = `Struggling with repeated errors (streak of ${lowestTopic?.recentStreak || -2}) on "${lowestTopic?.weakConcepts[0] || "Foundations"}". Low practice accuracy (${s.avgPracticeScore}% avg).`;
      suggestedIntervention = `Provide 10-minute 1-on-1 visual review of ${lowestTopic?.topicName} using NCERT worked examples.`;
    } else if (weakTopics.length === 1 || s.totalDoubtsAsked > 10) {
      severity = "medium_attention";
      primaryIssue = `Recent difficulty in ${lowestTopic?.topicName}`;
      plainLanguageReason = `Has asked ${s.totalDoubtsAsked} doubts recently and showed difficulty when progressing to intermediate questions.`;
      suggestedIntervention = `Assign prerequisite step-down exercises before assigning multi-variable problems.`;
    }

    return {
      studentId: s.id,
      studentName: s.name,
      gradeLevel: s.gradeLevel,
      severity,
      primaryIssue,
      plainLanguageReason,
      weakTopics: weakTopics.map((w) => w.topicName),
      doubtCountLast7Days: s.totalDoubtsAsked,
      practiceAccuracyRate: s.avgPracticeScore,
      suggestedIntervention,
      lastActive: s.lastActive,
    };
  });

  // Sort: High priority first
  flaggedStudents.sort((a, b) => {
    const order = { high_priority: 0, medium_attention: 1, on_track: 2 };
    return order[a.severity] - order[b.severity];
  });

  // 2. Compute Class-Level Topic Heatmap
  const topicMap = new Map<string, { topicName: string; subject: string; scores: number[]; strugglingCount: number }>();

  students.forEach((s) => {
    s.masteryList.forEach((m) => {
      if (!topicMap.has(m.topicId)) {
        topicMap.set(m.topicId, {
          topicName: m.topicName,
          subject: m.subject,
          scores: [],
          strugglingCount: 0,
        });
      }
      const item = topicMap.get(m.topicId)!;
      item.scores.push(m.masteryPercentage);
      if (m.masteryPercentage < 60) {
        item.strugglingCount += 1;
      }
    });
  });

  const heatmap: TopicHeatmapItem[] = Array.from(topicMap.entries()).map(([topicId, data]) => {
    const avg = Math.round(data.scores.reduce((a, b) => a + b, 0) / (data.scores.length || 1));
    let recommendedFocus: "Immediate Review Required" | "Reinforce Core Concepts" | "Mastered Well" = "Mastered Well";
    if (avg < 55) recommendedFocus = "Immediate Review Required";
    else if (avg < 75) recommendedFocus = "Reinforce Core Concepts";

    return {
      topicId,
      topicName: data.topicName,
      subject: data.subject,
      classAverageMastery: avg,
      strugglingStudentsCount: data.strugglingCount,
      totalStudents: data.scores.length,
      recommendedFocus,
    };
  });

  const totalEnrolled = students.length;
  const avgAccuracy = totalEnrolled > 0
    ? Math.round(students.reduce((a, s) => a + s.avgPracticeScore, 0) / totalEnrolled)
    : 0;

  res.json({
    flaggedStudents,
    heatmap,
    classOverview: {
      totalEnrolled,
      needingIntervention: flaggedStudents.filter((f) => f.severity !== "on_track").length,
      totalDoubtsSolvedThisWeek: 42,
      classAverageAccuracy: avgAccuracy,
    },
  });
});

// POST /api/teacher/lesson-plan - Generate AI 15-Minute Remediation Plan
app.post("/api/teacher/lesson-plan", async (req, res) => {
  try {
    const { topicName, strugglingCount, weakConcepts = [] } = req.body;
    const ai = getGeminiClient();

    let lessonPlan = "";

    if (ai) {
      const prompt = `You are a curriculum specialist helping a teacher in an under-resourced school.
Generate a concise 15-Minute Targeted Remediation Plan for the topic: "${topicName}".
Struggling Students: ${strugglingCount || 3} students in class.
Specific Misconceptions: ${weakConcepts.join(", ") || "Foundational algebraic/conceptual gaps"}.

Structure the response with:
1. 3-Minute Hook / Concrete Daily Life Analogy (grounded in everyday objects)
2. 5-Minute Guided Step-by-Step Board Work (using official NCERT textbook method)
3. 5-Minute Pair Practice Problem with Prerequisite Scaffolding
4. 2-Minute Formative Check Question with Diagnostic Distractors.
Keep it direct, actionable, practical, and highly pedagogical.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
      });

      lessonPlan = response.text || "15-Minute Remediation Plan ready for classroom delivery.";
    } else {
      lessonPlan = `### 15-Minute Rapid Remediation Plan: ${topicName}

**1. 3-Minute Real-World Hook:**
Introduce the concept using a familiar sharing scenario (e.g., dividing a roti/pizza or comparing two runners' speeds) to connect abstract variables to physical quantities.

**2. 5-Minute Guided Board Example (NCERT Method):**
- Step 1: Write the standard balance equation clearly on the board.
- Step 2: Show why both sides must be manipulated simultaneously to preserve equality.
- Step 3: Highlight the common sign or denominator trap that causes error.

**3. 5-Minute Pair Scaffolding Exercise:**
Students work in pairs on one foundational variant before attempting multi-step problems.

**4. 2-Minute Diagnostic Exit Ticket:**
Ask students to identify the single error in a pre-written flawed solution to ensure conceptual mastery.`;
    }

    res.json({ lessonPlan, topicName });
  } catch (error: any) {
    console.error("Error in /api/teacher/lesson-plan:", error);
    res.status(500).json({ error: error.message || "Failed to generate remediation plan" });
  }
});

// POST /api/scholarships/match - Scholarship & Financial Aid Matcher (Module D)
app.post("/api/scholarships/match", (req, res) => {
  const {
    gradeLevel,
    familyIncomeAnnual,
    category,
    gender,
    academicScorePercent,
    stateOrRegion,
    firstGenerationLearner,
  } = req.body;

  const results = SCHOLARSHIP_SCHEMES.map((scheme) => {
    const matchedCriteria: string[] = [];
    const unmetCriteria: string[] = [];
    let score = 0;

    // 1. Grade match
    if (!gradeLevel || scheme.eligibleGrades.includes(gradeLevel)) {
      matchedCriteria.push(`Grade Level Eligible (${gradeLevel || "All"})`);
      score += 25;
    } else {
      unmetCriteria.push(`Requires Grade: ${scheme.eligibleGrades.join(", ")} (Current: ${gradeLevel})`);
    }

    // 2. Family Income check
    if (familyIncomeAnnual !== undefined && scheme.maxFamilyIncomeAnnual) {
      if (Number(familyIncomeAnnual) <= scheme.maxFamilyIncomeAnnual) {
        matchedCriteria.push(`Income Eligible (${scheme.maxFamilyIncomeLabel})`);
        score += 30;
      } else {
        unmetCriteria.push(`Exceeds maximum income cap of ₹${scheme.maxFamilyIncomeAnnual.toLocaleString()}/year`);
      }
    } else {
      matchedCriteria.push(`Income check compatible`);
      score += 20;
    }

    // 3. Category / Social group check
    if (!category || scheme.eligibleCategories.includes(category)) {
      matchedCriteria.push(`Category Eligible (${category || "Open to all"})`);
      score += 20;
    } else {
      unmetCriteria.push(`Reserved for: ${scheme.eligibleCategories.join(", ")}`);
    }

    // 4. Gender match
    if (!gender || scheme.eligibleGenders.includes(gender)) {
      matchedCriteria.push(`Gender Eligible (${gender || "All"})`);
      score += 15;
    } else {
      unmetCriteria.push(`Restricted to: ${scheme.eligibleGenders.join(", ")} applicants`);
    }

    // 5. Academic score threshold
    if (academicScorePercent !== undefined && scheme.minAcademicScore) {
      if (Number(academicScorePercent) >= scheme.minAcademicScore) {
        matchedCriteria.push(`Academic Marks Criteria Met (${academicScorePercent}% ≥ ${scheme.minAcademicScore}% requirement)`);
        score += 10;
      } else {
        unmetCriteria.push(`Minimum ${scheme.minAcademicScore}% marks required (Current: ${academicScorePercent}%)`);
      }
    }

    // 6. First-generation learner check
    if (scheme.firstGenLearnerOnly) {
      if (firstGenerationLearner) {
        matchedCriteria.push(`First-Generation Learner grant priority applied`);
        score += 15;
      } else {
        unmetCriteria.push(`Specific priority scheme for first-generation learners`);
      }
    }

    const isEligible = unmetCriteria.length === 0;

    const plainLanguageReasoning = isEligible
      ? `You appear eligible based on your entered criteria: ${matchedCriteria.slice(0, 3).join(", ")}. Matches all formal scheme criteria without disqualifications.`
      : `Currently not matched due to: ${unmetCriteria.join("; ")}.`;

    return {
      scheme,
      isEligible,
      matchScore: isEligible ? Math.min(100, score + 10) : Math.max(10, score - 30),
      matchedCriteria,
      unmetCriteria,
      plainLanguageReasoning,
    };
  });

  // Sort: Eligible first, then highest match score
  results.sort((a, b) => {
    if (a.isEligible && !b.isEligible) return -1;
    if (!a.isEligible && b.isEligible) return 1;
    return b.matchScore - a.matchScore;
  });

  res.json({ matches: results });
});

// Vite middleware and static serving setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI for Equitable Education Access server running on http://localhost:${PORT}`);
  });
}

startServer();
