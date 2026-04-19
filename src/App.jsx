// src/App.jsx
// ============================================================
// Root component. Handles routing:
//   → Public: LandingPage (no login required)
//   → Auth:   AuthScreen modal (login / register)
//   → App:    Dashboard by role (admin / student / superadmin / tutor)
// ============================================================

import React, { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./contexts/AuthContext";
import { getStudentCoachings } from "./services/firestoreService";

// Public
import LandingPage        from "./components/public/LandingPage";
import AuthScreen         from "./components/auth/AuthScreen";
import AnimatedBackground from "./components/public/AnimatedBackground";

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
import AdminPaymentMethods from "./components/admin/AdminPaymentMethods";

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
import StudentPaymentPage   from "./components/student/StudentPaymentPage";
import StudentReviews       from "./components/student/StudentReviews";

// Tutor
import TutorDashboard from "./components/tutor/TutorDashboard";

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
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 36, height: 36,
          background: "linear-gradient(135deg, var(--accent), #8b5cf6)",
          borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
            <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm-2 11.5v3.5L12 19l2-1v-3.5L12 16l-2-1.5z"/>
          </svg>
        </div>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: 28, color: "var(--accent2)" }}>Mentoria360</h1>
      </div>
      <span className="spinner" />
    </div>
  );
}

// ── Profile Recovery Screen ───────────────────────────────────
// Shown when Firebase Auth succeeds but Firestore profile load fails
function ProfileRecoveryScreen({ user, logout }) {
  const { refreshProfile } = useAuth();
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState("");

  const handleRetry = async () => {
    setRetrying(true);
    setError("");
    try {
      const p = await refreshProfile();
      if (!p) {
        setError("Profile not found. Your account may not be fully set up in the database.");
      }
      // If profile loaded successfully, AuthContext will update and App will re-render
    } catch (err) {
      console.error("Profile retry failed:", err);
      setError(err.message || "Failed to load profile. Check your connection and Firestore rules.");
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 20, padding: 32,
    }}>
      <div style={{
        width: 64, height: 64,
        background: "linear-gradient(135deg, #ef4444, #f97316)",
        borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 28,
      }}>
        ⚠️
      </div>
      <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 22, color: "var(--text)" }}>
        Profile Load Failed
      </h2>
      <p style={{ color: "var(--text2)", fontSize: 14, textAlign: "center", maxWidth: 400 }}>
        You're signed in as <strong>{user.email || user.phoneNumber || "Unknown"}</strong>,
        but we couldn't load your profile from the database.
      </p>
      {error && (
        <div style={{
          padding: "10px 16px", background: "rgba(239,68,68,0.1)",
          border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8,
          color: "#ef4444", fontSize: 12, maxWidth: 400, textAlign: "center",
        }}>
          {error}
        </div>
      )}
      <div style={{ display: "flex", gap: 12 }}>
        <button className="btn btn-primary" onClick={handleRetry} disabled={retrying}>
          {retrying ? <span className="spinner" /> : "🔄 Retry"}
        </button>
        <button className="btn btn-secondary" onClick={logout}>
          Sign Out
        </button>
      </div>
      <p style={{ color: "var(--text3)", fontSize: 11, maxWidth: 380, textAlign: "center", marginTop: 8 }}>
        If this keeps happening, your Firestore security rules may be blocking
        reads, or your user document may not exist in the <code>users</code> collection.
      </p>
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
      case "payments":      return <AdminPaymentMethods entityType="coaching" />;
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
  const [coachings,        setCoachings]        = useState([]);
  const [activeCoachingId, setActiveCoachingId] = useState(
    profile?.coachingIds?.[0] || profile?.coachingId || null
  );

  // Re-load coachings whenever profile changes (e.g. after joining one)
  useEffect(() => {
    getStudentCoachings(profile).then(list => {
      setCoachings(list);
      // If activeCoachingId is no longer valid, reset to first
      if (list.length > 0 && !list.find(c => c.id === activeCoachingId)) {
        setActiveCoachingId(list[0].id);
      }
    }).catch(() => {});
  }, [profile?.coachingIds?.join(","), profile?.coachingId]);

  const renderPage = () => {
    const cid = activeCoachingId;
    switch (active) {
      case "dashboard":     return <StudentDashboard setActive={setActive} coachings={coachings} activeCoachingId={cid} setActiveCoachingId={setActiveCoachingId} />;
      case "classes":       return <StudentClasses activeCoachingId={cid} />;  
      case "fees":          return <StudentFees activeCoachingId={cid} />;  
      case "workshops":     return <StudentWorkshops activeCoachingId={cid} />;
      case "announcements": return <StudentAnnouncements activeCoachingId={cid} />;
      case "attendance":    return <StudentAttendance activeCoachingId={cid} />;  
      case "materials":     return <StudentMaterials activeCoachingId={cid} />;
      case "homework":      return <StudentHomework activeCoachingId={cid} />;
      case "tests":         return <StudentTests activeCoachingId={cid} />;
      case "profile":       return <StudentProfile coachings={coachings} setCoachings={setCoachings} activeCoachingId={cid} setActiveCoachingId={setActiveCoachingId} />;
      case "payments":      return <StudentPaymentPage activeCoachingId={cid} />;
      case "reviews":       return <StudentReviews activeCoachingId={cid} />;
      default:              return <StudentDashboard setActive={setActive} coachings={coachings} activeCoachingId={cid} setActiveCoachingId={setActiveCoachingId} />;
    }
  };

  return (
    <>
      <Sidebar role="student" active={active} setActive={setActive} profile={profile} onLogout={logout} />
      <div className="main-content">{renderPage()}</div>
    </>
  );
}

