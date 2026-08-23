import { isMongoConnected } from "./connection.js";
import {
  Institute,
  Teacher,
  Student,
  ClassModel,
  ClassInvite,
  ClassAnnouncement,
  ClassroomResource,
  ResourceDump,
  CommunityPost,
  AiChatHistory,
  DirectMessage,
  MentalHealthChat,
  Notification
} from "./schemas.js";

// In-Memory fallback store
export const inMemDb = {
  institutes: new Map(),
  students: new Map(),
  teachers: new Map(),
  classes: new Map(),
  invites: [],
  announcements: [],
  classroomResources: new Map(),
  resourceDumps: [],
  communityPosts: [],
  doubtHistory: [],
  practiceLogs: [],
  aiChatHistories: new Map(),
  directMessages: [],
  mentalHealthChats: new Map(),
  notifications: []
};

// Seed MongoDB if empty from in-memory baseline
export async function seedMongoDatabase() {
  if (!isMongoConnected()) return;

  try {
    const instCount = await Institute.countDocuments();
    if (instCount === 0 && inMemDb.institutes.size > 0) {
      console.log("🌱 [MongoDB] Seeding initial institutes collection...");
      const instDocs = Array.from(inMemDb.institutes.values());
      await Institute.insertMany(instDocs, { ordered: false }).catch(() => {});
    }

    const classCount = await ClassModel.countDocuments();
    if (classCount === 0 && inMemDb.classes.size > 0) {
      console.log("🌱 [MongoDB] Seeding initial classes collection...");
      const classDocs = Array.from(inMemDb.classes.values());
      await ClassModel.insertMany(classDocs, { ordered: false }).catch(() => {});
    }

    const teacherCount = await Teacher.countDocuments();
    if (teacherCount === 0 && inMemDb.teachers.size > 0) {
      console.log("🌱 [MongoDB] Seeding initial teachers collection...");
      const teacherDocs = Array.from(inMemDb.teachers.values()).map(t => ({
        ...t,
        passwordHash: t.password || t.passwordHash || "teacher123",
        password: t.password || "teacher123"
      }));
      await Teacher.insertMany(teacherDocs, { ordered: false });
    }

    const studentCount = await Student.countDocuments();
    if (studentCount === 0 && inMemDb.students.size > 0) {
      console.log("🌱 [MongoDB] Seeding initial students collection...");
      const studentDocs = Array.from(inMemDb.students.values()).map(s => ({
        ...s,
        passwordHash: s.password || s.passwordHash || "password123",
        password: s.password || "password123"
      }));
      await Student.insertMany(studentDocs, { ordered: false });
    }

    const resourceCount = await ClassroomResource.countDocuments();
    if (resourceCount === 0 && inMemDb.classroomResources.size > 0) {
      console.log("🌱 [MongoDB] Seeding initial classroom resources collection...");
      const resDocs = [];
      for (const resList of inMemDb.classroomResources.values()) {
        resDocs.push(...resList);
      }
      if (resDocs.length > 0) {
        await ClassroomResource.insertMany(resDocs, { ordered: false }).catch(() => {});
      }
    }

    const dumpCount = await ResourceDump.countDocuments();
    if (dumpCount === 0 && inMemDb.resourceDumps.length > 0) {
      console.log("🌱 [MongoDB] Seeding initial resource dumps collection...");
      await ResourceDump.insertMany(inMemDb.resourceDumps, { ordered: false }).catch(() => {});
    }

    const postCount = await CommunityPost.countDocuments();
    if (postCount === 0 && inMemDb.communityPosts.length > 0) {
      console.log("🌱 [MongoDB] Seeding initial community posts collection...");
      await CommunityPost.insertMany(inMemDb.communityPosts, { ordered: false }).catch(() => {});
    }

    console.log("✅ [MongoDB] Baseline data seeding check completed.");
  } catch (err) {
    console.error("⚠️ [MongoDB] Error during baseline seeding:", err.message);
  }
}

// -------------------------------------------------------------
// INSTITUTES
// -------------------------------------------------------------
export async function getInstitutes() {
  if (isMongoConnected()) {
    return await Institute.find({}).lean();
  }
  return Array.from(inMemDb.institutes.values());
}

export async function getInstituteById(id) {
  if (isMongoConnected()) {
    return await Institute.findOne({ id }).lean();
  }
  return inMemDb.institutes.get(id) || null;
}

export async function createInstitute(data) {
  inMemDb.institutes.set(data.id, data);
  if (isMongoConnected()) {
    await Institute.findOneAndUpdate({ id: data.id }, data, { upsert: true, new: true });
  }
  return data;
}

export async function updateInstitute(id, update) {
  const current = inMemDb.institutes.get(id) || {};
  const updated = { ...current, ...update };
  inMemDb.institutes.set(id, updated);
  if (isMongoConnected()) {
    return await Institute.findOneAndUpdate({ id }, { $set: update }, { new: true }).lean();
  }
  return updated;
}

