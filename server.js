import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { OER_CORPUS, SUPPORTED_LANGUAGES } from "./src/data/oerKnowledgeBase.js";
import { SCHOLARSHIP_SCHEMES } from "./src/data/scholarshipDatabase.js";
dotenv.config();
const app = express();
const PORT = 3e3;
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. Offline/fallback grounded mode will be used.");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}

// Multimodal Resource Analyzer using Gemini 3.7 Flash
async function analyzeUploadedResource({
  title,
  subject,
  gradeLevel,
  chapter,
  content = "",
  mediaType = "text",
  fileData = null,
  mimeType = "",
  fileName = "",
  fileSize = 0,
  tags = []
}) {
  let detectedType = mediaType || "text";
  if (mimeType) {
    if (mimeType.startsWith("image/")) detectedType = "image";
    else if (mimeType.startsWith("video/")) detectedType = "video";
    else if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("text")) detectedType = "file";
  }

  let aiExtractedContent = "";
  let extractedConcepts = Array.isArray(tags) ? [...tags] : (tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : []);
  let mediaMeta = null;

  if (fileData) {
    mediaMeta = {
      fileName: fileName || `${detectedType}-resource-${Date.now()}`,
      fileSize: fileSize || Math.round(fileData.length * 0.75),
      mimeType: mimeType || (detectedType === "image" ? "image/jpeg" : detectedType === "video" ? "video/mp4" : "application/pdf"),
      uploadedAt: new Date().toISOString()
    };

    const ai = getGeminiClient();
    if (ai) {
      try {
        const base64Clean = fileData.replace(/^data:[^;]+;base64,/, "");
        let promptText = "";
        if (detectedType === "image") {
          promptText = `You are an expert educational content analyzer. Analyze this uploaded student/teacher study image for ${subject} (${gradeLevel}) titled '${title}' (Topic: ${chapter || "General Topic"}).
Thoroughly extract and transcribe all handwritten and typed notes, mathematical equations, chemical formulas, diagram structures, definitions, step-by-step derivations, and key learning concepts into clear, rich Markdown.
Also provide a concise list of 4-6 key concepts covered.`;
        } else if (detectedType === "video") {
          promptText = `You are an expert educational video lecture analyzer. Transcribe and summarize the lecture/explanation in this video titled '${title}' for ${subject} (${gradeLevel}) (Topic: ${chapter || "General Topic"}).
Extract all taught key concepts, formulas, blackboard equations, step-by-step problem solutions, and definitions into structured Markdown study notes so the AI tutor can reference this lesson when helping students.
Also provide a concise list of 4-6 key concepts covered.`;
        } else {
          promptText = `You are an expert curriculum document analyzer. Extract all key notes, formulas, theorems, definitions, and worked examples from this uploaded file titled '${title}' for ${subject} (${gradeLevel}) into clear, structured Markdown.
Also provide a concise list of 4-6 key concepts covered.`;
        }

        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: mediaMeta.mimeType,
                  data: base64Clean
                }
              },
              { text: promptText }
            ]
          },
          config: {
            temperature: 0.2
          }
        });

        aiExtractedContent = response.text || "";
      } catch (err) {
        console.warn("AI multimodal extraction warning (falling back):", err.message);
        aiExtractedContent = `### AI Analysis & Notes Summary for ${title}\n- **Topic**: ${chapter || subject}\n- **Media**: ${detectedType.toUpperCase()} file (${fileName || "Uploaded Resource"})\n- **Extracted Content**: Contains core diagrams, definitions, and formulas for ${subject} ${gradeLevel}.\n${content ? `\n**User Notes:**\n${content}` : ""}`;
      }
    } else {
      aiExtractedContent = `### Multimodal Study Material: ${title}\n- **Type**: ${detectedType.toUpperCase()} (${mediaMeta.fileName})\n- **Subject**: ${subject} (${gradeLevel})\n- **Summary**: Comprehensive study material and problem breakdown for ${chapter || title}.\n${content ? `\n**Provided Notes:**\n${content}` : ""}`;
    }
  }

  // Combine user content with AI extracted content
  const combinedContent = [
    content ? `### Contributor Notes & Overview:\n${content}` : "",
    aiExtractedContent ? `### AI Multimodal Extracted Concepts & Transcription:\n${aiExtractedContent}` : ""
  ].filter(Boolean).join("\n\n");

  return {
    mediaType: detectedType,
    mediaData: fileData, // Data URL / Base64 string for direct preview/playback
    mediaMeta,
    aiExtractedContent: aiExtractedContent || content,
    finalContent: combinedContent || content || `Educational resource for ${subject}: ${title}`,
    keyConcepts: extractedConcepts
  };
}
const db = {
  institutes: /* @__PURE__ */ new Map(),
  students: /* @__PURE__ */ new Map(),
  teachers: /* @__PURE__ */ new Map(),
  classes: /* @__PURE__ */ new Map(),
  classroomResources: /* @__PURE__ */ new Map(), // classCode -> Array of shared notes/resources
  resourceDumps: [], // Library resource dump files
  communityPosts: [], // Institutional doubt and community posts
  doubtHistory: [],
  practiceLogs: []
};
function seedInitialData() {
  const initialInstitutes = [
    {
      id: "inst-1",
      name: "Kendriya Vidyalaya No. 1, Model Cluster",
      type: "Government School (KVS)",
      location: "New Delhi",
      classesCount: 2,
      teachersCount: 2
    },
    {
      id: "inst-2",
      name: "Jawaharlal Navodaya Vidyalaya, Model District",
      type: "Residential Government (JNV)",
      location: "Bhopal, Madhya Pradesh",
      classesCount: 1,
      teachersCount: 1
    },
    {
      id: "inst-3",
      name: "Delhi Public School, Sector 12",
      type: "Private CBSE School",
      location: "Delhi NCR",
      classesCount: 1,
      teachersCount: 1
    },
    {
      id: "inst-4",
      name: "Sarvodaya Kanya Vidyalaya No. 2",
      type: "State Govt Model School",
      location: "Delhi",
      classesCount: 1,
      teachersCount: 1
    },
    {
      id: "inst-5",
      name: "Government Higher Secondary Model School",
      type: "State Higher Secondary",
      location: "Kolkata, West Bengal",
      classesCount: 1,
      teachersCount: 1
    },
    {
      id: "inst-6",
      name: "St. Xavier's Senior Secondary School",
      type: "Private Aided / CBSE",
      location: "Ahmedabad, Gujarat",
      classesCount: 1,
      teachersCount: 1
    },
    {
      id: "inst-7",
      name: "National Model Inter College",
      type: "State Secondary Board",
      location: "Lucknow, Uttar Pradesh",
      classesCount: 1,
      teachersCount: 1
    }
  ];
  initialInstitutes.forEach((inst) => db.institutes.set(inst.id, inst));

  const class12A_Timetable = [
    {
      day: "Monday",
      periods: [
        { periodNumber: 1, time: "08:30 - 09:15 AM", subject: "Physics", topic: "Wave Optics (Young's Slit)", teacher: "Dr. Rajesh Varma", room: "Lab 2" },
        { periodNumber: 2, time: "09:20 - 10:05 AM", subject: "Mathematics", topic: "Integrals by Parts (ILATE)", teacher: "Prof. S. Ramanujan", room: "Room 102" },
        { periodNumber: 3, time: "10:20 - 11:05 AM", subject: "Chemistry", topic: "Electrochemistry & Nernst Eq", teacher: "Dr. M. Sen", room: "Chem Lab" },
        { periodNumber: 4, time: "11:10 - 11:55 AM", subject: "Biology", topic: "DNA Transcription & Translation", teacher: "Dr. V. Swaminathan", room: "Bio Lab" },
        { periodNumber: 5, time: "12:45 - 01:30 PM", subject: "NCERT Remediation", topic: "Formative Doubt Solving & Board Work", teacher: "Dr. Rajesh Varma", room: "Smart Room" }
      ]
    },
    {
      day: "Tuesday",
      periods: [
        { periodNumber: 1, time: "08:30 - 09:15 AM", subject: "Mathematics", topic: "Adjoint & Inverse of Matrices", teacher: "Prof. S. Ramanujan", room: "Room 102" },
        { periodNumber: 2, time: "09:20 - 10:05 AM", subject: "Physics", topic: "Electromagnetic Waves & Maxwell Eq", teacher: "Dr. Rajesh Varma", room: "Lab 2" },
        { periodNumber: 3, time: "10:20 - 11:05 AM", subject: "Chemistry", topic: "Haloalkanes SN1 vs SN2 Mechanisms", teacher: "Dr. M. Sen", room: "Chem Lab" },
        { periodNumber: 4, time: "11:10 - 11:55 AM", subject: "Computer Science", topic: "Adaptive Practice Session & Python", teacher: "Mr. K. Sharma", room: "Computer Lab" }
      ]
    },
    {
      day: "Wednesday",
      periods: [
        { periodNumber: 1, time: "08:30 - 09:15 AM", subject: "Chemistry", topic: "Chemical Kinetics & Order of Reaction", teacher: "Dr. M. Sen", room: "Chem Lab" },
        { periodNumber: 2, time: "09:20 - 10:05 AM", subject: "Biology", topic: "Biotechnology Principles & PCR", teacher: "Dr. V. Swaminathan", room: "Bio Lab" },
        { periodNumber: 3, time: "10:20 - 11:05 AM", subject: "Physics", topic: "Ray Optics & Optical Instruments", teacher: "Dr. Rajesh Varma", room: "Lab 2" },
        { periodNumber: 4, time: "11:10 - 11:55 AM", subject: "Mathematics", topic: "Definite Integrals & Area Under Curves", teacher: "Prof. S. Ramanujan", room: "Room 102" }
      ]
    },
    {
      day: "Thursday",
      periods: [
        { periodNumber: 1, time: "08:30 - 09:15 AM", subject: "Physics Lab", topic: "Prism Angle & Refractive Index Practical", teacher: "Dr. Rajesh Varma", room: "Dark Room" },
        { periodNumber: 2, time: "09:20 - 10:05 AM", subject: "Chemistry Lab", topic: "Volumetric Titration & KMnO4 Prep", teacher: "Dr. M. Sen", room: "Chem Lab" },
        { periodNumber: 3, time: "10:20 - 11:05 AM", subject: "Mathematics", topic: "Differential Equations Formulation", teacher: "Prof. S. Ramanujan", room: "Room 102" },
        { periodNumber: 4, time: "11:10 - 11:55 AM", subject: "Biology", topic: "Ecology & Population Genetics", teacher: "Dr. V. Swaminathan", room: "Bio Lab" }
      ]
    },
    {
      day: "Friday",
      periods: [
        { periodNumber: 1, time: "08:30 - 09:15 AM", subject: "Mathematics", topic: "Vectors & 3D Geometry Cross-Products", teacher: "Prof. S. Ramanujan", room: "Room 102" },
        { periodNumber: 2, time: "09:20 - 10:05 AM", subject: "Physics", topic: "Semiconductor Diode & Logic Circuits", teacher: "Dr. Rajesh Varma", room: "Lab 2" },
        { periodNumber: 3, time: "10:20 - 11:05 AM", subject: "Chemistry", topic: "Biomolecules & Peptide Linkages", teacher: "Dr. M. Sen", room: "Chem Lab" },
        { periodNumber: 4, time: "11:10 - 11:55 AM", subject: "Review & Triage", topic: "Weekly Formative Diagnostic Assessment", teacher: "Dr. Rajesh Varma", room: "Smart Room" }
      ]
    }
  ];
  const class12A_Syllabus = [
    {
      unitNumber: 1,
      unitTitle: "Optics & Wave Theory (Physics)",
      subject: "Physics",
      chapters: ["Wave Optics (NCERT Ch 10)", "Ray Optics & Optical Instruments (NCERT Ch 9)"],
      weightageMarks: 18,
      totalPeriods: 28,
      status: "In Progress"
    },
    {
      unitNumber: 2,
      unitTitle: "Integral Calculus & Differential Eq (Maths)",
      subject: "Mathematics",
      chapters: ["Integrals (NCERT Ch 7)", "Applications of Integrals (NCERT Ch 8)", "Differential Equations (NCERT Ch 9)"],
      weightageMarks: 35,
      totalPeriods: 42,
      status: "In Progress"
    },
    {
      unitNumber: 3,
      unitTitle: "Physical & Inorganic Chemistry",
      subject: "Chemistry",
      chapters: ["Solutions (NCERT Ch 1)", "Electrochemistry (NCERT Ch 2)", "Chemical Kinetics (NCERT Ch 3)"],
      weightageMarks: 23,
      totalPeriods: 30,
      status: "Completed"
    },
    {
      unitNumber: 4,
      unitTitle: "Organic Chemistry Mechanisms",
      subject: "Chemistry",
      chapters: ["Haloalkanes & Haloarenes (NCERT Ch 6)", "Alcohols, Phenols & Ethers (NCERT Ch 7)"],
      weightageMarks: 28,
      totalPeriods: 34,
      status: "In Progress"
    },
    {
      unitNumber: 5,
      unitTitle: "Genetics & Molecular Biology",
      subject: "Biology",
      chapters: ["Principles of Inheritance & Variation (NCERT Ch 4)", "Molecular Basis of Inheritance (NCERT Ch 5)"],
      weightageMarks: 20,
      totalPeriods: 26,
      status: "In Progress"
    },
    {
      unitNumber: 6,
      unitTitle: "Biotechnology & Ecology",
      subject: "Biology",
      chapters: ["Biotechnology Principles (NCERT Ch 9)", "Organisms & Populations (NCERT Ch 11)"],
      weightageMarks: 16,
      totalPeriods: 22,
      status: "Upcoming"
    }
  ];
  const sampleClass12A = {
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
    enrolledCount: 3
  };
  const sampleClass11B = {
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
        status: "In Progress"
      },
      {
        unitNumber: 2,
        unitTitle: "Chemical Bonding & VSEPR",
        subject: "Chemistry",
        chapters: ["Structure of Atom (NCERT Ch 2)", "Chemical Bonding (NCERT Ch 4)"],
        weightageMarks: 22,
        totalPeriods: 26,
        status: "In Progress"
      }
    ],
    enrolledStudentIds: [],
    enrolledCount: 0
  };
  const sampleClass10A = {
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
          { periodNumber: 3, time: "10:20 - 11:05 AM", subject: "Science", topic: "Chemical Reactions & Equations", teacher: "Mrs. Sunita Sharma", room: "Room 105" }
        ]
      },
      {
        day: "Tuesday",
        periods: [
          { periodNumber: 1, time: "08:30 - 09:15 AM", subject: "Science", topic: "Life Processes & Photosynthesis", teacher: "Dr. K. Joseph", room: "Room 105" },
          { periodNumber: 2, time: "09:20 - 10:05 AM", subject: "Mathematics", topic: "Quadratic Equations Factoring", teacher: "Mrs. Sunita Sharma", room: "Room 105" }
        ]
      }
    ],
    syllabus: [
      {
        unitNumber: 1,
        unitTitle: "Algebra & Coordinate Geometry",
        subject: "Mathematics",
        chapters: ["Linear Equations (NCERT Ch 3)", "Quadratic Equations (NCERT Ch 4)"],
        weightageMarks: 20,
        totalPeriods: 24,
        status: "In Progress"
      },
      {
        unitNumber: 2,
        unitTitle: "Forces, Energy & Chemical Changes",
        subject: "Science",
        chapters: ["Chemical Reactions (NCERT Ch 1)", "Light: Reflection & Refraction (NCERT Ch 9)"],
        weightageMarks: 25,
        totalPeriods: 30,
        status: "In Progress"
      }
    ],
    enrolledStudentIds: ["student-3"],
    enrolledCount: 1
  };
  const sampleClass9A = {
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
          { periodNumber: 2, time: "09:20 - 10:05 AM", subject: "Science", topic: "Matter in Our Surroundings", teacher: "Mr. R. Nair", room: "Room 104" }
        ]
      }
    ],
    syllabus: [
      {
        unitNumber: 1,
        unitTitle: "Number Systems & Polynomials",
        subject: "Mathematics",
        chapters: ["Number Systems (NCERT Ch 1)", "Polynomials (NCERT Ch 2)"],
        weightageMarks: 22,
        totalPeriods: 25,
        status: "In Progress"
      }
    ],
    enrolledStudentIds: [],
    enrolledCount: 0
  };
  db.classes.set(sampleClass12A.classCode, sampleClass12A);
  db.classes.set(sampleClass11B.classCode, sampleClass11B);
  db.classes.set(sampleClass10A.classCode, sampleClass10A);
  db.classes.set(sampleClass9A.classCode, sampleClass9A);
  const teacher1 = {
    id: "teacher-1",
    name: "Dr. Rajesh Varma",
    email: "rajesh.varma@school.edu.in",
    password: "teacher123",
    role: "teacher",
    department: "Senior Physics & Science HOD",
    school: "Kendriya Vidyalaya No. 1, Model Cluster",
    classes: [sampleClass12A, sampleClass11B]
  };
  const teacher2 = {
    id: "teacher-2",
    name: "Mrs. Sunita Sharma",
    email: "sunita.sharma@school.edu.in",
    password: "teacher123",
    role: "teacher",
    department: "Secondary Mathematics Lead",
    school: "Kendriya Vidyalaya No. 1, Model Cluster",
    classes: [sampleClass10A]
  };
  db.teachers.set(teacher1.id, teacher1);
  db.teachers.set(teacher2.id, teacher2);
  const sampleStudents = [
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
          lastAttemptedAt: "Today"
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
          lastAttemptedAt: "Today"
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
          lastAttemptedAt: "Yesterday"
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
          lastAttemptedAt: "2 days ago"
        }
      ]
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
          lastAttemptedAt: "Today"
        },
        {
          topicId: "wave-optics",
          topicName: "Wave Optics & Young's Double Slit",
          subject: "Physics",
          gradeLevel: "Grade 11-12",
          masteryPercentage: 82,
          recentStreak: 2,
          weakConcepts: ["Fringe width \u03B2 = \u03BBD/d in medium of refractive index \u03BC"],
          attemptsCount: 11,
          lastAttemptedAt: "Yesterday"
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
          lastAttemptedAt: "Today"
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
          lastAttemptedAt: "2 days ago"
        }
      ]
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
          lastAttemptedAt: "Today"
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
          lastAttemptedAt: "Today"
        }
      ]
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
          lastAttemptedAt: "Today"
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
          lastAttemptedAt: "Yesterday"
        }
      ]
    }
  ];
  sampleStudents.forEach((s) => db.students.set(s.id, s));

  // Seed Classroom Resources
  const initialClassResources = [
    {
      id: "res-c1",
      classCode: "NCERT-12A",
      title: "Wave Optics Formula Sheet & Young's Double Slit Derivation",
      subject: "Physics",
      gradeLevel: "Grade 11-12",
      chapter: "Chapter 10: Wave Optics",
      keyConcepts: ["wave optics", "youngs double slit", "fringe width", "constructive interference", "destructive interference", "path difference"],
      content: `Classroom Formula & Derivation Guide:
- Condition for Bright Fringes (Maxima): Path difference Δx = n·λ (n = 0, 1, 2...). Fringe position: y_n = (n·λ·D)/d.
- Condition for Dark Fringes (Minima): Path difference Δx = (2n-1)·(λ/2) (n = 1, 2...). Fringe position: y_n' = (2n-1)·(λ·D)/(2d).
- Fringe width: β = (λ·D)/d. Uniform for monochromatic light.
- If placed in medium of refractive index μ: β' = β / μ.`,
      sharedBy: "Dr. Rajesh Varma",
      sharedByRole: "teacher",
      createdAt: "2 days ago",
      downloadCount: 28
    },
    {
      id: "res-c2",
      classCode: "NCERT-12A",
      title: "Integration by Parts ILATE Cheat Sheet & Solved Board Examples",
      subject: "Mathematics",
      gradeLevel: "Grade 11-12",
      chapter: "Chapter 7: Integrals",
      keyConcepts: ["integrals", "integration by parts", "ILATE rule", "partial fractions", "indefinite integral"],
      content: `ILATE Integration Workflow:
∫ u·v dx = u ∫ v dx - ∫ [ u' · (∫ v dx) ] dx
Priority list: Inverse Trig > Log > Algebraic > Trig > Exponential.
Exam Tip: For ∫ ln(x) dx, treat as ∫ (ln x) · 1 dx with u = ln x and v = 1!
Result: x ln(x) - x + C.`,
      sharedBy: "Aarav Patel",
      sharedByRole: "student",
      createdAt: "Yesterday",
      downloadCount: 19
    },
    {
      id: "res-c3",
      classCode: "NCERT-12A",
      title: "Electrochemistry Nernst Equation & Gibbs Free Energy Core Notes",
      subject: "Chemistry",
      gradeLevel: "Grade 11-12",
      chapter: "Chapter 3: Electrochemistry",
      keyConcepts: ["electrochemistry", "nernst equation", "emf of cell", "gibbs free energy", "galvanic cell"],
      content: `At standard 298 K:
E_cell = E°_cell - (0.0591 / n) · log10( [Products] / [Reactants] )
ΔG° = -n · F · E°_cell
For a spontaneous cell reaction, E°_cell must be positive and ΔG° must be negative.`,
      sharedBy: "Dr. Rajesh Varma",
      sharedByRole: "teacher",
      createdAt: "3 days ago",
      downloadCount: 24
    },
    {
      id: "res-c4",
      classCode: "JNV-11A",
      title: "Kinematics & Projectile Motion Complete Derivations",
      subject: "Physics",
      gradeLevel: "Grade 11-12",
      chapter: "Chapter 4: Motion in a Plane",
      keyConcepts: ["kinematics", "projectile motion", "time of flight", "maximum height", "horizontal range"],
      content: `Time of flight T = (2 u sin θ) / g
Max height H = (u² sin² θ) / (2g)
Range R = (u² sin 2θ) / g. Max range at θ = 45°.`,
      sharedBy: "Prof. S. Ramanujan",
      sharedByRole: "teacher",
      createdAt: "4 days ago",
      downloadCount: 15
    }
  ];

  initialClassResources.forEach((res) => {
    if (!db.classroomResources.has(res.classCode)) {
      db.classroomResources.set(res.classCode, []);
    }
    db.classroomResources.get(res.classCode).push(res);
  });

  // Seed Library Resource Dumps (uploaded by students and teachers)
  db.resourceDumps = [
    {
      id: "dump-1",
      title: "Comprehensive Nucleophilic Substitution (SN1 vs SN2) Comparison Matrix",
      subject: "Chemistry",
      gradeLevel: "Grade 11-12",
      chapter: "Chapter 10: Haloalkanes and Haloarenes",
      tags: ["organic chemistry", "SN1", "SN2", "carbocation", "walden inversion", "reaction kinetics"],
      content: `SN1 vs SN2 Comprehensive Breakdown:
1. Kinetics: SN1 is first order (Rate = k[R-X]), SN2 is second order (Rate = k[R-X][Nu-]).
2. Intermediate: SN1 forms planar carbocation intermediate (allows racemization), SN2 proceeds via concerted 5-coordinate transition state (100% Walden inversion).
3. Substrate Reactivity:
   - SN1: 3° > 2° > 1° > CH3-X (governed by carbocation stability).
   - SN2: CH3-X > 1° > 2° > 3° (governed by steric hindrance).
4. Solvents: Polar protic favors SN1; polar aprotic (Acetone, DMSO) favors SN2.`,
      uploadedBy: "Dr. Rajesh Varma",
      uploadedByRole: "teacher",
      instituteName: "Kendriya Vidyalaya No. 1, Model Cluster",
      fileType: "text/markdown",
      readCount: 142,
      createdAt: "3 days ago"
    },
    {
      id: "dump-2",
      title: "Newton's Laws of Motion & Momentum Practical Problem Solving Notes",
      subject: "Physics",
      gradeLevel: "Grade 9-10",
      chapter: "Chapter 9: Force and Laws of Motion",
      tags: ["physics", "force", "momentum", "F=ma", "inertia", "conservation of momentum"],
      content: `Problem Solving Steps for Newton's 2nd Law:
1. Draw Free Body Diagram (FBD) for all forces acting on the body.
2. Resolve forces along axes of motion: Σ F_net = m · a.
3. Law of Conservation of Linear Momentum: In the absence of external force, total initial momentum = total final momentum (m1·u1 + m2·u2 = m1·v1 + m2·v2).
4. Impulse = Force × time = Change in momentum (Δp).`,
      uploadedBy: "Priya Sharma",
      uploadedByRole: "student",
      instituteName: "Kendriya Vidyalaya No. 1, Model Cluster",
      fileType: "text/markdown",
      readCount: 98,
      createdAt: "2 days ago"
    },
    {
      id: "dump-3",
      title: "Plant Physiology & Photosynthesis Light vs Dark Reaction Summary",
      subject: "Biology",
      gradeLevel: "Grade 11-12",
      chapter: "Chapter 13: Photosynthesis in Higher Plants",
      tags: ["biology", "photosynthesis", "calvin cycle", "z scheme", "rubisco", "atp nadph"],
      content: `Photosynthesis Light vs Dark Reaction Summary:
- Light Reaction (Thylakoid): Photolysis of water (2 H2O -> 4 H+ + O2 + 4 e-), non-cyclic photophosphorylation generates ATP and NADPH via Photosystems II and I.
- Dark Reaction / Calvin Cycle (Stroma): Uses ATP and NADPH to fix CO2 into glucose.
- 6 turns of Calvin cycle are required for 1 glucose molecule, consuming 6 CO2, 18 ATP, and 12 NADPH.
- Key enzyme: RuBisCO (Ribulose-1,5-bisphosphate carboxylase-oxygenase).`,
      uploadedBy: "Dr. Sunita Sharma",
      uploadedByRole: "teacher",
      instituteName: "Sarvodaya Kanya Vidyalaya No. 2",
      fileType: "text/markdown",
      readCount: 115,
      createdAt: "4 days ago"
    },
    {
      id: "dump-4",
      title: "Limits and First Principle Derivatives Quick Reference Guide",
      subject: "Mathematics",
      gradeLevel: "Grade 11-12",
      chapter: "Chapter 13: Limits and Derivatives",
      tags: ["calculus", "derivatives", "first principle", "limits", "differentiation"],
      content: `Definition: f'(x) = lim (h->0) [ f(x+h) - f(x) ] / h
Key Limits:
- lim (x->0) [ sin x / x ] = 1
- lim (x->0) [ (e^x - 1) / x ] = 1
- lim (x->a) [ (x^n - a^n) / (x - a) ] = n · a^(n-1)`,
      uploadedBy: "Rohan Sen",
      uploadedByRole: "student",
      instituteName: "Delhi Public School, Sector 12",
      fileType: "text/markdown",
      readCount: 88,
      createdAt: "5 days ago"
    }
  ];

  // Seed Institutional Community Posts & Doubts
  db.communityPosts = [
    {
      id: "post-1",
      instituteName: "Kendriya Vidyalaya No. 1, Model Cluster",
      title: "Why does fringe width remain constant in Young's Double Slit experiment for monochromatic light?",
      content: "I was solving the wave optics assignment from Dr. Varma's class. Could someone clarify why the spacing between consecutive dark fringes is identical to the spacing between bright fringes throughout?",
      subject: "Physics",
      gradeLevel: "Grade 11-12",
      authorName: "Aarav Patel",
      authorRole: "student",
      authorId: "student-1",
      tags: ["wave optics", "youngs double slit", "fringe width"],
      upvotes: 6,
      upvotedBy: ["student-2", "teacher-1"],
      createdAt: "1 day ago",
      answers: [
        {
          id: "ans-1",
          authorName: "Dr. Rajesh Varma",
          authorRole: "teacher",
          authorId: "teacher-1",
          content: "Great question Aarav! The fringe width formula is β = (λ · D) / d. Since λ (wavelength of monochromatic source), D (distance between slit plane and screen), and d (separation between the two coherent slits) are all constants for the apparatus, the path difference increases by exactly 1λ for each successive order. Hence, every fringe has the exact same width β.",
          isVerified: true,
          upvotes: 8,
          upvotedBy: ["student-1", "student-2"],
          createdAt: "18 hours ago"
        },
        {
          id: "ans-2",
          authorName: "Priya Sharma",
          authorRole: "student",
          authorId: "student-2",
          content: "Also remember from today's class that if we immerse the entire setup in water (refractive index μ = 4/3), the new fringe width becomes β' = β / μ = 0.75 β, so fringes become narrower!",
          isVerified: false,
          upvotes: 4,
          upvotedBy: ["student-1"],
          createdAt: "14 hours ago"
        }
      ]
    },
    {
      id: "post-2",
      instituteName: "Kendriya Vidyalaya No. 1, Model Cluster",
      title: "How do we distinguish between SN1 and SN2 for secondary alkyl halides in board exams?",
      content: "Secondary (2°) alkyl halides can undergo both SN1 and SN2 reactions. What are the key deciding factors like solvent, temperature, and nucleophile strength that we should look for in test questions?",
      subject: "Chemistry",
      gradeLevel: "Grade 11-12",
      authorName: "Priya Sharma",
      authorRole: "student",
      authorId: "student-2",
      tags: ["organic chemistry", "SN1 vs SN2", "reaction mechanism"],
      upvotes: 7,
      upvotedBy: ["student-1", "teacher-1"],
      createdAt: "2 days ago",
      answers: [
        {
          id: "ans-3",
          authorName: "Dr. Rajesh Varma",
          authorRole: "teacher",
          authorId: "teacher-1",
          content: "For 2° alkyl halides, look at the reaction environment: 1) Strong nucleophiles (like OH⁻, RO⁻, CN⁻) in polar aprotic solvents (Acetone, DMSO) strongly favor SN2 with inversion of configuration. 2) Weak nucleophiles (like H2O, ROH) in polar protic solvents favor carbocation ionization and thus SN1 with racemization.",
          isVerified: true,
          upvotes: 9,
          upvotedBy: ["student-1", "student-2"],
          createdAt: "1 day ago"
        }
      ]
    },
    {
      id: "post-3",
      instituteName: "Sarvodaya Kanya Vidyalaya No. 2",
      title: "Tips for choosing u(x) and v(x) in Integration by Parts using ILATE rule?",
      content: "When integrating expressions like x · ln(x) or x · sin(x), why is the priority order strict? Does reversing it break the integral?",
      subject: "Mathematics",
      gradeLevel: "Grade 11-12",
      authorName: "Sunita Rao",
      authorRole: "student",
      authorId: "student-3",
      tags: ["calculus", "integrals", "ILATE rule"],
      upvotes: 5,
      upvotedBy: ["teacher-3"],
      createdAt: "3 days ago",
      answers: [
        {
          id: "ans-4",
          authorName: "Dr. Sunita Sharma",
          authorRole: "teacher",
          authorId: "teacher-3",
          content: "ILATE stands for Inverse, Log, Algebraic, Trig, Exponential. The function appearing earlier should be chosen as u(x) so that its derivative du/dx simplifies upon differentiation (for example d/dx(ln x) = 1/x simplifies an algebraic power). If you reverse it for x · ln(x), you'd have to integrate ln(x), which complicates the second term instead of simplifying it!",
          isVerified: true,
          upvotes: 7,
          upvotedBy: ["student-3"],
          createdAt: "2 days ago"
        }
      ]
    }
  ];
}
seedInitialData();

