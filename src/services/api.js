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
  async joinClass(studentId, classCode) {
    const res = await fetch("/api/student/join-class", {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ studentId, classCode })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to join classroom");
    }
    return res.json();
  },
  async getStudentClasses(studentId, email) {
    const searchParams = new URLSearchParams();
    if (studentId) searchParams.set("studentId", studentId);
    if (email) searchParams.set("email", email);
    const qs = searchParams.toString();
    const res = await fetch(`/api/student/classes?${qs}`, {
      headers: this.getAuthHeaders()
    });
    if (!res.ok) throw new Error("Failed to fetch student classes");
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
  async joinClass(studentId, classCode) {
    const res = await fetch("/api/classes/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, classCode })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to join class");
    }
    return res.json();
  },
  async leaveClass(studentId, classCode) {
    const res = await fetch("/api/student/leave-class", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, classCode })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to leave class");
    }
    return res.json();
  },
  async deleteClass(classCode, teacherId) {
    const res = await fetch(`/api/teacher/classes/${encodeURIComponent(classCode)}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacherId })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to delete class");
    }
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
  async verifyClassroomResource(classCode, id, teacherName) {
    const res = await fetch(`/api/class/${encodeURIComponent(classCode)}/resources/${encodeURIComponent(id)}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacherName })
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
  async verifyResourceDump(id, teacherName) {
    const res = await fetch(`/api/resources/dumps/${encodeURIComponent(id)}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacherName })
    });
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
  // Classroom Invitations & Sections
  async inviteStudent(payload) {
    const res = await fetch("/api/teacher/invite-student", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to send invitation");
    }
    return res.json();
  },
  async getTeacherInvites(teacherId) {
    const res = await fetch(`/api/teacher/invites?teacherId=${encodeURIComponent(teacherId || "")}`);
    if (!res.ok) throw new Error("Failed to fetch teacher invites");
    return res.json();
  },
  async getStudentInvites(email, studentId) {
    const searchParams = new URLSearchParams();
    if (email) searchParams.set("email", email);
    if (studentId) searchParams.set("studentId", studentId);
    const res = await fetch(`/api/student/invites?${searchParams.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch student invites");
    return res.json();
  },
  async acceptInvite(inviteId, studentId) {
    const res = await fetch("/api/student/accept-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteId, studentId })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to accept invite");
    }
    return res.json();
  },
  async rejectInvite(inviteId) {
    const res = await fetch("/api/student/reject-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteId })
    });
    return res.json();
  },
  // Class Roster
  async getClassStudents(classCode) {
    const res = await fetch(`/api/class/${encodeURIComponent(classCode)}/students`);
    if (!res.ok) throw new Error("Failed to fetch class students");
    return res.json();
  },
  // Classroom Announcements (Teacher Broadcast)
  async getClassAnnouncements(classCode, section = "all") {
    const searchParams = new URLSearchParams();
    if (section && section !== "all") searchParams.set("section", section);
    const qs = searchParams.toString();
    const url = qs ? `/api/class/${encodeURIComponent(classCode)}/announcements?${qs}` : `/api/class/${encodeURIComponent(classCode)}/announcements`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch class announcements");
    return res.json();
  },
  async createAnnouncement(classCode, payload) {
    const res = await fetch(`/api/class/${encodeURIComponent(classCode)}/announcements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create announcement");
    }
    return res.json();
  },
  async deleteAnnouncement(classCode, id) {
    const res = await fetch(`/api/class/${encodeURIComponent(classCode)}/announcements/${encodeURIComponent(id)}`, {
      method: "DELETE"
    });
    return res.json();
  },
  // Community Chat & Doubts
  async getCommunityPosts(params) {
    const searchParams = new URLSearchParams();
    if (params?.institute) searchParams.set("institute", params.institute);
    if (params?.subject) searchParams.set("subject", params.subject);
    if (params?.classCode) searchParams.set("classCode", params.classCode);
    if (params?.section) searchParams.set("section", params.section);
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
  },
  async flagCommunityAnswer(postId, answerId, teacherName, reason) {
    const res = await fetch(`/api/community/posts/${encodeURIComponent(postId)}/answers/${encodeURIComponent(answerId)}/flag`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacherName, reason })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to flag answer");
    }
    return res.json();
  },
  async deleteClass(classCode, teacherId) {
    const res = await fetch(`/api/teacher/classes/${encodeURIComponent(classCode)}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ teacherId })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to delete classroom");
    }
    return res.json();
  },
  async updateStudentSchool(studentId, school) {
    const res = await fetch("/api/student/update-school", {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ studentId, school })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to update school");
    }
    return res.json();
  },
  async getAiChatHistory(userId) {
    const res = await fetch(`/api/ai/history?userId=${encodeURIComponent(userId)}`, {
      headers: this.getAuthHeaders()
    });
    if (!res.ok) throw new Error("Failed to fetch AI chat history");
    return res.json();
  },
  async getAiChatSession(id) {
    const res = await fetch(`/api/ai/history/${encodeURIComponent(id)}`, {
      headers: this.getAuthHeaders()
    });
    if (!res.ok) throw new Error("Failed to fetch session");
    return res.json();
  },
  async saveAiChatSession(sessionData) {
    const res = await fetch("/api/ai/history", {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(sessionData)
    });
    if (!res.ok) throw new Error("Failed to save AI chat session");
    return res.json();
  },
  async deleteAiChatSession(id) {
    const res = await fetch(`/api/ai/history/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: this.getAuthHeaders()
    });
    if (!res.ok) throw new Error("Failed to delete chat session");
    return res.json();
  },
  // Direct 1-on-1 Messages (Student <-> Teacher)
  async getDirectMessages(user1, user2) {
    const res = await fetch(`/api/messages/direct?user1=${encodeURIComponent(user1)}&user2=${encodeURIComponent(user2)}`, {
      headers: this.getAuthHeaders()
    });
    if (!res.ok) throw new Error("Failed to fetch direct messages");
    return res.json();
  },
  async getDirectMessageConversations(userId, role) {
    const res = await fetch(`/api/messages/conversations?userId=${encodeURIComponent(userId)}&role=${encodeURIComponent(role || '')}`, {
      headers: this.getAuthHeaders()
    });
    if (!res.ok) throw new Error("Failed to fetch conversations");
    return res.json();
  },
  async sendDirectMessage(payload) {
    const res = await fetch("/api/messages/direct", {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to send direct message");
    }
    return res.json();
  },
  // Mental Health & Wellbeing
  async getMentalHealthChats(studentId) {
    const res = await fetch(`/api/counseling/chats?studentId=${encodeURIComponent(studentId)}`, {
      headers: this.getAuthHeaders()
    });
    if (!res.ok) throw new Error("Failed to load counseling chats");
    return res.json();
  },
  async saveMentalHealthChat(payload) {
    const res = await fetch("/api/counseling/chats", {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Failed to save counseling chat");
    return res.json();
  },
  async talkToAiCounselor(payload) {
    const res = await fetch("/api/counseling/ai-talk", {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Failed to get counseling response");
    return res.json();
  },
  // Notifications
  async getUserNotifications(userId) {
    const res = await fetch(`/api/notifications/${encodeURIComponent(userId)}`, {
      headers: this.getAuthHeaders()
    });
    if (!res.ok) return { notifications: [] };
    return res.json();
  },
  async markNotificationRead(id) {
    const res = await fetch(`/api/notifications/${encodeURIComponent(id)}/read`, {
      method: "POST",
      headers: this.getAuthHeaders()
    });
    return res.json();
  }
};
export {
  api
};
