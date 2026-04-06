// src/components/public/LandingPage.jsx
// ============================================================
// Public homepage — Mentoria360
// Section 1: Coaching Institutes (with filters, address, reviews)
// Section 2: Tutors (separate grid)
// Includes: promo banner, years of experience, star ratings
// ============================================================

import React, { useEffect, useState, useRef } from "react";
import { getAllCoachings, getAllTutors } from "../../services/firestoreService";

const SUBJECTS = ["All", "IIT-JEE", "NEET", "UPSC", "Class 12", "Class 10", "Commerce", "Banking", "Mathematics", "Physics", "Computer Science"];

function getInitials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join("");
}

const AVATAR_COLORS = [
  ["#6366f1","#818cf8"], ["#8b5cf6","#a78bfa"], ["#ec4899","#f472b6"],
  ["#06b6d4","#22d3ee"], ["#10b981","#34d399"], ["#f59e0b","#fbbf24"],
  ["#ef4444","#f87171"], ["#3b82f6","#60a5fa"],
];

function getColor(name = "A") {
  const i = (name.charCodeAt(0) || 65) % AVATAR_COLORS.length;
  return AVATAR_COLORS[i];
}

function StarDisplay({ rating = 0, count = 0 }) {
  const stars = Math.round(rating);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <div style={{ display: "flex", gap: 1 }}>
        {[1,2,3,4,5].map(i => (
          <span key={i} style={{ fontSize: 11, color: i <= stars ? "#f59e0b" : "var(--border2)" }}>★</span>
        ))}
      </div>
      {rating > 0 && (
        <span style={{ fontSize: 11, color: "var(--text3)" }}>
          {rating} ({count})
        </span>
      )}
    </div>
  );
}