function retrieveRelevantOerDocs(query, gradeLevel, classCode, instituteName) {
  const queryWords = query.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 2);
  
  // 1. Gather all searchable items: Corpus + Classroom shared resources + Resource dumps
  const allDocs = [];

  // Core curriculum
  OER_CORPUS.forEach((doc) => {
    allDocs.push({
      ...doc,
      docType: "curriculum",
      sourceTypeLabel: "Open Curriculum Core",
      mediaType: "text",
      mediaData: null,
      mediaMeta: null
    });
  });

  // Classroom-specific shared resources
  if (classCode && db.classroomResources.has(classCode)) {
    const classDocs = db.classroomResources.get(classCode);
    classDocs.forEach((cd) => {
      allDocs.push({
        id: cd.id,
        title: cd.title,
        publisher: `Classroom Shared Resource (${cd.sharedByRole === 'teacher' ? 'Teacher: ' : 'Student: '}${cd.sharedBy})`,
        subject: cd.subject,
        gradeLevel: cd.gradeLevel,
        chapter: cd.chapter,
        section: `Shared in Class ${classCode}`,
        pageOrRef: `Classroom Reference Module [${cd.sharedBy}]`,
        license: "Classroom Open Share (Teacher & Student Resource)",
        keyConcepts: cd.keyConcepts || [],
        summary: `Shared notes by ${cd.sharedBy} (${cd.sharedByRole}) in class ${classCode}. ${cd.mediaType !== 'text' ? `[Includes ${cd.mediaType.toUpperCase()} file]` : ''}`,
        content: cd.content || cd.aiExtractedContent || "",
        aiExtractedContent: cd.aiExtractedContent,
        mediaType: cd.mediaType || "text",
        mediaData: cd.mediaData || null,
        mediaMeta: cd.mediaMeta || null,
        docType: "classroom_resource",
        sourceTypeLabel: `Classroom Notes (${cd.sharedBy})`,
        classCode
      });
    });
  }

  // Library Resource Dumps
  if (db.resourceDumps && db.resourceDumps.length > 0) {
    db.resourceDumps.forEach((rd) => {
      allDocs.push({
        id: rd.id,
        title: rd.title,
        publisher: `Library Resource Dump (${rd.uploadedByRole === 'teacher' ? 'Teacher: ' : 'Student: '}${rd.uploadedBy})`,
        subject: rd.subject,
        gradeLevel: rd.gradeLevel,
        chapter: rd.chapter,
        section: `Library Dump - ${rd.instituteName}`,
        pageOrRef: `Community Repository [${rd.uploadedBy}]`,
        license: "Open Educational Resource Dump",
        keyConcepts: rd.tags || rd.keyConcepts || [],
        summary: `Uploaded resource by ${rd.uploadedBy} from ${rd.instituteName}. ${rd.mediaType !== 'text' ? `[Includes ${rd.mediaType.toUpperCase()} file]` : ''}`,
        content: rd.content || rd.aiExtractedContent || "",
        aiExtractedContent: rd.aiExtractedContent,
        mediaType: rd.mediaType || "text",
        mediaData: rd.mediaData || null,
        mediaMeta: rd.mediaMeta || null,
        docType: "resource_dump",
        sourceTypeLabel: `Library Dump (${rd.uploadedBy})`,
        instituteName: rd.instituteName
      });
    });
  }

  const scored = allDocs.map((doc) => {
    let score = 0;
    const docFullText = `${doc.title} ${doc.chapter} ${doc.section} ${(doc.keyConcepts || []).join(" ")} ${doc.content} ${doc.aiExtractedContent || ""} ${doc.summary}`.toLowerCase();
    for (const concept of (doc.keyConcepts || [])) {
      if (query.toLowerCase().includes(concept.toLowerCase())) {
        score += 30;
      }
    }
    for (const word of queryWords) {
      if (docFullText.includes(word)) {
        score += 6;
      }
    }
    if (gradeLevel && doc.gradeLevel && doc.gradeLevel.toLowerCase().includes(gradeLevel.toLowerCase().slice(0, 7))) {
      score += 10;
    }
    // High priority for classroom-shared resources in this class
    if (doc.docType === "classroom_resource" && classCode && doc.classCode === classCode) {
      score += 35;
    }
    // Boost for resource dumps from the same institute
    if (doc.docType === "resource_dump" && instituteName && doc.instituteName === instituteName) {
      score += 20;
    }
    return { doc, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const topMatches = scored.filter((item) => item.score > 10).slice(0, 4);
  const selected = topMatches.length > 0 ? topMatches : scored.slice(0, 2);
  const citations = selected.map(({ doc, score }) => ({
    id: `cite-${doc.id}`,
    sourceName: doc.title,
    publisher: doc.publisher,
    chapter: doc.chapter,
    section: doc.section,
    pageOrRef: doc.pageOrRef,
    license: doc.license,
    excerptSnippet: (doc.content || doc.aiExtractedContent || "").slice(0, 220) + "...",
    mediaType: doc.mediaType || "text",
    mediaData: doc.mediaData || null,
    mediaMeta: doc.mediaMeta || null,
    docType: doc.docType || "curriculum",
    relevanceScore: Math.min(99, Math.max(65, score * 3))
  }));

  return {
    docs: selected.map((s) => s.doc),
    citations
  };
}
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    aiEnabled: !!process.env.GEMINI_API_KEY,
    oerDocsCount: OER_CORPUS.length,
    scholarshipsCount: SCHOLARSHIP_SCHEMES.length,
    activeStudents: db.students.size,
    activeTeachers: db.teachers.size,
    activeClasses: db.classes.size,
    activeInstitutes: db.institutes.size
  });
});
app.get("/api/institutes", (_req, res) => {
  const institutesList = Array.from(db.institutes.values());
  res.json({ institutes: institutesList });
});
app.post("/api/institutes", (req, res) => {
  const { name, type = "School / Educational Institute", location = "National", addedBy = "Teacher" } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Institute name is required." });
  }
  const cleanName = name.trim();
  const existing = Array.from(db.institutes.values()).find(
    (i) => i.name.toLowerCase() === cleanName.toLowerCase()
  );
  if (existing) {
    return res.json({ institute: existing, message: "Institute already exists in database." });
  }
  const newInst = {
    id: `inst-${Date.now()}`,
    name: cleanName,
    type: type.trim() || "School / Educational Institute",
    location: location.trim() || "India",
    addedBy: addedBy || "Teacher",
    classesCount: 0,
    teachersCount: 1,
    createdAt: new Date().toISOString()
  };
  db.institutes.set(newInst.id, newInst);
  res.status(201).json({ success: true, institute: newInst, message: `Institute "${cleanName}" registered successfully!` });
});
app.get("/api/teachers", (_req, res) => {
  const teachersList = Array.from(db.teachers.values()).map((t) => ({
    id: t.id,
    name: t.name,
    email: t.email,
    department: t.department,
    school: t.school || t.institute || "Kendriya Vidyalaya No. 1",
    institute: t.institute || t.school || "Kendriya Vidyalaya No. 1",
    classes: Array.from(db.classes.values()).filter((c) => c.teacherId === t.id)
  }));
  res.json({ teachers: teachersList });
});
function validateClassCodeMatch(studentClass, classInfo) {
  if (!studentClass) {
    return { valid: false, reason: "Please select your enrolled class (e.g. Class 12, Class 11, Class 10)." };
  }
  const studentDigitsMatch = studentClass.match(/\b(12|11|10|9|8|7|6)\b/i) || studentClass.match(/(12|11|10|9|8|7|6)/i);
  const studentNum = studentDigitsMatch ? studentDigitsMatch[1] : "";
  const targetDigitsMatch = (classInfo.targetClass || "").match(/\b(12|11|10|9|8|7|6)\b/i) || classInfo.classCode.match(/(12|11|10|9|8|7|6)/i) || classInfo.className.match(/\bclass\s*(12|11|10|9|8|7|6)\b/i);
  const targetNum = targetDigitsMatch ? targetDigitsMatch[1] : "";
  if (studentNum && targetNum) {
    if (studentNum !== targetNum) {
      return {
        valid: false,
        reason: `Class Mismatch: You selected Class ${studentNum}, but Class Code "${classInfo.classCode}" is for Class ${targetNum} (${classInfo.className}). Students are strictly allowed to join only the class matching their enrolled grade level.`
      };
    }
    return { valid: true };
  }
  if (classInfo.targetClass && studentClass.trim().toLowerCase() !== classInfo.targetClass.trim().toLowerCase()) {
    return {
      valid: false,
      reason: `Class Mismatch: You selected "${studentClass}", but Class Code "${classInfo.classCode}" is for "${classInfo.targetClass}".`
    };
  }
  return { valid: true };
}
function generateClassMasteryList(studentClass, gradeLevel) {
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
        lastAttemptedAt: "Registered Today"
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
        lastAttemptedAt: "Registered Today"
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
        lastAttemptedAt: "Registered Today"
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
        lastAttemptedAt: "Registered Today"
      }
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
        lastAttemptedAt: "Registered Today"
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
        lastAttemptedAt: "Registered Today"
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
        lastAttemptedAt: "Registered Today"
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
        lastAttemptedAt: "Registered Today"
      }
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
        lastAttemptedAt: "Registered Today"
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
        lastAttemptedAt: "Registered Today"
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
        lastAttemptedAt: "Registered Today"
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
        lastAttemptedAt: "Registered Today"
      }
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
        lastAttemptedAt: "Registered Today"
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
        lastAttemptedAt: "Registered Today"
      }
    ];
  }
}
app.post("/api/auth/login", (req, res) => {
  const { role, identifier, password } = req.body;
  if (!identifier || !String(identifier).trim()) {
    return res.status(400).json({ error: "Please provide your email or username/ID." });
  }
  if (!password) {
    return res.status(400).json({ error: "Please enter your password." });
  }

  const cleanId = String(identifier).trim().toLowerCase();

  if (role === "teacher") {
    const teachersList = Array.from(db.teachers.values());
    const teacher = teachersList.find(
      (t) =>
        t.id.toLowerCase() === cleanId ||
        t.email.toLowerCase() === cleanId ||
        t.name.toLowerCase() === cleanId
    );
    if (!teacher) {
      return res.status(401).json({ error: "Invalid credentials. No teacher account found with that email or ID." });
    }
    const expectedPassword = teacher.password || "teacher123";
    if (password !== expectedPassword) {
      return res.status(401).json({ error: "Incorrect password for this teacher account." });
    }
    const authUser = {
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      role: "teacher",
      school: teacher.school || teacher.institute || "Kendriya Vidyalaya No. 1",
      institute: teacher.institute || teacher.school || "Kendriya Vidyalaya No. 1",
      teacherProfile: teacher
    };
    return res.json({
      user: authUser,
      teacherProfile: teacher,
      classes: Array.from(db.classes.values()).filter((c) => c.teacherId === teacher.id)
    });
  } else {
    const studentsList = Array.from(db.students.values());
    const student = studentsList.find(
      (s) =>
        s.id.toLowerCase() === cleanId ||
        s.email.toLowerCase() === cleanId ||
        s.name.toLowerCase() === cleanId
    );
    if (!student) {
      return res.status(401).json({ error: "Invalid credentials. No student account found with that email or ID." });
    }
    const expectedPassword = student.password || "password123";
    if (password !== expectedPassword) {
      return res.status(401).json({ error: "Incorrect password for this student account." });
    }
    const classInfo = db.classes.get(student.classCode);
    const enrichedStudent = {
      ...student,
      classInfo,
      institute: student.institute || student.school || classInfo?.school || "Kendriya Vidyalaya No. 1, Model Cluster",
      school: student.school || student.institute || classInfo?.school || "Kendriya Vidyalaya No. 1, Model Cluster"
    };
    const authUser = {
      id: student.id,
      name: student.name,
      email: student.email,
      role: "student",
      classCode: student.classCode,
      institute: enrichedStudent.institute,
      school: enrichedStudent.school,
      studentProfile: enrichedStudent
    };
    return res.json({
      user: authUser,
      studentProfile: enrichedStudent,
      classInfo
    });
  }
});
app.get("/api/class/:code", (req, res) => {
  const code = req.params.code.trim().toUpperCase();
  const classInfo = db.classes.get(code);
  if (!classInfo) {
    return res.status(404).json({
      error: `Invalid Class Code "${code}". Please check with your teacher for the correct code (e.g., NCERT-12A).`
    });
  }
  res.json({ classInfo });
});
app.post("/api/auth/register-teacher", (req, res) => {
  const {
    name,
    email,
    password,
    department = "Senior Science & Mathematics",
    instituteName,
    isNewInstitute = false,
    instituteType = "Government / Private School",
    instituteLocation = "National",
    initialClassGrade = "Class 12",
    initialStream = "Science (PCM / PCB)"
  } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Teacher full name is required." });
  }
  if (!email || !email.trim()) {
    return res.status(400).json({ error: "Teacher email address is required." });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long." });
  }
  if (!instituteName || !instituteName.trim()) {
    return res.status(400).json({ error: "Institute name is required. Please select or register your institute." });
  }

  const cleanInstituteName = instituteName.trim();
  let targetInstitute = Array.from(db.institutes.values()).find(
    (i) => i.name.toLowerCase() === cleanInstituteName.toLowerCase()
  );

  if (!targetInstitute) {
    // Teachers have permission to register a new institute
    targetInstitute = {
      id: `inst-${Date.now()}`,
      name: cleanInstituteName,
      type: instituteType.trim() || "School / Educational Institute",
      location: instituteLocation.trim() || "India",
      addedBy: name.trim(),
      classesCount: 1,
      teachersCount: 1,
      createdAt: new Date().toISOString()
    };
    db.institutes.set(targetInstitute.id, targetInstitute);
  } else {
    targetInstitute.teachersCount = (targetInstitute.teachersCount || 0) + 1;
    targetInstitute.classesCount = (targetInstitute.classesCount || 0) + 1;
  }

  const teacherId = `teacher-${Date.now()}`;
  const initials = name.trim().split(/\s+/).map((n) => n[0]).join("").toUpperCase().slice(0, 3) || "TCH";
  const gradeNum = initialClassGrade.match(/\d+/)?.[0] || "12";
  const generatedClassCode = `NCERT-${gradeNum}${initials}${Math.floor(10 + Math.random() * 90)}`;

  const initialClass = {
    classCode: generatedClassCode,
    className: `${initialClassGrade}-A ${initialStream}`,
    targetClass: initialClassGrade,
    gradeLevel: initialClassGrade === "Class 10" || initialClassGrade === "Class 9" ? "Grade 9-10" : initialClassGrade === "Class 8" || initialClassGrade === "Class 7" || initialClassGrade === "Class 6" ? "Grade 6-8" : "Grade 11-12",
    stream: initialStream,
    curriculum: "NCERT / CBSE National Curriculum Framework 2024-25",
    school: cleanInstituteName,
    institute: cleanInstituteName,
    teacherId,
    teacherName: name.trim(),
    academicYear: "2024-2025",
    subjects: initialStream.includes("Science") ? ["Physics", "Chemistry", "Mathematics", "Biology"] : ["Mathematics", "Science"],
    timetable: [
      {
        day: "Monday",
        periods: [
          { periodNumber: 1, time: "08:30 - 09:15 AM", subject: "Core Concept", topic: "NCERT Foundation & Diagnostic Assessment", teacher: name.trim(), room: "Room 101" },
          { periodNumber: 2, time: "09:20 - 10:05 AM", subject: "Guided Practice", topic: "Formative Problem Solving", teacher: name.trim(), room: "Lab" }
        ]
      }
    ],
    syllabus: [
      {
        unitNumber: 1,
        unitTitle: "Unit 1: Core Curriculum Mastery",
        subject: "Core Subject",
        chapters: ["Chapter 1: Principles & Foundations", "Chapter 2: Formulas & Applications"],
        weightageMarks: 25,
        totalPeriods: 30,
        status: "In Progress"
      }
    ],
    enrolledStudentIds: [],
    enrolledCount: 0
  };

  db.classes.set(initialClass.classCode, initialClass);

  const newTeacher = {
    id: teacherId,
    name: name.trim(),
    email: email.trim(),
    password,
    role: "teacher",
    department: department.trim(),
    school: cleanInstituteName,
    institute: cleanInstituteName,
    classes: [initialClass]
  };

  db.teachers.set(teacherId, newTeacher);

  const authUser = {
    id: newTeacher.id,
    name: newTeacher.name,
    email: newTeacher.email,
    role: "teacher",
    school: cleanInstituteName,
    institute: cleanInstituteName,
    teacherProfile: newTeacher
  };

  res.status(201).json({
    success: true,
    user: authUser,
    teacherProfile: newTeacher,
    classes: [initialClass],
    message: `Welcome, ${name}! Your teacher account and class code ${generatedClassCode} for ${cleanInstituteName} have been registered.`
  });
});
app.post("/api/auth/register-student", (req, res) => {
  const {
    name,
    email,
    password,
    studentClass,
    classCode,
    instituteName,
    primaryLanguage = "en",
    category = "General",
    gender = "Other",
    familyIncomeBracket = "< 1.5 Lakhs/yr",
    academicScorePercent = 75,
    firstGenerationLearner = true,
    stateOrRegion = "National"
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
  if (!instituteName || !instituteName.trim()) {
    return res.status(400).json({
      error: "Please select your institute from the dropdown menu. Students can only join existing registered institutes."
    });
  }

  const cleanInstituteName = instituteName.trim();
  const existingInstitute = Array.from(db.institutes.values()).find(
    (i) => i.name.toLowerCase() === cleanInstituteName.toLowerCase()
  );
  if (!existingInstitute) {
    return res.status(400).json({
      error: `Institute "${cleanInstituteName}" is not registered in the system. Students can only select existing registered institutes. Please ask your teacher to sign up your institute.`
    });
  }

  const cleanCode = classCode.trim().toUpperCase();
  const classInfo = db.classes.get(cleanCode);
  if (!classInfo) {
    return res.status(400).json({
      error: `Class Code "${cleanCode}" was not found. Please verify the code provided by your teacher (e.g. NCERT-12A).`
    });
  }
  const matchResult = validateClassCodeMatch(studentClass, classInfo);
  if (!matchResult.valid) {
    return res.status(400).json({
      error: matchResult.reason || "Your selected class does not match the class code. You cannot join this class."
    });
  }
  let resolvedGradeLevel = classInfo.gradeLevel;
  if (/12|11/.test(studentClass)) {
    resolvedGradeLevel = "Grade 11-12";
  } else if (/10|9/.test(studentClass)) {
    resolvedGradeLevel = "Grade 9-10";
  } else if (/8|7|6/.test(studentClass)) {
    resolvedGradeLevel = "Grade 6-8";
  }
  const studentId = `student-${Date.now()}`;
  const avatarSeed = name.toLowerCase().replace(/[^a-z]/g, "").slice(0, 8) || "student";
  const initialMastery = generateClassMasteryList(studentClass, resolvedGradeLevel);
  const newStudent = {
    id: studentId,
    name,
    email,
    password,
    role: "student",
    classCode: cleanCode,
    studentClass,
    classInfo,
    gradeLevel: resolvedGradeLevel,
    institute: cleanInstituteName,
    school: cleanInstituteName,
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
    masteryList: initialMastery
  };
  db.students.set(studentId, newStudent);
  if (!classInfo.enrolledStudentIds.includes(studentId)) {
    classInfo.enrolledStudentIds.push(studentId);
    classInfo.enrolledCount = classInfo.enrolledStudentIds.length;
  }
  const authUser = {
    id: studentId,
    name: newStudent.name,
    email: newStudent.email,
    role: "student",
    classCode: cleanCode,
    institute: cleanInstituteName,
    school: cleanInstituteName,
    studentProfile: newStudent
  };
  res.json({
    success: true,
    user: authUser,
    student: newStudent,
    classInfo,
    message: `Successfully registered for ${classInfo.className} at ${cleanInstituteName} under ${classInfo.teacherName}!`
  });
});
app.get("/api/teacher/classes", (req, res) => {
  const teacherId = req.query.teacherId || "teacher-1";
  const teacherClasses = Array.from(db.classes.values()).filter(
    (c) => !teacherId || c.teacherId === teacherId
  );
  res.json({ classes: teacherClasses });
});
app.post("/api/teacher/create-class", (req, res) => {
  const {
    className,
    gradeLevel = "Grade 11-12",
    stream = "Science",
    teacherId = "teacher-1",
    teacherName = "Dr. Rajesh Varma",
    school = "Kendriya Vidyalaya No. 1",
    customCode
  } = req.body;
  const generatedCode = customCode ? customCode.trim().toUpperCase() : `NCERT-${Math.floor(100 + Math.random() * 900)}`;
  if (db.classes.has(generatedCode)) {
    return res.status(400).json({
      error: `Class code ${generatedCode} already exists. Please choose a different code.`
    });
  }
  const newClass = {
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
            room: "Room 101"
          },
          {
            periodNumber: 2,
            time: "09:20 - 10:05 AM",
            subject: "Mathematics",
            topic: "NCERT Foundation Chapter 1",
            teacher: "Prof. S. Ramanujan",
            room: "Room 101"
          }
        ]
      }
    ],
    syllabus: [
      {
        unitNumber: 1,
        unitTitle: "Unit 1: Core NCERT Foundations",
        subject: "Science & Math",
        chapters: ["Chapter 1: Theory & Principles", "Chapter 2: Methods & Equations"],
        weightageMarks: 25,
        totalPeriods: 30,
        status: "In Progress"
      }
    ],
    enrolledStudentIds: [],
    enrolledCount: 0
  };
  db.classes.set(generatedCode, newClass);
  const teacher = db.teachers.get(teacherId);
  if (teacher) {
    teacher.classes.push(newClass);
  }
  res.json({ success: true, classInfo: newClass });
});
app.get("/api/student/me", (req, res) => {
  const studentId = req.query.id || "student-1";
  const student = db.students.get(studentId);
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }
  const classInfo = db.classes.get(student.classCode);
  res.json({
    student: { ...student, classInfo },
    classInfo
  });
});
app.get("/api/students", (req, res) => {
  const { classCode } = req.query;
  let students = Array.from(db.students.values());
  if (classCode) {
    students = students.filter((s) => s.classCode === String(classCode).toUpperCase());
  }
  res.json({ students });
});
app.get("/api/students/:id", (req, res) => {
  const student = db.students.get(req.params.id);
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }
  const classInfo = db.classes.get(student.classCode);
  res.json({ student: { ...student, classInfo } });
});
app.put("/api/students/:id", (req, res) => {
  const student = db.students.get(req.params.id);
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }
  const updated = { ...student, ...req.body };
  db.students.set(req.params.id, updated);
  res.json({ student: updated });
});
// ==========================================
// CLASSROOM RESOURCES (TEACHER & STUDENT SHARING)
// ==========================================
app.get("/api/class/:code/resources", (req, res) => {
  const code = req.params.code.trim().toUpperCase();
  const resources = db.classroomResources.get(code) || [];
  res.json({ resources, classCode: code, count: resources.length });
});

