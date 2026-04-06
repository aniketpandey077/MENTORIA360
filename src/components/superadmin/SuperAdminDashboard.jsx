// src/components/superadmin/SuperAdminDashboard.jsx
// ============================================================
// Platform-level overview for the super admin.
// Manages all institutes, users, and platform analytics.
// ============================================================

import React, { useEffect, useState } from "react";
import { getAllCoachings, getAllUsers } from "../../services/firestoreService";
import { formatDate } from "../../utils/helpers";
import toast from "react-hot-toast";

const ROLE_COLOR = {
  superadmin: "#ec4899",
  admin:      "#6366f1",
  student:    "#10b981",
};

function StatCard({ label, value, icon, color }) {
  return (
    <div className="stat-card" style={{ textAlign: "center" }}>
      <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
      <span className="stat-value" style={{ color: color || "var(--text)", fontSize: 32, display: "block" }}>
        {value}
      </span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

export default function SuperAdminDashboard({ active }) {
  const [coachings, setCoachings] = useState([]);
  const [users,     setUsers]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");

  useEffect(() => {
    Promise.all([getAllCoachings(), getAllUsers()])
      .then(([c, u]) => { setCoachings(c); setUsers(u); })
      .catch(() => toast.error("Failed to load data — check Firestore rules."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "100px 0", gap: 16 }}>
      <span className="spinner" style={{ width: 40, height: 40 }} />
      <p style={{ color: "var(--text3)", fontSize: 14 }}>Loading platform data...</p>
    </div>
  );

  const admins   = users.filter(u => u.role === "admin");
  const students = users.filter(u => u.role === "student");
  const pending  = students.filter(u => u.status === "pending");
  const totalStudentsEnrolled = coachings.reduce((s, c) => s + (c.students?.length || 0), 0);

  // ── Dashboard Overview ──────────────────────────────────────
  if (active === "dashboard") {
    const recentCoachings = [...coachings]
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      .slice(0, 5);

    return (
      <div className="fade-in">
        <div className="page-header">
          <h2>🚀 Platform Overview</h2>
          <p>EduPulse multi-tenant coaching management platform</p>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: 28 }}>
          <StatCard label="Total Institutes"  value={coachings.length}          icon="🏫" color="var(--accent2)" />
          <StatCard label="Total Admins"      value={admins.length}             icon="👨‍💼" color="var(--accent)" />
          <StatCard label="Total Students"    value={students.length}           icon="👨‍🎓" color="var(--green)" />
          <StatCard label="Enrolled Students" value={totalStudentsEnrolled}     icon="✅"  color="var(--blue)"  />
          <StatCard label="Pending Approvals" value={pending.length}            icon="⏳"  color="var(--amber)" />
          <StatCard label="Platform Users"    value={users.length}              icon="👥"  color="var(--text)"  />
        </div>

        {/* Quick Insights */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          {/* Top institutes by student count */}
          <div className="card">
            <h3 style={{ fontSize: 14, marginBottom: 16, color: "var(--text2)" }}>🏆 Top Institutes by Students</h3>
            {[...coachings]
              .sort((a, b) => (b.students?.length || 0) - (a.students?.length || 0))
              .slice(0, 5)
              .map((c, i) => (
                <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text3)", minWidth: 20 }}>#{i + 1}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text3)" }}>📍 {c.city || "—"}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--green)" }}>{c.students?.length || 0}</span>
                    <span style={{ fontSize: 11, color: "var(--text3)" }}>students</span>
                  </div>
                </div>
              ))}
            {coachings.length === 0 && <div className="empty-state" style={{ padding: 20 }}><p>No institutes yet</p></div>}
          </div>

          {/* City distribution */}
          <div className="card">
            <h3 style={{ fontSize: 14, marginBottom: 16, color: "var(--text2)" }}>📍 City Distribution</h3>
            {(() => {
              const cityMap = {};
              coachings.forEach(c => {
                if (c.city) cityMap[c.city] = (cityMap[c.city] || 0) + 1;
              });
              const sorted = Object.entries(cityMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
              const max = sorted[0]?.[1] || 1;
              return sorted.map(([city, count]) => (
                <div key={city} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ fontWeight: 500 }}>{city}</span>
                    <span style={{ color: "var(--text3)" }}>{count} institute{count > 1 ? "s" : ""}</span>
                  </div>
                  <div style={{ height: 6, background: "var(--bg3)", borderRadius: 10, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 10,
                      width: `${(count / max) * 100}%`,
                      background: "linear-gradient(90deg, var(--accent), var(--accent2))",
                      transition: "width 0.5s",
                    }} />
                  </div>
                </div>
              ));
            })()}
            {coachings.length === 0 && <div className="empty-state" style={{ padding: 20 }}><p>No data yet</p></div>}
          </div>
        </div>

        {/* Recently registered institutes */}
        <div className="card">
          <h3 style={{ fontSize: 14, marginBottom: 16, color: "var(--text2)" }}>🆕 Recently Registered Institutes</h3>
          {recentCoachings.length === 0 && (
            <div className="empty-state"><div className="emoji">🏫</div><p>No institutes yet</p></div>
          )}
          <table>
            <thead>
              <tr>
                <th>Institute</th>
                <th>City</th>
                <th>Focus</th>
                <th>Students</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentCoachings.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td style={{ color: "var(--text2)" }}>{c.city || "—"}</td>
                  <td>
                    {c.subject ? <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "var(--accent-bg)", color: "var(--accent)" }}>{c.subject}</span> : "—"}
                  </td>
                  <td style={{ fontWeight: 600, color: "var(--green)" }}>{(c.students || []).length}</td>
                  <td><span className="badge badge-approved">Active</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ── All Institutes ──────────────────────────────────────────
  if (active === "institutes") {
    const filtered = coachings.filter(c => {
      const q = search.toLowerCase();
      return !q || c.name?.toLowerCase().includes(q) || c.city?.toLowerCase().includes(q) || c.subject?.toLowerCase().includes(q);
    });

    return (
      <div className="fade-in">
        <div className="page-header">
          <h2>🏫 All Institutes</h2>
          <p>{coachings.length} registered coaching institutes on the platform</p>
        </div>

        {/* Search */}
        <div className="search-wrap" style={{ marginBottom: 20 }}>
          <span className="search-icon">🔍</span>
          <input placeholder="Search by name, city, subject..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.length === 0 && (
            <div className="card empty-state"><div className="emoji">🏫</div><p>No institutes found</p></div>
          )}
          {filtered.map(c => {
            const admin = users.find(u => u.uid === c.adminId || u.id === c.adminId);
            const mapsUrl = c.city ? `https://www.google.com/maps/search/${encodeURIComponent(c.name + " " + c.city)}` : null;
            const studentCount = c.students?.length || 0;

            return (
              <div key={c.id} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                  {/* Left */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 10, background: "var(--accent)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 18, fontWeight: 800, color: "#fff", flexShrink: 0,
                      }}>
                        {c.name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</div>
                        {mapsUrl ? (
                          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "var(--accent2)", textDecoration: "none" }}>
                            📍 {c.city || "—"} ↗
                          </a>
                        ) : (
                          <span style={{ fontSize: 12, color: "var(--text3)" }}>📍 {c.city || "—"}</span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12, color: "var(--text2)" }}>
                      {c.subject && <span>📚 {c.subject}</span>}
                      {c.phone   && <span>📞 {c.phone}</span>}
                      {admin     && <span>👨‍💼 Admin: {admin.name}</span>}
                    </div>
                  </div>

                  {/* Right */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    <span className="badge badge-approved">Active</span>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "var(--green)", textAlign: "right" }}>
                      {studentCount}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text3)" }}>students</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── All Users ───────────────────────────────────────────────
  if (active === "users") {
    const filtered = users.filter(u => {
      const q = search.toLowerCase();
      return !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.role?.toLowerCase().includes(q);
    });

    const roleGroups = {
      superadmin: filtered.filter(u => u.role === "superadmin"),
      admin:      filtered.filter(u => u.role === "admin"),
      student:    filtered.filter(u => u.role === "student"),
    };

    return (
      <div className="fade-in">
        <div className="page-header">
          <h2>👥 All Users</h2>
          <p>{users.length} registered platform users</p>
        </div>

        {/* Search */}
        <div className="search-wrap" style={{ marginBottom: 20 }}>
          <span className="search-icon">🔍</span>
          <input placeholder="Search by name, email, or role..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Role summary */}
        <div className="stats-grid" style={{ marginBottom: 20 }}>
          {Object.entries(roleGroups).map(([role, list]) => (
            <div key={role} className="stat-card" style={{ textAlign: "center" }}>
              <span className="stat-value" style={{ color: ROLE_COLOR[role], fontSize: 28 }}>{list.length}</span>
              <span className="stat-label" style={{ textTransform: "capitalize" }}>{role}s</span>
            </div>
          ))}
        </div>

        <div className="card">
          {filtered.length === 0 && (
            <div className="empty-state"><div className="emoji">👥</div><p>No users found</p></div>
          )}
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email / Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Institute</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const coaching = u.coachingId ? coachings.find(c => c.id === u.coachingId) : null;
                const statusBadge =
                  u.status === "approved" || u.status === "active" ? "approved" :
                  u.status === "pending" ? "pending" : "rejected";

                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: "50%",
                          background: ROLE_COLOR[u.role] || "var(--accent)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0,
                        }}>
                          {u.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <span style={{ fontWeight: 500, fontSize: 13 }}>{u.name || "—"}</span>
                      </div>
                    </td>
                    <td style={{ color: "var(--text2)", fontSize: 12 }}>
                      {u.email || u.phone || "—"}
                    </td>
                    <td>
                      <span style={{
                        fontSize: 10, padding: "3px 10px", borderRadius: 20, fontWeight: 700,
                        background: (ROLE_COLOR[u.role] || "var(--accent)") + "22",
                        color: ROLE_COLOR[u.role] || "var(--accent)",
                        textTransform: "uppercase", letterSpacing: "0.05em",
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${statusBadge}`}>{u.status || "active"}</span>
                    </td>
                    <td style={{ color: "var(--text2)", fontSize: 12 }}>
                      {coaching?.name || (u.coachingId ? "Unknown" : "—")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ── Fallback (should never happen) ─────────────────────────
  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>🚀 Platform Overview</h2>
        <p>Select a section from the sidebar</p>
      </div>
      <div className="card empty-state">
        <div className="emoji">🔧</div>
        <p>Select a page from the sidebar to continue</p>
      </div>
    </div>
  );
}
