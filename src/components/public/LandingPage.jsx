// src/components/public/LandingPage.jsx
// ============================================================
// Public homepage — lists all coaching institutes.
// No login required. Students discover and join from here.
// ============================================================

import React, { useEffect, useState, useRef } from "react";
import { getAllCoachings } from "../../services/firestoreService";

const SUBJECTS = ["All", "IIT-JEE", "NEET", "UPSC", "Class 12", "Class 10", "Commerce", "Banking", "Mathematics", "Physics", "Computer Science"];

function getInitials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join("");
}

const AVATAR_COLORS = [
  ["#6366f1","#818cf8"], ["#8b5cf6","#a78bfa"], ["#ec4899","#f472b6"],
  ["#06b6d4","#22d3ee"], ["#10b981","#34d399"], ["#f59e0b","#fbbf24"],
  ["#ef4444","#f87171"], ["#3b82f6","#60a5fa"],
];

function getColor(name) {
  const i = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[i];
}

export default function LandingPage({ onShowAuth, preSelectCoaching }) {
  const [coachings, setCoachings] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [cityFilter, setCityFilter] = useState("All");
  const [subFilter,  setSubFilter]  = useState("All");
  const searchRef = useRef(null);

  useEffect(() => {
    getAllCoachings()
      .then(list => setCoachings(list))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Unique cities from data
  const cities = ["All", ...Array.from(new Set(coachings.map(c => c.city).filter(Boolean)))];

  const filtered = coachings.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name?.toLowerCase().includes(q) || c.city?.toLowerCase().includes(q) || c.subject?.toLowerCase().includes(q);
    const matchCity = cityFilter === "All" || c.city === cityFilter;
    const matchSub  = subFilter  === "All" || c.subject?.toLowerCase().includes(subFilter.toLowerCase());
    return matchSearch && matchCity && matchSub;
  });

  const totalStudents = coachings.reduce((s, c) => s + (c.students?.length || 0), 0);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "DM Sans, sans-serif" }}>

      {/* ── Top Nav ───────────────────────────────────────── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(13,13,26,0.85)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
        padding: "0 24px", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "var(--accent)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm-2 11.5v3.5L12 19l2-1v-3.5L12 16l-2-1.5z"/>
            </svg>
          </div>
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 20, color: "var(--accent2)" }}>
            EduPulse
          </span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onShowAuth("login")}
          >
            Sign In
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onShowAuth("register")}
          >
            Register Free
          </button>
        </div>
      </nav>

      {/* ── Hero Section ──────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.08) 50%, transparent 100%)",
        borderBottom: "1px solid var(--border)",
        padding: "64px 24px 48px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background glow */}
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
              {coachings.length} Institutes Listed
            </span>
          </div>

          <h1 style={{
            fontFamily: "Syne, sans-serif", fontSize: "clamp(32px, 6vw, 60px)",
            fontWeight: 900, lineHeight: 1.1, marginBottom: 16,
            background: "linear-gradient(135deg, #fff 0%, var(--accent2) 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Find Your Perfect<br />Coaching Institute
          </h1>
          <p style={{ fontSize: 16, color: "var(--text2)", marginBottom: 36, maxWidth: 520, margin: "0 auto 36px" }}>
            Discover top coaching centres for IIT-JEE, NEET, UPSC &amp; more.
            Browse, compare, and join — all in one place.
          </p>

          {/* Search bar */}
          <div style={{
            display: "flex", maxWidth: 540, margin: "0 auto",
            background: "var(--bg2)", border: "1px solid var(--border)",
            borderRadius: 14, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          }}>
            <div style={{ display: "flex", alignItems: "center", padding: "0 16px", color: "var(--text3)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
            </div>
            <input
              ref={searchRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by institute name, city, or subject..."
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                fontSize: 14, color: "var(--text)", padding: "14px 0",
              }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "var(--text3)", padding: "0 16px", cursor: "pointer", fontSize: 18 }}>
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats Banner ──────────────────────────────────── */}
      <div style={{
        display: "flex", justifyContent: "center", gap: 0,
        background: "var(--bg2)", borderBottom: "1px solid var(--border)",
        flexWrap: "wrap",
      }}>
        {[
          { label: "Institutes", value: coachings.length, icon: "🏫" },
          { label: "Total Students", value: totalStudents, icon: "👨‍🎓" },
          { label: "Cities", value: cities.length - 1, icon: "📍" },
          { label: "Subjects", value: "10+", icon: "📚" },
        ].map((s, i) => (
          <div key={i} style={{
            padding: "18px 36px", textAlign: "center",
            borderRight: i < 3 ? "1px solid var(--border)" : "none",
          }}>
            <div style={{ fontSize: 20 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", fontFamily: "Syne, sans-serif" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Filters ───────────────────────────────────────── */}
      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.07em", paddingTop: 8 }}>City:</span>
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
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.07em", paddingTop: 8 }}>Subject:</span>
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
      </div>

      {/* ── Coaching Cards ────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        {/* Results count */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <p style={{ fontSize: 13, color: "var(--text2)" }}>
            {loading ? "Loading institutes..." : `Showing ${filtered.length} of ${coachings.length} institutes`}
            {(search || cityFilter !== "All" || subFilter !== "All") && (
              <button
                onClick={() => { setSearch(""); setCityFilter("All"); setSubFilter("All"); }}
                style={{ marginLeft: 12, fontSize: 11, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
              >
                Clear filters
              </button>
            )}
          </p>
          <div style={{ fontSize: 12, color: "var(--text3)" }}>
            🔥 Updated live
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <span className="spinner" style={{ width: 40, height: 40 }} />
            <p style={{ color: "var(--text3)", marginTop: 16, fontSize: 14 }}>Discovering institutes...</p>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 22, marginBottom: 8 }}>No institutes found</h3>
            <p style={{ color: "var(--text2)", fontSize: 14 }}>
              Try adjusting your search or filters
            </p>
            <button className="btn btn-secondary" style={{ marginTop: 20 }} onClick={() => { setSearch(""); setCityFilter("All"); setSubFilter("All"); }}>
              Clear All Filters
            </button>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
          {filtered.map(c => (
            <CoachingCard
              key={c.id}
              coaching={c}
              onJoin={() => { preSelectCoaching(c); onShowAuth("register"); }}
            />
          ))}
        </div>
      </div>

      {/* ── CTA Banner ────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg, var(--accent) 0%, #8b5cf6 100%)",
        padding: "48px 24px", textAlign: "center", marginTop: 40,
      }}>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 12 }}>
          Own a Coaching Institute?
        </h2>
        <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 15, marginBottom: 24 }}>
          List your institute on EduPulse. Manage students, fees, attendance & more — all free.
        </p>
        <button
          className="btn"
          style={{ background: "#fff", color: "var(--accent)", fontWeight: 700, fontSize: 14, padding: "12px 28px", borderRadius: 10 }}
          onClick={() => onShowAuth("register-admin")}
        >
          Register Your Institute →
        </button>
      </div>

      {/* ── Footer ───────────────────────────────────────── */}
      <div style={{
        borderTop: "1px solid var(--border)", padding: "24px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 12, color: "var(--text3)", fontSize: 12,
      }}>
        <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "var(--accent2)" }}>EduPulse</span>
        <span>© 2026 EduPulse · Coaching Institute Management Platform</span>
        <div style={{ display: "flex", gap: 16 }}>
          <button onClick={() => onShowAuth("login")} style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: 12 }}>Sign In</button>
          <button onClick={() => onShowAuth("register")} style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: 12 }}>Register</button>
        </div>
      </div>
    </div>
  );
}