app.post("/api/class/:code/resources", async (req, res) => {
  try {
    const code = req.params.code.trim().toUpperCase();
    const {
      title,
      subject = "General Science & Math",
      gradeLevel = "Grade 11-12",
      chapter = "General Reference",
      keyConcepts = [],
      content = "",
      mediaType = "text",
      fileData = null,
      mimeType = "",
      fileName = "",
      fileSize = 0,
      sharedBy = "Class Contributor",
      sharedByRole = "student"
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Resource title is required." });
    }
    if (!content?.trim() && !fileData) {
      return res.status(400).json({ error: "Please enter notes content or upload an image, video, or file." });
    }

    const analyzed = await analyzeUploadedResource({
      title: title.trim(),
      subject: subject.trim(),
      gradeLevel: gradeLevel.trim(),
      chapter: chapter.trim(),
      content: content.trim(),
      mediaType,
      fileData,
      mimeType,
      fileName,
      fileSize,
      tags: keyConcepts
    });

    const newResource = {
      id: `res-${Date.now()}`,
      classCode: code,
      title: title.trim(),
      subject: subject.trim(),
      gradeLevel: gradeLevel.trim(),
      chapter: chapter.trim(),
      keyConcepts: analyzed.keyConcepts.length > 0 ? analyzed.keyConcepts : (Array.isArray(keyConcepts) ? keyConcepts : keyConcepts.split(",").map(s => s.trim()).filter(Boolean)),
      content: analyzed.finalContent,
      aiExtractedContent: analyzed.aiExtractedContent,
      mediaType: analyzed.mediaType,
      mediaData: analyzed.mediaData,
      mediaMeta: analyzed.mediaMeta,
      sharedBy: sharedBy.trim(),
      sharedByRole: sharedByRole === "teacher" ? "teacher" : "student",
      createdAt: "Just now",
      downloadCount: 1
    };

    if (!db.classroomResources.has(code)) {
      db.classroomResources.set(code, []);
    }
    db.classroomResources.get(code).unshift(newResource);

    res.status(201).json({
      message: `Resource with ${analyzed.mediaType.toUpperCase()} content shared with classroom successfully! AI has indexed it for doubts and tests.`,
      resource: newResource
    });
  } catch (err) {
    console.error("Error in /api/class/:code/resources:", err);
    res.status(500).json({ error: err.message || "Failed to process classroom resource upload" });
  }
});

