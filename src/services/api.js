const api = {
  async getHealth() {
    const res = await fetch("/api/health");
    return res.json();
  },
  // Auth & Class Methods
  async login(payload) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Login failed");
    }
    return res.json();
  },
  async lookupClassCode(code) {
    const res = await fetch(`/api/class/${encodeURIComponent(code)}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Invalid class code");
    }
    return res.json();
  },
  async registerStudent(payload) {
    const res = await fetch("/api/auth/register-student", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Registration failed");
    }
    return res.json();
  },
  async getTeacherClasses(teacherId) {
    const url = teacherId ? `/api/teacher/classes?teacherId=${encodeURIComponent(teacherId)}` : "/api/teacher/classes";
    const res = await fetch(url);
    return res.json();
  },
  async createClass(payload) {
    const res = await fetch("/api/teacher/create-class", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create class");
    }
    return res.json();
  },
  async getStudentMe(studentId) {
    const res = await fetch(`/api/student/me?id=${encodeURIComponent(studentId)}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to fetch student details");
    }
    return res.json();
  },
  async getStudents(classCode) {
    const url = classCode ? `/api/students?classCode=${encodeURIComponent(classCode)}` : "/api/students";
    const res = await fetch(url);
    return res.json();
  },
  async getStudent(id) {
    const res = await fetch(`/api/students/${id}`);
    return res.json();
  },
  async updateStudent(id, updates) {
    const res = await fetch(`/api/students/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });
    return res.json();
  },
  async getOerCorpus(params) {
    const searchParams = new URLSearchParams();
    if (params?.subject) searchParams.set("subject", params.subject);
    if (params?.grade) searchParams.set("grade", params.grade);
    const res = await fetch(`/api/oer/corpus?${searchParams.toString()}`);
    return res.json();
  },
  async solveDoubt(payload) {
    const res = await fetch("/api/doubt/solve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to solve doubt");
    }
    return res.json();
  },
  async generatePractice(payload) {
    const res = await fetch("/api/practice/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to generate practice question");
    }
    return res.json();
  },
  async submitPractice(payload) {
    const res = await fetch("/api/practice/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return res.json();
  },
  async getTeacherInsights(classCode) {
    const url = classCode && classCode !== "all" ? `/api/teacher/insights?classCode=${encodeURIComponent(classCode)}` : "/api/teacher/insights";
    const res = await fetch(url);
    return res.json();
  },
  async generateLessonPlan(payload) {
    const res = await fetch("/api/teacher/lesson-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return res.json();
  },
  async matchScholarships(profileData) {
    const res = await fetch("/api/scholarships/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileData)
    });
    return res.json();
  }
};
export {
  api
};
