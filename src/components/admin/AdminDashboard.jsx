// src/components/admin/AdminDashboard.jsx
// ============================================================
// Main dashboard for coaching admins. Shows stats, pending
// requests, recent transactions, and fee status overview.
// ============================================================

import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  getCoaching, getJoinRequests, getCoachingFees,
  getTransactions, approveJoinRequest, rejectJoinRequest,
  getStudentProfiles,
} from "../../services/firestoreService";
import { formatCurrency, formatDate, getInitials } from "../../utils/helpers";
import toast from "react-hot-toast";

export default function AdminDashboard({ setActive }) {
  const { profile } = useAuth();
  const [coaching,      setCoaching]      = useState(null);
  const [requests,      setRequests]      = useState([]);
  const [fees,          setFees]          = useState([]);
  const [transactions,  setTransactions]  = useState([]);
  const [studentCount,  setStudentCount]  = useState(0);
  const [loading,       setLoading]       = useState(true);

  const loadData = async () => {
    try {
      const c  = await getCoaching(profile.coachingId);
      const jr = await getJoinRequests(profile.coachingId);
      const f  = await getCoachingFees(profile.coachingId);
      const tx = await getTransactions(profile.coachingId);
      setCoaching(c);
      setRequests(jr.filter(r => r.status === "pending"));
      setFees(f);
      setTransactions(tx.slice(0, 5));
      setStudentCount(c?.students?.length || 0);
    } catch (e) {
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [profile.coachingId]);

  const handleApprove = async (req) => {
    try {
      await approveJoinRequest(profile.coachingId, req.id, req.studentId);
      toast.success(`${req.studentName} approved!`);
      setRequests(r => r.filter(x => x.id !== req.id));
      setStudentCount(n => n + 1);
    } catch { toast.error("Approval failed."); }
  };

  const handleReject = async (req) => {
    try {
      await rejectJoinRequest(profile.coachingId, req.id, req.studentId);
      toast.success(`${req.studentName}'s request rejected.`);
      setRequests(r => r.filter(x => x.id !== req.id));
    } catch { toast.error("Rejection failed."); }
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
      <span className="spinner" />
    </div>
  );

  const totalRevenue = fees.reduce((s, f) => s + (f.paid  || 0), 0);
  const totalDue     = fees.reduce((s, f) => s + (f.due   || 0), 0);

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>{coaching?.name || "Dashboard"}</h2>
        <p>{coaching?.city} · {coaching?.subject}</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Students</span>
          <span className="stat-value" style={{ color: "var(--accent2)" }}>{studentCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Revenue</span>
          <span className="stat-value" style={{ color: "var(--green)" }}>{formatCurrency(totalRevenue)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Pending Dues</span>
          <span className="stat-value" style={{ color: "var(--amber)" }}>{formatCurrency(totalDue)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Pending Requests</span>
          <span className="stat-value" style={{ color: requests.length > 0 ? "var(--red)" : "var(--green)" }}>
            {requests.length}
          </span>
        </div>
      </div>

      {/* Pending join requests */}
      {requests.length > 0 && (
        <div className="card" style={{ borderLeft: "3px solid var(--amber)", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ fontSize: 15 }}>Pending Join Requests</h3>
            <span className="badge badge-pending">{requests.length} pending</span>
          </div>
          {requests.map(r => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div className="avatar">{getInitials(r.studentName)}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{r.studentName}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>{r.studentEmail} · {formatDate(r.timestamp)}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-success btn-sm" onClick={() => handleApprove(r)}>Approve</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleReject(r)}>Reject</button>
              </div>
            </div>
          ))}
          <button
            className="btn btn-secondary btn-sm"
            style={{ marginTop: 12 }}
            onClick={() => setActive("requests")}
          >
            View All Requests →
          </button>
        </div>
      )}

      <div className="grid-2">
        {/* Recent transactions */}
        <div className="card">
          <h3 style={{ fontSize: 15, marginBottom: 14 }}>Recent Transactions</h3>
          {transactions.length === 0 && (
            <div className="empty-state" style={{ padding: 24 }}>
              <p>No transactions yet</p>
            </div>
          )}
          {transactions.map(t => (
            <div key={t.id} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--border)" }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500 }}>{t.studentName}</div>
                <div style={{ fontSize: 11, color: "var(--text3)" }}>{t.note} · {t.date}</div>
              </div>
              <div style={{ color: "var(--green)", fontWeight: 500, fontSize: 13 }}>
                +{formatCurrency(t.amount)}
              </div>
            </div>
          ))}
        </div>

        {/* Fee status */}
        <div className="card">
          <h3 style={{ fontSize: 15, marginBottom: 14 }}>Fee Status</h3>
          {fees.length === 0 && (
            <div className="empty-state" style={{ padding: 24 }}>
              <p>No fee records yet</p>
            </div>
          )}
          {fees.slice(0, 5).map(f => (
            <div key={f.id} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span>{f.studentName} — {f.month}</span>
                <span className={`badge badge-${f.status === "paid" ? "approved" : f.status === "partial" ? "pending" : "rejected"}`}>
                  {f.status}
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${Math.round((f.paid / f.amount) * 100)}%` }} />
              </div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 3 }}>
                {formatCurrency(f.paid)} of {formatCurrency(f.amount)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