app.delete("/api/class/:code/resources/:id", (req, res) => {
  const code = req.params.code.trim().toUpperCase();
  const resId = req.params.id;
  if (db.classroomResources.has(code)) {
    const list = db.classroomResources.get(code);
    db.classroomResources.set(code, list.filter(r => r.id !== resId));
  }
  res.json({ success: true, message: "Resource deleted from classroom." });
});

// ==========================================
// LIBRARY RESOURCE DUMPS (STUDENTS & TEACHERS REPOSITORY)
// ==========================================
app.get("/api/resources/dumps", (req, res) => {
  const { subject, grade, institute, search } = req.query;
  let dumps = [...(db.resourceDumps || [])];

  if (subject && subject !== "all") {
    dumps = dumps.filter(d => d.subject.toLowerCase() === String(subject).toLowerCase());
  }
  if (grade && grade !== "all") {
    dumps = dumps.filter(d => d.gradeLevel === grade);
  }
  if (institute && institute !== "all") {
    dumps = dumps.filter(d => d.instituteName?.toLowerCase().includes(String(institute).toLowerCase()));
  }
  if (search && search.trim()) {
    const term = search.toLowerCase();
    dumps = dumps.filter(d => 
      d.title.toLowerCase().includes(term) ||
      d.content.toLowerCase().includes(term) ||
      (d.aiExtractedContent && d.aiExtractedContent.toLowerCase().includes(term)) ||
      (d.tags && d.tags.some(t => t.toLowerCase().includes(term)))
    );
  }

  res.json({ dumps, count: dumps.length });
});