// -------------------------------------------------------------
// TEACHERS
// -------------------------------------------------------------
export async function getTeachers() {
  if (isMongoConnected()) {
    return await Teacher.find({}).lean();
  }
  return Array.from(inMemDb.teachers.values());
}

export async function getTeacherById(id) {
  if (isMongoConnected()) {
    return await Teacher.findOne({ id }).lean();
  }
  return inMemDb.teachers.get(id) || null;
}

export async function getTeacherByEmail(email) {
  const cleanEmail = email ? email.toLowerCase().trim() : "";
  if (isMongoConnected()) {
    return await Teacher.findOne({ email: cleanEmail }).lean();
  }
  return Array.from(inMemDb.teachers.values()).find(
    (t) => t.email && t.email.toLowerCase() === cleanEmail
  ) || null;
}

export async function createTeacher(data) {
  inMemDb.teachers.set(data.id, data);
  if (isMongoConnected()) {
    await Teacher.findOneAndUpdate({ id: data.id }, data, { upsert: true, new: true });
  }
  return data;
}

export async function updateTeacher(id, update) {
  const current = inMemDb.teachers.get(id) || {};
  const updated = { ...current, ...update };
  inMemDb.teachers.set(id, updated);
  if (isMongoConnected()) {
    return await Teacher.findOneAndUpdate({ id }, { $set: update }, { new: true }).lean();
  }
  return updated;
}

// -------------------------------------------------------------
// STUDENTS
// -------------------------------------------------------------
export async function getStudents(filters = {}) {
  if (isMongoConnected()) {
    const query = {};
    if (filters.classCode) query.classCode = filters.classCode;
    return await Student.find(query).lean();
  }
  let list = Array.from(inMemDb.students.values());
  if (filters.classCode) {
    list = list.filter(s => s.classCode === filters.classCode);
  }
  return list;
}

export async function getStudentById(id) {
  if (isMongoConnected()) {
    return await Student.findOne({ id }).lean();
  }
  return inMemDb.students.get(id) || null;
}

export async function getStudentByEmail(email) {
  const cleanEmail = email ? email.toLowerCase().trim() : "";
  if (isMongoConnected()) {
    return await Student.findOne({ email: cleanEmail }).lean();
  }
  return Array.from(inMemDb.students.values()).find(
    (s) => s.email && s.email.toLowerCase() === cleanEmail
  ) || null;
}

export async function createStudent(data) {
  inMemDb.students.set(data.id, data);
  if (isMongoConnected()) {
    await Student.findOneAndUpdate({ id: data.id }, data, { upsert: true, new: true });
  }
  return data;
}

export async function updateStudent(id, update) {
  const current = inMemDb.students.get(id) || {};
  const updated = { ...current, ...update };
  inMemDb.students.set(id, updated);
  if (isMongoConnected()) {
    return await Student.findOneAndUpdate({ id }, { $set: update }, { new: true }).lean();
  }
  return updated;
}

// -------------------------------------------------------------
// CLASSES
// -------------------------------------------------------------
export async function getClasses() {
  if (isMongoConnected()) {
    return await ClassModel.find({}).lean();
  }
  return Array.from(inMemDb.classes.values());
}

export async function getClassByCode(classCode) {
  if (!classCode) return null;
  const clean = classCode.toUpperCase().trim();
  if (isMongoConnected()) {
    return await ClassModel.findOne({ classCode: clean }).lean();
  }
  return inMemDb.classes.get(clean) || null;
}

export async function getClassesByTeacher(teacherId) {
  if (isMongoConnected()) {
    return await ClassModel.find({ teacherId }).lean();
  }
  return Array.from(inMemDb.classes.values()).filter(c => c.teacherId === teacherId);
}

export async function getStudentEnrolledClasses(studentId, studentEmail) {
  const allClasses = Array.from(inMemDb.classes.values());
  const matched = [];
  const cleanEmail = (studentEmail || "").toLowerCase().trim();

  for (const cls of allClasses) {
    const isDirectCodeMatch = cls.enrolledStudentIds && cls.enrolledStudentIds.includes(studentId);
    const isRosterMatch = cls.enrolledStudents && cls.enrolledStudents.some(
      s => s.studentId === studentId || (cleanEmail && s.studentEmail && s.studentEmail.toLowerCase() === cleanEmail)
    );
    if (isDirectCodeMatch || isRosterMatch) {
      if (!matched.some(m => m.classCode === cls.classCode)) {
        matched.push(cls);
      }
    }
  }

  // Also check student's enrolledClassCodes if student object exists
  const student = inMemDb.students.get(studentId);
  if (student && student.enrolledClassCodes && Array.isArray(student.enrolledClassCodes)) {
    for (const code of student.enrolledClassCodes) {
      const cls = inMemDb.classes.get(code.toUpperCase().trim());
      if (cls && !matched.some(m => m.classCode === cls.classCode)) {
        matched.push(cls);
      }
    }
  }
  if (student && student.classCode) {
    const cls = inMemDb.classes.get(student.classCode.toUpperCase().trim());
    if (cls && !matched.some(m => m.classCode === cls.classCode)) {
      matched.push(cls);
    }
  }

  return matched;
}

