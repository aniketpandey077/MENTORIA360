// src/components/public/PageFlipIntro.jsx
// ============================================================
// Premium 3D page-flip intro animation for Mentoria360.
// Uses pure CSS 3D transforms (rotateX + perspective) — no
// heavy libraries. Runs only once per browser session.
// Dispatches "m360PortalDone" when complete so LandingPage
// can reveal itself exactly as before.
// ============================================================

import { useEffect, useRef, useState } from "react";

const SESSION_KEY = "m360_intro_done";

// ── Page content definitions ──────────────────────────────────
const PAGES = [
  {
    id: "p1",
    eyebrow: "Welcome to",
    headline: "Mentoria360",
    sub: "Your coaching discovery platform",
    accent: "linear-gradient(135deg,#6c3ff5 0%,#a78bfa 100%)",
    glow: "rgba(108,50,255,0.55)",
    icon: "◉",
  },
  {
    id: "p2",
    eyebrow: "Discover",
    headline: "Find Your Perfect Coaching",
    sub: "Browse 100+ verified institutes near you",
    accent: "linear-gradient(135deg,#1d4ed8 0%,#60a5fa 100%)",
    glow: "rgba(59,130,246,0.55)",
    icon: "✦",
  },
  {
    id: "p3",
    eyebrow: "Decide Better",
    headline: "Compare & Choose Easily",
    sub: "Ratings · Fees · Subjects · Location",
    accent: "linear-gradient(135deg,#065f46 0%,#34d399 100%)",
    glow: "rgba(52,211,153,0.5)",
    icon: "⬡",
  },
];

// Total animation timeline (ms):
//  0        – intro overlay fades in (200ms)
//  200      – page 1 scale-in (350ms)
//  550      – page 1 holds (200ms)
//  750      – flip to page 2 (350ms)
//  1100     – page 2 holds (200ms)
//  1300     – flip to page 3 (350ms)
//  1650     – page 3 holds (150ms)
//  1800     – whole overlay fades out + expands (400ms)
//  2200     – done, fires m360PortalDone

const T = {
  overlayIn:  200,
  p1In:       350,  // starts at 200
  p1Hold:     200,
  flip12:     350,
  p2Hold:     200,
  flip23:     350,
  p3Hold:     150,
  fadeOut:    450,
};

function dispatch() {
  window.dispatchEvent(new CustomEvent("m360PortalDone"));
}

