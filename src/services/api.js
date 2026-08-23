async function parseResponse(res, defaultError = "Request failed") {
  const text = await res.text();
  let data = {};
  if (text && text.trim()) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }

  if (!res.ok) {
    const errorMsg = data?.error || data?.message || defaultError;
    const err = new Error(errorMsg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

const api = {
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
  getAuthHeaders(customHeaders = {}) {
    const token = this.getToken();
    const headers = { "Content-Type": "application/json", ...customHeaders };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  },

  // Health
  async getHealth(retries = 2, delayMs = 400) {
    for (let i = 0; i <= retries; i++) {
      try {
        const res = await fetch("/api/health");
        return await parseResponse(res, "Health check failed");
      } catch (err) {
        if (i === retries) {
          return { status: "ok", aiEnabled: true, offlineFallback: true };
        }
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
    return { status: "ok", aiEnabled: true };
  },

  // Institutes
  async getInstitutes() {
    const res = await fetch("/api/institutes");
    return parseResponse(res, "Failed to fetch institutes");
  },
  async createInstitute(payload) {
    const res = await fetch("/api/institutes", {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return parseResponse(res, "Failed to register institute");
  },
  async getTeachers() {
    const res = await fetch("/api/teachers");
    return parseResponse(res, "Failed to fetch teachers");
  },

  // Auth & Registration
  async login(payload) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return parseResponse(res, "Login failed");
  },
  async registerTeacher(payload) {
    const res = await fetch("/api/auth/register-teacher", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return parseResponse(res, "Teacher registration failed");
  },
  async registerStudent(payload) {
    const res = await fetch("/api/auth/register-student", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return parseResponse(res, "Registration failed");
  },
  async verifySession(token) {
    const sessionToken = token || this.getToken();
    if (!sessionToken) throw new Error("No active session token");
    const res = await fetch(`/api/auth/verify`, {
      headers: {
        Authorization: `Bearer ${sessionToken}`
      }
    });
    return parseResponse(res, "Session invalid or expired");
  },

  // Classes
  async getClass(code) {
    try {
      const res = await fetch(`/api/class/${encodeURIComponent(code)}`);
      if (!res.ok) return null;
      return await parseResponse(res, "Failed to fetch class");
    } catch {
      return null;
    }
  },
  async lookupClassCode(code) {
    const res = await fetch(`/api/class/${encodeURIComponent(code)}`);
    return parseResponse(res, "Invalid class code");
  },
  async getTeacherClasses(teacherId) {
    const searchParams = new URLSearchParams();
    if (teacherId) searchParams.set("teacherId", teacherId);
    const qs = searchParams.toString();
    const url = qs ? `/api/teacher/classes?${qs}` : "/api/teacher/classes";
    const res = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    return parseResponse(res, "Failed to fetch teacher classes");
  },
  async createClass(payload) {
    const res = await fetch("/api/teacher/create-class", {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return parseResponse(res, "Failed to create class");
  },
  async deleteClass(classCode, teacherId) {
    const res = await fetch(`/api/teacher/classes/${encodeURIComponent(classCode)}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ teacherId })
    });
    return parseResponse(res, "Failed to delete classroom");
  },

  // Students
  async getStudentMe(studentId) {
    const res = await fetch(`/api/student/me?id=${encodeURIComponent(studentId)}`, {
      headers: this.getAuthHeaders()
    });
    return parseResponse(res, "Failed to fetch student details");
  },
  async joinClass(studentId, classCode) {
    const res = await fetch("/api/student/join-class", {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ studentId, classCode })
    });
    return parseResponse(res, "Failed to join classroom");
  },
  async leaveClass(studentId, classCode) {
    const res = await fetch("/api/student/leave-class", {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ studentId, classCode })
    });
    return parseResponse(res, "Failed to leave class");
  },
  async getStudentClasses(studentId, email) {
    const searchParams = new URLSearchParams();
    if (studentId) searchParams.set("studentId", studentId);
    if (email) searchParams.set("email", email);
    const qs = searchParams.toString();
    const res = await fetch(`/api/student/classes?${qs}`, {
      headers: this.getAuthHeaders()
    });
    return parseResponse(res, "Failed to fetch student classes");
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
    return parseResponse(res, "Failed to fetch students");
  },
  async getStudent(id) {
    const res = await fetch(`/api/students/${id}`, {
      headers: this.getAuthHeaders()
    });
    return parseResponse(res, "Failed to fetch student");
  },
  async updateStudent(id, updates) {
    const res = await fetch(`/api/students/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    return parseResponse(res, "Failed to update student");
  },
  async updateStudentSchool(studentId, school) {
    const res = await fetch("/api/student/update-school", {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ studentId, school })
    });
    return parseResponse(res, "Failed to update school");
  },

  // OER & Learning Tools
  async getOerCorpus(params) {
    const searchParams = new URLSearchParams();
    if (params?.subject) searchParams.set("subject", params.subject);
    if (params?.grade) searchParams.set("grade", params.grade);
    const res = await fetch(`/api/oer/corpus?${searchParams.toString()}`);
    return parseResponse(res, "Failed to fetch OER corpus");
  },
  async solveDoubt(payload) {
    const res = await fetch("/api/doubt/solve", {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return parseResponse(res, "Failed to solve doubt");
  },
  async generatePractice(payload) {
    const res = await fetch("/api/practice/generate", {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return parseResponse(res, "Failed to generate practice question");
  },
  async submitPractice(payload) {
    const res = await fetch("/api/practice/submit", {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return parseResponse(res, "Failed to submit practice");
  },
  async sendPracticeFeedback(summary) {
    const res = await fetch("/api/practice/feedback", {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(summary)
    });
    return parseResponse(res, "Failed to send practice feedback");
  },

  // BookPedia Agent
  async askBookPedia(question, studentId) {
    const res = await fetch("/api/bookpedia/ask", {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ question, studentId })
    });
    return parseResponse(res, "Failed to query Book-Pedia");
  },

  // Teacher Insights & Lesson Plans
  async getTeacherInsights(classCode, teacherId) {
    const searchParams = new URLSearchParams();
    if (classCode && classCode !== "all") searchParams.set("classCode", classCode);
    if (teacherId) searchParams.set("teacherId", teacherId);
    const qs = searchParams.toString();
    const url = qs ? `/api/teacher/insights?${qs}` : "/api/teacher/insights";
    const res = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    return parseResponse(res, "Failed to fetch teacher insights");
  },
  async generateLessonPlan(payload) {
    const res = await fetch("/api/teacher/lesson-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return parseResponse(res, "Failed to generate lesson plan");
  },

  // Scholarships
  async matchScholarships(profileData) {
    const res = await fetch("/api/scholarships/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileData)
    });
    return parseResponse(res, "Failed to match scholarships");
  },

  // Classroom Resources
  async getClassroomResources(classCode) {
    const res = await fetch(`/api/class/${encodeURIComponent(classCode)}/resources`);
    return parseResponse(res, "Failed to fetch classroom resources");
  },
  async shareClassroomResource(classCode, payload) {
    const res = await fetch(`/api/class/${encodeURIComponent(classCode)}/resources`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return parseResponse(res, "Failed to share resource");
  },
  async deleteClassroomResource(classCode, id) {
    const res = await fetch(`/api/class/${encodeURIComponent(classCode)}/resources/${encodeURIComponent(id)}`, {
      method: "DELETE"
    });
    return parseResponse(res, "Failed to delete classroom resource");
  },
  async verifyClassroomResource(classCode, id, teacherName) {
    const res = await fetch(`/api/class/${encodeURIComponent(classCode)}/resources/${encodeURIComponent(id)}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacherName })
    });
    return parseResponse(res, "Failed to verify classroom resource");
  },

  // Library Resource Dumps
  async getResourceDumps(params) {
    const searchParams = new URLSearchParams();
    if (params?.subject) searchParams.set("subject", params.subject);
    if (params?.grade) searchParams.set("grade", params.grade);
    if (params?.institute) searchParams.set("institute", params.institute);
    if (params?.search) searchParams.set("search", params.search);
    const res = await fetch(`/api/resources/dumps?${searchParams.toString()}`);
    return parseResponse(res, "Failed to fetch resource dumps");
  },
  async uploadResourceDump(payload) {
    const res = await fetch("/api/resources/dumps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return parseResponse(res, "Failed to upload resource dump");
  },
  async verifyResourceDump(id, teacherName) {
    const res = await fetch(`/api/resources/dumps/${encodeURIComponent(id)}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacherName })
    });
    return parseResponse(res, "Failed to verify resource dump");
  },
  async deleteResourceDump(id) {
    const res = await fetch(`/api/resources/dumps/${encodeURIComponent(id)}`, {
      method: "DELETE"
    });
    return parseResponse(res, "Failed to delete resource dump");
  },

  // System Audits
  async getSystemAudit() {
    const res = await fetch("/api/system/audit");
    return parseResponse(res, "Failed to fetch system audit");
  },
  async probeRetrieval(query) {
    const res = await fetch(`/api/system/probe-retrieval?q=${encodeURIComponent(query)}`);
    return parseResponse(res, "Failed to probe retrieval");
  },

  // Invites
  async inviteStudent(payload) {
    const res = await fetch("/api/teacher/invite-student", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return parseResponse(res, "Failed to send invitation");
  },
  async getTeacherInvites(teacherId) {
    const res = await fetch(`/api/teacher/invites?teacherId=${encodeURIComponent(teacherId || "")}`);
    return parseResponse(res, "Failed to fetch teacher invites");
  },
  async getStudentInvites(email, studentId) {
    const searchParams = new URLSearchParams();
    if (email) searchParams.set("email", email);
    if (studentId) searchParams.set("studentId", studentId);
    const res = await fetch(`/api/student/invites?${searchParams.toString()}`);
    return parseResponse(res, "Failed to fetch student invites");
  },
  async acceptInvite(inviteId, studentId) {
    const res = await fetch("/api/student/accept-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteId, studentId })
    });
    return parseResponse(res, "Failed to accept invite");
  },
  async rejectInvite(inviteId) {
    const res = await fetch("/api/student/reject-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteId })
    });
    return parseResponse(res, "Failed to reject invite");
  },

  // Class Roster & Announcements
  async getClassStudents(classCode) {
    const res = await fetch(`/api/class/${encodeURIComponent(classCode)}/students`);
    return parseResponse(res, "Failed to fetch class students");
  },
  async getClassAnnouncements(classCode, section = "all") {
    const searchParams = new URLSearchParams();
    if (section && section !== "all") searchParams.set("section", section);
    const qs = searchParams.toString();
    const url = qs ? `/api/class/${encodeURIComponent(classCode)}/announcements?${qs}` : `/api/class/${encodeURIComponent(classCode)}/announcements`;
    const res = await fetch(url);
    return parseResponse(res, "Failed to fetch class announcements");
  },
  async createAnnouncement(classCode, payload) {
    const res = await fetch(`/api/class/${encodeURIComponent(classCode)}/announcements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return parseResponse(res, "Failed to create announcement");
  },
  async deleteAnnouncement(classCode, id) {
    const res = await fetch(`/api/class/${encodeURIComponent(classCode)}/announcements/${encodeURIComponent(id)}`, {
      method: "DELETE"
    });
    return parseResponse(res, "Failed to delete announcement");
  },

  // Community Forum
  async getCommunityPosts(params) {
    const searchParams = new URLSearchParams();
    if (params?.institute) searchParams.set("institute", params.institute);
    if (params?.subject) searchParams.set("subject", params.subject);
    if (params?.classCode) searchParams.set("classCode", params.classCode);
    if (params?.section) searchParams.set("section", params.section);
    if (params?.search) searchParams.set("search", params.search);
    const res = await fetch(`/api/community/posts?${searchParams.toString()}`);
    return parseResponse(res, "Failed to fetch community posts");
  },
  async createCommunityPost(payload) {
    const res = await fetch("/api/community/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return parseResponse(res, "Failed to post doubt");
  },
  async answerCommunityPost(postId, payload) {
    const res = await fetch(`/api/community/posts/${encodeURIComponent(postId)}/answers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return parseResponse(res, "Failed to submit answer");
  },
  async upvoteCommunityPost(postId, userId) {
    const res = await fetch(`/api/community/posts/${encodeURIComponent(postId)}/upvote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId })
    });
    return parseResponse(res, "Failed to upvote post");
  },
  async upvoteAnswer(postId, answerId, userId) {
    const res = await fetch(`/api/community/posts/${encodeURIComponent(postId)}/answers/${encodeURIComponent(answerId)}/upvote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId })
    });
    return parseResponse(res, "Failed to upvote answer");
  },
  async verifyAnswer(postId, answerId) {
    const res = await fetch(`/api/community/posts/${encodeURIComponent(postId)}/answers/${encodeURIComponent(answerId)}/verify`, {
      method: "POST"
    });
    return parseResponse(res, "Failed to verify answer");
  },
  async flagCommunityAnswer(postId, answerId, teacherName, reason) {
    const res = await fetch(`/api/community/posts/${encodeURIComponent(postId)}/answers/${encodeURIComponent(answerId)}/flag`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacherName, reason })
    });
    return parseResponse(res, "Failed to flag answer");
  },

  // AI Chat History
  async getAiChatHistory(userId) {
    const res = await fetch(`/api/ai/history?userId=${encodeURIComponent(userId)}`, {
      headers: this.getAuthHeaders()
    });
    return parseResponse(res, "Failed to fetch AI chat history");
  },
  async getAiChatSession(id) {
    const res = await fetch(`/api/ai/history/${encodeURIComponent(id)}`, {
      headers: this.getAuthHeaders()
    });
    return parseResponse(res, "Failed to fetch session");
  },
  async saveAiChatSession(sessionData) {
    const res = await fetch("/api/ai/history", {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(sessionData)
    });
    return parseResponse(res, "Failed to save AI chat session");
  },
  async deleteAiChatSession(id) {
    const res = await fetch(`/api/ai/history/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: this.getAuthHeaders()
    });
    return parseResponse(res, "Failed to delete chat session");
  },

  // Direct Messages
  async getDirectMessages(user1, user2) {
    const res = await fetch(`/api/messages/direct?user1=${encodeURIComponent(user1)}&user2=${encodeURIComponent(user2)}`, {
      headers: this.getAuthHeaders()
    });
    return parseResponse(res, "Failed to fetch direct messages");
  },
  async getDirectMessageConversations(userId, role) {
    const res = await fetch(`/api/messages/conversations?userId=${encodeURIComponent(userId)}&role=${encodeURIComponent(role || "")}`, {
      headers: this.getAuthHeaders()
    });
    return parseResponse(res, "Failed to fetch conversations");
  },
  async sendDirectMessage(payload) {
    const res = await fetch("/api/messages/direct", {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return parseResponse(res, "Failed to send direct message");
  },

  // Counseling
  async getMentalHealthChats(studentId) {
    const res = await fetch(`/api/counseling/chats?studentId=${encodeURIComponent(studentId)}`, {
      headers: this.getAuthHeaders()
    });
    return parseResponse(res, "Failed to load counseling chats");
  },
  async saveMentalHealthChat(payload) {
    const res = await fetch("/api/counseling/chats", {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return parseResponse(res, "Failed to save counseling chat");
  },
  async talkToAiCounselor(payload) {
    const res = await fetch("/api/counseling/ai-talk", {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return parseResponse(res, "Failed to get counseling response");
  },

  // Notifications
  async getUserNotifications(userId) {
    try {
      const res = await fetch(`/api/notifications/${encodeURIComponent(userId)}`, {
        headers: this.getAuthHeaders()
      });
      return await parseResponse(res, "Failed to fetch notifications");
    } catch {
      return { notifications: [] };
    }
  },
  async markNotificationRead(id) {
    const res = await fetch(`/api/notifications/${encodeURIComponent(id)}/read`, {
      method: "POST",
      headers: this.getAuthHeaders()
    });
    return parseResponse(res, "Failed to mark notification read");
  }
};

export { api };
