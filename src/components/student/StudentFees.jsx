// src/components/student/StudentFees.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getStudentFees } from "../../services/firestoreService";
import { formatCurrency, computeFeeStats } from "../../utils/helpers";

export default function StudentFees() {
  const { profile } = useAuth();
  const [fees,    setFees]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudentFees(profile.coachingId, profile.uid)
      .then(setFees)
      .finally(() => setLoading(false));
  }, []);

  const stats = computeFeeStats(fees);

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>My Fees</h2>
        <p>Payment history and outstanding dues</p>
      </div>

      {/* Summary cards */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <span className="stat-label">Total Billed</span>
          <span className="stat-value" style={{ fontSize: 22 }}>{formatCurrency(stats.total)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Paid</span>
          <span className="stat-value" style={{ fontSize: 22, color: "var(--green)" }}>{formatCurrency(stats.paid)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Outstanding</span>
          <span className="stat-value" style={{ fontSize: 22, color: stats.due > 0 ? "var(--amber)" : "var(--green)" }}>
            {formatCurrency(stats.due)}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Records</span>
          <span className="stat-value" style={{ fontSize: 22 }}>{fees.length}</span>
        </div>
      </div>

      <div className="card">
        {loading && <div style={{ textAlign: "center", padding: 40 }}><span className="spinner" /></div>}

        {!loading && fees.length === 0 && (
          <div className="empty-state">
            <div className="emoji">💰</div>
            <p>No fee records yet</p>
          </div>
        )}

        {!loading && fees.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Amount</th>
                <th>Paid</th>
                <th>Due</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {fees.map(f => (
                <tr key={f.id}>
                  <td style={{ fontWeight: 500 }}>{f.month}</td>
                  <td>{formatCurrency(f.amount)}</td>
                  <td style={{ color: "var(--green)" }}>{formatCurrency(f.paid)}</td>
                  <td style={{ color: f.due > 0 ? "var(--red)" : "var(--text3)" }}>{formatCurrency(f.due)}</td>
                  <td style={{ color: "var(--text3)", fontSize: 12 }}>{f.date}</td>
                  <td>
                    <span className={`badge badge-${
                      f.status === "paid" ? "approved" :
                      f.status === "partial" ? "pending" : "rejected"
                    }`}>{f.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {stats.due > 0 && (
        <div className="alert alert-warning" style={{ marginTop: 16 }}>
          You have <strong>{formatCurrency(stats.due)}</strong> in outstanding dues.
          Please contact your institute admin to make the payment.
        </div>
      )}
    </div>
  );
}
