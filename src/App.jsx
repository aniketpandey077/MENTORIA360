// src/App.jsx
// ============================================================
// Root component. Handles routing:
//   → Public: LandingPage (no login required)
//   → Auth:   AuthScreen modal (login / register)
//   → App:    Dashboard by role (admin / student / superadmin / tutor)
// ============================================================

import React, { useState, useEffect, lazy, Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./contexts/AuthContext";
import { getStudentCoachings } from "./services/firestoreService";

// Public (small — loaded eagerly)
import LandingPage        from "./components/public/LandingPage";
import AuthScreen         from "./components/auth/AuthScreen";
import AnimatedBackground from "./components/public/AnimatedBackground";
import PageFlipIntro      from "./components/public/PageFlipIntro";

// Shared
import Sidebar        from "./components/shared/Sidebar";
import ErrorBoundary  from "./components/shared/ErrorBoundary";
import OnboardingTour from "./components/shared/OnboardingTour";

// ── Lazy-loaded dashboard pages ───────────────────────────────
// These only download when the user actually visits that page,
// reducing the initial JS bundle size significantly.

// Admin
const AdminDashboard     = lazy(() => import("./components/admin/AdminDashboard"));
const AdminStudents      = lazy(() => import("./components/admin/AdminStudents"));
const AdminRequests      = lazy(() => import("./components/admin/AdminRequests"));
const AdminFees          = lazy(() => import("./components/admin/AdminFees"));
const AdminClasses       = lazy(() => import("./components/admin/AdminClasses"));
const AdminWorkshops     = lazy(() => import("./components/admin/AdminWorkshops"));
const AdminAnnouncements = lazy(() => import("./components/admin/AdminAnnouncements"));
const AdminAttendance    = lazy(() => import("./components/admin/AdminAttendance"));
const AdminMaterials     = lazy(() => import("./components/admin/AdminMaterials"));
const AdminHomework      = lazy(() => import("./components/admin/AdminHomework"));
const AdminTests         = lazy(() => import("./components/admin/AdminTests"));
const AdminPaymentMethods= lazy(() => import("./components/admin/AdminPaymentMethods"));
const AdminBatches       = lazy(() => import("./components/admin/AdminBatches"));

// Student
const StudentDashboard    = lazy(() => import("./components/student/StudentDashboard"));
const StudentClasses      = lazy(() => import("./components/student/StudentClasses"));
const StudentFees         = lazy(() => import("./components/student/StudentFees"));
const StudentWorkshops    = lazy(() => import("./components/student/StudentWorkshops"));
const StudentAnnouncements= lazy(() => import("./components/student/StudentAnnouncements"));
const StudentAttendance   = lazy(() => import("./components/student/StudentAttendance"));
const StudentMaterials    = lazy(() => import("./components/student/StudentMaterials"));
const StudentHomework     = lazy(() => import("./components/student/StudentHomework"));
const StudentTests        = lazy(() => import("./components/student/StudentTests"));
const StudentProfile      = lazy(() => import("./components/student/StudentProfile"));
const StudentPaymentPage  = lazy(() => import("./components/student/StudentPaymentPage"));
const StudentReviews      = lazy(() => import("./components/student/StudentReviews"));

// Tutor
const TutorDashboard = lazy(() => import("./components/tutor/TutorDashboard"));

// Super admin
const SuperAdminDashboard = lazy(() => import("./components/superadmin/SuperAdminDashboard"));

// ── Suspense fallback ─────────────────────────────────────────
function PageLoader() {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "60vh", flexDirection: "column", gap: 16,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: "50%",
        border: "3px solid rgba(108,99,255,0.2)",
        borderTop: "3px solid #6c63ff",
        animation: "spin 0.9s linear infinite",
      }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

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
  const tourKey = `m360_onboarded_${profile?.uid}`;
  const [showTour, setShowTour] = useState(() => !localStorage.getItem(tourKey));

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
      case "batches":       return <AdminBatches />;
      case "payments":      return <AdminPaymentMethods entityType="coaching" />;
      default:              return <AdminDashboard setActive={setActive} />;
    }
  };

  return (
    <>
      <Sidebar role="admin" active={active} setActive={setActive} profile={profile} onLogout={logout} />
      <div className="main-content">
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>{renderPage()}</Suspense>
        </ErrorBoundary>
      </div>
      {profile?.whatsapp && (
        <a href={`https://wa.me/${profile.whatsapp}`} target="_blank" rel="noopener noreferrer" style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 100,
          background: "#25d366", color: "#fff", borderRadius: "50%",
          width: 52, height: 52, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 22, textDecoration: "none",
          boxShadow: "0 4px 20px rgba(37,211,102,0.4)",
        }}>💬</a>
      )}
      {showTour && <OnboardingTour role="admin" uid={profile?.uid} onDone={() => setShowTour(false)} />}
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
  const tourKey = `m360_onboarded_${profile?.uid}`;
  const [showTour, setShowTour] = useState(() => !localStorage.getItem(tourKey));

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
      <div className="main-content">
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>{renderPage()}</Suspense>
        </ErrorBoundary>
      </div>
      {showTour && <OnboardingTour role="student" uid={profile?.uid} onDone={() => setShowTour(false)} />}
    </>
  );
}

