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
    { key: "dashboard",      icon: "dashboard",  label: "Dashboard" },
    { key: "students",       icon: "users",       label: "Students" },
    { key: "requests",       icon: "request",     label: "Join Requests" },
    { key: "attendance",     icon: "calendar",    label: "Attendance" },
    { key: "fees",           icon: "fee",         label: "Fees" },
    { key: "classes",        icon: "class",       label: "Classes" },
    { key: "homework",       icon: "homework",    label: "Homework" },
    { key: "tests",          icon: "test",        label: "Tests & Quizzes" },
    { key: "workshops",      icon: "workshop",    label: "Workshops" },
    { key: "materials",      icon: "material",    label: "Study Materials" },
    { key: "announcements",  icon: "announce",    label: "Announcements" },
  ],
  student: [
    { key: "dashboard",      icon: "dashboard",  label: "My Dashboard" },
    { key: "profile",        icon: "profile",    label: "My Profile" },
    { key: "attendance",     icon: "calendar",   label: "Attendance" },
    { key: "classes",        icon: "class",      label: "My Classes" },
    { key: "fees",           icon: "fee",        label: "My Fees" },
    { key: "homework",       icon: "homework",   label: "Homework" },
    { key: "tests",          icon: "test",       label: "Tests & Quizzes" },
    { key: "workshops",      icon: "workshop",   label: "Workshops" },
    { key: "materials",      icon: "material",   label: "Study Materials" },
    { key: "announcements",  icon: "announce",   label: "Announcements" },
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
      <div style={{ padding: "8px 0", flex: 1, overflowY: "auto" }}>
        <div className="nav-section">Navigation</div>
        {navItems.map(item => (
          <button
            key={item.key}
            className={`nav-item${active === item.key ? " active" : ""}`}
            onClick={() => setActive(item.key)}
          >
            <NavIcon name={item.icon} size={15} />
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
          <NavIcon name="logout" size={14} /> Sign Out
        </button>
      </div>
    </div>
  );
}

// Extended icon component with new icons
function NavIcon({ name, size = 16 }) {
  const icons = {
    dashboard: "M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z",
    users:     "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
    request:   "M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z",
    fee:       "M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z",
    class:     "M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z",
    workshop:  "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z",
    school:    "M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm-2 11.5v3.5L12 19l2-1v-3.5L12 16l-2-1.5z",
    logout:    "M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z",
    download:  "M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z",
    plus:      "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
    // New icons:
    calendar:  "M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z",
    material:  "M9 3L5 6.99h3V14h2V6.99h3L9 3zm7 14.01V10h-2v7.01h-3L15 21l4-3.99h-3z",
    homework:  "M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z",
    test:      "M9 3L5 6.99h3V14h2V6.99h3L9 3zm7 14.01V10h-2v7.01h-3L15 21l4-3.99h-3zM4 10.5H2v2h2v-2zm0-4H2v2h2v-2zm0 8H2v2h2v-2zm0 4H2v2h2v-2z",
    announce:  "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z",
    profile:   "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
  };

  const path = icons[name] || icons.dashboard;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0, opacity: 0.8 }}>
      <path d={path} />
    </svg>
  );
}
