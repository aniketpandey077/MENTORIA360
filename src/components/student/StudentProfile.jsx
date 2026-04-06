// src/components/student/StudentProfile.jsx
// ============================================================
// Student can view and edit their profile details.
// ============================================================

import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { updateUserProfile } from "../../services/firestoreService";
import toast from "react-hot-toast";

export default function StudentProfile() {
  const { profile, refreshProfile } = useAuth();
  const [editing,  setEditing]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [form,     setForm]     = useState({
    name:   profile?.name   || "",
    phone:  profile?.phone  || "",
    parent: profile?.parent || "",
    goals:  profile?.goals  || "",
    school: profile?.school || "",
  });

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserProfile(profile.uid, {
        name:   form.name.trim(),
        phone:  form.phone.trim(),
        parent: form.parent.trim(),
        goals:  form.goals.trim(),
        school: form.school.trim(),
      });
      await refreshProfile();
      toast.success("Profile updated!");
      setEditing(false);
    } catch {
      toast.error("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const initials = (profile?.name || "S").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  const fields = [
    { key: "name",   label: "Full Name",      placeholder: "Your full name",       icon: "👤" },
    { key: "phone",  label: "Phone Number",   placeholder: "9876543210",           icon: "📱" },
    { key: "parent", label: "Parent's Name",  placeholder: "Parent / Guardian",    icon: "👨‍👩‍👧" },
    { key: "school", label: "School / Board", placeholder: "e.g. CBSE / State",    icon: "🏫" },
    { key: "goals",  label: "Academic Goals", placeholder: "e.g. IIT-JEE 2026...", icon: "🎯" },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>👤 My Profile</h2>
        <p>Your personal and academic information</p>
      </div>

      <div style={{ maxWidth: 560 }}>
        {/* Avatar card */}
        <div className="card" style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%", background: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 26, fontWeight: 800, color: "#fff", flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{profile?.name}</div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 3 }}>{profile?.email}</div>
            <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span className="badge badge-approved">Student</span>
              <span className="badge badge-approved" style={{ background: "var(--accent-bg)", color: "var(--accent)" }}>
                {profile?.status}
              </span>
            </div>
          </div>
          {!editing && (
            <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>✏️ Edit</button>
          )}
        </div>

        {/* Details */}
        <div className="card">
          {fields.map(f => (
            <div key={f.key} style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 4 }}>
                {f.icon} {f.label}
              </div>
              {editing ? (
                f.key === "goals" ? (
                  <textarea
                    value={form[f.key]} onChange={set(f.key)}
                    placeholder={f.placeholder} rows={2}
                    style={{ width: "100%", resize: "vertical", fontFamily: "inherit", fontSize: 13, padding: "8px 10px", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)" }}
                  />
                ) : (
                  <input
                    value={form[f.key]} onChange={set(f.key)}
                    placeholder={f.placeholder}
                    style={{ width: "100%", fontSize: 13 }}
                  />
                )
              ) : (
                <div style={{ fontSize: 14, fontWeight: 500, color: form[f.key] ? "var(--text)" : "var(--text3)" }}>
                  {profile?.[f.key] || `—  (tap Edit to add)`}
                </div>
              )}
            </div>
          ))}

          {/* Read-only fields */}
          {[
            ["📧 Email",   profile?.email],
            ["🏫 Institute", profile?.coachingId ? "Enrolled" : "Not enrolled"],
          ].map(([label, val]) => (
            <div key={label} style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text2)" }}>{val}</div>
            </div>
          ))}

          {editing && (
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={saving}>
                {saving ? <span className="spinner" /> : "Save Changes"}
              </button>
              <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