// ── Individual Coaching Card ───────────────────────────────────
function CoachingCard({ coaching, onJoin }) {
  const [colors] = useState(() => getColor(coaching.name || "A"));
  const studentCount = coaching.students?.length || 0;
  const initials = getInitials(coaching.name);

  const mapsUrl = coaching.city
    ? `https://www.google.com/maps/search/${encodeURIComponent((coaching.name || "") + " " + (coaching.city || ""))}`
    : null;

  const waUrl = coaching.whatsapp || coaching.phone
    ? `https://wa.me/${(coaching.whatsapp || coaching.phone || "").replace(/\D/g, "").replace(/^/, "91")}`
    : null;

  // Parse subjects into tags
  const subjects = (coaching.subject || "").split(/[,\/]/).map(s => s.trim()).filter(Boolean);

  return (
    <div
      className="card"
      style={{
        padding: 0, overflow: "hidden",
        transition: "transform 0.2s, box-shadow 0.2s",
        cursor: "default",
        display: "flex", flexDirection: "column",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 20px 60px rgba(0,0,0,0.4)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      {/* Card gradient top bar */}
      <div style={{
        height: 6,
        background: `linear-gradient(90deg, ${colors[0]}, ${colors[1]})`,
      }} />

      <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
          {/* Avatar */}
          <div style={{
            width: 56, height: 56, borderRadius: 14, flexShrink: 0,
            background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, fontWeight: 800, color: "#fff",
            fontFamily: "Syne, sans-serif",
            boxShadow: `0 8px 20px ${colors[0]}44`,
          }}>
            {initials || "?"}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3, lineHeight: 1.3 }}>
              {coaching.name || "Unnamed Institute"}
            </div>
            {/* Location */}
            {coaching.city && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  color: "var(--accent2)", fontSize: 12, textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                {coaching.city}
                <span style={{ color: "var(--text3)", fontSize: 10 }}>↗</span>
              </a>
            )}
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
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            {subjects.slice(0, 4).map((s, i) => (
              <span key={i} style={{
                fontSize: 10, padding: "3px 10px", borderRadius: 20, fontWeight: 600,
                background: `${colors[0]}20`, color: colors[0],
                border: `1px solid ${colors[0]}30`, letterSpacing: "0.04em",
              }}>
                {s.toUpperCase()}
              </span>
            ))}
          </div>
        )}

        {/* Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16, flex: 1 }}>
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
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: 40, height: 40, borderRadius: 8, background: "#25d366",
                display: "flex", alignItems: "center", justifyContent: "center",
                textDecoration: "none", flexShrink: 0,
                boxShadow: "0 4px 12px rgba(37,211,102,0.3)",
              }}
              onClick={e => e.stopPropagation()}
              title="Chat on WhatsApp"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
          )}
          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: 40, height: 40, borderRadius: 8, background: "var(--bg3)",
                border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                textDecoration: "none", flexShrink: 0, color: "var(--text2)",
              }}
              onClick={e => e.stopPropagation()}
              title="View on Google Maps"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