export async function joinStudentToClass(studentId, classCode) {
  const cleanCode = (classCode || "").toUpperCase().trim();
  const cls = await getClassByCode(cleanCode);
  if (!cls) {
    throw new Error(`Classroom code "${cleanCode}" was not found.`);
  }

  const student = await getStudentById(studentId);
  if (!student) {
    throw new Error("Student record not found.");
  }

  // Update Class enrollment
  cls.enrolledStudents = cls.enrolledStudents || [];
  cls.enrolledStudentIds = cls.enrolledStudentIds || [];
  if (!cls.enrolledStudentIds.includes(studentId)) {
    cls.enrolledStudentIds.push(studentId);
  }
  if (!cls.enrolledStudents.some(s => s.studentId === studentId || s.studentEmail === student.email)) {
    cls.enrolledStudents.push({
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      section: cls.section || "Section A",
      joinedAt: new Date().toISOString()
    });
  }
  cls.enrolledCount = cls.enrolledStudents.length;
  await updateClass(cleanCode, cls);

  // Update student's multiple classrooms
  student.enrolledClassCodes = student.enrolledClassCodes || [];
  if (!student.enrolledClassCodes.includes(cleanCode)) {
    student.enrolledClassCodes.push(cleanCode);
  }
  if (!student.classCode) {
    student.classCode = cleanCode;
  }
  student.classInfo = cls;
  await updateStudent(studentId, student);

  const studentClasses = await getStudentEnrolledClasses(student.id, student.email);
  return {
    classInfo: cls,
    student,
    classes: studentClasses
  };
}

export async function createClass(data) {
  const code = (data.classCode || "").toUpperCase().trim();
  const normalized = { ...data, classCode: code };
  inMemDb.classes.set(code, normalized);
  if (isMongoConnected()) {
    await ClassModel.findOneAndUpdate({ classCode: code }, normalized, { upsert: true, new: true });
  }
  return normalized;
}

export async function updateClass(classCode, update) {
  const code = classCode.toUpperCase().trim();
  const current = inMemDb.classes.get(code) || {};
  const updated = { ...current, ...update };
  inMemDb.classes.set(code, updated);
  if (isMongoConnected()) {
    return await ClassModel.findOneAndUpdate({ classCode: code }, { $set: update }, { new: true }).lean();
  }
  return updated;
}

export async function deleteClass(classCode, teacherId) {
  const code = (classCode || "").toUpperCase().trim();
  inMemDb.classes.delete(code);

  // Clean teacher references in memory
  if (teacherId) {
    const teacher = inMemDb.teachers.get(teacherId);
    if (teacher && teacher.classes) {
      teacher.classes = teacher.classes.filter(
        (c) => (typeof c === "string" ? c : c.classCode) !== code
      );
    }
  } else {
    for (const teacher of inMemDb.teachers.values()) {
      if (teacher.classes) {
        teacher.classes = teacher.classes.filter(
          (c) => (typeof c === "string" ? c : c.classCode) !== code
        );
      }
    }
  }

  // Clean student references in memory
  for (const student of inMemDb.students.values()) {
    if (student.enrolledClassCodes) {
      student.enrolledClassCodes = student.enrolledClassCodes.filter((c) => c !== code);
    }
    if (student.classCode === code) {
      student.classCode = student.enrolledClassCodes?.[0] || null;
    }
  }

  if (isMongoConnected()) {
    await ClassModel.deleteOne({ classCode: code });
    await Teacher.updateMany({}, { $pull: { classes: { $in: [code, { classCode: code }] } } });
    await Student.updateMany(
      { enrolledClassCodes: code },
      { $pull: { enrolledClassCodes: code } }
    );
    await Student.updateMany(
      { classCode: code },
      { $set: { classCode: null } }
    );
    await ClassroomResource.deleteMany({ classCode: code });
    await ClassAnnouncement.deleteMany({ classCode: code });
  }

  return true;
}

// -------------------------------------------------------------
// CLASSROOM RESOURCES (Notes, PDF, Video OCR)
// -------------------------------------------------------------
export async function getClassroomResources(classCode) {
  if (!classCode) return [];
  const code = classCode.toUpperCase().trim();
  if (isMongoConnected()) {
    return await ClassroomResource.find({ classCode: code }).sort({ createdAt: -1 }).lean();
  }
  return inMemDb.classroomResources.get(code) || [];
}

export async function getAllClassroomResources() {
  if (isMongoConnected()) {
    return await ClassroomResource.find({}).sort({ createdAt: -1 }).lean();
  }
  const all = [];
  for (const list of inMemDb.classroomResources.values()) {
    all.push(...list);
  }
  return all;
}