export default function LandingPage({ onShowAuth, preSelectCoaching }) {
  const [coachings, setCoachings] = useState([]);
  const [tutors,    setTutors]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [tutorSearch, setTutorSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("All");
  const [subFilter,  setSubFilter]  = useState("All");
  const [activeSection, setActiveSection] = useState("coachings"); // "coachings" | "tutors"
  const coachingsRef = useRef(null);
  const tutorsRef    = useRef(null);

  useEffect(() => {
    Promise.all([getAllCoachings(), getAllTutors()])
      .then(([c, t]) => { setCoachings(c); setTutors(t); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Unique cities from data
  const cities = ["All", ...Array.from(new Set(coachings.map(c => c.city).filter(Boolean)))];

  const filteredCoachings = coachings.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name?.toLowerCase().includes(q) || c.city?.toLowerCase().includes(q)
      || c.subject?.toLowerCase().includes(q) || c.address?.toLowerCase().includes(q);
    const matchCity = cityFilter === "All" || c.city === cityFilter;
    const matchSub  = subFilter  === "All" || c.subject?.toLowerCase().includes(subFilter.toLowerCase());
    return matchSearch && matchCity && matchSub;
  });

  const filteredTutors = tutors.filter(t => {
    const q = tutorSearch.toLowerCase();
    return !q || t.name?.toLowerCase().includes(q) || t.subject?.toLowerCase().includes(q)
      || t.city?.toLowerCase().includes(q);
  });

  const totalStudents = coachings.reduce((s, c) => s + (c.students?.length || 0), 0);

  const scrollTo = (section) => {
    setActiveSection(section);
    const ref = section === "coachings" ? coachingsRef : tutorsRef;
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "DM Sans, sans-serif" }}>

      {/* ── Top Nav ───────────────────────────────────────── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(13,13,26,0.92)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
        padding: "0 16px", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 8,
      }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{
            width: 32, height: 32,
            background: "linear-gradient(135deg, var(--accent), #8b5cf6)",
            borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="#fff">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm-2 11.5v3.5L12 19l2-1v-3.5L12 16l-2-1.5z"/>
            </svg>
          </div>
          <span className="landing-brand-text" style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 18, color: "var(--accent2)", whiteSpace: "nowrap" }}>
            Mentoria360
          </span>
        </div>

        {/* Nav tabs — hidden on mobile, shown on desktop */}
        <div className="landing-nav-tabs" style={{ display: "flex", gap: 4, flex: 1, justifyContent: "center" }}>
          <button
            onClick={() => scrollTo("coachings")}
            style={{
              background: activeSection === "coachings" ? "var(--accent-bg)" : "none",
              border: activeSection === "coachings" ? "1px solid rgba(108,99,255,0.4)" : "1px solid transparent",
              color: activeSection === "coachings" ? "var(--accent2)" : "var(--text2)",
              borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer",
              fontFamily: "DM Sans, sans-serif", transition: "all 0.2s", whiteSpace: "nowrap",
            }}
          >
            🏫 Coachings
          </button>
          <button
            onClick={() => scrollTo("tutors")}
            style={{
              background: activeSection === "tutors" ? "var(--accent-bg)" : "none",
              border: activeSection === "tutors" ? "1px solid rgba(108,99,255,0.4)" : "1px solid transparent",
              color: activeSection === "tutors" ? "var(--accent2)" : "var(--text2)",
              borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer",
              fontFamily: "DM Sans, sans-serif", transition: "all 0.2s", whiteSpace: "nowrap",
            }}
          >
            👨‍🏫 Tutors
          </button>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
          <button className="btn btn-secondary btn-sm landing-signin-btn" onClick={() => onShowAuth("login")}>Sign In</button>
          <button className="btn btn-primary btn-sm" onClick={() => onShowAuth("register")} style={{ whiteSpace: "nowrap" }}>Register</button>
        </div>
      </nav>

      {/* ── Mobile section switcher (shown only on small screens) */}
      <div className="landing-mobile-tabs">
        <button
          onClick={() => scrollTo("coachings")}
          style={{
            flex: 1, padding: "9px 0", border: "none",
            background: activeSection === "coachings" ? "var(--accent-bg)" : "transparent",
            color: activeSection === "coachings" ? "var(--accent2)" : "var(--text2)",
            borderBottom: activeSection === "coachings" ? "2px solid var(--accent)" : "2px solid transparent",
            fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "DM Sans, sans-serif",
          }}
        >🏫 Coachings</button>
        <button
          onClick={() => scrollTo("tutors")}
          style={{
            flex: 1, padding: "9px 0", border: "none",
            background: activeSection === "tutors" ? "var(--accent-bg)" : "transparent",
            color: activeSection === "tutors" ? "var(--accent2)" : "var(--text2)",
            borderBottom: activeSection === "tutors" ? "2px solid var(--accent)" : "2px solid transparent",
            fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "DM Sans, sans-serif",
          }}
        >👨‍🏫 Tutors</button>
      </div>

      {/* ── Hero Section ──────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.08) 50%, transparent 100%)",
        borderBottom: "1px solid var(--border)",
        padding: "clamp(32px, 8vw, 64px) 16px clamp(28px, 6vw, 48px)",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)",
          width: 600, height: 300,
          background: "radial-gradient(ellipse, rgba(99,102,241,0.2) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: 20, padding: "4px 14px", marginBottom: 20,
          }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--green)", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 12, color: "var(--accent2)", fontWeight: 600 }}>
              {coachings.length} Institutes · {tutors.length} Tutors Listed
            </span>
          </div>

          <h1 style={{
            fontFamily: "Syne, sans-serif", fontSize: "clamp(26px, 7vw, 60px)",
            fontWeight: 900, lineHeight: 1.1, marginBottom: 14,
            background: "linear-gradient(135deg, #fff 0%, var(--accent2) 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Find Your Perfect<br />Coach or Institute
          </h1>
          <p style={{ fontSize: "clamp(13px, 3.5vw, 16px)", color: "var(--text2)", maxWidth: 520, margin: "0 auto 28px" }}>
            Discover top coaching centres & private tutors for IIT-JEE, NEET, UPSC & more.
            Browse, compare, and join — all in one place.
          </p>

          {/* Search bar */}
          <div style={{
            display: "flex", maxWidth: 560, margin: "0 auto",
            background: "var(--bg2)", border: "1px solid var(--border)",
            borderRadius: 14, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          }}>
            <div style={{ display: "flex", alignItems: "center", padding: "0 14px", color: "var(--text3)", flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
            </div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search institutes, subjects, city..."
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                fontSize: 14, color: "var(--text)", padding: "12px 0", minWidth: 0,
              }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "var(--text3)", padding: "0 14px", cursor: "pointer", fontSize: 18, flexShrink: 0 }}>×</button>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats Banner ──────────────────────────────────── */}
      <div style={{
        display: "flex", justifyContent: "center",
        background: "var(--bg2)", borderBottom: "1px solid var(--border)",
        flexWrap: "wrap",
      }}>
        {[
          { label: "Institutes", value: coachings.length, icon: "🏫" },
          { label: "Tutors",     value: tutors.length,    icon: "👨‍🏫" },
          { label: "Students",   value: totalStudents,    icon: "👨‍🎓" },
          { label: "Subjects",   value: "10+",            icon: "📚" },
        ].map((s, i) => (
          <div key={i} style={{
            padding: "14px 20px", textAlign: "center", flex: "1 1 70px",
          }}>
            <div style={{ fontSize: 18 }}>{s.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", fontFamily: "Syne, sans-serif" }}>{s.value}</div>
            <div style={{ fontSize: 10, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── BIG PROMO BANNER ──────────────────────────────── */}
      <div
        className="promo-glow"
        style={{
          background: "linear-gradient(135deg, rgba(108,99,255,0.12) 0%, rgba(139,92,246,0.08) 100%)",
          border: "1px solid rgba(108,99,255,0.3)",
          borderRadius: 16,
          margin: "16px",
          padding: "18px 18px",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 14,
        }}
      >
        <div style={{ flex: "1 1 200px", minWidth: 0 }}>
          <div style={{ fontSize: 22, marginBottom: 4 }}>🚀</div>
          <h2 style={{
            fontFamily: "Syne, sans-serif", fontSize: "clamp(14px, 4vw, 22px)",
            fontWeight: 900, color: "#fff", marginBottom: 6,
          }}>
            List your institute on Mentoria360!
          </h2>
          <p style={{ color: "var(--text2)", fontSize: 13 }}>
            Reach thousands of students. Manage attendance, fees, classes & more — all free.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flexShrink: 0 }}>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onShowAuth("register-admin")}
            style={{ fontWeight: 700 }}
          >
            Register Institute →
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onShowAuth("register-tutor")}
            style={{ fontWeight: 700 }}
          >
            Register as Tutor →
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────── */}
      {/* ── COACHINGS SECTION ─────────────────────────────── */}
      {/* ───────────────────────────────────────────────────── */}
      <div ref={coachingsRef} style={{ maxWidth: 1240, margin: "0 auto", padding: "0 16px 48px" }}>

        {/* Section header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "32px 0 20px" }}>
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: "linear-gradient(135deg, var(--accent), #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
          }}>🏫</div>
          <div>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 22, fontWeight: 800 }}>Coaching Institutes</h2>
            <p style={{ color: "var(--text2)", fontSize: 13 }}>Browse verified coaching centres near you</p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ padding: "16px 0", borderBottom: "1px solid var(--border)", marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.07em" }}>📍 City:</span>
            {cities.slice(0, 8).map(c => (
              <button key={c}
                className={`btn btn-sm ${cityFilter === c ? "btn-primary" : "btn-secondary"}`}
                style={{ fontSize: 12 }}
                onClick={() => setCityFilter(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.07em" }}>📚 Subject:</span>
            {SUBJECTS.map(s => (
              <button key={s}
                className={`btn btn-sm ${subFilter === s ? "btn-primary" : "btn-secondary"}`}
                style={{ fontSize: 12 }}
                onClick={() => setSubFilter(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Results info */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <p style={{ fontSize: 13, color: "var(--text2)" }}>
            {loading ? "Loading institutes..." : `Showing ${filteredCoachings.length} of ${coachings.length} institutes`}
            {(search || cityFilter !== "All" || subFilter !== "All") && (
              <button
                onClick={() => { setSearch(""); setCityFilter("All"); setSubFilter("All"); }}
                style={{ marginLeft: 12, fontSize: 11, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
              >
                Clear filters
              </button>
            )}
          </p>
          <div style={{ fontSize: 12, color: "var(--text3)" }}>🔥 Updated live</div>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <span className="spinner" style={{ width: 40, height: 40 }} />
            <p style={{ color: "var(--text3)", marginTop: 16, fontSize: 14 }}>Discovering institutes...</p>
          </div>
        )}

        {!loading && filteredCoachings.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 20, marginBottom: 8 }}>No institutes found</h3>
            <p style={{ color: "var(--text2)", fontSize: 14 }}>Try adjusting your search or filters</p>
            <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={() => { setSearch(""); setCityFilter("All"); setSubFilter("All"); }}>
              Clear All Filters
            </button>
          </div>
        )}

        <div className="coaching-grid">
          {filteredCoachings.map(c => (
            <CoachingCard
              key={c.id}
              coaching={c}
              onJoin={() => { preSelectCoaching(c); onShowAuth("register"); }}
            />
          ))}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────── */}
      {/* ── TUTORS SECTION ────────────────────────────────── */}
      {/* ───────────────────────────────────────────────────── */}
      <div
        ref={tutorsRef}
        style={{
          borderTop: "2px solid var(--border)",
          background: "linear-gradient(180deg, rgba(139,92,246,0.05) 0%, transparent 60%)",
          padding: "0 16px 60px",
        }}
      >
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          {/* Section header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "32px 0 20px" }}>
            <div style={{
              width: 42, height: 42, borderRadius: 10,
              background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
            }}>👨‍🏫</div>
            <div>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 22, fontWeight: 800 }}>Private Tutors</h2>
              <p style={{ color: "var(--text2)", fontSize: 13 }}>One-on-one learning with expert tutors</p>
            </div>
          </div>

          {/* Tutor search */}
          <div style={{ marginBottom: 20, maxWidth: 400 }}>
            <div style={{
              display: "flex",
              background: "var(--bg2)", border: "1px solid var(--border)",
              borderRadius: 10, overflow: "hidden",
            }}>
              <div style={{ display: "flex", alignItems: "center", padding: "0 12px", color: "var(--text3)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
              </div>
              <input
                value={tutorSearch}
                onChange={e => setTutorSearch(e.target.value)}
                placeholder="Search tutors by name, subject, city..."
                style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 13, color: "var(--text)", padding: "10px 0" }}
              />
            </div>
          </div>

          {!loading && tutors.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>👨‍🏫</div>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 20, marginBottom: 8 }}>No tutors listed yet</h3>
              <p style={{ color: "var(--text2)", fontSize: 14, marginBottom: 20 }}>
                Are you a tutor? Register on Mentoria360 and reach hundreds of students!
              </p>
              <button className="btn btn-primary" onClick={() => onShowAuth("register-tutor")}>
                Register as Tutor →
              </button>
            </div>
          )}

          <div className="tutors-grid">
            {filteredTutors.map(t => (
              <TutorCard key={t.id} tutor={t} onContact={() => onShowAuth("login")} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────── */}
      <div style={{
        borderTop: "1px solid var(--border)", padding: "16px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 10, color: "var(--text3)", fontSize: 12,
        background: "var(--bg2)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 24, height: 24, background: "linear-gradient(135deg, var(--accent), #8b5cf6)",
            borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#fff">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm-2 11.5v3.5L12 19l2-1v-3.5L12 16l-2-1.5z"/>
            </svg>
          </div>
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "var(--accent2)", fontSize: 14 }}>Mentoria360</span>
        </div>
        <span>© 2026 Mentoria360 · Coaching & Tutor Discovery Platform</span>
        <div style={{ display: "flex", gap: 16 }}>
          <button onClick={() => onShowAuth("login")} style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: 12 }}>Sign In</button>
          <button onClick={() => onShowAuth("register")} style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: 12 }}>Register</button>
        </div>
      </div>
    </div>
  );
}

