import {
  GroundedDoubtMessage,
  GradeLevel,
  LanguageCode,
  PracticeQuestion,
  StudentProfile,
  TeacherStudentFlag,
  TopicHeatmapItem,
  ScholarshipMatchResult,
  OerCorpusDoc,
  AuthUser,
  TeacherProfile,
  ClassroomInfo,
} from '../types';

export const api = {
  async getHealth() {
    const res = await fetch('/api/health');
    return res.json();
  },

  // Auth & Class Methods
  async login(payload: {
    role: 'teacher' | 'student';
    identifier: string;
    password?: string;
  }): Promise<{
    user: AuthUser;
    studentProfile?: StudentProfile;
    teacherProfile?: TeacherProfile;
    classInfo?: ClassroomInfo;
    classes?: ClassroomInfo[];
  }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  async lookupClassCode(code: string): Promise<{ classInfo: ClassroomInfo }> {
    const res = await fetch(`/api/class/${encodeURIComponent(code)}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Invalid class code');
    }
    return res.json();
  },

  async registerStudent(payload: {
    name: string;
    email: string;
    password: string;
    studentClass: string;
    classCode: string;
    primaryLanguage?: string;
    category?: string;
    gender?: string;
    familyIncomeBracket?: string;
    academicScorePercent?: number;
    firstGenerationLearner?: boolean;
    stateOrRegion?: string;
  }): Promise<{
    success: boolean;
    user: AuthUser;
    student: StudentProfile;
    classInfo: ClassroomInfo;
    message: string;
  }> {
    const res = await fetch('/api/auth/register-student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  async getTeacherClasses(teacherId?: string): Promise<{ classes: ClassroomInfo[] }> {
    const url = teacherId ? `/api/teacher/classes?teacherId=${encodeURIComponent(teacherId)}` : '/api/teacher/classes';
    const res = await fetch(url);
    return res.json();
  },

  async createClass(payload: {
    className: string;
    gradeLevel?: string;
    stream?: string;
    teacherId?: string;
    teacherName?: string;
    school?: string;
    customCode?: string;
  }): Promise<{ success: boolean; classInfo: ClassroomInfo }> {
    const res = await fetch('/api/teacher/create-class', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create class');
    }
    return res.json();
  },

  async getStudentMe(studentId: string): Promise<{ student: StudentProfile; classInfo: ClassroomInfo }> {
    const res = await fetch(`/api/student/me?id=${encodeURIComponent(studentId)}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to fetch student details');
    }
    return res.json();
  },

  async getStudents(classCode?: string): Promise<{ students: StudentProfile[] }> {
    const url = classCode ? `/api/students?classCode=${encodeURIComponent(classCode)}` : '/api/students';
    const res = await fetch(url);
    return res.json();
  },

  async getStudent(id: string): Promise<{ student: StudentProfile }> {
    const res = await fetch(`/api/students/${id}`);
    return res.json();
  },

  async updateStudent(id: string, updates: Partial<StudentProfile>): Promise<{ student: StudentProfile }> {
    const res = await fetch(`/api/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async getOerCorpus(params?: { subject?: string; grade?: string }): Promise<{ corpus: OerCorpusDoc[] }> {
    const searchParams = new URLSearchParams();
    if (params?.subject) searchParams.set('subject', params.subject);
    if (params?.grade) searchParams.set('grade', params.grade);
    const res = await fetch(`/api/oer/corpus?${searchParams.toString()}`);
    return res.json();
  },

  async solveDoubt(payload: {
    question: string;
    gradeLevel?: GradeLevel;
    language?: LanguageCode;
    explanationStyle?: string;
    studentId?: string;
    imageData?: string;
    previousContext?: any[];
  }): Promise<{
    explanation: string;
    citations: any[];
    groundingStatus: 'verified_grounded' | 'partially_grounded';
    groundingReasoning: string;
    suggestedFollowUps: string[];
    language: LanguageCode;
    gradeLevel: GradeLevel;
  }> {
    const res = await fetch('/api/doubt/solve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to solve doubt');
    }
    return res.json();
  },

  async generatePractice(payload: {
    studentId?: string;
    topicId?: string;
    requestedDifficulty?: 'Foundational' | 'Intermediate' | 'Advanced';
  }): Promise<{ question: PracticeQuestion; targetTopic: any }> {
    const res = await fetch('/api/practice/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to generate practice question');
    }
    return res.json();
  },

  async submitPractice(payload: {
    studentId: string;
    topicId: string;
    isCorrect: boolean;
    difficulty: string;
  }): Promise<{ success: boolean; updatedTopic: any; updatedProfile: StudentProfile }> {
    const res = await fetch('/api/practice/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async getTeacherInsights(classCode?: string): Promise<{
    flaggedStudents: TeacherStudentFlag[];
    heatmap: TopicHeatmapItem[];
    classOverview: {
      totalEnrolled: number;
      needingIntervention: number;
      totalDoubtsSolvedThisWeek: number;
      classAverageAccuracy: number;
    };
  }> {
    const url = classCode && classCode !== 'all' ? `/api/teacher/insights?classCode=${encodeURIComponent(classCode)}` : '/api/teacher/insights';
    const res = await fetch(url);
    return res.json();
  },

  async generateLessonPlan(payload: {
    topicName: string;
    strugglingCount: number;
    weakConcepts: string[];
  }): Promise<{ lessonPlan: string; topicName: string }> {
    const res = await fetch('/api/teacher/lesson-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async matchScholarships(profileData: {
    gradeLevel?: GradeLevel;
    familyIncomeAnnual?: number;
    category?: string;
    gender?: string;
    academicScorePercent?: number;
    stateOrRegion?: string;
    firstGenerationLearner?: boolean;
  }): Promise<{ matches: ScholarshipMatchResult[] }> {
    const res = await fetch('/api/scholarships/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });
    return res.json();
  },
};