export async function createClassroomResource(resourceData) {
  const code = (resourceData.classCode || "").toUpperCase().trim();
  const isTeacher = resourceData.authorRole === "teacher";
  const normalized = {
    ...resourceData,
    classCode: code,
    isVerified: typeof resourceData.isVerified === "boolean" ? resourceData.isVerified : isTeacher,
    verifiedBy: resourceData.verifiedBy || (isTeacher ? resourceData.authorName || "Faculty Lead" : ""),
    verifiedAt: resourceData.verifiedAt || (isTeacher ? new Date().toISOString() : "")
  };

  if (!inMemDb.classroomResources.has(code)) {
    inMemDb.classroomResources.set(code, []);
  }
  inMemDb.classroomResources.get(code).unshift(normalized);

  if (isMongoConnected()) {
    await ClassroomResource.findOneAndUpdate({ id: normalized.id }, normalized, { upsert: true, new: true });
  }
  return normalized;
}

export async function verifyClassroomResource(id, classCode, teacherName) {
  const code = (classCode || "").toUpperCase().trim();
  let updated = null;
  const list = inMemDb.classroomResources.get(code) || [];
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      list[i].isVerified = true;
      list[i].verifiedBy = teacherName || "Faculty Lead";
      list[i].verifiedAt = new Date().toISOString();
      updated = list[i];
      break;
    }
  }

  if (isMongoConnected()) {
    updated = await ClassroomResource.findOneAndUpdate(
      { id },
      { $set: { isVerified: true, verifiedBy: teacherName || "Faculty Lead", verifiedAt: new Date().toISOString() } },
      { new: true }
    ).lean();
  }

  if (updated && (updated.authorId || updated.sharedBy || updated.uploadedBy)) {
    const studentUser = updated.authorId || updated.sharedBy || updated.uploadedBy;
    createNotification({
      userId: studentUser,
      title: "Classroom Resource Verified! 🌟",
      message: `Your study material '${updated.title}' has been reviewed & verified by ${teacherName || "Faculty Lead"} for Class ${code}!`,
      type: "verification",
      resourceId: updated.id,
      resourceTitle: updated.title,
      verifiedBy: teacherName || "Faculty Lead"
    }).catch(() => {});
  }

  return updated;
}

export async function deleteClassroomResource(id, classCode) {
  if (classCode) {
    const code = classCode.toUpperCase().trim();
    const list = inMemDb.classroomResources.get(code) || [];
    inMemDb.classroomResources.set(code, list.filter(r => r.id !== id));
  } else {
    for (const [code, list] of inMemDb.classroomResources.entries()) {
      inMemDb.classroomResources.set(code, list.filter(r => r.id !== id));
    }
  }

  if (isMongoConnected()) {
    await ClassroomResource.deleteOne({ id });
  }
  return true;
}

// -------------------------------------------------------------
// RESOURCE DUMPS (Open Library)
// -------------------------------------------------------------
export async function getResourceDumps(filters = {}) {
  if (isMongoConnected()) {
    const query = {};
    if (filters.subject && filters.subject !== "all") {
      query.subject = { $regex: new RegExp(filters.subject, "i") };
    }
    return await ResourceDump.find(query).sort({ createdAt: -1 }).lean();
  }
  let dumps = [...inMemDb.resourceDumps];
  if (filters.subject && filters.subject !== "all") {
    dumps = dumps.filter(d => d.subject && d.subject.toLowerCase() === filters.subject.toLowerCase());
  }
  return dumps;
}

export async function createResourceDump(dumpData) {
  const isTeacher = dumpData.authorRole === "teacher" || dumpData.uploadedByRole === "teacher";
  const normalized = {
    ...dumpData,
    isVerified: typeof dumpData.isVerified === "boolean" ? dumpData.isVerified : isTeacher,
    verifiedBy: dumpData.verifiedBy || (isTeacher ? dumpData.authorName || dumpData.uploadedBy || "Faculty Lead" : ""),
    verifiedAt: dumpData.verifiedAt || (isTeacher ? new Date().toISOString() : "")
  };
  inMemDb.resourceDumps.unshift(normalized);
  if (isMongoConnected()) {
    await ResourceDump.findOneAndUpdate({ id: normalized.id }, normalized, { upsert: true, new: true });
  }
  return normalized;
}

export async function verifyResourceDump(id, teacherName) {
  let updated = null;
  for (let i = 0; i < inMemDb.resourceDumps.length; i++) {
    if (inMemDb.resourceDumps[i].id === id) {
      inMemDb.resourceDumps[i].isVerified = true;
      inMemDb.resourceDumps[i].verifiedBy = teacherName || "Faculty Lead";
      inMemDb.resourceDumps[i].verifiedAt = new Date().toISOString();
      updated = inMemDb.resourceDumps[i];
      break;
    }
  }
  if (isMongoConnected()) {
    updated = await ResourceDump.findOneAndUpdate(
      { id },
      { $set: { isVerified: true, verifiedBy: teacherName || "Faculty Lead", verifiedAt: new Date().toISOString() } },
      { new: true }
    ).lean();
  }

  if (updated && (updated.authorId || updated.uploadedBy)) {
    const studentUser = updated.authorId || updated.uploadedBy;
    createNotification({
      userId: studentUser,
      title: "Study Material Verified! 🎉",
      message: `Your study resource '${updated.title}' has been endorsed by ${teacherName || "Faculty Lead"}! You've advanced in the Verified Scholar rankings.`,
      type: "verification",
      resourceId: updated.id,
      resourceTitle: updated.title,
      verifiedBy: teacherName || "Faculty Lead"
    }).catch(() => {});
  }

  return updated;
}

