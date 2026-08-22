const api = {
  async getHealth() {
    const res = await fetch("/api/health");
    return res.json();
  },
  // Institutes
  async getInstitutes() {
    const res = await fetch("/api/institutes");
    if (!res.ok) throw new Error("Failed to fetch institutes");
    return res.json();
  },
  async createInstitute(payload) {
    const res = await fetch("/api/institutes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to register institute");
    }
    return res.json();
  },
  async getTeachers() {
    const res = await fetch("/api/teachers");
    if (!res.ok) throw new Error("Failed to fetch teachers");
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
  async registerTeacher(payload) {
    const res = await fetch("/api/auth/register-teacher", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Teacher registration failed");
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
  getAuthHeaders() {
    const token = this.getToken();
    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  },
  async getTeacherClasses(teacherId) {
    const searchParams = new URLSearchParams();
    if (teacherId) searchParams.set("teacherId", teacherId);
    const qs = searchParams.toString();
    const url = qs ? `/api/teacher/classes?${qs}` : "/api/teacher/classes";
    const res = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    return res.json();
  },
  async createClass(payload) {
    const res = await fetch("/api/teacher/create-class", {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create class");
    }
    return res.json();
  },
  async getStudentMe(studentId) {
    const res = await fetch(`/api/student/me?id=${encodeURIComponent(studentId)}`, {
      headers: this.getAuthHeaders()
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to fetch student details");
    }
    return res.json();
  },
  async getStudents(classCode, teacherId) {
    const searchParams = new URLSearchParams();
    if (classCode) searchParams.set("classCode", classCode);
    if (teacherId) searchParams.set("teacherId", teacherId);
    const qs = searchParams.toString();
    const url = qs ? `/api/students?${qs}` : "/api/students";
    const res = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    return res.json();
  },
  async getStudent(id) {
    const res = await fetch(`/api/students/${id}`, {
      headers: this.getAuthHeaders()
    });
    return res.json();
  },
  async updateStudent(id, updates) {
    const res = await fetch(`/api/students/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
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
      headers: this.getAuthHeaders(),
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
      headers: this.getAuthHeaders(),
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
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },
  async getTeacherInsights(classCode, teacherId) {
    const searchParams = new URLSearchParams();
    if (classCode && classCode !== "all") searchParams.set("classCode", classCode);
    if (teacherId) searchParams.set("teacherId", teacherId);
    const qs = searchParams.toString();
    const url = qs ? `/api/teacher/insights?${qs}` : "/api/teacher/insights";
    const res = await fetch(url, {
      headers: this.getAuthHeaders()
    });
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
  },
  // Classroom Resources
  async getClassroomResources(classCode) {
    const res = await fetch(`/api/class/${encodeURIComponent(classCode)}/resources`);
    if (!res.ok) throw new Error("Failed to fetch classroom resources");
    return res.json();
  },
  async shareClassroomResource(classCode, payload) {
    const res = await fetch(`/api/class/${encodeURIComponent(classCode)}/resources`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to share resource");
    }
    return res.json();
  },
  async deleteClassroomResource(classCode, id) {
    const res = await fetch(`/api/class/${encodeURIComponent(classCode)}/resources/${encodeURIComponent(id)}`, {
      method: "DELETE"
    });
    return res.json();
  },
  // Library Resource Dumps
  async getResourceDumps(params) {
    const searchParams = new URLSearchParams();
    if (params?.subject) searchParams.set("subject", params.subject);
    if (params?.grade) searchParams.set("grade", params.grade);
    if (params?.institute) searchParams.set("institute", params.institute);
    if (params?.search) searchParams.set("search", params.search);
    const res = await fetch(`/api/resources/dumps?${searchParams.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch resource dumps");
    return res.json();
  },
  async uploadResourceDump(payload) {
    const res = await fetch("/api/resources/dumps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to upload resource dump");
    }
    return res.json();
  },
  async deleteResourceDump(id) {
    const res = await fetch(`/api/resources/dumps/${encodeURIComponent(id)}`, {
      method: "DELETE"
    });
    return res.json();
  },
  // Auth & Session Management
  getToken() {
    return localStorage.getItem("equitable_session_token") || null;
  },
  setToken(token) {
    if (token) {
      localStorage.setItem("equitable_session_token", token);
    } else {
      localStorage.removeItem("equitable_session_token");
    }
  },
  async verifySession(token) {
    const sessionToken = token || this.getToken();
    if (!sessionToken) throw new Error("No active session token");
    const res = await fetch(`/api/auth/verify`, {
      headers: {
        Authorization: `Bearer ${sessionToken}`
      }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Session invalid or expired");
    }
    return res.json();
  },
  async getSystemAudit() {
    const res = await fetch("/api/system/audit");
    if (!res.ok) throw new Error("Failed to fetch system audit");
    return res.json();
  },
  async probeRetrieval(query) {
    const res = await fetch(`/api/system/probe-retrieval?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error("Failed to probe retrieval");
    return res.json();
  },
  // Community Chat & Doubts
  async getCommunityPosts(params) {
    const searchParams = new URLSearchParams();
    if (params?.institute) searchParams.set("institute", params.institute);
    if (params?.subject) searchParams.set("subject", params.subject);
    if (params?.search) searchParams.set("search", params.search);
    const res = await fetch(`/api/community/posts?${searchParams.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch community posts");
    return res.json();
  },
  async createCommunityPost(payload) {
    const res = await fetch("/api/community/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to post doubt");
    }
    return res.json();
  },
  async answerCommunityPost(postId, payload) {
    const res = await fetch(`/api/community/posts/${encodeURIComponent(postId)}/answers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to submit answer");
    }
    return res.json();
  },
  async upvoteCommunityPost(postId, userId) {
    const res = await fetch(`/api/community/posts/${encodeURIComponent(postId)}/upvote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId })
    });
    return res.json();
  },
  async upvoteAnswer(postId, answerId, userId) {
    const res = await fetch(`/api/community/posts/${encodeURIComponent(postId)}/answers/${encodeURIComponent(answerId)}/upvote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId })
    });
    return res.json();
  },
  async verifyAnswer(postId, answerId) {
    const res = await fetch(`/api/community/posts/${encodeURIComponent(postId)}/answers/${encodeURIComponent(answerId)}/verify`, {
      method: "POST"
    });
    return res.json();
  }
};
export {
  api
};