app.post("/api/resources/dumps", async (req, res) => {
  try {
    const {
      title,
      subject = "Science & Mathematics",
      gradeLevel = "Grade 11-12",
      chapter = "Topic Notes",
      tags = [],
      content = "",
      mediaType = "text",
      fileData = null,
      mimeType = "",
      fileName = "",
      fileSize = 0,
      uploadedBy = "Community Scholar",
      uploadedByRole = "student",
      instituteName = "Open Education Network",
      fileType = "text/markdown"
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Resource Dump title is required." });
    }
    if (!content?.trim() && !fileData) {
      return res.status(400).json({ error: "Please provide document notes or upload a file, video, or image." });
    }

    const analyzed = await analyzeUploadedResource({
      title: title.trim(),
      subject: subject.trim(),
      gradeLevel: gradeLevel.trim(),
      chapter: chapter.trim(),
      content: content.trim(),
      mediaType,
      fileData,
      mimeType,
      fileName,
      fileSize,
      tags
    });

    const newDump = {
      id: `dump-${Date.now()}`,
      title: title.trim(),
      subject: subject.trim(),
      gradeLevel: gradeLevel.trim(),
      chapter: chapter.trim(),
      tags: analyzed.keyConcepts.length > 0 ? analyzed.keyConcepts : (Array.isArray(tags) ? tags : tags.split(",").map(s => s.trim()).filter(Boolean)),
      content: analyzed.finalContent,
      aiExtractedContent: analyzed.aiExtractedContent,
      mediaType: analyzed.mediaType,
      mediaData: analyzed.mediaData,
      mediaMeta: analyzed.mediaMeta,
      uploadedBy: uploadedBy.trim(),
      uploadedByRole: uploadedByRole === "teacher" ? "teacher" : "student",
      instituteName: instituteName.trim(),
      fileType: mimeType || fileType,
      readCount: 1,
      createdAt: "Just now"
    };

    db.resourceDumps.unshift(newDump);

    res.status(201).json({
      message: `Resource with ${analyzed.mediaType.toUpperCase()} uploaded to Knowledge Dump repository. AI will now index and read from this document!`,
      dump: newDump
    });
  } catch (err) {
    console.error("Error in /api/resources/dumps:", err);
    res.status(500).json({ error: err.message || "Failed to upload resource dump" });
  }
});

