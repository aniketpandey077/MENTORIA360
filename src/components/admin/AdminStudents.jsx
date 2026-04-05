// src/components/admin/AdminStudents.jsx
// ============================================================
// Shows all enrolled students. Admin can view details or remove.
// ============================================================

import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getCoaching, getStudentProfiles, removeStudent } from "../../services/firestoreService";
import { getInitials, exportToCSV } from "../../utils/helpers";
import Icon from "../shared/Icon";
import toast from "react-hot-toast";

export default function AdminStudents() {
  const { profile } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");

  const load = async () => {
    const c = await getCoaching(profile.coachingId);
    const s = await getStudentProfiles(c?.students || []);
    setStudents(s);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleRemove = async (student) => {
    if (!window.confirm(`Remove ${student.name} from the institute?`)) return;
    try {
      await removeStudent(profile.coachingId, student.id);
      setStudents(s => s.filter(x => x.id !== student.id));
      toast.success(`${student.name} removed.`);
    } catch { toast.error("Failed to remove student."); }
  };

  const filtered = students.filter(s =>
    !search || s.name?.toLowerCase().includes(search.toLowerCase()) ||
               s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>Students</h2>
        <p>{students.length} enrolled students</p>
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12 }}>
          <div className="search-wrap" style={{ flex: 1, maxWidth: 300 }}>
            <span className="search-icon"><Icon name="search" size={14} /></span>
            <input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => exportToCSV(students.map(s => ({ Name: s.name, Email: s.email, Status: s.status })), "students")}
          >
            <Icon name="download" size={12} /> Export CSV
          </button>
        </div>

        {loading && <div style={{ textAlign: "center", padding: 40 }}><span className="spinner" /></div>}

        {!loading && filtered.length === 0 && (
          <div className="empty-state">
            <div className="emoji">👥</div>
            <p>{search ? "No students match your search" : "No students enrolled yet"}</p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Email</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="avatar">{getInitials(s.name)}</div>
                      <span style={{ fontWeight: 500 }}>{s.name}</span>
                    </div>
                  </td>
                  <td style={{ color: "var(--text2)" }}>{s.email}</td>
                  <td><span className="badge badge-approved">Enrolled</span></td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleRemove(s)}>
                      <Icon name="trash" size={12} /> Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
