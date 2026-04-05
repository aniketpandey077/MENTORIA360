// src/components/shared/Sidebar.jsx
// ============================================================
// Navigation sidebar. Renders different nav items by role.
// ============================================================

import React from "react";
import Icon from "./Icon";
import { getInitials } from "../../utils/helpers";

const NAV = {
  superadmin: [
    { key: "dashboard",  icon: "dashboard",  label: "Overview" },
    { key: "institutes", icon: "school",     label: "Institutes" },
    { key: "users",      icon: "users",      label: "All Users" },
  ],
  admin: [
    { key: "dashboard",  icon: "dashboard",  label: "Dashboard" },
    { key: "students",   icon: "users",      label: "Students" },
    { key: "requests",   icon: "request",    label: "Join Requests" },
    { key: "fees",       icon: "fee",        label: "Fees" },
    { key: "classes",    icon: "class",      label: "Classes" },
    { key: "workshops",  icon: "workshop",   label: "Workshops" },
  ],
  student: [
    { key: "dashboard",  icon: "dashboard",  label: "My Dashboard" },
    { key: "classes",    icon: "class",      label: "My Classes" },
    { key: "fees",       icon: "fee",        label: "My Fees" },
    { key: "workshops",  icon: "workshop",   label: "Workshops" },
  ],
};

const ROLE_LABEL = {
  superadmin: "Platform Admin",
  admin:      "Institute Admin",
  student:    "Student",
};

export default function Sidebar({ role, active, setActive, profile, onLogout, pendingCount = 0 }) {
  const navItems = NAV[role] || [];

  return (
    <div className="sidebar">
      {/* Logo */}
      <div style={{ padding: "24px 20px", borderBottom: "1px solid var(--border)" }}>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: 22, fontWeight: 800, color: "var(--accent2)" }}>
          EduPulse
        </h1>
        <p style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>
          {ROLE_LABEL[role] || "User"}
        </p>
      </div>

      {/* Navigation */}
      <div style={{ padding: "8px 0", flex: 1 }}>
        <div className="nav-section">Navigation</div>
        {navItems.map(item => (
          <button
            key={item.key}
            className={`nav-item${active === item.key ? " active" : ""}`}
            onClick={() => setActive(item.key)}
          >
            <Icon name={item.icon} size={15} />
            <span style={{ flex: 1 }}>{item.label}</span>
            {/* Badge for pending requests */}
            {item.key === "requests" && pendingCount > 0 && (
              <span style={{
                background: "var(--red)", color: "#fff",
                borderRadius: 10, fontSize: 10,
                padding: "1px 7px", fontWeight: 600,
              }}>
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* User info + logout */}
      <div style={{ borderTop: "1px solid var(--border)", padding: "12px 0" }}>
        <div style={{ padding: "8px 20px", display: "flex", gap: 10, alignItems: "center" }}>
          <div className="avatar" style={{ width: 34, height: 34, fontSize: 12 }}>
            {getInitials(profile?.name || "U")}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {profile?.name || "User"}
            </div>
            <div style={{ fontSize: 10, color: "var(--text3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {profile?.email || ""}
            </div>
          </div>
        </div>
        <button className="nav-item" onClick={onLogout}>
          <Icon name="logout" size={14} /> Sign Out
        </button>
      </div>
    </div>
  );
}