app.delete("/api/resources/dumps/:id", (req, res) => {
  const dumpId = req.params.id;
  db.resourceDumps = db.resourceDumps.filter(d => d.id !== dumpId);
  res.json({ success: true, message: "Resource dump removed from library repository." });
});

// ==========================================
// INSTITUTION COMMUNITY CHAT & DOUBTS
// ==========================================
app.get("/api/community/posts", (req, res) => {
  const { institute, subject, search } = req.query;
  let posts = [...(db.communityPosts || [])];

  if (institute && institute !== "all") {
    posts = posts.filter(p => p.instituteName?.toLowerCase().trim() === String(institute).toLowerCase().trim());
  }
  if (subject && subject !== "all") {
    posts = posts.filter(p => p.subject?.toLowerCase() === String(subject).toLowerCase());
  }
  if (search && search.trim()) {
    const term = search.toLowerCase();
    posts = posts.filter(p => 
      p.title.toLowerCase().includes(term) ||
      p.content.toLowerCase().includes(term) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(term)))
    );
  }

  res.json({ posts, count: posts.length });
});

app.post("/api/community/posts", (req, res) => {
  const {
    instituteName,
    title,
    content,
    subject = "General",
    gradeLevel = "Grade 11-12",
    authorName = "Anonymous Student",
    authorRole = "student",
    authorId = "user-1",
    tags = []
  } = req.body;

  if (!instituteName || !instituteName.trim()) {
    return res.status(400).json({ error: "Institution name is required to post in the community forum." });
  }
  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Doubt question title is required." });
  }
  if (!content || !content.trim()) {
    return res.status(400).json({ error: "Please describe your question or doubt." });
  }

  const newPost = {
    id: `post-${Date.now()}`,
    instituteName: instituteName.trim(),
    title: title.trim(),
    content: content.trim(),
    subject: subject.trim(),
    gradeLevel: gradeLevel.trim(),
    authorName: authorName.trim(),
    authorRole: authorRole === "teacher" ? "teacher" : "student",
    authorId,
    tags: Array.isArray(tags) ? tags : tags.split(",").map(t => t.trim()).filter(Boolean),
    upvotes: 0,
    upvotedBy: [],
    createdAt: "Just now",
    answers: []
  };

  db.communityPosts.unshift(newPost);

  res.status(201).json({
    message: "Doubt shared to your institution's community chat!",
    post: newPost
  });
});