export default function PageFlipIntro() {
  // If already shown this session, immediately signal done and render nothing
  const alreadyDone = useRef(
    typeof sessionStorage !== "undefined" &&
      sessionStorage.getItem(SESSION_KEY) === "1"
  );

  const [phase, setPhase]       = useState("entering"); // entering | p1 | flipping12 | p2 | flipping23 | p3 | leaving | gone
  const [visible, setVisible]   = useState(true);
  const timers                  = useRef([]);

  const finish = () => {
    timers.current.forEach(clearTimeout);
    try { sessionStorage.setItem(SESSION_KEY, "1"); } catch {}
    setPhase("leaving");
    setTimeout(() => { setVisible(false); dispatch(); }, T.fadeOut);
  };

  useEffect(() => {
    if (alreadyDone.current) { dispatch(); return; }

    const add = (fn, delay) => { const id = setTimeout(fn, delay); timers.current.push(id); };
    let t = 0;

    t += T.overlayIn;                       add(() => setPhase("p1"),        t);
    t += T.p1In + T.p1Hold;                 add(() => setPhase("flipping12"), t);
    t += T.flip12;                           add(() => setPhase("p2"),        t);
    t += T.p2Hold;                           add(() => setPhase("flipping23"), t);
    t += T.flip23;                           add(() => setPhase("p3"),        t);
    t += T.p3Hold;                           add(() => finish(),              t);

    return () => timers.current.forEach(clearTimeout);
  // eslint-disable-next-line
  }, []);

  if (!visible || alreadyDone.current) return null;

  const isLeaving   = phase === "leaving";
  const isFlipping12 = phase === "flipping12";
  const isFlipping23 = phase === "flipping23";
  const isEntering  = phase === "entering";

  // Which page card is "active" (front)
  const activeIdx =
    phase === "p1" || phase === "flipping12" ? 0 :
    phase === "p2" || phase === "flipping23" ? 1 : 2;

  return (
    <>
      {/* ── Keyframes injected once ─────────────────────── */}
      <style>{`
        @keyframes pfi-fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes pfi-fadeOut{from{opacity:1}to{opacity:0}}
        @keyframes pfi-scaleIn{
          from{opacity:0;transform:scale(0.82) translateY(28px) rotateX(-8deg) rotateZ(-2deg)}
          to  {opacity:1;transform:scale(1)   translateY(0)     rotateX(0deg)  rotateZ(-1.5deg)}
        }
        @keyframes pfi-flipOut{
          0%  {opacity:1;transform:perspective(900px) scale(1)    rotateX(0deg)  rotateZ(-1.5deg)}
          50% {opacity:0.3;transform:perspective(900px) scale(0.9) rotateX(62deg) rotateZ(1deg)}
          100%{opacity:0;transform:perspective(900px) scale(0.75) rotateX(90deg) rotateZ(2deg)}
        }
        @keyframes pfi-flipIn{
          0%  {opacity:0;transform:perspective(900px) scale(0.75) rotateX(-90deg) rotateZ(-2deg)}
          50% {opacity:0.4;transform:perspective(900px) scale(0.92) rotateX(-45deg) rotateZ(-1deg)}
          100%{opacity:1;transform:perspective(900px) scale(1)    rotateX(0deg)   rotateZ(-1.5deg)}
        }
        @keyframes pfi-expand{
          0%  {opacity:1;transform:perspective(900px) scale(1)    rotateX(0deg)}
          60% {opacity:0.6;transform:perspective(900px) scale(1.18) rotateX(-6deg)}
          100%{opacity:0;transform:perspective(900px) scale(1.55) rotateX(-14deg)}
        }
        @keyframes pfi-shimmer{
          0%  {background-position:0% 50%}
          100%{background-position:200% 50%}
        }
        @keyframes pfi-pulse{
          0%,100%{opacity:0.6}50%{opacity:1}
        }
        @keyframes pfi-shadowPop{
          0%  {box-shadow:0 8px 40px rgba(0,0,0,0.5)}
          50% {box-shadow:0 30px 80px rgba(0,0,0,0.7),0 0 60px var(--pfi-glow,rgba(108,50,255,0.5))}
          100%{box-shadow:0 8px 40px rgba(0,0,0,0.5)}
        }
      `}</style>

      {/* ── Full-screen overlay ──────────────────────────── */}
      <div
        id="pfi-overlay"
        onClick={finish}
        style={{
          position:        "fixed",
          inset:           0,
          zIndex:          500,
          display:         "flex",
          alignItems:      "center",
          justifyContent:  "center",
          background:      "radial-gradient(ellipse at 50% 40%, rgba(22,15,50,0.97) 0%, rgba(4,3,14,0.99) 70%)",
          animation:       isLeaving
                             ? `pfi-fadeOut ${T.fadeOut}ms cubic-bezier(0.4,0,0.2,1) forwards`
                             : isEntering
                               ? `pfi-fadeIn 220ms ease forwards`
                               : "none",
          cursor:          "pointer",
        }}
      >
        {/* Soft vignette ring */}
        <div style={{
          position:         "absolute",
          inset:            0,
          background:       "radial-gradient(ellipse 70% 65% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)",
          pointerEvents:    "none",
        }}/>

        {/* ── Skip button ───────────────────────────────── */}
        <button
          id="pfi-skip-btn"
          onClick={(e) => { e.stopPropagation(); finish(); }}
          style={{
            position:      "absolute",
            top:           20,
            right:         24,
            padding:       "7px 18px",
            border:        "1px solid rgba(139,130,255,0.35)",
            borderRadius:   20,
            background:    "rgba(20,16,48,0.75)",
            color:         "#8878cc",
            fontFamily:    "DM Sans, sans-serif",
            fontSize:       12,
            fontWeight:     600,
            letterSpacing: "0.06em",
            cursor:         "pointer",
            zIndex:         10,
            backdropFilter: "blur(8px)",
            transition:    "all 0.2s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background    = "rgba(108,50,255,0.28)";
            e.currentTarget.style.color         = "#c4b5fd";
            e.currentTarget.style.borderColor   = "rgba(167,139,250,0.6)";
            e.currentTarget.style.transform     = "scale(1.05)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background    = "rgba(20,16,48,0.75)";
            e.currentTarget.style.color         = "#8878cc";
            e.currentTarget.style.borderColor   = "rgba(139,130,255,0.35)";
            e.currentTarget.style.transform     = "scale(1)";
          }}
        >
          Skip ✕
        </button>

        {/* ── Page stack (perspective wrapper) ──────────── */}
        <div
          id="pfi-stage"
          style={{
            perspective:        "900px",
            perspectiveOrigin:  "50% 45%",
            position:           "relative",
            width:              Math.min(window.innerWidth - 40, 360),
            // height is driven by the card inside
          }}
        >
          {PAGES.map((pg, idx) => {
            const isActive = idx === activeIdx;
            const isPrev   = idx < activeIdx;

            // Determine per-card animation
            let anim = "none";
            let animDur = "350ms";
            const ease = "cubic-bezier(0.4,0,0.2,1)";

            if (isActive && phase === "p1" && idx === 0) {
              anim = `pfi-scaleIn ${T.p1In}ms ${ease} forwards`;
            } else if (idx === 0 && isFlipping12) {
              anim = `pfi-flipOut ${T.flip12}ms ${ease} forwards`;
            } else if (idx === 1 && isFlipping12) {
              anim = `pfi-flipIn ${T.flip12}ms ${ease} forwards`;
              animDur = `${T.flip12}ms`;
            } else if (idx === 1 && isFlipping23) {
              anim = `pfi-flipOut ${T.flip23}ms ${ease} forwards`;
            } else if (idx === 2 && isFlipping23) {
              anim = `pfi-flipIn ${T.flip23}ms ${ease} forwards`;
            } else if (isLeaving && isActive) {
              anim = `pfi-expand ${T.fadeOut}ms ${ease} forwards`;
            }

            // Cards that have already been flipped past are hidden
            const shouldRender = isActive || isFlipping12 || isFlipping23 ||
              (phase === "leaving" && idx === activeIdx);

            // For the flip transitions, show both the outgoing and incoming card
            const renderMe =
              isActive ||
              (isFlipping12 && (idx === 0 || idx === 1)) ||
              (isFlipping23 && (idx === 1 || idx === 2)) ||
              (isLeaving && idx === activeIdx);

            if (!renderMe) return null;

            return (
              <PageCard
                key={pg.id}
                page={pg}
                anim={anim}
                isActive={isActive}
              />
            );
          })}
        </div>

        {/* ── Progress dots ─────────────────────────────── */}
        <div style={{
          position:        "absolute",
          bottom:          36,
          left:            "50%",
          transform:       "translateX(-50%)",
          display:         "flex",
          gap:             10,
          alignItems:      "center",
        }}>
          {PAGES.map((_, i) => (
            <div key={i} style={{
              width:        i === activeIdx ? 24 : 8,
              height:       8,
              borderRadius: 4,
              background:   i === activeIdx
                ? "linear-gradient(90deg,#a78bfa,#60a5fa)"
                : "rgba(139,130,255,0.25)",
              transition:   "all 0.35s cubic-bezier(0.4,0,0.2,1)",
              boxShadow:    i === activeIdx ? "0 0 12px rgba(167,139,250,0.6)" : "none",
            }}/>
          ))}
        </div>

        {/* ── Brand watermark bottom ─────────────────────── */}
        <div style={{
          position:      "absolute",
          bottom:        14,
          width:         "100%",
          textAlign:     "center",
          fontFamily:    "DM Sans, sans-serif",
          fontSize:      10,
          color:         "rgba(139,130,255,0.35)",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          pointerEvents: "none",
        }}>
          Mentoria360 · Where Knowledge Begins
        </div>
      </div>
    </>
  );
}

