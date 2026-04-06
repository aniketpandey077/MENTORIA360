// src/App.jsx
// ============================================================
// Root component. Handles routing:
//   → Public: LandingPage (no login required)
//   → Auth:   AuthScreen modal (login / register)
//   → App:    Dashboard by role (admin / student / superadmin)
// ============================================================

import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./contexts/AuthContext";

// Public
import LandingPage from "./components/public/LandingPage";
import AuthScreen  from "./components/auth/AuthScreen";

// Shared
import Sidebar from "./components/shared/Sidebar";

// Admin pages
import AdminDashboard    from "./components/admin/AdminDashboard";
import AdminStudents     from "./components/admin/AdminStudents";
import AdminRequests     from "./components/admin/AdminRequests";
import AdminFees         from "./components/admin/AdminFees";
import AdminClasses      from "./components/admin/AdminClasses";
import AdminWorkshops    from "./components/admin/AdminWorkshops";
import AdminAnnouncements from "./components/admin/AdminAnnouncements";
import AdminAttendance    from "./components/admin/AdminAttendance";
import AdminMaterials     from "./components/admin/AdminMaterials";
import AdminHomework      from "./components/admin/AdminHomework";
import AdminTests         from "./components/admin/AdminTests";

// Student pages
import StudentDashboard    from "./components/student/StudentDashboard";
import StudentClasses      from "./components/student/StudentClasses";
import StudentFees         from "./components/student/StudentFees";
import StudentWorkshops    from "./components/student/StudentWorkshops";
import StudentAnnouncements from "./components/student/StudentAnnouncements";
import StudentAttendance    from "./components/student/StudentAttendance";
import StudentMaterials     from "./components/student/StudentMaterials";
import StudentHomework      from "./components/student/StudentHomework";
import StudentTests         from "./components/student/StudentTests";
import StudentProfile       from "./components/student/StudentProfile";

// Super admin
import SuperAdminDashboard from "./components/superadmin/SuperAdminDashboard";

// ── Shared toaster config ─────────────────────────────────────
const TOASTER_CONFIG = {
  position: "top-right",
  toastOptions: {
    style: {
      background: "var(--bg2)",
      color: "var(--text)",
      border: "1px solid var(--border)",
      fontFamily: "DM Sans, sans-serif",
      fontSize: 13,
    },
    success: { iconTheme: { primary: "var(--green)", secondary: "var(--bg2)" } },
    error:   { iconTheme: { primary: "var(--red)",   secondary: "var(--bg2)" } },
  },
};

// ── Full-screen loading ───────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: 32, color: "var(--accent2)" }}>EduPulse</h1>
      <span className="spinner" />
    </div>
  );
}

// ── Admin layout ──────────────────────────────────────────────
function AdminLayout({ profile, logout }) {
  const [active, setActive] = useState("dashboard");

  const renderPage = () => {
    switch (active) {
      case "dashboard":     return <AdminDashboard setActive={setActive} />;
      case "students":      return <AdminStudents />;
      case "requests":      return <AdminRequests />;
      case "fees":          return <AdminFees />;
      case "classes":       return <AdminClasses />;
      case "workshops":     return <AdminWorkshops />;
      case "announcements": return <AdminAnnouncements />;
      case "attendance":    return <AdminAttendance />;
      case "materials":     return <AdminMaterials />;
      case "homework":      return <AdminHomework />;
      case "tests":         return <AdminTests />;
      default:              return <AdminDashboard setActive={setActive} />;
    }
  };

  return (
    <>
      <Sidebar role="admin" active={active} setActive={setActive} profile={profile} onLogout={logout} />
      <div className="main-content">{renderPage()}</div>
      {profile?.whatsapp && (
        <a href={`https://wa.me/${profile.whatsapp}`} target="_blank" rel="noopener noreferrer" style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 100,
          background: "#25d366", color: "#fff", borderRadius: "50%",
          width: 52, height: 52, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 22, textDecoration: "none",
          boxShadow: "0 4px 20px rgba(37,211,102,0.4)",
        }}>💬</a>
      )}
    </>
  );
}

// ── Student layout ─────────────────────────────────────────────
function StudentLayout({ profile, logout }) {
  const [active, setActive] = useState("dashboard");

  const renderPage = () => {
    switch (active) {
      case "dashboard":     return <StudentDashboard setActive={setActive} />;
      case "classes":       return <StudentClasses />;
      case "fees":          return <StudentFees />;
      case "workshops":     return <StudentWorkshops />;
      case "announcements": return <StudentAnnouncements />;
      case "attendance":    return <StudentAttendance />;
      case "materials":     return <StudentMaterials />;
      case "homework":      return <StudentHomework />;
      case "tests":         return <StudentTests />;
      case "profile":       return <StudentProfile />;
      default:              return <StudentDashboard setActive={setActive} />;
    }
  };

  return (
    <>
      <Sidebar role="student" active={active} setActive={setActive} profile={profile} onLogout={logout} />
      <div className="main-content">{renderPage()}</div>
    </>
  );
}

// ── Super admin layout ─────────────────────────────────────
function SuperAdminLayout({ profile, logout }) {
  const [active, setActive] = useState("dashboard");
  return (
    <>
      <Sidebar role="superadmin" active={active} setActive={setActive} profile={profile} onLogout={logout} />
      <div className="main-content">
        <SuperAdminDashboard active={active} />
      </div>
    </>
  );
}

// ── Root App ──────────────────────────────────────────────────
export default function App() {
  const { user, profile, loading, logout } = useAuth();

  // Auth screen state — null = show landing page, "login"/"register"/"register-admin" = show auth
  const [authView,          setAuthView]           = useState(null);
  const [preSelectCoaching, setPreSelectCoaching]  = useState(null);

  if (loading) return <LoadingScreen />;

  // User is fully authenticated → show their dashboard
  if (user && profile) {
    return (
      <>
        <Toaster {...TOASTER_CONFIG} />
        {profile.role === "superadmin" && <SuperAdminLayout profile={profile} logout={logout} />}
        {profile.role === "admin"      && <AdminLayout      profile={profile} logout={logout} />}
        {profile.role === "student"    && <StudentLayout    profile={profile} logout={logout} />}
      </>
    );
  }

  // Auth screen (login / register)
  if (authView) {
    return (
      <>
        <Toaster {...TOASTER_CONFIG} />
        <AuthScreen
          initialTab={authView === "register" || authView === "register-admin" ? "register" : "login"}
          initialRegRole={authView === "register-admin" ? "admin" : "student"}
          preSelectedCoaching={preSelectCoaching}
          onGoHome={() => { setAuthView(null); setPreSelectCoaching(null); }}
        />
      </>
    );
  }

  // Public landing page (default)
  return (
    <>
      <Toaster {...TOASTER_CONFIG} />
      <LandingPage
        onShowAuth={(view) => setAuthView(view)}
        preSelectCoaching={(coaching) => {
          setPreSelectCoaching(coaching);
          setAuthView("register");
        }}
      />
    </>
  );
}
