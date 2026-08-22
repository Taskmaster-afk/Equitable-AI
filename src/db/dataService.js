import { isMongoConnected } from "./connection.js";
import {
  Institute,
  Teacher,
  Student,
  ClassModel,
  ClassroomResource,
  ResourceDump,
  CommunityPost
} from "./schemas.js";

// In-Memory fallback store
export const inMemDb = {
  institutes: new Map(),
  students: new Map(),
  teachers: new Map(),
  classes: new Map(),
  classroomResources: new Map(),
  resourceDumps: [],
  communityPosts: [],
  doubtHistory: [],
  practiceLogs: []
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
  const normalized = { ...resourceData, classCode: code };

  if (!inMemDb.classroomResources.has(code)) {
    inMemDb.classroomResources.set(code, []);
  }
  inMemDb.classroomResources.get(code).unshift(normalized);

  if (isMongoConnected()) {
    await ClassroomResource.findOneAndUpdate({ id: normalized.id }, normalized, { upsert: true, new: true });
  }
  return normalized;
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
  inMemDb.resourceDumps.unshift(dumpData);
  if (isMongoConnected()) {
    await ResourceDump.findOneAndUpdate({ id: dumpData.id }, dumpData, { upsert: true, new: true });
  }
  return dumpData;
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
  if (isMongoConnected()) {
    const query = {};
    if (filters.institute && filters.institute !== "all") {
      query.instituteName = filters.institute;
    }
    if (filters.subject && filters.subject !== "all") {
      query.subject = { $regex: new RegExp(filters.subject, "i") };
    }
    return await CommunityPost.find(query).sort({ createdAt: -1 }).lean();
  }
  let posts = [...inMemDb.communityPosts];
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
