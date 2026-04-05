// src/components/superadmin/SuperAdminDashboard.jsx
// ============================================================
// Platform-level overview for the super admin.
// ============================================================

import React, { useEffect, useState } from "react";
import { getAllCoachings, getAllUsers } from "../../services/firestoreService";
import { formatDate } from "../../utils/helpers";
import toast from "react-hot-toast";

export default function SuperAdminDashboard({ active }) {
  const [coachings, setCoachings] = useState([]);
  const [users,     setUsers]     = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([getAllCoachings(), getAllUsers()])
      .then(([c, u]) => { setCoachings(c); setUsers(u); })
      .catch(() => toast.error("Failed to load data."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
      <span className="spinner" />
    </div>
  );

  const admins   = users.filter(u => u.role === "admin");
  const students = users.filter(u => u.role === "student");

  if (active === "dashboard") return (
    <div className="fade-in">
      <div className="page-header">
        <h2>Platform Overview</h2>
        <p>EduPulse multi-tenant dashboard</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Institutes</span>
          <span className="stat-value" style={{ color: "var(--accent2)" }}>{coachings.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Students</span>
          <span className="stat-value" style={{ color: "var(--green)" }}>{students.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Admins</span>
          <span className="stat-value" style={{ color: "var(--blue)" }}>{admins.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Platform Users</span>
          <span className="stat-value" style={{ color: "var(--amber)" }}>{users.length}</span>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 15, marginBottom: 16 }}>Registered Institutes</h3>
        {coachings.length === 0 && (
          <div className="empty-state"><div className="emoji">🏫</div><p>No institutes registered yet</p></div>
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
            {coachings.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: 500 }}>{c.name}</td>
                <td style={{ color: "var(--text2)" }}>{c.city || "—"}</td>
                <td><span className="chip">{c.subject || "—"}</span></td>
                <td>{(c.students || []).length}</td>
                <td><span className="badge badge-approved">Active</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (active === "institutes") return (
    <div className="fade-in">
      <div className="page-header">
        <h2>All Institutes</h2>
        <p>{coachings.length} registered coaching institutes</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {coachings.map(c => (
          <div key={c.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 600, fontFamily: "Syne, sans-serif", fontSize: 16 }}>{c.name}</div>
              <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 4 }}>
                📍 {c.city || "—"} · 📚 {c.subject || "—"} · 👥 {(c.students || []).length} students
              </div>
              {c.phone && <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>📞 {c.phone}</div>}
            </div>
            <span className="badge badge-approved">Active</span>
          </div>
        ))}
        {coachings.length === 0 && (
          <div className="card empty-state"><div className="emoji">🏫</div><p>No institutes yet</p></div>
        )}
      </div>
    </div>
  );

  if (active === "users") return (
    <div className="fade-in">
      <div className="page-header">
        <h2>All Users</h2>
        <p>{users.length} registered platform users</p>
      </div>
      <div className="card">
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={{ fontWeight: 500 }}>{u.name}</td>
                <td style={{ color: "var(--text2)" }}>{u.email}</td>
                <td>
                  <span className={`badge badge-${u.role === "admin" ? "info" : u.role === "superadmin" ? "accent" : "approved"}`}>
                    {u.role}
                  </span>
                </td>
                <td>
                  <span className={`badge badge-${u.status === "approved" || u.status === "active" ? "approved" : u.status === "pending" ? "pending" : "rejected"}`}>
                    {u.status || "active"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return null;
}