app.post("/api/community/posts/:id/answers", (req, res) => {
  const postId = req.params.id;
  const {
    authorName = "Community Helper",
    authorRole = "student",
    authorId = "user-1",
    content
  } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: "Answer content cannot be empty." });
  }

  const post = db.communityPosts.find(p => p.id === postId);
  if (!post) {
    return res.status(404).json({ error: "Doubt thread not found." });
  }

  const newAnswer = {
    id: `ans-${Date.now()}`,
    authorName: authorName.trim(),
    authorRole: authorRole === "teacher" ? "teacher" : "student",
    authorId,
    content: content.trim(),
    isVerified: authorRole === "teacher", // Auto-verify if answered by teacher
    upvotes: 0,
    upvotedBy: [],
    createdAt: "Just now"
  };

  post.answers.push(newAnswer);

  res.status(201).json({
    message: "Answer posted to community doubt thread!",
    answer: newAnswer,
    post
  });
});

app.post("/api/community/posts/:id/upvote", (req, res) => {
  const postId = req.params.id;
  const { userId = "user-anon" } = req.body;
  const post = db.communityPosts.find(p => p.id === postId);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  post.upvotedBy = post.upvotedBy || [];
  if (post.upvotedBy.includes(userId)) {
    post.upvotedBy = post.upvotedBy.filter(u => u !== userId);
    post.upvotes = Math.max(0, post.upvotes - 1);
  } else {
    post.upvotedBy.push(userId);
    post.upvotes += 1;
  }

  res.json({ upvotes: post.upvotes, isUpvoted: post.upvotedBy.includes(userId) });
});

app.post("/api/community/posts/:id/answers/:answerId/upvote", (req, res) => {
  const { id: postId, answerId } = req.params;
  const { userId = "user-anon" } = req.body;
  const post = db.communityPosts.find(p => p.id === postId);
  if (!post) return res.status(404).json({ error: "Post not found" });

  const answer = post.answers.find(a => a.id === answerId);
  if (!answer) return res.status(404).json({ error: "Answer not found" });

  answer.upvotedBy = answer.upvotedBy || [];
  if (answer.upvotedBy.includes(userId)) {
    answer.upvotedBy = answer.upvotedBy.filter(u => u !== userId);
    answer.upvotes = Math.max(0, answer.upvotes - 1);
  } else {
    answer.upvotedBy.push(userId);
    answer.upvotes += 1;
  }

  res.json({ upvotes: answer.upvotes, isUpvoted: answer.upvotedBy.includes(userId) });
});

app.post("/api/community/posts/:id/answers/:answerId/verify", (req, res) => {
  const { id: postId, answerId } = req.params;
  const post = db.communityPosts.find(p => p.id === postId);
  if (!post) return res.status(404).json({ error: "Post not found" });

  const answer = post.answers.find(a => a.id === answerId);
  if (!answer) return res.status(404).json({ error: "Answer not found" });

  answer.isVerified = !answer.isVerified;
  res.json({ isVerified: answer.isVerified, message: answer.isVerified ? "Answer verified by teacher!" : "Verification removed." });
});

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