export async function deleteResourceDump(id) {
  inMemDb.resourceDumps = inMemDb.resourceDumps.filter(d => d.id !== id);
  if (isMongoConnected()) {
    await ResourceDump.deleteOne({ id });
  }
  return true;
}

// -------------------------------------------------------------
// COMMUNITY FORUM POSTS & ANSWERS
// -------------------------------------------------------------
export async function getCommunityPosts(filters = {}) {
  const isGlobalReq = filters.classCode === "global";
  const targetCode = filters.classCode && filters.classCode !== "all" && !isGlobalReq
    ? filters.classCode.toUpperCase().trim()
    : null;

  if (isMongoConnected()) {
    const query = {};
    if (targetCode) {
      query.classCode = targetCode;
    } else if (isGlobalReq) {
      query.$or = [{ classCode: "" }, { classCode: null }, { classCode: "global" }, { classCode: { $exists: false } }];
    }
    if (filters.section && filters.section !== "all") {
      query.section = { $in: [filters.section, "all"] };
    }
    if (filters.institute && filters.institute !== "all") {
      query.instituteName = filters.institute;
    }
    if (filters.subject && filters.subject !== "all") {
      query.subject = { $regex: new RegExp(filters.subject, "i") };
    }
    return await CommunityPost.find(query).sort({ createdAt: -1 }).lean();
  }

  let posts = [...inMemDb.communityPosts];
  if (targetCode) {
    posts = posts.filter(p => p.classCode && p.classCode.toUpperCase().trim() === targetCode);
  } else if (isGlobalReq) {
    posts = posts.filter(p => !p.classCode || p.classCode === "global" || p.classCode === "");
  }
  if (filters.section && filters.section !== "all") {
    posts = posts.filter(p => !p.section || p.section === filters.section || p.section === "all");
  }
  if (filters.institute && filters.institute !== "all") {
    posts = posts.filter(p => p.instituteName === filters.institute);
  }
  if (filters.subject && filters.subject !== "all") {
    posts = posts.filter(p => p.subject && p.subject.toLowerCase() === filters.subject.toLowerCase());
  }
  return posts;
}

export async function getCommunityPostById(id) {
  if (isMongoConnected()) {
    return await CommunityPost.findOne({ id }).lean();
  }
  return inMemDb.communityPosts.find(p => p.id === id) || null;
}

export async function createCommunityPost(postData) {
  inMemDb.communityPosts.unshift(postData);
  if (isMongoConnected()) {
    await CommunityPost.findOneAndUpdate({ id: postData.id }, postData, { upsert: true, new: true });
  }
  return postData;
}

// -------------------------------------------------------------
// CLASSROOM INVITATIONS (TEACHER INVITES STUDENT BY EMAIL & SECTION)
// -------------------------------------------------------------
export async function createClassInvite(inviteData) {
  inMemDb.invites = inMemDb.invites || [];
  inMemDb.invites.unshift(inviteData);

  if (isMongoConnected()) {
    await ClassInvite.findOneAndUpdate({ id: inviteData.id }, inviteData, { upsert: true, new: true });
  }
  return inviteData;
}

export async function getStudentPendingInvites(studentEmail) {
  const emailNorm = (studentEmail || "").toLowerCase().trim();
  if (isMongoConnected()) {
    return await ClassInvite.find({ studentEmail: emailNorm, status: "pending" }).sort({ createdAt: -1 }).lean();
  }
  return (inMemDb.invites || []).filter(i => (i.studentEmail || "").toLowerCase().trim() === emailNorm && i.status === "pending");
}

export async function getTeacherClassInvites(teacherId) {
  if (isMongoConnected()) {
    return await ClassInvite.find({ teacherId }).sort({ createdAt: -1 }).lean();
  }
  return (inMemDb.invites || []).filter(i => i.teacherId === teacherId);
}

