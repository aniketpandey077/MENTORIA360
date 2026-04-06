// src/components/admin/AdminTests.jsx
// ============================================================
// Admin creates MCQ tests. Tracks who has attempted.
// ============================================================

import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { createTest, getTests, deleteTest, getTestAttempts } from "../../services/firestoreService";
import Modal from "../shared/Modal";
import toast from "react-hot-toast";

const SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Computer Science", "General"];
const emptyQ = () => ({ question: "", options: ["", "", "", ""], correct: 0 });

export default function AdminTests() {
  const { profile } = useAuth();
  const [tests,    setTests]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showAdd,  setShowAdd]  = useState(false);
  const [viewTest, setViewTest] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [form,     setForm]     = useState({
    title: "", subject: "Mathematics", duration: 30, dueDate: "",
    questions: [emptyQ()],
  });

  const load = async () => {
    try { setTests(await getTests(profile.coachingId)); }
    catch { toast.error("Failed to load tests."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const setField = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const addQuestion = () => setForm(f => ({ ...f, questions: [...f.questions, emptyQ()] }));
  const removeQ = (i) => setForm(f => ({ ...f, questions: f.questions.filter((_, idx) => idx !== i) }));
  const setQ = (i, key, val) => setForm(f => ({
    ...f,
    questions: f.questions.map((q, idx) => idx === i ? { ...q, [key]: val } : q)
  }));
  const setOpt = (qi, oi, val) => setForm(f => ({
    ...f,
    questions: f.questions.map((q, idx) => idx === qi ? { ...q, options: q.options.map((o, i) => i === oi ? val : o) } : q)
  }));

  const handleCreate = async () => {
    if (!form.title.trim()) { toast.error("Test title required."); return; }
    if (form.questions.some(q => !q.question.trim() || q.options.some(o => !o.trim()))) {
      toast.error("Please fill all questions and options."); return;
    }
    try {
      await createTest(profile.coachingId, { ...form, duration: Number(form.duration), authorName: profile.name });
      toast.success("Test created!");
      setShowAdd(false);
      setForm({ title: "", subject: "Mathematics", duration: 30, dueDate: "", questions: [emptyQ()] });
      load();
    } catch { toast.error("Failed to create test."); }
  };

  const viewAttempts = async (test) => {
    setViewTest(test);
    try {
      const list = await getTestAttempts(profile.coachingId, test.id);
      setAttempts(list);
    } catch { setAttempts([]); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this test?")) return;
    try {
      await deleteTest(profile.coachingId, id);
      setTests(prev => prev.filter(t => t.id !== id));
      toast.success("Deleted.");
    } catch { toast.error("Delete failed."); }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>🧪 Tests & Quizzes</h2>
        <p>Create MCQ tests and track student performance</p>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Create Test</button>
      </div>

      {loading && <div style={{ textAlign: "center", padding: 40 }}><span className="spinner" /></div>}

      {!loading && tests.length === 0 && (
        <div className="empty-state">
          <div className="emoji">🧪</div>
          <p>No tests created yet</p>
          <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => setShowAdd(true)}>
            Create First Test
          </button>
        </div>
      )}

      {tests.map(t => {
        const attemptCount = t.attemptCount || 0;
        const expired = t.dueDate && t.dueDate < new Date().toISOString().slice(0, 10);

        return (
          <div key={t.id} className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 600, background: "var(--accent-bg)", color: "var(--accent)" }}>
                    {t.subject?.toUpperCase()}
                  </span>
                  {expired && <span style={{ fontSize: 10, color: "var(--red)", fontWeight: 600 }}>EXPIRED</span>}
                </div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{t.title}</div>
                <div style={{ fontSize: 12, color: "var(--text3)" }}>
                  {t.questions?.length} questions · {t.duration} mins
                  {t.dueDate && ` · Due ${t.dueDate}`}
                  {" · "}<span style={{ color: "var(--accent2)" }}>{attemptCount} attempts</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => viewAttempts(t)}>Results</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.id)}>Delete</button>
              </div>
            </div>
          </div>
        );
      })}

      {/* View Results Modal */}
      {viewTest && (
        <Modal isOpen={!!viewTest} onClose={() => setViewTest(null)} title={`Results: ${viewTest.title}`}>
          {attempts.length === 0 ? (
            <div className="empty-state" style={{ padding: 24 }}><p>No attempts yet</p></div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 13, color: "var(--text2)" }}>
                <span>{attempts.length} student{attempts.length !== 1 ? "s" : ""} attempted</span>
                <span>Avg: {Math.round(attempts.reduce((s, a) => s + (a.score || 0), 0) / attempts.length)}%</span>
              </div>
              {attempts.sort((a, b) => (b.score || 0) - (a.score || 0)).map((a, i) => (
                <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ color: "var(--text3)", fontWeight: 600, minWidth: 20 }}>#{i + 1}</span>
                    <span style={{ fontWeight: 500 }}>{a.studentName}</span>
                  </div>
                  <span style={{
                    fontWeight: 700, fontSize: 14,
                    color: a.score >= 70 ? "var(--green)" : a.score >= 40 ? "var(--amber)" : "var(--red)"
                  }}>
                    {a.score}%
                  </span>
                </div>
              ))}
            </>
          )}
          <button className="btn btn-secondary" style={{ marginTop: 16, width: "100%" }} onClick={() => setViewTest(null)}>Close</button>
        </Modal>
      )}

      {/* Create Test Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Create New Test">
        <div className="form-group">
          <label className="form-label">Test Title *</label>
          <input placeholder="e.g. Chapter 3 Mock Test" value={form.title} onChange={setField("title")} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Subject</label>
            <select value={form.subject} onChange={setField("subject")}>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Duration (mins)</label>
            <input type="number" value={form.duration} onChange={setField("duration")} min={5} max={180} />
          </div>
          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input type="date" value={form.dueDate} onChange={setField("dueDate")} />
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, marginTop: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Questions</span>
            <button className="btn btn-secondary btn-sm" onClick={addQuestion}>+ Add Question</button>
          </div>
          <div style={{ maxHeight: 340, overflowY: "auto" }}>
            {form.questions.map((q, qi) => (
              <div key={qi} style={{ background: "var(--bg3)", borderRadius: 10, padding: 14, marginBottom: 12, border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text3)" }}>Q{qi + 1}</span>
                  {form.questions.length > 1 && (
                    <button onClick={() => removeQ(qi)} style={{ fontSize: 11, color: "var(--red)", background: "none", border: "none", cursor: "pointer" }}>✕ Remove</button>
                  )}
                </div>
                <input
                  placeholder="Question text..."
                  value={q.question}
                  onChange={e => setQ(qi, "question", e.target.value)}
                  style={{ width: "100%", marginBottom: 8, fontSize: 13 }}
                />
                {q.options.map((opt, oi) => (
                  <div key={oi} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <input
                      type="radio" name={`q${qi}`}
                      checked={q.correct === oi}
                      onChange={() => setQ(qi, "correct", oi)}
                      style={{ accentColor: "var(--green)" }}
                    />
                    <input
                      placeholder={`Option ${oi + 1}`}
                      value={opt}
                      onChange={e => setOpt(qi, oi, e.target.value)}
                      style={{ flex: 1, fontSize: 12 }}
                    />
                    {q.correct === oi && <span style={{ fontSize: 10, color: "var(--green)", fontWeight: 600 }}>✓ Correct</span>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleCreate}>Create Test</button>
          <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
        </div>
      </Modal>
    </div>
  );
}