// ── Coaching Card ──────────────────────────────────────────────
function CoachingCard({ coaching, onJoin }) {
  const [colors] = useState(() => getColor(coaching.name || "A"));
  const studentCount = coaching.students?.length || 0;
  const initials = getInitials(coaching.name);

  // Build full address string
  const fullAddress = [coaching.address, coaching.area, coaching.city, coaching.state, coaching.pincode]
    .filter(Boolean).join(", ");
  const mapsUrl = fullAddress
    ? `https://www.google.com/maps/search/${encodeURIComponent(coaching.name + " " + fullAddress)}`
    : coaching.city
      ? `https://www.google.com/maps/search/${encodeURIComponent((coaching.name || "") + " " + coaching.city)}`
      : null;

  const waUrl = coaching.whatsapp || coaching.phone
    ? `https://wa.me/${(coaching.whatsapp || coaching.phone || "").replace(/\D/g, "").replace(/^(?!91)/, "91")}`
    : null;

  const subjects = (coaching.subject || "").split(/[,\/]/).map(s => s.trim()).filter(Boolean);

  return (
    <div
      className="card"
      style={{
        padding: 0, overflow: "hidden",
        transition: "transform 0.2s, box-shadow 0.2s",
        display: "flex", flexDirection: "column",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 20px 60px rgba(0,0,0,0.4)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = ""; }}
    >
      {/* Gradient top bar */}
      <div style={{ height: 5, background: `linear-gradient(90deg, ${colors[0]}, ${colors[1]})` }} />

      <div style={{ padding: "18px", flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
          {/* Avatar */}
          <div style={{
            width: 52, height: 52, borderRadius: 12, flexShrink: 0,
            background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 800, color: "#fff",
            fontFamily: "Syne, sans-serif",
            boxShadow: `0 6px 18px ${colors[0]}44`,
          }}>
            {initials || "?"}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2, lineHeight: 1.3 }}>
              {coaching.name || "Unnamed Institute"}
            </div>
            {/* Star rating */}
            <StarDisplay rating={coaching.avgRating} count={coaching.reviewCount} />
          </div>

          {/* Student count badge */}
          <div style={{
            padding: "4px 10px", borderRadius: 20, flexShrink: 0,
            background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)",
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent2)" }}>
              👥 {studentCount}
            </span>
          </div>
        </div>

        {/* Subject tags */}
        {subjects.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            {subjects.slice(0, 4).map((s, i) => (
              <span key={i} style={{
                fontSize: 10, padding: "3px 9px", borderRadius: 20, fontWeight: 600,
                background: `${colors[0]}20`, color: colors[0],
                border: `1px solid ${colors[0]}30`, letterSpacing: "0.04em",
              }}>
                {s.toUpperCase()}
              </span>
            ))}
          </div>
        )}

        {/* Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 14, flex: 1 }}>
          {/* Full address */}
          {fullAddress && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: "var(--text2)" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--text3)", marginTop: 1, flexShrink: 0 }}>
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span style={{ lineHeight: 1.4 }}>{fullAddress}</span>
            </div>
          )}
          {/* Years of experience */}
          {coaching.yearsExp > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text2)" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--text3)" }}>
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
              </svg>
              <span><strong style={{ color: "var(--text)" }}>{coaching.yearsExp} years</strong> of experience</span>
            </div>
          )}
          {/* Phone */}
          {coaching.phone && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text2)" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--text3)" }}>
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
              {coaching.phone}
            </div>
          )}
          {studentCount > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text2)" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--text3)" }}>
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
              {studentCount} student{studentCount !== 1 ? "s" : ""} enrolled
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn btn-primary"
            style={{ flex: 1, fontSize: 13, fontWeight: 600 }}
            onClick={onJoin}
          >
            Join This Institute →
          </button>
          {waUrl && (
            <a href={waUrl} target="_blank" rel="noopener noreferrer"
              style={{
                width: 38, height: 38, borderRadius: 8, background: "#25d366",
                display: "flex", alignItems: "center", justifyContent: "center",
                textDecoration: "none", flexShrink: 0,
                boxShadow: "0 4px 12px rgba(37,211,102,0.3)",
              }}
              onClick={e => e.stopPropagation()}
              title="Chat on WhatsApp"
            >
              <svg viewBox="0 0 24 24" width="17" height="17" fill="#fff">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
          )}
          {mapsUrl && (
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
              style={{
                width: 38, height: 38, borderRadius: 8, background: "var(--bg3)",
                border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                textDecoration: "none", flexShrink: 0, color: "var(--text2)",
              }}
              onClick={e => e.stopPropagation()}
              title="View on Maps"
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Tutor Card ─────────────────────────────────────────────────
function TutorCard({ tutor, onContact }) {
  const [colors] = useState(() => getColor(tutor.name || "T"));
  const subjects = (tutor.subject || "").split(/[,\/]/).map(s => s.trim()).filter(Boolean);

  return (
    <div
      className="card"
      style={{
        padding: 0, overflow: "hidden",
        transition: "transform 0.2s, box-shadow 0.2s",
        display: "flex", flexDirection: "column",
        borderTop: `3px solid ${colors[0]}`,
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 20px 60px rgba(0,0,0,0.4)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = ""; }}
    >
      <div style={{ padding: "18px", flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
          {tutor.photoUrl ? (
            <img
              src={tutor.photoUrl} alt={tutor.name}
              style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: `2px solid ${colors[0]}` }}
            />
          ) : (
            <div style={{
              width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
              background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, fontWeight: 800, color: "#fff", fontFamily: "Syne, sans-serif",
            }}>
              {getInitials(tutor.name) || "T"}
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{tutor.name}</div>
            <StarDisplay rating={tutor.avgRating} count={tutor.reviewCount} />
          </div>

          {tutor.yearsExp > 0 && (
            <div style={{
              padding: "4px 10px", borderRadius: 20, flexShrink: 0,
              background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)",
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa" }}>
                {tutor.yearsExp}yr exp
              </span>
            </div>
          )}
        </div>

        {/* Bio */}
        {tutor.bio && (
          <p style={{ fontSize: 12, color: "var(--text2)", marginBottom: 10, lineHeight: 1.5 }}>
            {tutor.bio.slice(0, 100)}{tutor.bio.length > 100 ? "..." : ""}
          </p>
        )}

        {/* Subjects */}
        {subjects.length > 0 && (
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
            {subjects.slice(0, 5).map((s, i) => (
              <span key={i} style={{
                fontSize: 10, padding: "3px 9px", borderRadius: 20, fontWeight: 600,
                background: `${colors[0]}20`, color: colors[0],
                border: `1px solid ${colors[0]}30`,
              }}>
                {s.toUpperCase()}
              </span>
            ))}
          </div>
        )}

        {/* Location */}
        {tutor.city && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text2)", marginBottom: 12 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--text3)" }}>
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            {[tutor.city, tutor.state].filter(Boolean).join(", ")}
          </div>
        )}

        {/* Contact button */}
        <button
          className="btn btn-secondary"
          style={{ width: "100%", fontSize: 13, fontWeight: 600, marginTop: "auto" }}
          onClick={onContact}
          title="Sign in to contact this tutor"
        >
          Contact Tutor →
        </button>
      </div>
    </div>
  );
}
