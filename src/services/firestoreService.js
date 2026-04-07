// src/services/firestoreService.js
// ============================================================
// All Firestore database operations in one place.
// This keeps components clean and Firebase logic centralized.
// ============================================================

import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, query, where, getDocs, addDoc,
  serverTimestamp, orderBy, limit, writeBatch,
} from "firebase/firestore";
import {
  ref, uploadBytesResumable, getDownloadURL, deleteObject,
} from "firebase/storage";
import { db, storage } from "./firebase";

/* ── USER OPERATIONS ──────────────────────────────────────── */

/**
 * Create a new user profile document in Firestore.
 * Called right after Firebase Auth createUserWithEmailAndPassword.
 */
export async function createUserProfile(uid, data) {
  await setDoc(doc(db, "users", uid), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

/**
 * Fetch a user's profile by their Firebase Auth UID.
 */
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * Update any fields in a user's profile.
 */
export async function updateUserProfile(uid, data) {
  await updateDoc(doc(db, "users", uid), data);
}

/* ── COACHING OPERATIONS ──────────────────────────────────── */

/**
 * Create a new coaching institute document.
 * Called when a new admin registers.
 */
export async function createCoaching(data) {
  const ref = await addDoc(collection(db, "coachings"), {
    ...data,
    students: [],
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Get a single coaching by its ID.
 */
export async function getCoaching(coachingId) {
  const snap = await getDoc(doc(db, "coachings", coachingId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * Update coaching details (name, city, phone, etc).
 */
export async function updateCoaching(coachingId, data) {
  await updateDoc(doc(db, "coachings", coachingId), data);
}

/**
 * Get all coaching institutes (for student search / super admin).
 */
export async function getAllCoachings() {
  const snap = await getDocs(collection(db, "coachings"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Search coachings by name (case-insensitive via nameLower field).
 */
export async function searchCoachings(term) {
  const all = await getAllCoachings();
  const t = term.toLowerCase();
  return all.filter(c =>
    c.name?.toLowerCase().includes(t) ||
    c.city?.toLowerCase().includes(t) ||
    c.subject?.toLowerCase().includes(t)
  );
}

/* ── JOIN REQUEST OPERATIONS ──────────────────────────────── */

/**
 * Student sends a join request to a coaching.
 * Creates a document in coachings/{coachingId}/joinRequests.
 */
export async function createJoinRequest(coachingId, studentData) {
  const reqRef = collection(db, "coachings", coachingId, "joinRequests");
  await addDoc(reqRef, {
    ...studentData,
    status: "pending",
    timestamp: serverTimestamp(),
  });
}

/**
 * Get all join requests for a coaching (admin view).
 */
export async function getJoinRequests(coachingId) {
  const q = query(
    collection(db, "coachings", coachingId, "joinRequests"),
    orderBy("timestamp", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Approve a join request:
 * 1. Update request status to "approved"
 * 2. Add student UID to coaching's students array
 * 3. Update student's profile with coachingIds[] array (multi-coaching support, max 5)
 */
export async function approveJoinRequest(coachingId, requestId, studentId) {
  const batch = writeBatch(db);

  // Update the request document
  batch.update(
    doc(db, "coachings", coachingId, "joinRequests", requestId),
    { status: "approved" }
  );

  // Add student to coaching's student list
  const coachingRef = doc(db, "coachings", coachingId);
  const coaching = await getCoaching(coachingId);
  batch.update(coachingRef, {
    students: [...(coaching.students || []), studentId],
  });

  // Update student profile — add to coachingIds, remove from pendingCoachingIds
  const studentProfile = await getUserProfile(studentId);
  const existing = studentProfile?.coachingIds || (studentProfile?.coachingId ? [studentProfile.coachingId] : []);
  const pending  = studentProfile?.pendingCoachingIds || [];

  const newCoachingIds = existing.includes(coachingId) ? existing : [...existing, coachingId];
  const newPending     = pending.filter(id => id !== coachingId);

  batch.update(doc(db, "users", studentId), {
    coachingIds:        newCoachingIds,
    coachingId:         newCoachingIds[0],   // keep backward compat
    pendingCoachingIds: newPending,
    status:             "approved",
  });

  await batch.commit();
}

/**
 * Reject a join request.
 * Only marks the request as rejected.
 * Does NOT change the student's global status (they may be in other coachings).
 * Removes coachingId from pendingCoachingIds on the student profile.
 */
export async function rejectJoinRequest(coachingId, requestId, studentId) {
  const batch = writeBatch(db);

  batch.update(
    doc(db, "coachings", coachingId, "joinRequests", requestId),
    { status: "rejected" }
  );

  // Only remove from pending list, don't touch global status
  const studentProfile = await getUserProfile(studentId);
  const pending  = studentProfile?.pendingCoachingIds || [];
  const enrolled = studentProfile?.coachingIds || [];
  const newPending = pending.filter(id => id !== coachingId);

  batch.update(doc(db, "users", studentId), {
    pendingCoachingIds: newPending,
    // Keep status as-is unless they have no coachings at all
    ...(enrolled.length === 0 && newPending.length === 0 ? { status: "independent" } : {}),
  });

  await batch.commit();
}

/* ── STUDENT MANAGEMENT ───────────────────────────────────── */

/**
 * Remove a student from a coaching.
 * Updates both the coaching's students list and the student's coachingIds.
 */
export async function removeStudent(coachingId, studentId) {
  const coaching = await getCoaching(coachingId);
  const updated = (coaching.students || []).filter(id => id !== studentId);

  const studentProfile = await getUserProfile(studentId);
  const updatedIds = (studentProfile?.coachingIds || []).filter(id => id !== coachingId);

  const batch = writeBatch(db);
  batch.update(doc(db, "coachings", coachingId), { students: updated });
  batch.update(doc(db, "users", studentId), {
    coachingIds: updatedIds,
    coachingId:  updatedIds[0] || null,
    status:      updatedIds.length > 0 ? "approved" : "independent",
  });
  await batch.commit();
}

/**
 * Fetch full profiles for a list of student UIDs.
 */
export async function getStudentProfiles(studentIds) {
  if (!studentIds.length) return [];
  const profiles = await Promise.all(studentIds.map(id => getUserProfile(id)));
  return profiles.filter(Boolean);
}

/* ── FEES OPERATIONS ──────────────────────────────────────── */

/**
 * Add a fee record for a student.
 */
export async function addFeeRecord(coachingId, data) {
  const ref = collection(db, "coachings", coachingId, "fees");
  await addDoc(ref, { ...data, createdAt: serverTimestamp() });
}

/**
 * Get all fee records for a coaching.
 */
export async function getCoachingFees(coachingId) {
  const q = query(
    collection(db, "coachings", coachingId, "fees"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Get fee records for a specific student.
 */
export async function getStudentFees(coachingId, studentId) {
  const q = query(
    collection(db, "coachings", coachingId, "fees"),
    where("studentId", "==", studentId)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Mark a fee record as paid and record the transaction.
 */
export async function markFeePaid(coachingId, feeId, feeData) {
  const batch = writeBatch(db);

  // Update fee record
  batch.update(doc(db, "coachings", coachingId, "fees", feeId), {
    paid: feeData.amount,
    due: 0,
    status: "paid",
    paidAt: serverTimestamp(),
  });

  // Create transaction record
  const txRef = doc(collection(db, "coachings", coachingId, "transactions"));
  batch.set(txRef, {
    studentId:   feeData.studentId,
    studentName: feeData.studentName,
    amount:      feeData.amount,
    type:        "credit",
    note:        `${feeData.month} fee`,
    date:        new Date().toISOString().slice(0, 10),
    createdAt:   serverTimestamp(),
  });

  await batch.commit();
}

/**
 * Update partial payment on a fee.
 */
export async function recordPartialPayment(coachingId, feeId, paidAmount, totalAmount) {
  await updateDoc(doc(db, "coachings", coachingId, "fees", feeId), {
    paid:   paidAmount,
    due:    totalAmount - paidAmount,
    status: paidAmount >= totalAmount ? "paid" : "partial",
  });
}

/* ── CLASS OPERATIONS ─────────────────────────────────────── */

export async function addClass(coachingId, data) {
  await addDoc(collection(db, "coachings", coachingId, "classes"), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function getClasses(coachingId) {
  const snap = await getDocs(collection(db, "coachings", coachingId, "classes"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function deleteClass(coachingId, classId) {
  await deleteDoc(doc(db, "coachings", coachingId, "classes", classId));
}

/* ── WORKSHOP OPERATIONS ──────────────────────────────────── */

export async function addWorkshop(coachingId, data) {
  await addDoc(collection(db, "coachings", coachingId, "workshops"), {
    ...data,
    enrolled: 0,
    createdAt: serverTimestamp(),
  });
}

export async function getWorkshops(coachingId) {
  const snap = await getDocs(collection(db, "coachings", coachingId, "workshops"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function enrollInWorkshop(coachingId, workshopId, currentEnrolled) {
  await updateDoc(doc(db, "coachings", coachingId, "workshops", workshopId), {
    enrolled: currentEnrolled + 1,
  });
}

/* ── TRANSACTIONS ─────────────────────────────────────────── */

export async function getTransactions(coachingId) {
  const q = query(
    collection(db, "coachings", coachingId, "transactions"),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/* ── ANNOUNCEMENTS ────────────────────────────────────────── */

export async function createAnnouncement(coachingId, data) {
  await addDoc(collection(db, "coachings", coachingId, "announcements"), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function getAnnouncements(coachingId) {
  try {
    const q = query(
      collection(db, "coachings", coachingId, "announcements"),
      orderBy("pinned", "desc"),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch {
    // Fallback if composite index not ready
    const snap = await getDocs(collection(db, "coachings", coachingId, "announcements"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  }
}

export async function deleteAnnouncement(coachingId, announcementId) {
  await deleteDoc(doc(db, "coachings", coachingId, "announcements", announcementId));
}

export async function pinAnnouncement(coachingId, announcementId, pinned) {
  await updateDoc(doc(db, "coachings", coachingId, "announcements", announcementId), { pinned });
}

/* ── ATTENDANCE ───────────────────────────────────────────── */

/**
 * Save attendance for a given date.
 * records = { [uid]: "present" | "absent" | "late" }
 */
export async function markAttendance(coachingId, date, records) {
  await setDoc(doc(db, "coachings", coachingId, "attendance", date), {
    date,
    records,
    updatedAt: serverTimestamp(),
  });
}

export async function getAttendanceForDate(coachingId, date) {
  const snap = await getDoc(doc(db, "coachings", coachingId, "attendance", date));
  return snap.exists() ? snap.data() : null;
}

/**
 * Fetch all attendance records where this student appears.
 * Returns [{date, status}]
 */
export async function getStudentAttendanceHistory(coachingId, studentId) {
  const snap = await getDocs(collection(db, "coachings", coachingId, "attendance"));
  const result = [];
  snap.docs.forEach(d => {
    const data = d.data();
    const status = data.records?.[studentId];
    if (status) result.push({ date: data.date || d.id, status });
  });
  return result.sort((a, b) => b.date.localeCompare(a.date));
}

/* ── STUDY MATERIALS ──────────────────────────────────────── */

export async function uploadMaterial(coachingId, data, onProgress) {
  let downloadUrl = data.videoUrl || null;
  let storagePath = null;

  if (data.file) {
    storagePath = `coachings/${coachingId}/materials/${Date.now()}_${data.file.name}`;
    const storageRef = ref(storage, storagePath);
    await new Promise((resolve, reject) => {
      const task = uploadBytesResumable(storageRef, data.file);
      task.on("state_changed",
        snap => onProgress && onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
        reject,
        async () => { downloadUrl = await getDownloadURL(task.snapshot.ref); resolve(); }
      );
    });
  }

  await addDoc(collection(db, "coachings", coachingId, "materials"), {
    title:       data.title,
    subject:     data.subject,
    type:        data.type,
    description: data.description || "",
    downloadUrl,
    storagePath,
    authorName:  data.authorName,
    uploadedAt:  serverTimestamp(),
  });
}

export async function getMaterials(coachingId) {
  const q = query(
    collection(db, "coachings", coachingId, "materials"),
    orderBy("uploadedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function deleteMaterial(coachingId, materialId, storagePath) {
  await deleteDoc(doc(db, "coachings", coachingId, "materials", materialId));
  if (storagePath) {
    try { await deleteObject(ref(storage, storagePath)); } catch {}
  }
}

/* ── HOMEWORK ──────────────────────────────────────────────── */

export async function createHomework(coachingId, data) {
  await addDoc(collection(db, "coachings", coachingId, "homework"), {
    ...data,
    submissions: {},
    createdAt: serverTimestamp(),
  });
}

export async function getHomework(coachingId) {
  const q = query(
    collection(db, "coachings", coachingId, "homework"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function deleteHomework(coachingId, homeworkId) {
  await deleteDoc(doc(db, "coachings", coachingId, "homework", homeworkId));
}

export async function submitHomework(coachingId, homeworkId, submission) {
  await updateDoc(doc(db, "coachings", coachingId, "homework", homeworkId), {
    [`submissions.${submission.studentId}`]: {
      studentName: submission.studentName,
      note:        submission.note || "",
      submittedAt: serverTimestamp(),
    },
  });
}

/* ── TESTS / QUIZZES ──────────────────────────────────────── */

export async function createTest(coachingId, data) {
  await addDoc(collection(db, "coachings", coachingId, "tests"), {
    ...data,
    attemptCount: 0,
    createdAt: serverTimestamp(),
  });
}

export async function getTests(coachingId) {
  const q = query(
    collection(db, "coachings", coachingId, "tests"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function deleteTest(coachingId, testId) {
  await deleteDoc(doc(db, "coachings", coachingId, "tests", testId));
}

export async function submitTestAttempt(coachingId, attempt) {
  const batch = writeBatch(db);

  const attemptRef = doc(collection(db, "coachings", coachingId, "testAttempts"));
  batch.set(attemptRef, { ...attempt, submittedAt: serverTimestamp() });

  // Increment attempt counter on the test
  const testRef = doc(db, "coachings", coachingId, "tests", attempt.testId);
  const testSnap = await getDoc(testRef);
  if (testSnap.exists()) {
    batch.update(testRef, { attemptCount: (testSnap.data().attemptCount || 0) + 1 });
  }

  await batch.commit();
}

export async function getTestAttempts(coachingId, testId) {
  const q = query(
    collection(db, "coachings", coachingId, "testAttempts"),
    where("testId", "==", testId),
    orderBy("score", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getStudentAttempts(coachingId, studentId) {
  const q = query(
    collection(db, "coachings", coachingId, "testAttempts"),
    where("studentId", "==", studentId)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/* -- TUTOR PROFILES ----------------------------------------- */

export async function upsertTutorProfile(uid, data) {
  await setDoc(doc(db, "tutors", uid), {
    ...data, uid, updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function getTutorProfile(uid) {
  const snap = await getDoc(doc(db, "tutors", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getAllTutors() {
  const snap = await getDocs(collection(db, "tutors"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/* -- REVIEWS ------------------------------------------------ */

export async function addCoachingReview(coachingId, reviewData) {
  await addDoc(collection(db, "coachings", coachingId, "reviews"), {
    ...reviewData, createdAt: serverTimestamp(),
  });
  const allReviews = await getCoachingReviews(coachingId);
  const avg = allReviews.reduce((s, r) => s + (r.rating || 0), 0) / (allReviews.length || 1);
  await updateDoc(doc(db, "coachings", coachingId), {
    avgRating: Math.round(avg * 10) / 10,
    reviewCount: allReviews.length,
  });
}

export async function getCoachingReviews(coachingId) {
  try {
    const q = query(collection(db, "coachings", coachingId, "reviews"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch {
    const snap = await getDocs(collection(db, "coachings", coachingId, "reviews"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
}

export async function addTutorReview(tutorUid, reviewData) {
  await addDoc(collection(db, "tutors", tutorUid, "reviews"), {
    ...reviewData, createdAt: serverTimestamp(),
  });
  const allReviews = await getTutorReviews(tutorUid);
  const avg = allReviews.reduce((s, r) => s + (r.rating || 0), 0) / (allReviews.length || 1);
  await updateDoc(doc(db, "tutors", tutorUid), {
    avgRating: Math.round(avg * 10) / 10,
    reviewCount: allReviews.length,
  });
}

export async function getTutorReviews(tutorUid) {
  try {
    const q = query(collection(db, "tutors", tutorUid, "reviews"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch {
    const snap = await getDocs(collection(db, "tutors", tutorUid, "reviews"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
}

/* -- PAYMENT METHODS ---------------------------------------- */

export async function addPaymentMethod(entityType, entityId, data) {
  const collRef = entityType === "tutor"
    ? collection(db, "tutors", entityId, "paymentMethods")
    : collection(db, "coachings", entityId, "paymentMethods");
  await addDoc(collRef, { ...data, createdAt: serverTimestamp() });
}

export async function getPaymentMethods(entityType, entityId) {
  const collRef = entityType === "tutor"
    ? collection(db, "tutors", entityId, "paymentMethods")
    : collection(db, "coachings", entityId, "paymentMethods");
  const snap = await getDocs(collRef);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function deletePaymentMethod(entityType, entityId, methodId) {
  const docRef = entityType === "tutor"
    ? doc(db, "tutors", entityId, "paymentMethods", methodId)
    : doc(db, "coachings", entityId, "paymentMethods", methodId);
  await deleteDoc(docRef);
}

/* -- MULTI-COACHING ----------------------------------------- */

export async function getStudentCoachings(studentProfile) {
  const ids = studentProfile?.coachingIds
    || (studentProfile?.coachingId ? [studentProfile.coachingId] : []);
  if (!ids.length) return [];
  const results = await Promise.all(ids.map(id => getCoaching(id)));
  return results.filter(Boolean);
}

export async function leaveCoaching(coachingId, studentId) {
  const [coaching, studentProfile] = await Promise.all([
    getCoaching(coachingId),
    getUserProfile(studentId),
  ]);
  const updatedStudents = (coaching.students || []).filter(id => id !== studentId);
  const updatedIds = (studentProfile?.coachingIds || []).filter(id => id !== coachingId);
  const batch = writeBatch(db);
  batch.update(doc(db, "coachings", coachingId), { students: updatedStudents });
  batch.update(doc(db, "users", studentId), {
    coachingIds: updatedIds,
    coachingId: updatedIds[0] || null,
    status: updatedIds.length > 0 ? "approved" : "independent",
  });
  await batch.commit();
}

/* -- SUPER ADMIN -------------------------------------------- */

export async function getAllUsers() {
  try {
    const snap = await getDocs(collection(db, "users"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error("getAllUsers error:", error);
    return [];
  }
}