export async function acceptClassInvite(inviteId, studentId) {
  let invite = null;
  if (isMongoConnected()) {
    invite = await ClassInvite.findOneAndUpdate(
      { id: inviteId, status: "pending" },
      { $set: { status: "accepted", acceptedAt: new Date().toISOString() } },
      { new: true }
    ).lean();
  } else {
    invite = (inMemDb.invites || []).find(i => i.id === inviteId);
    if (invite) {
      invite.status = "accepted";
      invite.acceptedAt = new Date().toISOString();
    }
  }

  if (!invite) return null;

  // Add student to the class roster and update student's classCode & section
  const student = await getStudentById(studentId);
  if (student) {
    student.classCode = invite.classCode;
    student.section = invite.section || "Section A";
    student.gradeLevel = invite.gradeLevel || student.gradeLevel;
    if (invite.school) student.school = invite.school;
    
    student.joinedClasses = student.joinedClasses || [];
    if (!student.joinedClasses.some(c => c.classCode === invite.classCode)) {
      student.joinedClasses.push({
        classCode: invite.classCode,
        className: invite.className,
        section: invite.section || "Section A",
        joinedAt: new Date().toISOString()
      });
    }
    await updateStudent(studentId, student);
  }

  // Update class enrollment in database
  const targetClass = await getClassByCode(invite.classCode);
  if (targetClass) {
    targetClass.enrolledStudents = targetClass.enrolledStudents || [];
    if (!targetClass.enrolledStudents.some(s => s.studentId === studentId || s.studentEmail === invite.studentEmail)) {
      targetClass.enrolledStudents.push({
        studentId: student?.id || studentId,
        studentName: student?.name || invite.studentName || "Student",
        studentEmail: invite.studentEmail,
        section: invite.section || "Section A",
        joinedAt: new Date().toISOString()
      });
      targetClass.studentsCount = targetClass.enrolledStudents.length;
      await createClass(targetClass);
    }
  }

  return { invite, student, classInfo: targetClass };
}

export async function rejectClassInvite(inviteId) {
  if (isMongoConnected()) {
    return await ClassInvite.findOneAndUpdate(
      { id: inviteId },
      { $set: { status: "rejected" } },
      { new: true }
    ).lean();
  }
  const invite = (inMemDb.invites || []).find(i => i.id === inviteId);
  if (invite) invite.status = "rejected";
  return invite;
}

// -------------------------------------------------------------
// CLASSROOM STUDENT ROSTER
// -------------------------------------------------------------
export async function getClassStudents(classCode) {
  const code = (classCode || "").toUpperCase().trim();
  const cls = await getClassByCode(code);
  let students = cls?.enrolledStudents || [];

  // Also query any students matching classCode
  if (isMongoConnected()) {
    const directStudents = await Student.find({ classCode: code }).lean();
    for (const ds of directStudents) {
      if (!students.some(s => s.studentId === ds.id || s.studentEmail === ds.email)) {
        students.push({
          studentId: ds.id,
          studentName: ds.name,
          studentEmail: ds.email,
          section: ds.section || "Section A",
          gradeLevel: ds.gradeLevel,
          joinedAt: ds.createdAt || "Enrolled"
        });
      }
    }
  } else {
    for (const ds of inMemDb.students.values()) {
      if (ds.classCode === code && !students.some(s => s.studentId === ds.id)) {
        students.push({
          studentId: ds.id,
          studentName: ds.name,
          studentEmail: ds.email,
          section: ds.section || "Section A",
          gradeLevel: ds.gradeLevel,
          joinedAt: "Enrolled"
        });
      }
    }
  }

  return {
    classCode: code,
    className: cls?.className || `Class ${code}`,
    totalEnrolled: students.length,
    students
  };
}

// -------------------------------------------------------------
// TEACHER ANNOUNCEMENTS BROADCAST CHANNEL (TEACHER POSTS, ALL READ)
// -------------------------------------------------------------
export async function createAnnouncement(announcementData) {
  inMemDb.announcements = inMemDb.announcements || [];
  inMemDb.announcements.unshift(announcementData);

  if (isMongoConnected()) {
    await ClassAnnouncement.findOneAndUpdate(
      { id: announcementData.id },
      announcementData,
      { upsert: true, new: true }
    );
  }
  return announcementData;
}

export async function getClassAnnouncements(classCode, section = "all") {
  const code = (classCode || "").toUpperCase().trim();
  if (isMongoConnected()) {
    const query = { classCode: code };
    if (section && section !== "all") {
      query.section = { $in: [section, "all"] };
    }
    return await ClassAnnouncement.find(query).sort({ createdAt: -1 }).lean();
  }
  return (inMemDb.announcements || []).filter(a => 
    a.classCode === code && (!section || section === "all" || a.section === section || a.section === "all")
  );
}

export async function deleteAnnouncement(announcementId) {
  if (isMongoConnected()) {
    await ClassAnnouncement.deleteOne({ id: announcementId });
  }
  inMemDb.announcements = (inMemDb.announcements || []).filter(a => a.id !== announcementId);
  return true;
}

export async function addPostAnswer(postId, answerData) {
  const postInMem = inMemDb.communityPosts.find(p => p.id === postId);
  if (postInMem) {
    if (!postInMem.answers) postInMem.answers = [];
    postInMem.answers.push(answerData);
  }

  if (isMongoConnected()) {
    return await CommunityPost.findOneAndUpdate(
      { id: postId },
      { $push: { answers: answerData } },
      { new: true }
    ).lean();
  }
  return postInMem;
}

