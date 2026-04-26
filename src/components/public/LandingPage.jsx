// src/components/public/LandingPage.jsx
// ============================================================
// Public landing page.
// Explore section: toggle between Coaching institutes & Tutors.
// ============================================================

import React, { useEffect, useRef, useState, useCallback } from "react";
import { searchCoachings, getAllTutors } from "../../services/firestoreService";

// Module-level flag — survives React remounts within a session
let _portalDone = typeof sessionStorage !== "undefined" &&
  sessionStorage.getItem("m360_intro_done") === "1";

export default function LandingPage({ onShowAuth, preSelectCoaching }) {
  const [view,         setView]         = useState("home");
  const [cardVisible,  setCardVisible]  = useState(false);
  const [query,        setQuery]        = useState("");
  const [results,      setResults]      = useState([]);
  const [featured,     setFeatured]     = useState([]);
  const [tutors,       setTutors]       = useState([]);
  const [searching,    setSearching]    = useState(false);
  const [exploreReady, setExploreReady] = useState(false);
  const [exploreMode,  setExploreMode]  = useState("coaching"); // "coaching" | "tutor"

  useEffect(() => {
    if (_portalDone) { setCardVisible(true); return; }
    const onDone = () => { _portalDone = true; setCardVisible(true); };
    window.addEventListener("m360PortalDone", onDone);
    // Fallback: reveal card after 2.4s in case the event never fires
    const t = setTimeout(() => { _portalDone = true; setCardVisible(true); }, 2400);
    return () => { window.removeEventListener("m360PortalDone", onDone); clearTimeout(t); };
  }, []);

  // Pre-load featured coachings + tutors
  useEffect(() => {
    searchCoachings("").then(r => setFeatured(r.slice(0, 12))).catch(() => {});
    getAllTutors().then(r => setTutors(r)).catch(() => {});
  }, []);

  const handleSearch = useCallback(async (q) => {
    setQuery(q);
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    try { setResults(await searchCoachings(q)); }
    catch { setResults([]); }
    finally { setSearching(false); }
  }, []);

  const openExplore = () => {
    setView("explore");
    setExploreReady(false);
    setTimeout(() => setExploreReady(true), 60);
  };
  const closeExplore = () => {
    setExploreReady(false);
    setTimeout(() => setView("home"), 300);
  };

  // Filtered tutor list
  const tutorList = query.trim()
    ? tutors.filter(t =>
        [t.name, t.subject, t.city, t.teachesWhom].some(f =>
          (f || "").toLowerCase().includes(query.toLowerCase())
        )
      )
    : tutors;

  return (
    <>
      <style>{`
        @keyframes m360Float0{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes m360Float1{0%,100%{transform:translateY(-4px)}50%{transform:translateY(4px)}}
        @keyframes m360Float2{0%,100%{transform:translateY(-2px)}50%{transform:translateY(7px)}}
        @keyframes m360Float3{0%,100%{transform:translateY(-6px)}50%{transform:translateY(2px)}}
        @keyframes m360CardFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
        @keyframes m360SlideUp{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
        @keyframes m360FadeIn{from{opacity:0}to{opacity:1}}
        .m360-scroll::-webkit-scrollbar{width:5px}
        .m360-scroll::-webkit-scrollbar-track{background:rgba(108,99,255,0.04)}
        .m360-scroll::-webkit-scrollbar-thumb{background:rgba(108,99,255,0.3);border-radius:3px}
        .m360-ccard{transition:transform 0.25s ease,box-shadow 0.25s ease,border-color 0.25s ease;}
        .m360-ccard:hover{transform:translateY(-6px) scale(1.02)!important;box-shadow:0 16px 48px rgba(108,50,255,0.3),0 0 0 1px rgba(139,130,255,0.45)!important;border-color:rgba(139,130,255,0.5)!important;}
      `}</style>

      <M360Cursor />

      {/* ═══════════ VIEW 1 — Home card ═══════════ */}
      {view === "home" && (
        <div style={{position:"fixed",inset:0,zIndex:20,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
          <div style={{
            width: 370,
            background: "rgba(8,6,24,0.92)",
            border: "1px solid rgba(139,130,255,0.4)",
            borderRadius: 24,
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            padding: "42px 38px",
            boxShadow: "0 0 80px rgba(108,50,255,0.2),0 0 160px rgba(59,130,246,0.08),inset 0 1px 0 rgba(255,255,255,0.07)",
            pointerEvents: "all",
            opacity: cardVisible ? 1 : 0,
            transform: cardVisible ? "translateY(0)" : "translateY(40px)",
            transition: "opacity 0.9s ease, transform 0.9s ease",
            animation: cardVisible ? "m360CardFloat 4s ease-in-out infinite" : "none",
          }}>
            {/* Logo */}
            <div style={{textAlign:"center",marginBottom:28}}>
              <div style={{width:56,height:56,borderRadius:"50%",background:"linear-gradient(135deg,#6c3ff5,#3b82f6)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 13px",fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:23,color:"#fff",boxShadow:"0 0 24px rgba(108,50,255,0.75),0 0 60px rgba(108,50,255,0.28)"}}>M</div>
              <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:30,background:"linear-gradient(90deg,#a78bfa,#e0d8ff,#a78bfa)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",lineHeight:1.15,marginBottom:7,letterSpacing:"-0.3px"}}>Mentoria360</div>
              <div style={{fontSize:10,color:"#6b5faa",letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600}}>Where Knowledge Begins</div>
            </div>

            <CardBtn primary onClick={() => onShowAuth("login")} mb={10}>Sign In →</CardBtn>
            <CardBtn onClick={() => onShowAuth("register")} mb={14}>Create Account</CardBtn>

            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
              <div style={{flex:1,height:1,background:"rgba(139,130,255,0.18)"}}/>
              <span style={{fontSize:10,color:"#4a3880",letterSpacing:"0.06em",fontWeight:600}}>OR</span>
              <div style={{flex:1,height:1,background:"rgba(139,130,255,0.18)"}}/>
            </div>

            <button onClick={openExplore} style={{
              width:"100%",padding:"13px",border:"1px solid rgba(59,130,246,0.45)",borderRadius:12,
              background:"rgba(20,40,100,0.25)",color:"#93c5fd",
              fontFamily:"DM Sans,sans-serif",fontSize:14,fontWeight:600,cursor:"pointer",
              letterSpacing:"0.03em",display:"flex",alignItems:"center",justifyContent:"center",gap:9,
              transition:"all 0.22s",boxShadow:"0 0 20px rgba(59,130,246,0.08)",
            }}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(30,70,180,0.3)";e.currentTarget.style.borderColor="rgba(59,130,246,0.75)";e.currentTarget.style.boxShadow="0 0 32px rgba(59,130,246,0.25)";e.currentTarget.style.transform="scale(1.02)";}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(20,40,100,0.25)";e.currentTarget.style.borderColor="rgba(59,130,246,0.45)";e.currentTarget.style.boxShadow="0 0 20px rgba(59,130,246,0.08)";e.currentTarget.style.transform="scale(1)";}}>
              <span style={{fontSize:17}}>🔭</span> Explore
            </button>

            <div style={{textAlign:"center",marginTop:16,fontSize:11,color:"#2e2460",letterSpacing:"0.05em"}}>
              ✦ &nbsp;Coaching · Students · Tutors&nbsp; ✦
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ VIEW 2 — Full-page Explore ═══════════ */}
      {view === "explore" && (
        <div style={{
          position:"fixed",inset:0,zIndex:20,
          display:"flex",flexDirection:"column",
          overflowY:"auto",
          opacity: exploreReady ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}>
          {/* ── sticky header ─────────────────── */}
          <div style={{
            position:"sticky",top:0,zIndex:30,
            background:"rgba(6,4,20,0.88)",
            backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",
            borderBottom:"1px solid rgba(139,130,255,0.2)",
            padding:"14px 36px",
            display:"flex",alignItems:"center",gap:18,
            boxShadow:"0 4px 40px rgba(0,0,0,0.5)",
            flexWrap:"wrap",
          }}>
            <button onClick={closeExplore} style={{padding:"9px 18px",border:"1px solid rgba(139,130,255,0.35)",borderRadius:10,background:"rgba(139,130,255,0.12)",color:"#c4b5fd",fontFamily:"DM Sans,sans-serif",fontSize:13,fontWeight:600,cursor:"pointer",flexShrink:0,transition:"all 0.2s"}} onMouseEnter={e=>{e.currentTarget.style.background="rgba(139,130,255,0.22)";}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(139,130,255,0.12)";}}>← Back</button>

            <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:18,background:"linear-gradient(90deg,#a78bfa,#e0d8ff)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",flexShrink:0}}>Mentoria360</div>

            {/* ── Coaching / Tutor toggle ─── */}
            <div style={{display:"flex",background:"rgba(20,16,48,0.7)",borderRadius:10,border:"1px solid rgba(139,130,255,0.25)",overflow:"hidden",flexShrink:0}}>
              <button
                onClick={() => { setExploreMode("coaching"); setQuery(""); setResults([]); }}
                style={{
                  padding:"7px 18px",border:"none",cursor:"pointer",fontSize:12,fontWeight:700,
                  background: exploreMode === "coaching" ? "linear-gradient(135deg,#6c3ff5,#8b82ff)" : "transparent",
                  color: exploreMode === "coaching" ? "#fff" : "#9080c8",
                  transition:"all 0.2s",
                }}
              >
                🏫 Coachings
              </button>
              <button
                onClick={() => { setExploreMode("tutor"); setQuery(""); setResults([]); }}
                style={{
                  padding:"7px 18px",border:"none",cursor:"pointer",fontSize:12,fontWeight:700,
                  background: exploreMode === "tutor" ? "linear-gradient(135deg,#1a5fbc,#3b82f6)" : "transparent",
                  color: exploreMode === "tutor" ? "#fff" : "#9080c8",
                  transition:"all 0.2s",
                }}
              >
                👨‍🏫 Tutors
              </button>
            </div>

            <div style={{flex:1,position:"relative",maxWidth:420,minWidth:160}}>
              <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontSize:14,opacity:0.55,pointerEvents:"none"}}>🔍</span>
              <input
                value={query}
                onChange={e => handleSearch(e.target.value)}
                placeholder={exploreMode === "tutor" ? "Search by name, subject, city..." : "Search by name, city, subject..."}
                style={{width:"100%",padding:"10px 14px 10px 38px",background:"rgba(139,130,255,0.1)",border:"1px solid rgba(139,130,255,0.25)",borderRadius:11,color:"#e8e0ff",fontFamily:"DM Sans,sans-serif",fontSize:13,outline:"none",transition:"all 0.2s",boxSizing:"border-box"}}
                onFocus={e=>{e.target.style.borderColor="rgba(167,139,250,0.7)";e.target.style.boxShadow="0 0 0 3px rgba(108,99,255,0.15)";}}
                onBlur={e=>{e.target.style.borderColor="rgba(139,130,255,0.25)";e.target.style.boxShadow="none";}}
              />
            </div>

            <button onClick={() => onShowAuth("register-admin")} style={{padding:"9px 16px",border:"1px solid rgba(167,139,250,0.45)",borderRadius:10,background:"rgba(108,50,255,0.18)",color:"#c4b5fd",fontFamily:"DM Sans,sans-serif",fontSize:12,fontWeight:600,cursor:"pointer",flexShrink:0,whiteSpace:"nowrap",transition:"all 0.2s"}} onMouseEnter={e=>{e.currentTarget.style.background="rgba(108,50,255,0.32)";}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(108,50,255,0.18)";}}> 🏫 Register Coaching</button>

            <button onClick={() => onShowAuth("register-tutor")} style={{padding:"9px 16px",border:"1px solid rgba(59,130,246,0.45)",borderRadius:10,background:"rgba(20,60,180,0.18)",color:"#93c5fd",fontFamily:"DM Sans,sans-serif",fontSize:12,fontWeight:600,cursor:"pointer",flexShrink:0,whiteSpace:"nowrap",transition:"all 0.2s"}} onMouseEnter={e=>{e.currentTarget.style.background="rgba(20,60,180,0.32)";}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(20,60,180,0.18)";}}> 👨‍🏫 Register as Tutor</button>

            <button onClick={() => onShowAuth("login")} style={{padding:"9px 20px",border:"none",borderRadius:10,background:"linear-gradient(135deg,#6c3ff5,#8b82ff)",color:"#fff",fontFamily:"DM Sans,sans-serif",fontSize:13,fontWeight:600,cursor:"pointer",flexShrink:0,boxShadow:"0 4px 16px rgba(108,50,255,0.4)",transition:"transform 0.2s"}} onMouseEnter={e=>e.currentTarget.style.transform="scale(1.05)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>Sign In</button>
          </div>

          {/* ── hero ─────────────────────── */}
          <div style={{textAlign:"center",padding:"44px 40px 28px",animation:"m360FadeIn 0.45s ease"}}>
            <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:34,background:"linear-gradient(90deg,#a78bfa,#e0d8ff,#a78bfa)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",marginBottom:9}}>
              {exploreMode === "tutor"
                ? (query ? `Tutors for "${query}"` : "Discover Tutors")
                : (query ? `Results for "${query}"` : "Discover Coaching Institutes")
              }
            </div>
            <div style={{color:"#8878cc",fontSize:14}}>
              {exploreMode === "tutor"
                ? (query ? `${tutorList.length} tutor${tutorList.length!==1?"s":""} found` : `${tutors.length} tutor${tutors.length!==1?"s":""} registered · Find the right teacher for you`)
                : (query ? `${results.length} coaching${results.length!==1?"s":""} found` : "Browse institutes · Join as student · Or register your coaching")
              }
            </div>
          </div>

          {/* ── banner (coachings only) ─── */}
          {exploreMode === "coaching" && !query && (
            <div style={{padding:"0 36px 24px",animation:"m360FadeIn 0.5s ease 0.1s both"}}>
              <div style={{
                background:"rgba(8,6,24,0.88)",border:"1px solid rgba(139,130,255,0.3)",borderRadius:20,
                padding:"24px 32px",backdropFilter:"blur(20px)",
                display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:20,
                boxShadow:"0 8px 40px rgba(108,50,255,0.12),inset 0 1px 0 rgba(255,255,255,0.05)",
              }}>
                <div>
                  <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:18,color:"#e0d8ff",marginBottom:5}}>🏫 Run a Coaching Institute?</div>
                  <div style={{color:"#7a6aa8",fontSize:13}}>Register your institute on Mentoria360 and manage students, fees, classes &amp; more.</div>
                </div>
                <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                  <button onClick={() => onShowAuth("register-admin")} style={{padding:"12px 24px",border:"none",borderRadius:12,background:"linear-gradient(135deg,#6c3ff5,#8b82ff)",color:"#fff",fontFamily:"DM Sans,sans-serif",fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:"0 6px 22px rgba(108,50,255,0.45)",transition:"transform 0.2s,box-shadow 0.2s"}} onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.04)";}} onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";}}>Register as Coaching →</button>
                  <button onClick={() => onShowAuth("register-tutor")} style={{padding:"12px 24px",border:"1px solid rgba(59,130,246,0.5)",borderRadius:12,background:"rgba(20,60,180,0.22)",color:"#93c5fd",fontFamily:"DM Sans,sans-serif",fontSize:14,fontWeight:700,cursor:"pointer",transition:"all 0.2s"}} onMouseEnter={e=>{e.currentTarget.style.background="rgba(30,80,220,0.35)";}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(20,60,180,0.22)";}}>Join as Tutor →</button>
                </div>
              </div>
            </div>
          )}

          {/* ── grid ─────────────────────── */}
          <div style={{padding:"0 36px 60px",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:22,maxWidth:1400,margin:"0 auto",width:"100%",boxSizing:"border-box"}}>

            {/* COACHING MODE */}
            {exploreMode === "coaching" && (
              <>
                {searching && <div style={{gridColumn:"1/-1",textAlign:"center",padding:60,color:"#8878cc",fontSize:14}}><div style={{fontSize:32,marginBottom:12}}>✨</div>Searching...</div>}
                {!searching && (query ? results : featured).length === 0 && (
                  <div style={{gridColumn:"1/-1",textAlign:"center",padding:60}}>
                    <div style={{fontSize:48,marginBottom:16}}>🔭</div>
                    <div style={{fontFamily:"Syne,sans-serif",fontSize:20,color:"#a78bfa",marginBottom:8}}>{query?"No coachings found":"No coachings yet"}</div>
                    <div style={{color:"#5a4880",fontSize:13,marginBottom:24}}>{query?"Try a different search":"Be the first to register your institute!"}</div>
                    <button onClick={() => onShowAuth("register-admin")} style={{padding:"12px 28px",border:"none",borderRadius:12,background:"linear-gradient(135deg,#6c3ff5,#8b82ff)",color:"#fff",fontFamily:"DM Sans,sans-serif",fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:"0 6px 22px rgba(108,50,255,0.4)"}}>Register Your Coaching →</button>
                  </div>
                )}
                {!searching && (query ? results : featured).map((c, idx) => (
                  <CoachingCard key={c.id} coaching={c} idx={idx} onJoin={() => { if(preSelectCoaching) preSelectCoaching(c); else onShowAuth("register"); }} />
                ))}
              </>
            )}

            {/* TUTOR MODE */}
            {exploreMode === "tutor" && (
              <>
                {tutorList.length === 0 && (
                  <div style={{gridColumn:"1/-1",textAlign:"center",padding:60}}>
                    <div style={{fontSize:48,marginBottom:16}}>👨‍🏫</div>
                    <div style={{fontFamily:"Syne,sans-serif",fontSize:20,color:"#60a5fa",marginBottom:8}}>
                      {query ? "No tutors found" : "No tutors yet"}
                    </div>
                    <div style={{color:"#5a4880",fontSize:13,marginBottom:24}}>
                      {query ? "Try searching by subject or city" : "Be the first to join as a tutor!"}
                    </div>
                    <button onClick={() => onShowAuth("register-tutor")} style={{padding:"12px 28px",border:"none",borderRadius:12,background:"linear-gradient(135deg,#1a5fbc,#3b82f6)",color:"#fff",fontFamily:"DM Sans,sans-serif",fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:"0 6px 22px rgba(59,130,246,0.4)"}}>
                      Register as Tutor →
                    </button>
                  </div>
                )}
                {tutorList.map((t, idx) => (
                  <TutorCard key={t.id} tutor={t} idx={idx} onContact={() => onShowAuth("login")} />
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ── Coaching card ─────────────────────────────────────────────
function CoachingCard({ coaching: c, idx, onJoin }) {
  const floats = ["m360Float0","m360Float1","m360Float2","m360Float3"];
  const initials = (c.name||"?").split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase();
  const subjects = c.subject ? c.subject.split(/[,/]/).slice(0,3) : [];

  return (
    <div className="m360-ccard" style={{
      background:"rgba(10,8,28,0.90)",
      border:"1px solid rgba(139,130,255,0.28)",
      borderRadius:20,padding:"24px",
      backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",
      boxShadow:"0 8px 32px rgba(0,0,0,0.5),0 0 0 1px rgba(108,99,255,0.1)",
      animation:`${floats[idx%4]} ${3.5+(idx%4)*0.7}s ease-in-out ${(idx%6)*0.35}s infinite, m360SlideUp 0.5s ease ${idx*0.055}s both`,
      display:"flex",flexDirection:"column",gap:14,
    }}>
      <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
        <div style={{width:50,height:50,borderRadius:14,flexShrink:0,background:"linear-gradient(135deg,rgba(108,50,255,0.4),rgba(59,130,246,0.35))",border:"1px solid rgba(139,130,255,0.35)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:17,color:"#d4c4ff",boxShadow:"0 0 18px rgba(108,50,255,0.25)"}}>{initials}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:15,color:"#e8e0ff",lineHeight:1.3,marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
          {c.city && <div style={{fontSize:12,color:"#7a6aaa",display:"flex",alignItems:"center",gap:4}}><span>📍</span><span>{c.city}{c.state?`, ${c.state}`:""}</span></div>}
        </div>
      </div>
      {subjects.length>0 && (
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {subjects.map((s,i) => <span key={i} style={{padding:"3px 11px",borderRadius:20,background:"rgba(139,130,255,0.15)",border:"1px solid rgba(139,130,255,0.28)",fontSize:11,color:"#b4a8ff",fontWeight:600}}>{s.trim()}</span>)}
        </div>
      )}
      <div style={{fontSize:11,color:"#5a4880",display:"flex",gap:14}}>
        {c.yearsExp && <span>⭐ {c.yearsExp}y exp</span>}
        {c.phone && <span style={{color:"#4a7a60"}}>✅ Available</span>}
        {!c.yearsExp && !c.phone && <span>Open enrollment</span>}
      </div>
      <button onClick={onJoin} style={{width:"100%",padding:"11px",border:"1px solid rgba(139,130,255,0.42)",borderRadius:12,background:"rgba(139,130,255,0.14)",color:"#d4c4ff",fontFamily:"DM Sans,sans-serif",fontSize:13,fontWeight:700,cursor:"pointer",transition:"all 0.2s",boxShadow:"0 2px 12px rgba(108,50,255,0.12)"}} onMouseEnter={e=>{e.currentTarget.style.background="rgba(108,50,255,0.32)";e.currentTarget.style.color="#fff";}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(139,130,255,0.14)";e.currentTarget.style.color="#d4c4ff";}}>
        Join this Coaching →
      </button>
    </div>
  );
}

// ── Tutor card ────────────────────────────────────────────────
function TutorCard({ tutor: t, idx, onContact }) {
  const floats = ["m360Float0","m360Float1","m360Float2","m360Float3"];
  const initials = (t.name||"?").split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase();
  const audiences = t.teachesWhom ? t.teachesWhom.split(",").map(x=>x.trim()).filter(Boolean) : [];
  const subjects  = t.subject ? t.subject.split(",").map(x=>x.trim()).slice(0,3) : [];

  return (
    <div className="m360-ccard" style={{
      background:"rgba(6,14,36,0.92)",
      border:"1px solid rgba(59,130,246,0.28)",
      borderRadius:20, padding:"24px",
      backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
      boxShadow:"0 8px 32px rgba(0,0,0,0.5),0 0 0 1px rgba(59,130,246,0.1)",
      animation:`${floats[idx%4]} ${3.5+(idx%4)*0.7}s ease-in-out ${(idx%6)*0.35}s infinite, m360SlideUp 0.5s ease ${idx*0.055}s both`,
      display:"flex", flexDirection:"column", gap:12,
    }}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
        <div style={{width:50,height:50,borderRadius:"50%",flexShrink:0,background:"linear-gradient(135deg,rgba(30,80,200,0.5),rgba(59,130,246,0.4))",border:"1px solid rgba(59,130,246,0.4)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:17,color:"#93c5fd",boxShadow:"0 0 18px rgba(59,130,246,0.25)"}}>{initials}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:15,color:"#e0f0ff",marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.name}</div>
          {t.city && <div style={{fontSize:12,color:"#5a7aaa",display:"flex",alignItems:"center",gap:4}}><span>📍</span><span>{t.city}{t.state?`, ${t.state}`:""}</span></div>}
        </div>
      </div>

      {/* Subjects */}
      {subjects.length > 0 && (
        <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
          {subjects.map((s,i) => (
            <span key={i} style={{padding:"3px 10px",borderRadius:20,background:"rgba(59,130,246,0.15)",border:"1px solid rgba(59,130,246,0.3)",fontSize:11,color:"#93c5fd",fontWeight:600}}>{s}</span>
          ))}
        </div>
      )}

      {/* Teaches whom */}
      {audiences.length > 0 && (
        <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
          {audiences.slice(0,3).map((a,i) => (
            <span key={i} style={{padding:"2px 9px",borderRadius:20,background:"rgba(168,85,247,0.12)",border:"1px solid rgba(168,85,247,0.25)",fontSize:10,color:"#c084fc",fontWeight:600}}>{a}</span>
          ))}
          {audiences.length > 3 && <span style={{fontSize:10,color:"#7060a8",padding:"2px 6px"}}>+{audiences.length-3} more</span>}
        </div>
      )}

      {/* Bio */}
      {t.bio && (
        <p style={{fontSize:12,color:"#6070a0",lineHeight:1.5,margin:0,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>
          {t.bio}
        </p>
      )}

      {/* Meta + rate */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:11,color:"#3a5080"}}>
        <span>{t.yearsExp ? `⭐ ${t.yearsExp}y exp` : "👨‍🏫 Tutor"}</span>
        {t.hourlyRate > 0 && <span style={{color:"#22c55e",fontWeight:700,fontSize:12}}>₹{t.hourlyRate}/hr</span>}
      </div>

      {/* Contact button */}
      <button onClick={onContact} style={{width:"100%",padding:"11px",border:"1px solid rgba(59,130,246,0.42)",borderRadius:12,background:"rgba(30,80,200,0.2)",color:"#93c5fd",fontFamily:"DM Sans,sans-serif",fontSize:13,fontWeight:700,cursor:"pointer",transition:"all 0.2s",boxShadow:"0 2px 12px rgba(59,130,246,0.12)"}} onMouseEnter={e=>{e.currentTarget.style.background="rgba(59,130,246,0.35)";e.currentTarget.style.color="#fff";}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(30,80,200,0.2)";e.currentTarget.style.color="#93c5fd";}}>
        Contact Tutor →
      </button>
    </div>
  );
}

// ── Card button ───────────────────────────────────────────────
function CardBtn({ children, onClick, primary, mb }) {
  const s = {width:"100%",padding:"13px",border:"none",borderRadius:12,fontFamily:"DM Sans,sans-serif",fontSize:14,fontWeight:700,cursor:"pointer",letterSpacing:"0.03em",display:"block",textAlign:"center",marginBottom:mb||0,transition:"transform 0.2s,box-shadow 0.25s,background 0.2s",...(primary?{background:"linear-gradient(135deg,#6c3ff5,#8b82ff)",color:"#fff",boxShadow:"0 6px 24px rgba(108,50,255,0.45)"}:{background:"rgba(139,130,255,0.12)",color:"#d4c4ff",border:"1px solid rgba(139,130,255,0.35)"})};
  return <button style={s} onClick={onClick} onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.025)";if(primary)e.currentTarget.style.boxShadow="0 8px 32px rgba(108,50,255,0.65)";else e.currentTarget.style.background="rgba(139,130,255,0.22)";}} onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";if(primary)e.currentTarget.style.boxShadow="0 6px 24px rgba(108,50,255,0.45)";else e.currentTarget.style.background="rgba(139,130,255,0.12)";}}>
    {children}
  </button>;
}

// ── Custom cursor ─────────────────────────────────────────────
function M360Cursor() {
  const dotRef = useRef(null), ringRef = useRef(null);
  const cx = useRef(0), cy = useRef(0), rx = useRef(0), ry = useRef(0);
  useEffect(() => {
    if (window.matchMedia("(pointer:coarse)").matches) return;
    const onM = (e) => { cx.current=e.clientX; cy.current=e.clientY; };
    window.addEventListener("mousemove", onM);
    let id;
    const tk = () => { rx.current+=(cx.current-rx.current)*0.12; ry.current+=(cy.current-ry.current)*0.12; if(dotRef.current){dotRef.current.style.left=cx.current+"px";dotRef.current.style.top=cy.current+"px";}if(ringRef.current){ringRef.current.style.left=rx.current+"px";ringRef.current.style.top=ry.current+"px";}id=requestAnimationFrame(tk);};
    id = requestAnimationFrame(tk);
    return () => { window.removeEventListener("mousemove", onM); cancelAnimationFrame(id); };
  }, []);
  const b = {position:"fixed",borderRadius:"50%",pointerEvents:"none",zIndex:9999,transform:"translate(-50%,-50%)",willChange:"left,top"};
  return <>
    <div ref={dotRef}  style={{...b,width:8,height:8,background:"#a78bfa",boxShadow:"0 0 12px #a78bfa,0 0 28px rgba(167,139,250,0.45)"}}/>
    <div ref={ringRef} style={{...b,width:28,height:28,border:"1.5px solid rgba(167,139,250,0.65)",boxShadow:"0 0 10px rgba(167,139,250,0.22)"}}/>
  </>;
}
