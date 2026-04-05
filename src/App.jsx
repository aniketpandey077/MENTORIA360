// src/App.jsx
// ============================================================
// Root component. Handles auth state routing and layout.
// Renders the correct dashboard based on user role.
// ============================================================

import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./contexts/AuthContext";
import AuthScreen from "./components/auth/AuthScreen";
import Sidebar from "./components/shared/Sidebar";

// Admin pages
import AdminDashboard  from "./components/admin/AdminDashboard";
import AdminStudents   from "./components/admin/AdminStudents";
import AdminRequests   from "./components/admin/AdminRequests";
import AdminFees       from "./components/admin/AdminFees";
import AdminClasses    from "./components/admin/AdminClasses";
import AdminWorkshops  from "./components/admin/AdminWorkshops";

// Student pages
import StudentDashboard  from "./components/student/StudentDashboard";
import StudentClasses    from "./components/student/StudentClasses";
import StudentFees       from "./components/student/StudentFees";
import StudentWorkshops  from "./components/student/StudentWorkshops";

// Super admin pages
import SuperAdminDashboard from "./components/superadmin/SuperAdminDashboard";

// ── Loading screen ────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
    }}>
      <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: 32, color: "var(--accent2)" }}>EduPulse</h1>
      <span className="spinner" />
    </div>
  );
}

// ── Admin layout ──────────────────────────────────────────────
function AdminLayout({ profile, logout }) {
  const [active, setActive] = useState("dashboard");

  // Count pending requests (passed to sidebar for badge)
  const [pendingCount, setPendingCount] = useState(0);

  const renderPage = () => {
    switch (active) {
      case "dashboard": return <AdminDashboard setActive={setActive} />;
      case "students":  return <AdminStudents />;
      case "requests":  return <AdminRequests />;
      case "fees":      return <AdminFees />;
      case "classes":   return <AdminClasses />;
      case "workshops": return <AdminWorkshops />;
      default:          return <AdminDashboard setActive={setActive} />;
    }
  };

  return (
    <>
      <Sidebar
        role="admin"
        active={active}
        setActive={setActive}
        profile={profile}
        onLogout={logout}
        pendingCount={pendingCount}
      />
      <div className="main-content">
        {renderPage()}
      </div>
      {/* WhatsApp floating button */}
      {profile?.whatsapp && (
        <a
          href={`https://wa.me/${profile.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 100,
            background: "#25d366",
            color: "#fff",
            borderRadius: "50%",
            width: 52,
            height: 52,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            textDecoration: "none",
            boxShadow: "0 4px 20px rgba(37,211,102,0.4)",
          }}
        >
          💬
        </a>
      )}
    </>
  );
}

// ── Student layout ─────────────────────────────────────────────
function StudentLayout({ profile, logout }) {
  const [active, setActive] = useState("dashboard");

  const renderPage = () => {
    switch (active) {
      case "dashboard": return <StudentDashboard setActive={setActive} />;
      case "classes":   return <StudentClasses />;
      case "fees":      return <StudentFees />;
      case "workshops": return <StudentWorkshops />;
      default:          return <StudentDashboard setActive={setActive} />;
    }
  };

  // Pending/rejected students still see sidebar (minimal)
  return (
    <>
      <Sidebar
        role="student"
        active={active}
        setActive={setActive}
        profile={profile}
        onLogout={logout}
      />
      <div className="main-content">
        {renderPage()}
      </div>
    </>
  );
}

// ── Super admin layout ─────────────────────────────────────────
function SuperAdminLayout({ profile, logout }) {
  const [active, setActive] = useState("dashboard");

  return (
    <>
      <Sidebar
        role="superadmin"
        active={active}
        setActive={setActive}
        profile={profile}
        onLogout={logout}
      />
      <div className="main-content">
        <SuperAdminDashboard active={active} />
      </div>
    </>
  );
}

// ── Root App ──────────────────────────────────────────────────
export default function App() {
  const { user, profile, loading, logout } = useAuth();

  if (loading) return <LoadingScreen />;

  if (!user || !profile) return <AuthScreen />;

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--bg2)",
            color: "var(--text)",
            border: "1px solid var(--border)",
            fontFamily: "DM Sans, sans-serif",
            fontSize: 13,
          },
          success: { iconTheme: { primary: "var(--green)", secondary: "var(--bg2)" } },
          error:   { iconTheme: { primary: "var(--red)",   secondary: "var(--bg2)" } },
        }}
      />

      {profile.role === "superadmin" && <SuperAdminLayout profile={profile} logout={logout} />}
      {profile.role === "admin"      && <AdminLayout      profile={profile} logout={logout} />}
      {profile.role === "student"    && <StudentLayout    profile={profile} logout={logout} />}
    </>
  );
}