export async function upvotePost(postId, userId) {
  const postInMem = inMemDb.communityPosts.find(p => p.id === postId);
  if (postInMem) {
    if (!postInMem.upvotedBy) postInMem.upvotedBy = [];
    const idx = postInMem.upvotedBy.indexOf(userId);
    if (idx > -1) {
      postInMem.upvotedBy.splice(idx, 1);
      postInMem.upvotes = Math.max(0, (postInMem.upvotes || 1) - 1);
    } else {
      postInMem.upvotedBy.push(userId);
      postInMem.upvotes = (postInMem.upvotes || 0) + 1;
    }
  }

  if (isMongoConnected()) {
    const post = await CommunityPost.findOne({ id: postId });
    if (post) {
      const upvoted = post.upvotedBy || [];
      if (upvoted.includes(userId)) {
        post.upvotedBy = upvoted.filter(u => u !== userId);
        post.upvotes = Math.max(0, (post.upvotes || 1) - 1);
      } else {
        post.upvotedBy.push(userId);
        post.upvotes = (post.upvotes || 0) + 1;
      }
      await post.save();
      return post.toObject();
    }
  }
  return postInMem;
}

export async function upvoteAnswer(postId, answerId, userId) {
  const postInMem = inMemDb.communityPosts.find(p => p.id === postId);
  if (postInMem && postInMem.answers) {
    const ans = postInMem.answers.find(a => a.id === answerId);
    if (ans) {
      if (!ans.upvotedBy) ans.upvotedBy = [];
      const idx = ans.upvotedBy.indexOf(userId);
      if (idx > -1) {
        ans.upvotedBy.splice(idx, 1);
        ans.upvotes = Math.max(0, (ans.upvotes || 1) - 1);
      } else {
        ans.upvotedBy.push(userId);
        ans.upvotes = (ans.upvotes || 0) + 1;
      }
    }
  }

  if (isMongoConnected()) {
    const post = await CommunityPost.findOne({ id: postId });
    if (post && post.answers) {
      const ans = post.answers.find(a => a.id === answerId);
      if (ans) {
        ans.upvotedBy = ans.upvotedBy || [];
        if (ans.upvotedBy.includes(userId)) {
          ans.upvotedBy = ans.upvotedBy.filter(u => u !== userId);
          ans.upvotes = Math.max(0, (ans.upvotes || 1) - 1);
        } else {
          ans.upvotedBy.push(userId);
          ans.upvotes = (ans.upvotes || 0) + 1;
        }
        await post.save();
        return post.toObject();
      }
    }
  }
  return postInMem;
}

export async function verifyAnswer(postId, answerId, isTeacher) {
  const postInMem = inMemDb.communityPosts.find(p => p.id === postId);
  if (postInMem && postInMem.answers) {
    const ans = postInMem.answers.find(a => a.id === answerId);
    if (ans) {
      ans.isTeacherVerified = isTeacher;
    }
  }

  if (isMongoConnected()) {
    return await CommunityPost.findOneAndUpdate(
      { id: postId, "answers.id": answerId },
      { $set: { "answers.$.isTeacherVerified": isTeacher } },
      { new: true }
    ).lean();
  }
  return postInMem;
}

// -------------------------------------------------------------
// DOUBT & PRACTICE HISTORY LOGGING
// -------------------------------------------------------------
export async function recordDoubt(doubtData) {
  inMemDb.doubtHistory.push(doubtData);
  if (doubtData.studentId) {
    const student = inMemDb.students.get(doubtData.studentId);
    if (student) {
      if (!student.doubtHistory) student.doubtHistory = [];
      student.doubtHistory.unshift(doubtData);
    }
    if (isMongoConnected()) {
      await Student.findOneAndUpdate(
        { id: doubtData.studentId },
        { $push: { doubtHistory: { $each: [doubtData], $position: 0 } } }
      ).catch(() => {});
    }
  }
  return doubtData;
}

export async function recordPracticeLog(logData) {
  inMemDb.practiceLogs.push(logData);
  if (logData.studentId) {
    const student = inMemDb.students.get(logData.studentId);
    if (student) {
      if (!student.practiceLogs) student.practiceLogs = [];
      student.practiceLogs.unshift(logData);
    }
    if (isMongoConnected()) {
      await Student.findOneAndUpdate(
        { id: logData.studentId },
        { $push: { practiceLogs: { $each: [logData], $position: 0 } } }
      ).catch(() => {});
    }
  }
  return logData;
}

// -------------------------------------------------------------
// AI DOUBT SOLVER CHAT SESSIONS & HISTORY
// -------------------------------------------------------------
export async function getAiChatHistories(userId) {
  if (!userId) return [];
  if (isMongoConnected()) {
    return await AiChatHistory.find({ userId }).sort({ updatedAt: -1 }).lean();
  }
  const all = Array.from(inMemDb.aiChatHistories.values()).filter((c) => c.userId === userId);
  return all.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
}

export async function getAiChatHistoryById(id) {
  if (!id) return null;
  if (isMongoConnected()) {
    return await AiChatHistory.findOne({ id }).lean();
  }
  return inMemDb.aiChatHistories.get(id) || null;
}