// ── Tutor layout ───────────────────────────────────────────────
function TutorLayout({ profile, logout }) {
  const [active, setActive] = useState("dashboard");
  const tourKey = `m360_onboarded_${profile?.uid}`;
  const [showTour, setShowTour] = useState(() => !localStorage.getItem(tourKey));

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
      <div className="main-content">
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>{renderPage()}</Suspense>
        </ErrorBoundary>
      </div>
      {showTour && <OnboardingTour role="tutor" uid={profile?.uid} onDone={() => setShowTour(false)} />}
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
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <SuperAdminDashboard active={active} />
          </Suspense>
        </ErrorBoundary>
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

  const KNOWN_ROLES = ["superadmin", "admin", "tutor", "student"];
  const roleNormalized = profile?.role?.toLowerCase().trim();

  // User is fully authenticated → show their dashboard
  if (user && profile) {
    // Unknown / unrecognised role — show a diagnostic screen
    if (!KNOWN_ROLES.includes(roleNormalized)) {
      return (
        <>
          <Toaster {...TOASTER_CONFIG} />
          <div style={{
            minHeight: "100vh", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 20, padding: 32,
            fontFamily: "DM Sans, sans-serif", background: "#0f0f13", color: "#f0f0f8",
          }}>
            <div style={{ fontSize: 52 }}>🔐</div>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 22 }}>Account Role Not Recognised</h2>
            <p style={{ color: "#9898b0", fontSize: 14, textAlign: "center", maxWidth: 420, lineHeight: 1.6 }}>
              Your account role is <code style={{ background:"rgba(239,68,68,.12)", color:"#f87171", padding:"2px 8px", borderRadius:6 }}>
                "{profile.role || "(empty)"}"
              </code>.
              <br /><br />
              Please set your <strong>role</strong> field in Firestore to exactly one of:<br />
              <code style={{ color:"#a78bfa" }}>superadmin</code> · <code style={{ color:"#a78bfa" }}>admin</code> · <code style={{ color:"#a78bfa" }}>student</code> · <code style={{ color:"#a78bfa" }}>tutor</code>
              <br /><br />
              <span style={{ fontSize:12, color:"#5a5a72" }}>
                Firebase Console → Firestore → users → {user.uid} → role field
              </span>
            </p>
            <button
              onClick={logout}
              style={{
                padding: "12px 28px", border: "none", borderRadius: 12,
                background: "linear-gradient(135deg,#6c3ff5,#8b82ff)",
                color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 6px 22px rgba(108,50,255,.4)",
              }}
            >
              ← Sign Out
            </button>
          </div>
        </>
      );
    }

    return (
      <>
        <Toaster {...TOASTER_CONFIG} />
        {roleNormalized === "superadmin" && <SuperAdminLayout profile={profile} logout={logout} />}
        {roleNormalized === "admin"      && <AdminLayout      profile={profile} logout={logout} />}
        {roleNormalized === "tutor"      && <TutorLayout      profile={profile} logout={logout} />}
        {roleNormalized === "student"    && <StudentLayout    profile={profile} logout={logout} />}
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

      {/* Persistent animated canvas — z-index 1–3 */}
      <AnimatedBackground />

      {/* Premium page-flip intro — z-index 500; self-removes after firing m360PortalDone */}
      <PageFlipIntro />

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
