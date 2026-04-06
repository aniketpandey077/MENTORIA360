// src/components/admin/AdminFees.jsx
// ============================================================
// Add fee records, track payments, mark fees as paid.
// ============================================================

import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  getCoachingFees, addFeeRecord, markFeePaid,
  getCoaching, getStudentProfiles,
} from "../../services/firestoreService";
import { formatCurrency, formatDate, computeFeeStats, exportToCSV } from "../../utils/helpers";
import Modal from "../shared/Modal";
import Icon from "../shared/Icon";
import FeeReceipt from "../shared/FeeReceipt";
import toast from "react-hot-toast";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const YEARS  = [2024, 2025, 2026];

export default function AdminFees() {
  const { profile } = useAuth();
  const [fees,     setFees]     = useState([]);
  const [students, setStudents] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showAdd,  setShowAdd]  = useState(false);
  const [receipt,  setReceipt]  = useState(null);
  const [coaching, setCoachingInfo] = useState(null);
  const [form,     setForm]     = useState({ studentId: "", amount: "", month: "", year: String(new Date().getFullYear()) });

  const load = async () => {
    const c  = await getCoaching(profile.coachingId);
    const s  = await getStudentProfiles(c?.students || []);
    const f  = await getCoachingFees(profile.coachingId);
    setStudents(s);
    setFees(f);
    setCoachingInfo(c);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleAdd = async () => {
    if (!form.studentId || !form.amount || !form.month) {
      toast.error("Please fill all fields."); return;
    }
    const student = students.find(s => s.id === form.studentId);
    const amount  = Number(form.amount);
    try {
      await addFeeRecord(profile.coachingId, {
        studentId:   form.studentId,
        studentName: student?.name || "",
        amount,
        paid:   0,
        due:    amount,
        month:  `${form.month} ${form.year}`,
        status: "unpaid",
        date:   new Date().toISOString().slice(0, 10),
      });
      toast.success("Fee record added!");
      setShowAdd(false);
      setForm({ studentId: "", amount: "", month: "", year: String(new Date().getFullYear()) });
      load();
    } catch { toast.error("Failed to add fee record."); }
  };

  const handleMarkPaid = async (fee) => {
    try {
      await markFeePaid(profile.coachingId, fee.id, fee);
      toast.success("Payment recorded!");
      load();
    } catch { toast.error("Failed to record payment."); }
  };

  const stats = computeFeeStats(fees);

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>Fees Management</h2>
        <p>Track all payments and outstanding dues</p>
      </div>

      {/* Stats row */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <span className="stat-label">Total Billed</span>
          <span className="stat-value" style={{ fontSize: 22, color: "var(--text)" }}>{formatCurrency(stats.total)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Collected</span>
          <span className="stat-value" style={{ fontSize: 22, color: "var(--green)" }}>{formatCurrency(stats.paid)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Outstanding</span>
          <span className="stat-value" style={{ fontSize: 22, color: "var(--amber)" }}>{formatCurrency(stats.due)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Unpaid Records</span>
          <span className="stat-value" style={{ fontSize: 22, color: stats.unpaid > 0 ? "var(--red)" : "var(--green)" }}>{stats.unpaid}</span>
        </div>
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 13, color: "var(--text2)" }}>{fees.length} fee records</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-secondary btn-sm"
              onClick={() => exportToCSV(fees.map(f => ({ Student: f.studentName, Month: f.month, Amount: f.amount, Paid: f.paid, Due: f.due, Status: f.status })), "fees")}>
              <Icon name="download" size={12} /> Export
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
              <Icon name="plus" size={12} /> Add Fee
            </button>
          </div>
        </div>

        {loading && <div style={{ textAlign: "center", padding: 40 }}><span className="spinner" /></div>}

        {!loading && fees.length === 0 && (
          <div className="empty-state"><div className="emoji">💰</div><p>No fee records yet</p></div>
        )}

        {!loading && fees.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Month</th>
                <th>Amount</th>
                <th>Paid</th>
                <th>Due</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {fees.map(f => (
                <tr key={f.id}>
                  <td style={{ fontWeight: 500 }}>{f.studentName}</td>
                  <td style={{ color: "var(--text2)" }}>{f.month}</td>
                  <td>{formatCurrency(f.amount)}</td>
                  <td style={{ color: "var(--green)" }}>{formatCurrency(f.paid)}</td>
                  <td style={{ color: f.due > 0 ? "var(--red)" : "var(--text3)" }}>{formatCurrency(f.due)}</td>
                  <td>
                    <span className={`badge badge-${
                      f.status === "paid" ? "approved" : f.status === "partial" ? "pending" : "rejected"
                    }`}>{f.status}</span>
                  </td>
                  <td>
                    {f.due > 0 && (
                      <button className="btn btn-success btn-sm" onClick={() => handleMarkPaid(f)}>
                        Mark Paid
                      </button>
                    )}
                    {f.paid > 0 && (
                      <button className="btn btn-secondary btn-sm" style={{ marginLeft: 6 }} onClick={() => setReceipt(f)}>
                        🧾 Receipt
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Fee Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Fee Record">
        <div className="form-group">
          <label className="form-label">Student</label>
          <select value={form.studentId} onChange={set("studentId")}>
            <option value="">Select student</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Amount (₹)</label>
          <input type="number" placeholder="5000" value={form.amount} onChange={set("amount")} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Month</label>
            <select value={form.month} onChange={set("month")}>
              <option value="">Select month</option>
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Year</label>
            <select value={form.year} onChange={set("year")}>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAdd}>Add Record</button>
          <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
        </div>
      </Modal>

      {/* Fee Receipt Modal */}
      {receipt && (
        <FeeReceipt
          fee={receipt}
          coachingName={coaching?.name}
          coachingCity={coaching?.city}
          onClose={() => setReceipt(null)}
        />
      )}
    </div>
  );
}