// ── Individual page card ──────────────────────────────────────
function PageCard({ page, anim, isActive }) {
  return (
    <div
      style={{
        position:         "absolute",
        top:              0,
        left:             0,
        right:            0,
        // Static fallback — actual sizing via padding
        willChange:       "transform, opacity",
        animation:        anim,
        transformOrigin:  "50% 100%",
        transform:        "rotateZ(-1.5deg)", // resting tilt
        "--pfi-glow":     page.glow,
      }}
    >
      <div
        style={{
          background:       "rgba(8,6,22,0.93)",
          border:           "1px solid rgba(139,130,255,0.32)",
          borderRadius:     22,
          padding:          "44px 36px 40px",
          backdropFilter:   "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          boxShadow:        `0 24px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 60px ${page.glow}`,
          position:         "relative",
          overflow:         "hidden",
        }}
      >
        {/* Light sweep gradient */}
        <div style={{
          position:   "absolute",
          top:        "-40%",
          left:       "-20%",
          width:      "60%",
          height:     "70%",
          background: `radial-gradient(ellipse, ${page.glow.replace("0.5", "0.18").replace("0.55", "0.18")} 0%, transparent 70%)`,
          pointerEvents: "none",
          transform:  "rotate(-20deg)",
        }}/>

        {/* Top edge shimmer line */}
        <div style={{
          position:   "absolute",
          top:        0,
          left:       "10%",
          right:      "10%",
          height:     1,
          background: `linear-gradient(90deg, transparent, ${page.glow.replace(/[\d.]+\)$/, "0.8)")}, transparent)`,
          borderRadius: 1,
        }}/>

        {/* ── Icon badge ───────────────────────────── */}
        <div style={{
          width:         54,
          height:        54,
          borderRadius:  "50%",
          background:    page.accent,
          display:       "flex",
          alignItems:    "center",
          justifyContent:"center",
          margin:        "0 auto 20px",
          fontSize:      22,
          color:         "#fff",
          boxShadow:     `0 0 28px ${page.glow}, 0 0 60px ${page.glow.replace(/[\d.]+\)$/, "0.3)")}`,
          fontFamily:    "Syne, sans-serif",
          fontWeight:    800,
          animation:     "pfi-pulse 2.2s ease-in-out infinite",
        }}>
          {page.icon}
        </div>

        {/* Eyebrow */}
        <div style={{
          textAlign:     "center",
          fontSize:      10,
          fontFamily:    "DM Sans, sans-serif",
          fontWeight:    700,
          color:         "rgba(167,139,250,0.65)",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          marginBottom:  8,
        }}>
          {page.eyebrow}
        </div>

        {/* Headline */}
        <div style={{
          textAlign:     "center",
          fontFamily:    "Syne, sans-serif",
          fontWeight:    800,
          fontSize:      28,
          background:    `linear-gradient(135deg, #e0d8ff 0%, #a78bfa 50%, #e0d8ff 100%)`,
          backgroundSize:"220% 100%",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor:  "transparent",
          backgroundClip:"text",
          lineHeight:    1.2,
          marginBottom:  12,
          animation:     "pfi-shimmer 4s linear infinite",
        }}>
          {page.headline}
        </div>

        {/* Subtitle */}
        <div style={{
          textAlign:     "center",
          fontFamily:    "DM Sans, sans-serif",
          fontSize:      13,
          color:         "rgba(167,139,250,0.55)",
          lineHeight:    1.55,
          letterSpacing: "0.01em",
        }}>
          {page.sub}
        </div>

        {/* Bottom decorative line */}
        <div style={{
          marginTop:  26,
          height:     1,
          background: "linear-gradient(90deg, transparent, rgba(139,130,255,0.22), transparent)",
          borderRadius: 1,
        }}/>

        {/* Corner fold hint — top-right */}
        <div style={{
          position:     "absolute",
          top:          0,
          right:        0,
          width:        32,
          height:       32,
          background:   `linear-gradient(225deg, ${page.glow.replace(/[\d.]+\)$/, "0.35)")} 0%, transparent 60%)`,
          borderRadius: "0 22px 0 0",
          pointerEvents:"none",
        }}/>
      </div>
    </div>
  );
}
