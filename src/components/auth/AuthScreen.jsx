// src/components/auth/AuthScreen.jsx
// ============================================================
// Login + Registration screen.
// Students: sign up → search coaching → request to join.
// Admins: sign up → create coaching institute.
// ============================================================

import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  createCoaching,
  createJoinRequest,
  searchCoachings,
} from "../../services/firestoreService";
import toast from "react-hot-toast";

export default function AuthScreen() {
  const { login, register } = useAuth();

  const [tab,     setTab]     = useState("login");   // "login" | "register"
  const [regRole, setRegRole] = useState("student"); // "student" | "admin"
  const [step,    setStep]    = useState(1);         // multi-step registration

  const [form, setForm] = useState({
    email: "", password: "", name: "",
    // Admin-specific
    coachingName: "", city: "", subject: "", phone: "",
  });

  const [coachingResults, setCoachingResults]   = useState([]);
  const [selectedCoaching, setSelectedCoaching] = useState(null);
  const [searchQ, setSearchQ]                   = useState("");
  const [searching, setSearching]               = useState(false);
  const [loading,   setLoading]                 = useState(false);
  const [error,     setError]                   = useState("");

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  // ── Search coachings (student step 2) ──────────────────────
  const handleSearch = async (val) => {
    setSearchQ(val);
    if (!val.trim()) { setCoachingResults([]); return; }
    setSearching(true);
    try {
      const results = await searchCoachings(val);
      setCoachingResults(results);
    } catch {
      setCoachingResults([]);
    } finally {
      setSearching(false);
    }
  };

  // ── Login ──────────────────────────────────────────────────
  const handleLogin = async () => {
    setError(""); setLoading(true);
    try {
      await login(form.email, form.password);
    } catch (err) {
      setError(
        err.code === "auth/user-not-found"       ? "No account found with this email." :
        err.code === "auth/wrong-password"        ? "Incorrect password." :
        err.code === "auth/invalid-email"         ? "Invalid email address." :
        err.code === "auth/too-many-requests"     ? "Too many attempts. Try again later." :
        "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Register ───────────────────────────────────────────────
  const handleRegister = async () => {
    setError(""); setLoading(true);

    try {
      if (regRole === "admin") {
        // 1. Create coaching doc
        const coachingId = await createCoaching({
          name:    form.coachingName,
          city:    form.city,
          subject: form.subject,
          phone:   form.phone,
          whatsapp: form.phone,
        });

        // 2. Register admin user
        const user = await register(form.email, form.password, form.name, "admin", {
          coachingId,
        });

        // 3. Update coaching with adminId (we have user.uid now)
        // (firestoreService updateCoaching called in register flow if needed)
        toast.success("Institute registered! Welcome.");

      } else {
        // Student: step 1 = fill details, step 2 = select coaching
        if (step === 1) {
          if (!form.name || !form.email || !form.password) {
            setError("Please fill all fields."); setLoading(false); return;
          }
          setStep(2); setLoading(false); return;
        }

        if (!selectedCoaching) {
          setError("Please select a coaching institute."); setLoading(false); return;
        }

        // Register student (no coachingId yet — pending approval)
        const user = await register(form.email, form.password, form.name, "student", {
          requestedCoachingId: selectedCoaching.id,
          coachingId: null,
          status: "pending",
        });

        // Create join request
        await createJoinRequest(selectedCoaching.id, {
          studentId:    user.uid,
          studentName:  form.name,
          studentEmail: form.email,
        });

        toast.success("Join request sent! Awaiting approval.");
      }
    } catch (err) {
      setError(
        err.code === "auth/email-already-in-use" ? "This email is already registered." :
        err.code === "auth/weak-password"          ? "Password must be at least 6 characters." :
        err.code === "auth/invalid-email"          ? "Invalid email address." :
        err.message || "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (t) => { setTab(t); setError(""); setStep(1); setSelectedCoaching(null); };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg)",
      padding: 20,
    }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: 42, fontWeight: 800, color: "var(--accent2)" }}>
            EduPulse
          </h1>
          <p style={{ color: "var(--text2)", fontSize: 14, marginTop: 4 }}>
            Coaching Institute Management Platform
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ borderRadius: "var(--radius-lg)", padding: 36 }}>
          {/* Login / Register tabs */}
          <div className="tab-bar">
            <button className={`tab${tab === "login" ? " active" : ""}`} onClick={() => switchTab("login")}>
              Sign In
            </button>
            <button className={`tab${tab === "register" ? " active" : ""}`} onClick={() => switchTab("register")}>
              Register
            </button>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {/* ── LOGIN FORM ──────────────────────────────── */}
          {tab === "login" && (
            <>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" placeholder="your@email.com" value={form.email} onChange={set("email")} />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" placeholder="••••••••" value={form.password} onChange={set("password")}
                  onKeyDown={e => e.key === "Enter" && handleLogin()} />
              </div>
              <button className="btn btn-primary btn-full btn-lg" onClick={handleLogin} disabled={loading}>
                {loading ? <span className="spinner" /> : "Sign In"}
              </button>
            </>
          )}

          {/* ── REGISTER FORM ────────────────────────────── */}
          {tab === "register" && (
            <>
              {/* Role selector */}
              <div className="tab-bar">
                <button className={`tab${regRole === "student" ? " active" : ""}`} onClick={() => { setRegRole("student"); setStep(1); setError(""); }}>
                  Student
                </button>
                <button className={`tab${regRole === "admin" ? " active" : ""}`} onClick={() => { setRegRole("admin"); setStep(1); setError(""); }}>
                  Coaching Admin
                </button>
              </div>

              {/* Admin registration */}
              {regRole === "admin" && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input placeholder="Your name" value={form.name} onChange={set("name")} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input type="email" placeholder="admin@coaching.com" value={form.email} onChange={set("email")} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input type="password" placeholder="Min. 6 characters" value={form.password} onChange={set("password")} />
                  </div>
                  <div className="divider" />
                  <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Institute Details
                  </p>
                  <div className="form-group">
                    <label className="form-label">Institute Name</label>
                    <input placeholder="e.g. Brilliant Minds Institute" value={form.coachingName} onChange={set("coachingName")} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input placeholder="Delhi" value={form.city} onChange={set("city")} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Subject Focus</label>
                      <input placeholder="IIT-JEE / NEET" value={form.subject} onChange={set("subject")} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">WhatsApp / Phone</label>
                    <input placeholder="9876543210" value={form.phone} onChange={set("phone")} />
                  </div>
                  <button className="btn btn-primary btn-full" onClick={handleRegister} disabled={loading}>
                    {loading ? <span className="spinner" /> : "Register Institute"}
                  </button>
                </>
              )}

              {/* Student step 1 - basic details */}
              {regRole === "student" && step === 1 && (
                <>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input placeholder="Your name" value={form.name} onChange={set("name")} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" placeholder="you@email.com" value={form.email} onChange={set("email")} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input type="password" placeholder="Min. 6 characters" value={form.password} onChange={set("password")} />
                  </div>
                  <button className="btn btn-primary btn-full" onClick={handleRegister} disabled={loading}>
                    {loading ? <span className="spinner" /> : "Next: Select Coaching →"}
                  </button>
                </>
              )}

              {/* Student step 2 - select coaching */}
              {regRole === "student" && step === 2 && (
                <>
                  <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 12 }}>
                    Search and select a coaching institute to join:
                  </p>
                  <div className="search-wrap" style={{ marginBottom: 12 }}>
                    <span className="search-icon">🔍</span>
                    <input
                      placeholder="Search by name, city, or subject..."
                      value={searchQ}
                      onChange={e => handleSearch(e.target.value)}
                    />
                  </div>
                  <div style={{ maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                    {searching && <div style={{ textAlign: "center", padding: 16 }}><span className="spinner" /></div>}
                    {!searching && coachingResults.map(c => (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCoaching(c)}
                        style={{
                          padding: "12px 14px",
                          background: selectedCoaching?.id === c.id ? "var(--accent-bg)" : "var(--bg3)",
                          border: `1px solid ${selectedCoaching?.id === c.id ? "var(--accent)" : "var(--border)"}`,
                          borderRadius: 8,
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>
                          📍 {c.city} · 📚 {c.subject}
                        </div>
                      </div>
                    ))}
                    {!searching && searchQ && coachingResults.length === 0 && (
                      <div style={{ textAlign: "center", padding: 20, color: "var(--text3)", fontSize: 13 }}>
                        No institutes found for "{searchQ}"
                      </div>
                    )}
                    {!searchQ && (
                      <div style={{ textAlign: "center", padding: 20, color: "var(--text3)", fontSize: 13 }}>
                        Type to search institutes...
                      </div>
                    )}
                  </div>

                  {selectedCoaching && (
                    <div className="alert alert-info" style={{ fontSize: 12 }}>
                      Joining: <strong>{selectedCoaching.name}</strong> — your request will be reviewed by the admin.
                    </div>
                  )}

                  <button className="btn btn-primary btn-full" onClick={handleRegister} disabled={loading || !selectedCoaching}>
                    {loading ? <span className="spinner" /> : "Send Join Request"}
                  </button>
                  <button
                    className="btn btn-secondary btn-full"
                    style={{ marginTop: 8, fontSize: 13 }}
                    onClick={() => { setStep(1); setError(""); }}
                  >
                    ← Back
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
