// src/components/student/StudentTests.jsx
// ============================================================
// Student attempts MCQ tests with timer and auto-scoring.
// ============================================================

import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getTests, submitTestAttempt, getStudentAttempts } from "../../services/firestoreService";
import toast from "react-hot-toast";

export default function StudentTests() {
  const { profile } = useAuth();
  const [tests,     setTests]     = useState([]);
  const [attempts,  setAttempts]  = useState({});   // { testId: attempt }
  const [loading,   setLoading]   = useState(true);
  const [active,    setActive]    = useState(null);  // test being taken
  const [answers,   setAnswers]   = useState({});    // { qIdx: optIdx }
  const [timeLeft,  setTimeLeft]  = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);

  const load = async () => {
    try {
      const list = await getTests(profile.coachingId);
      const myAttempts = await getStudentAttempts(profile.coachingId, profile.uid);
      const attMap = {};
      myAttempts.forEach(a => { attMap[a.testId] = a; });
      setTests(list);
      setAttempts(attMap);
    } catch {}
    finally { setLoading(false); }
  };
  useEffect(() => {
    if (!profile?.coachingId) { setLoading(false); return; }
    load();
  }, []);

  const startTest = (test) => {
    setActive(test);
    setAnswers({});
    setTimeLeft(test.duration * 60);
  };

  useEffect(() => {
    if (!active) { if (timerRef.current) clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [active]);

  const handleSubmit = async (auto = false) => {
    if (!active) return;
    if (!auto && Object.keys(answers).length < active.questions.length) {
      if (!window.confirm(`You've only answered ${Object.keys(answers).length}/${active.questions.length} questions. Submit anyway?`)) return;
    }
    setSubmitting(true);
    try {
      // Calculate score
      let correct = 0;
      active.questions.forEach((q, i) => {
        if (answers[i] === q.correct) correct++;
      });
      const score = Math.round((correct / active.questions.length) * 100);

      await submitTestAttempt(profile.coachingId, {
        testId:      active.id,
        testTitle:   active.title,
        studentId:   profile.uid,
        studentName: profile.name,
        answers,
        correct,
        total:       active.questions.length,
        score,
      });

      setAttempts(prev => ({ ...prev, [active.id]: { score, correct, total: active.questions.length } }));
      toast.success(`Test submitted! Score: ${score}%`);
      setActive(null);
    } catch { toast.error("Submission failed."); }
    finally { setSubmitting(false); }
  };

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  // ── Taking a test ──
  if (active) {
    const isExpiring = timeLeft < 60;
    return (
      <div className="fade-in">
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>{active.title}</h2>
            <div style={{ fontSize: 12, color: "var(--text3)" }}>{active.subject} · {active.questions.length} questions</div>
          </div>
          <div style={{
            fontSize: 22, fontWeight: 800, padding: "8px 20px", borderRadius: 10,
            background: isExpiring ? "var(--red)" : "var(--bg2)",
            color:      isExpiring ? "#fff"       : "var(--text)",
            border: "1px solid var(--border)", fontFamily: "monospace",
            animation: isExpiring ? "pulse 1s infinite" : "none",
          }}>
            ⏱ {formatTime(timeLeft)}
          </div>
        </div>

        {/* Progress */}
        <div style={{ height: 4, background: "var(--bg3)", borderRadius: 10, marginBottom: 24, overflow: "hidden" }}>
          <div style={{
            height: "100%", background: "var(--accent)", borderRadius: 10,
            width: `${(Object.keys(answers).length / active.questions.length) * 100}%`,
            transition: "width 0.3s"
          }} />
        </div>

        {active.questions.map((q, qi) => (
          <div key={qi} className="card" style={{ marginBottom: 16, borderLeft: answers[qi] !== undefined ? "3px solid var(--green)" : "3px solid var(--border)" }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14 }}>
              <span style={{ color: "var(--text3)", marginRight: 8 }}>Q{qi + 1}.</span>
              {q.question}
            </div>
            {q.options.map((opt, oi) => (
              <div
                key={oi}
                onClick={() => setAnswers(a => ({ ...a, [qi]: oi }))}
                style={{
                  padding: "10px 14px", borderRadius: 8, marginBottom: 8, cursor: "pointer",
                  border: `1px solid ${answers[qi] === oi ? "var(--accent)" : "var(--border)"}`,
                  background: answers[qi] === oi ? "var(--accent-bg)" : "var(--bg3)",
                  transition: "all 0.15s", fontSize: 13,
                  display: "flex", alignItems: "center", gap: 10,
                }}
              >
                <span style={{
                  width: 22, height: 22, borderRadius: "50%", border: `2px solid ${answers[qi] === oi ? "var(--accent)" : "var(--border)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  background: answers[qi] === oi ? "var(--accent)" : "transparent",
                  color: answers[qi] === oi ? "#fff" : "var(--text3)", fontSize: 11, fontWeight: 700,
                }}>
                  {String.fromCharCode(65 + oi)}
                </span>
                {opt}
              </div>
            ))}
          </div>
        ))}

        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleSubmit(false)} disabled={submitting}>
            {submitting ? <span className="spinner" /> : `Submit Test (${Object.keys(answers).length}/${active.questions.length} answered)`}
          </button>
          <button className="btn btn-secondary" onClick={() => { clearInterval(timerRef.current); setActive(null); }}>
            Exit
          </button>
        </div>
      </div>
    );
  }

  // ── Test list ──
  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>🧪 Tests & Quizzes</h2>
        <p>Attempt tests and view your scores</p>
      </div>

      {loading && <div style={{ textAlign: "center", padding: 40 }}><span className="spinner" /></div>}

      {!loading && tests.length === 0 && (
        <div className="empty-state">
          <div className="emoji">🧪</div>
          <p>No tests available yet</p>
          <span style={{ fontSize: 12, color: "var(--text3)" }}>Your institute admin will create tests here</span>
        </div>
      )}

      {tests.map(t => {
        const attempted = attempts[t.id];
        const expired = t.dueDate && t.dueDate < new Date().toISOString().slice(0, 10);
        const scoreColor = attempted?.score >= 70 ? "var(--green)" : attempted?.score >= 40 ? "var(--amber)" : "var(--red)";

        return (
          <div key={t.id} className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 600, background: "var(--accent-bg)", color: "var(--accent)" }}>
                    {t.subject?.toUpperCase()}
                  </span>
                  {expired && !attempted && <span style={{ fontSize: 10, color: "var(--red)", fontWeight: 600 }}>EXPIRED</span>}
                </div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{t.title}</div>
                <div style={{ fontSize: 12, color: "var(--text3)" }}>
                  {t.questions?.length} questions · {t.duration} mins
                  {t.dueDate && ` · Due ${t.dueDate}`}
                </div>
                {attempted && (
                  <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: scoreColor }}>{attempted.score}%</span>
                    <span style={{ fontSize: 12, color: "var(--text3)" }}>
                      {attempted.correct}/{attempted.total} correct
                    </span>
                  </div>
                )}
              </div>
              <div style={{ flexShrink: 0 }}>
                {attempted ? (
                  <span className={`badge badge-${attempted.score >= 70 ? "approved" : attempted.score >= 40 ? "pending" : "rejected"}`}>
                    {attempted.score >= 70 ? "Passed" : attempted.score >= 40 ? "Average" : "Failed"}
                  </span>
                ) : (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => startTest(t)}
                    disabled={expired}
                  >
                    {expired ? "Expired" : "Start Test →"}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