app.post("/api/doubt/solve", async (req, res) => {
  try {
    const {
      question,
      gradeLevel = "Grade 9-10",
      language = "en",
      explanationStyle = "step-by-step",
      studentId = "student-1",
      classCode,
      instituteName,
      imageData,
      // optional base64 image of handwritten work
      previousContext = []
    } = req.body;
    if (!question && !imageData) {
      return res.status(400).json({ error: "Question text or image is required." });
    }

    const student = db.students.get(studentId);
    const effectiveClassCode = classCode || student?.classCode || "";
    const effectiveInstitute = instituteName || student?.instituteName || "";

    const { docs, citations } = retrieveRelevantOerDocs(
      question || "Math & Science concepts",
      gradeLevel,
      effectiveClassCode,
      effectiveInstitute
    );

    const contextText = docs.map(
      (d) => `[SOURCE (${d.sourceTypeLabel || 'Curriculum'}): ${d.title} | ${d.chapter} | ${d.section} | Reference: ${d.pageOrRef} | License: ${d.license}]
Content:
${d.content}`
    ).join("\n\n---\n\n");
    const langName = SUPPORTED_LANGUAGES.find((l) => l.code === language)?.name || "English";
    if (student) {
      student.totalDoubtsAsked += 1;
      student.lastActive = "Just now";
    }
    const ai = getGeminiClient();
    let explanation = "";
    let suggestedFollowUps = [
      "Could you explain this with a real-world daily life analogy?",
      "I am confused about Step 2, could you break it down into smaller steps?",
      "Can you give me a simple practice question to test if I got it?"
    ];
    let groundingStatus = "verified_grounded";
    if (ai) {
      const systemInstruction = `You are a patient, pedagogically grounded AI tutor designed for equitable education access for students.
Your primary directive is to provide clear, level-appropriate explanations STRICTLY GROUNDED in verified educational curriculum frameworks, classroom-shared notes uploaded by teachers and peers, and community resource dumps.

STRICT RULES:
1. Target Grade Level: ${gradeLevel}. Adjust vocabulary, pacing, and complexity specifically for this grade.
2. Target Output Language: ${langName} (${language}). Explain the entire answer in ${langName}. If technical terms are used, you may provide English transliteration or bilingual keywords where helpful for clarity.
3. Explanation Style: ${explanationStyle} (e.g. step-by-step breakdown, simple analogy, or prerequisite basics).
4. CITATION REQUIREMENT: You MUST explicitly reference the provided curriculum chapters, teacher/student classroom notes, or resource dump passages (e.g. "According to the classroom notes on Wave Optics..." or "Referencing Senior Secondary Mathematics Chapter 7 Integrals...").
5. HONESTY: If the question cannot be grounded in standard secondary/high school curriculum or the provided corpus, politely explain what foundational concept applies rather than fabricating facts.
6. NO MOCK JARGON: Keep the tone encouraging, supportive, and crystal clear.
7. Format with clear numbered steps, bold highlights, and clean typography.`;
      const promptContent = `Student Doubt / Question:
"${question}"

${imageData ? "[Student uploaded an image of their handwritten work or textbook problem]" : ""}

OPEN REFERENCE PASSAGES & CLASSROOM SHARED NOTES (Ground your answer strictly in these):
${contextText}

Previous conversation context (if any):
${JSON.stringify(previousContext.slice(-3))}

Provide a step-by-step grounded explanation in ${langName} citing the exact source material and classroom resources.`;
      let contentsPayload = promptContent;
      if (imageData) {
        const base64Clean = imageData.replace(/^data:image\/\w+;base64,/, "");
        contentsPayload = {
          parts: [
            {
              inlineData: {
                mimeType: "image/png",
                data: base64Clean
              }
            },
            {
              text: promptContent
            }
          ]
        };
      }
      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: contentsPayload,
        config: {
          systemInstruction,
          temperature: 0.3
          // Low temperature for high factual consistency
        }
      });
      explanation = response.text || "Here is a step-by-step explanation grounded in open textbook resources and classroom materials.";
      try {
        const followUpPrompt = `Based on the explanation given above for topic "${question}", provide exactly 3 helpful, one-sentence follow-up questions a student might naturally ask to clarify confusion. Return ONLY a JSON array of strings.`;
        const followUpRes = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: followUpPrompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        });
        if (followUpRes.text) {
          suggestedFollowUps = JSON.parse(followUpRes.text.trim());
        }
      } catch (e) {
      }
    } else {
      const matchedDoc = docs[0];
      explanation = `### Step-by-Step Explanation (Grounded in ${matchedDoc.title})

**Core Principle:**
${matchedDoc.summary}

**Step 1: Understand the Given Quantities**
Look closely at the components from ${matchedDoc.chapter} (${matchedDoc.section}).

**Step 2: Apply the Open Curriculum Formula & Classroom Notes**
Referencing ${matchedDoc.pageOrRef}:
\`\`\`
${matchedDoc.content.split("\n").slice(0, 4).join("\n")}
\`\`\`

**Step 3: Solve Step-by-Step**
Work through the equation step-by-step to arrive at the final simplified value. Verify with equivalent balance on both sides.

**Verified Educational Source:**
- **Source Material:** ${matchedDoc.title}
- **Section / Origin:** ${matchedDoc.section} (${matchedDoc.pageOrRef})
- **License / Classification:** ${matchedDoc.license}`;
    }
    db.doubtHistory.push({
      id: `doubt-${Date.now()}`,
      studentId,
      question,
      response: explanation,
      citations,
      language,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    res.json({
      explanation,
      citations,
      groundingStatus,
      groundingReasoning: `Grounded in ${citations.length} verified educational sources and classroom materials (${citations.map((c) => c.publisher).join(", ")}).`,
      suggestedFollowUps,
      language,
      gradeLevel
    });
  } catch (error) {
    console.error("Error in /api/doubt/solve:", error);
    res.status(500).json({ error: error.message || "Failed to generate grounded explanation" });
  }
});
app.post("/api/practice/generate", async (req, res) => {
  try {
    const { studentId = "student-1", topicId, requestedDifficulty, classCode } = req.body;
    const student = db.students.get(studentId);
    const effectiveClassCode = classCode || student?.classCode;
    let targetTopic = student?.masteryList.find((t) => t.topicId === topicId);
    if (!targetTopic && student?.masteryList && student.masteryList.length > 0) {
      const sorted = [...student.masteryList].sort((a, b) => a.masteryPercentage - b.masteryPercentage);
      targetTopic = sorted[0];
    }
    let difficulty = requestedDifficulty || "Intermediate";
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

    // Look for classroom-shared resources first
    let classResource = null;
    if (effectiveClassCode && db.classroomResources.has(effectiveClassCode)) {
      const classList = db.classroomResources.get(effectiveClassCode);
      classResource = classList.find(r => 
        (targetTopic && (r.subject.toLowerCase() === targetTopic.subject.toLowerCase() || (r.keyConcepts && r.keyConcepts.some(k => targetTopic.topicName.toLowerCase().includes(k.toLowerCase())))))
      ) || classList[0];
    }

    const matchingDocs = OER_CORPUS.filter(
      (d) => d.keyConcepts.some((k) => targetTopic?.topicName.toLowerCase().includes(k.toLowerCase())) || d.subject.toLowerCase() === targetTopic?.subject.toLowerCase()
    );
    const primaryDoc = matchingDocs[0] || OER_CORPUS[0];

    const citation = classResource ? {
      id: `cite-practice-${classResource.id}`,
      sourceName: classResource.title,
      publisher: `Classroom Resource (Shared by ${classResource.sharedBy})`,
      chapter: classResource.chapter,
      section: `Class ${effectiveClassCode}`,
      pageOrRef: `Classroom Shared Notes [${classResource.sharedBy}]`,
      license: "Classroom Open Share",
      excerptSnippet: classResource.content.slice(0, 180) + "...",
      relevanceScore: 99
    } : {
      id: `cite-practice-${primaryDoc.id}`,
      sourceName: primaryDoc.title,
      publisher: primaryDoc.publisher,
      chapter: primaryDoc.chapter,
      section: primaryDoc.section,
      pageOrRef: primaryDoc.pageOrRef,
      license: primaryDoc.license,
      excerptSnippet: primaryDoc.content.slice(0, 180) + "...",
      relevanceScore: 95
    };

    const groundingContent = classResource ? classResource.content : primaryDoc.content;
    const groundingTitle = classResource ? `${classResource.title} (Classroom Notes by ${classResource.sharedBy})` : `${primaryDoc.title} (${primaryDoc.chapter}, ${primaryDoc.section})`;

    const ai = getGeminiClient();
    let questionData = {
      id: `q-${Date.now()}`,
      topicId: targetTopic?.topicId || "fractions-decimals",
      topicName: targetTopic?.topicName || "Fractions & Decimals",
      subject: targetTopic?.subject || "Mathematics",
      difficulty,
      isStepDownPrerequisite,
      questionText: isStepDownPrerequisite ? "Prerequisite Review: What is the Least Common Multiple (LCM) of 4 and 6 before adding 1/4 + 1/6?" : "Evaluate the sum: 2/3 + 3/5. Express your answer as a simplified fraction.",
      options: isStepDownPrerequisite ? ["12", "24", "10", "16"] : ["19/15", "5/8", "13/15", "1 1/15"],
      correctOptionIndex: 0,
      explanation: isStepDownPrerequisite ? "The multiples of 4 are 4, 8, 12, 16... and the multiples of 6 are 6, 12, 18... The smallest common multiple is 12." : "Step 1: Find LCM of denominators 3 and 5 = 15.\nStep 2: 2/3 = 10/15 and 3/5 = 9/15.\nStep 3: 10/15 + 9/15 = 19/15 (or 1 4/15).",
      prerequisiteHint: "Remember to find the smallest number that both denominators divide into evenly.",
      groundedCitation: citation
    };
    if (ai) {
      const prompt = `Generate a single multiple-choice adaptive practice test question for a student.
Topic: ${targetTopic?.topicName || "Linear Equations & Fractions"}
Subject: ${targetTopic?.subject || "Mathematics"}
Difficulty Level: ${difficulty}
Is Step-Down Prerequisite after wrong answer: ${isStepDownPrerequisite}
Grounding Source (Classroom Resource / Curriculum): ${groundingTitle}

Reference Notes & Source Passage:
${groundingContent}

Generate a clear, pedagogical question strictly testing concepts from the provided classroom resource/curriculum notes, with 4 options, the exact 0-based index of the correct option, a step-by-step worked explanation, and a helpful hint.`;
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
                items: { type: Type.STRING }
              },
              correctOptionIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
              prerequisiteHint: { type: Type.STRING }
            },
            required: ["questionText", "options", "correctOptionIndex", "explanation"]
          }
        }
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
          groundedCitation: citation
        };
      }
    }
    res.json({ question: questionData, targetTopic });
  } catch (error) {
    console.error("Error in /api/practice/generate:", error);
    res.status(500).json({ error: error.message || "Failed to generate practice question" });
  }
});
app.post("/api/practice/submit", (req, res) => {
  const { studentId = "student-1", topicId, isCorrect, difficulty } = req.body;
  const student = db.students.get(studentId);
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }
  const topic = student.masteryList.find((t) => t.topicId === topicId);
  if (topic) {
    topic.attemptsCount += 1;
    topic.lastAttemptedAt = "Just now";
    if (isCorrect) {
      topic.recentStreak = topic.recentStreak > 0 ? topic.recentStreak + 1 : 1;
      const delta = difficulty === "Advanced" ? 8 : difficulty === "Intermediate" ? 5 : 3;
      topic.masteryPercentage = Math.min(100, topic.masteryPercentage + delta);
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
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
  res.json({
    success: true,
    updatedTopic: topic,
    updatedProfile: student
  });
});
app.get("/api/teacher/insights", (req, res) => {
  const { classCode } = req.query;
  let students = Array.from(db.students.values());
  if (classCode && classCode !== "all") {
    students = students.filter((s) => s.classCode === String(classCode).toUpperCase());
  }
  const flaggedStudents = students.map((s) => {
    const weakTopics = s.masteryList.filter((t) => t.masteryPercentage < 60 || t.recentStreak <= -2);
    const lowestTopic = [...s.masteryList].sort((a, b) => a.masteryPercentage - b.masteryPercentage)[0];
    let severity = "on_track";
    let primaryIssue = "Demonstrating consistent progress across current modules.";
    let plainLanguageReason = "Student is meeting learning benchmarks with steady practice scores.";
    let suggestedIntervention = "Continue reinforcing advanced practice items.";
    if (weakTopics.length >= 2 || lowestTopic && lowestTopic.masteryPercentage < 40) {
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
      lastActive: s.lastActive
    };
  });
  flaggedStudents.sort((a, b) => {
    const order = { high_priority: 0, medium_attention: 1, on_track: 2 };
    return order[a.severity] - order[b.severity];
  });
  const topicMap = /* @__PURE__ */ new Map();
  students.forEach((s) => {
    s.masteryList.forEach((m) => {
      if (!topicMap.has(m.topicId)) {
        topicMap.set(m.topicId, {
          topicName: m.topicName,
          subject: m.subject,
          scores: [],
          strugglingCount: 0
        });
      }
      const item = topicMap.get(m.topicId);
      item.scores.push(m.masteryPercentage);
      if (m.masteryPercentage < 60) {
        item.strugglingCount += 1;
      }
    });
  });
  const heatmap = Array.from(topicMap.entries()).map(([topicId, data]) => {
    const avg = Math.round(data.scores.reduce((a, b) => a + b, 0) / (data.scores.length || 1));
    let recommendedFocus = "Mastered Well";
    if (avg < 55) recommendedFocus = "Immediate Review Required";
    else if (avg < 75) recommendedFocus = "Reinforce Core Concepts";
    return {
      topicId,
      topicName: data.topicName,
      subject: data.subject,
      classAverageMastery: avg,
      strugglingStudentsCount: data.strugglingCount,
      totalStudents: data.scores.length,
      recommendedFocus
    };
  });
  const totalEnrolled = students.length;
  const avgAccuracy = totalEnrolled > 0 ? Math.round(students.reduce((a, s) => a + s.avgPracticeScore, 0) / totalEnrolled) : 0;
  res.json({
    flaggedStudents,
    heatmap,
    classOverview: {
      totalEnrolled,
      needingIntervention: flaggedStudents.filter((f) => f.severity !== "on_track").length,
      totalDoubtsSolvedThisWeek: 42,
      classAverageAccuracy: avgAccuracy
    }
  });
});
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
        contents: prompt
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
  } catch (error) {
    console.error("Error in /api/teacher/lesson-plan:", error);
    res.status(500).json({ error: error.message || "Failed to generate remediation plan" });
  }
});
app.post("/api/scholarships/match", (req, res) => {
  const {
    gradeLevel,
    familyIncomeAnnual,
    category,
    gender,
    academicScorePercent,
    stateOrRegion,
    firstGenerationLearner
  } = req.body;
  const results = SCHOLARSHIP_SCHEMES.map((scheme) => {
    const matchedCriteria = [];
    const unmetCriteria = [];
    let score = 0;
    if (!gradeLevel || scheme.eligibleGrades.includes(gradeLevel)) {
      matchedCriteria.push(`Grade Level Eligible (${gradeLevel || "All"})`);
      score += 25;
    } else {
      unmetCriteria.push(`Requires Grade: ${scheme.eligibleGrades.join(", ")} (Current: ${gradeLevel})`);
    }
    if (familyIncomeAnnual !== void 0 && scheme.maxFamilyIncomeAnnual) {
      if (Number(familyIncomeAnnual) <= scheme.maxFamilyIncomeAnnual) {
        matchedCriteria.push(`Income Eligible (${scheme.maxFamilyIncomeLabel})`);
        score += 30;
      } else {
        unmetCriteria.push(`Exceeds maximum income cap of \u20B9${scheme.maxFamilyIncomeAnnual.toLocaleString()}/year`);
      }
    } else {
      matchedCriteria.push(`Income check compatible`);
      score += 20;
    }
    if (!category || scheme.eligibleCategories.includes(category)) {
      matchedCriteria.push(`Category Eligible (${category || "Open to all"})`);
      score += 20;
    } else {
      unmetCriteria.push(`Reserved for: ${scheme.eligibleCategories.join(", ")}`);
    }
    if (!gender || scheme.eligibleGenders.includes(gender)) {
      matchedCriteria.push(`Gender Eligible (${gender || "All"})`);
      score += 15;
    } else {
      unmetCriteria.push(`Restricted to: ${scheme.eligibleGenders.join(", ")} applicants`);
    }
    if (academicScorePercent !== void 0 && scheme.minAcademicScore) {
      if (Number(academicScorePercent) >= scheme.minAcademicScore) {
        matchedCriteria.push(`Academic Marks Criteria Met (${academicScorePercent}% \u2265 ${scheme.minAcademicScore}% requirement)`);
        score += 10;
      } else {
        unmetCriteria.push(`Minimum ${scheme.minAcademicScore}% marks required (Current: ${academicScorePercent}%)`);
      }
    }
    if (scheme.firstGenLearnerOnly) {
      if (firstGenerationLearner) {
        matchedCriteria.push(`First-Generation Learner grant priority applied`);
        score += 15;
      } else {
        unmetCriteria.push(`Specific priority scheme for first-generation learners`);
      }
    }
    const isEligible = unmetCriteria.length === 0;
    const plainLanguageReasoning = isEligible ? `You appear eligible based on your entered criteria: ${matchedCriteria.slice(0, 3).join(", ")}. Matches all formal scheme criteria without disqualifications.` : `Currently not matched due to: ${unmetCriteria.join("; ")}.`;
    return {
      scheme,
      isEligible,
      matchScore: isEligible ? Math.min(100, score + 10) : Math.max(10, score - 30),
      matchedCriteria,
      unmetCriteria,
      plainLanguageReasoning
    };
  });
  results.sort((a, b) => {
    if (a.isEligible && !b.isEligible) return -1;
    if (!a.isEligible && b.isEligible) return 1;
    return b.matchScore - a.matchScore;
  });
  res.json({ matches: results });
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
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