// ── Tutor layout ───────────────────────────────────────────────
function TutorLayout({ profile, logout }) {
  const [active, setActive] = useState("dashboard");

  const renderPage = () => {
    switch (active) {
      case "dashboard": return <TutorDashboard />;
      case "payments":  return <TutorDashboard />;  // TutorDashboard has internal tab nav
      case "reviews":   return <TutorDashboard />;
      default:          return <TutorDashboard />;
    }
  };

  return (
    <>
      <Sidebar role="tutor" active={active} setActive={setActive} profile={profile} onLogout={logout} />
      <div className="main-content">{renderPage()}</div>
    </>
  );
}

// ── Super admin layout ─────────────────────────────────────────
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
  const { user, profile, loading, logout, refreshProfile, profileError } = useAuth();

  // Auth screen state — null = show landing page, "login"/"register"/"register-admin"/"register-tutor" = show auth
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
        {profile.role === "tutor"      && <TutorLayout      profile={profile} logout={logout} />}
        {profile.role === "student"    && <StudentLayout    profile={profile} logout={logout} />}
      </>
    );
  }

  // User is authenticated but profile load failed via error
  if (user && profileError) {
    return (
      <>
        <Toaster {...TOASTER_CONFIG} />
        <ProfileRecoveryScreen user={user} logout={logout} />
      </>
    );
  }

  // User is authenticated but profile is missing (incomplete setup)
  if (user && !profile && !profileError) {
    return (
      <>
        <Toaster {...TOASTER_CONFIG} />
        <AuthScreen
          forceProfileSetupUser={user}
          preSelectedCoaching={preSelectCoaching}
          onGoHome={() => { logout(); setAuthView(null); setPreSelectCoaching(null); }}
        />
      </>
    );
  }

  // ── Public pages (not logged in) ────────────────────────────
  // AnimatedBackground always stays mounted so canvas persists
  // across landing → auth → explore transitions.
  return (
    <>
      <Toaster {...TOASTER_CONFIG} />

      {/* Persistent animated canvas — z-index 1–4 */}
      <AnimatedBackground />

      {/* Custom cursor rendered once globally */}

      {/* Auth screen floats over the background */}
      {authView && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 50,
          background: "rgba(4,2,14,0.55)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflowY: "auto",
        }}>
          <AuthScreen
            initialTab={authView === "register" || authView === "register-admin" || authView === "register-tutor" ? "register" : "login"}
            initialRegRole={
              authView === "register-admin"  ? "admin"  :
              authView === "register-tutor"  ? "tutor"  :
              "student"
            }
            preSelectedCoaching={preSelectCoaching}
            onGoHome={() => { setAuthView(null); setPreSelectCoaching(null); }}
          />
        </div>
      )}

      {/* Landing page UI (card + explore) — hidden when auth screen is open */}
      {!authView && (
        <LandingPage
          onShowAuth={(view) => setAuthView(view)}
          preSelectCoaching={(coaching) => {
            setPreSelectCoaching(coaching);
            setAuthView("register");
          }}
        />
      )}
    </>
  );
}