export async function saveAiChatHistory(chatData) {
  const id = chatData.id || `chat-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const now = new Date().toISOString();
  const normalized = {
    ...chatData,
    id,
    updatedAt: now,
    createdAt: chatData.createdAt || now
  };

  inMemDb.aiChatHistories.set(id, normalized);

  if (isMongoConnected()) {
    await AiChatHistory.findOneAndUpdate({ id }, normalized, { upsert: true, new: true });
  }

  return normalized;
}

export async function deleteAiChatHistory(id) {
  if (!id) return false;
  inMemDb.aiChatHistories.delete(id);
  if (isMongoConnected()) {
    await AiChatHistory.deleteOne({ id });
  }
  return true;
}

// -------------------------------------------------------------
// DIRECT MESSAGES (STUDENT <-> TEACHER 1-ON-1)
// -------------------------------------------------------------
export async function getDirectMessages(user1Id, user2Id) {
  if (!user1Id || !user2Id) return [];
  if (isMongoConnected()) {
    return await DirectMessage.find({
      $or: [
        { senderId: user1Id, recipientId: user2Id },
        { senderId: user2Id, recipientId: user1Id }
      ]
    }).sort({ createdAt: 1 }).lean();
  }
  return inMemDb.directMessages.filter(
    (m) =>
      (m.senderId === user1Id && m.recipientId === user2Id) ||
      (m.senderId === user2Id && m.recipientId === user1Id)
  );
}

export async function getDirectMessageConversations(userId, role) {
  if (!userId) return [];
  let all = [];
  if (isMongoConnected()) {
    all = await DirectMessage.find({
      $or: [{ senderId: userId }, { recipientId: userId }]
    }).sort({ createdAt: -1 }).lean();
  } else {
    all = inMemDb.directMessages.filter((m) => m.senderId === userId || m.recipientId === userId);
  }

  // Deduplicate by other party
  const map = new Map();
  for (const msg of all) {
    const isMeSender = msg.senderId === userId;
    const otherId = isMeSender ? msg.recipientId : msg.senderId;
    const otherName = isMeSender ? msg.recipientName : msg.senderName;
    const otherRole = isMeSender ? msg.recipientRole : msg.senderRole;

    if (!map.has(otherId)) {
      map.set(otherId, {
        otherId,
        otherName,
        otherRole,
        lastMessage: msg.message,
        lastTimestamp: msg.createdAt,
        unreadCount: !isMeSender && !msg.isRead ? 1 : 0
      });
    } else if (!isMeSender && !msg.isRead) {
      map.get(otherId).unreadCount += 1;
    }
  }
  return Array.from(map.values());
}

export async function sendDirectMessage(messageData) {
  const id = `dm-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const now = new Date().toISOString();
  const normalized = {
    ...messageData,
    id,
    isRead: false,
    createdAt: now
  };

  inMemDb.directMessages.push(normalized);
  if (isMongoConnected()) {
    await DirectMessage.create(normalized);
  }
  return normalized;
}

// -------------------------------------------------------------
// MENTAL HEALTH & WELLBEING (LIVE COUNSELOR & AI SANCTUM)
// -------------------------------------------------------------
export async function getMentalHealthChats(studentId) {
  if (!studentId) return [];
  if (isMongoConnected()) {
    return await MentalHealthChat.find({ studentId }).sort({ updatedAt: -1 }).lean();
  }
  const all = Array.from(inMemDb.mentalHealthChats.values()).filter((c) => c.studentId === studentId);
  return all.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
}

export async function getMentalHealthChatById(id) {
  if (!id) return null;
  if (isMongoConnected()) {
    return await MentalHealthChat.findOne({ id }).lean();
  }
  return inMemDb.mentalHealthChats.get(id) || null;
}

export async function saveMentalHealthChat(chatData) {
  const id = chatData.id || `mhc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const now = new Date().toISOString();
  const normalized = {
    ...chatData,
    id,
    updatedAt: now,
    createdAt: chatData.createdAt || now
  };

  inMemDb.mentalHealthChats.set(id, normalized);
  if (isMongoConnected()) {
    await MentalHealthChat.findOneAndUpdate({ id }, normalized, { upsert: true, new: true });
  }
  return normalized;
}

// -------------------------------------------------------------
// STUDENT NOTIFICATIONS (VERIFICATION CONFIRMATION, ETC.)
// -------------------------------------------------------------
export async function createNotification(notifData) {
  const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const now = new Date().toISOString();
  const normalized = {
    ...notifData,
    id,
    isRead: false,
    createdAt: now
  };

  inMemDb.notifications.unshift(normalized);
  if (isMongoConnected()) {
    await Notification.create(normalized);
  }
  return normalized;
}

export async function getUserNotifications(userId) {
  if (!userId) return [];
  if (isMongoConnected()) {
    return await Notification.find({ userId }).sort({ createdAt: -1 }).limit(20).lean();
  }
  return inMemDb.notifications.filter((n) => n.userId === userId);
}

export async function markNotificationRead(id) {
  for (const n of inMemDb.notifications) {
    if (n.id === id) {
      n.isRead = true;
      break;
    }
  }
  if (isMongoConnected()) {
    await Notification.findOneAndUpdate({ id }, { $set: { isRead: true } });
  }
  return true;
}
