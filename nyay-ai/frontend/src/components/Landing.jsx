import { useState, useEffect } from "react";
import { useMobile } from "../hooks/useMobile";

const C = {
  navy:    "#0d2461",
  navyDk:  "#081640",
  saffron: "#c94b00",
  saffronL:"#e05c00",
  bg:      "#eef2f7",
  white:   "#ffffff",
  border:  "#d1dae8",
  text1:   "#0d1b3e",
  text2:   "#4a5d80",
  text3:   "#7a8fad",
  green:   "#166534",
  greenBg: "#dcfce7",
};

const FEATURES = [
  { icon: "🎙", title: "Multilingual Voice Intake",    titleHi: "बहुभाषी वॉयस इनटेक",    desc: "Accept complaints in Hindi, English, or Hinglish. AI structures the facts automatically." },
  { icon: "⚖️", title: "Instant IPC Classification",   titleHi: "तत्काल IPC वर्गीकरण",   desc: "AI identifies applicable IPC sections — 14+ offence categories covered from theft to fraud." },
  { icon: "📄", title: "FIR Draft Generation",         titleHi: "FIR प्रारूप तैयार करना", desc: "Generates a court-ready, formally worded FIR draft in seconds. Print or save as PDF." },
  { icon: "🗂️", title: "Case Management Dashboard",   titleHi: "केस प्रबंधन डैशबोर्ड",   desc: "Track all FIR cases by status and urgency. Update progress from draft to closed in one click." },
];

const STEPS = [
  { step: "01", title: "Officer Starts Intake",  titleHi: "अधिकारी इनटेक शुरू करता है", desc: "Officer opens a new case and asks the complainant to describe the incident — by voice or text." },
  { step: "02", title: "AI Extracts Facts",      titleHi: "AI तथ्य निकालता है",          desc: "Nyay AI extracts complainant details, accused info, date, location, and maps applicable IPC sections." },
  { step: "03", title: "FIR Ready to File",      titleHi: "FIR दाखिल करने के लिए तैयार", desc: "A complete, formally worded FIR draft is generated — ready to print, sign, and register." },
];

export default function Landing({ onLogin, onGetStarted }) {
  const isMobile = useMobile();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const px = isMobile ? "16px" : "56px";

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text1, fontFamily: "'Inter', sans-serif", overflowX: "hidden" }}>

      {/* Tricolor strip */}
      <div style={{ height: 4, background: "linear-gradient(to right, #FF9933 33.3%, #ffffff 33.3%, #ffffff 66.6%, #138808 66.6%)" }} />

      {/* ── Navbar ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        display: "flex", alignItems: "center",
        padding: isMobile ? "0 16px" : "0 56px",
        height: isMobile ? 56 : 62,
        background: scrolled ? C.navy : C.white,
        borderBottom: `1px solid ${scrolled ? "transparent" : C.border}`,
        boxShadow: scrolled ? "0 2px 16px rgba(13,36,97,0.18)" : "none",
        transition: "all 0.3s ease",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 18 }}>⚖️</span>
          <div>
            <div style={{ fontSize: isMobile ? 13 : 15, fontWeight: 800, letterSpacing: 2, color: scrolled ? "#fff" : C.navy, lineHeight: 1.1 }}>NYAY.AI</div>
            {!isMobile && <div style={{ fontSize: 9, letterSpacing: 1.5, color: scrolled ? "rgba(255,255,255,0.5)" : C.text3, textTransform: "uppercase" }}>Digital FIR System</div>}
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onLogin} style={{
            background: "transparent",
            border: `1px solid ${scrolled ? "rgba(255,255,255,0.35)" : C.border}`,
            color: scrolled ? "#fff" : C.text2,
            padding: isMobile ? "7px 12px" : "9px 20px",
            borderRadius: 6, fontSize: isMobile ? 12 : 13,
            cursor: "pointer", fontFamily: "inherit", fontWeight: 500,
          }}>
            {isMobile ? "Login" : "Officer Login"}
          </button>
          <button onClick={onGetStarted} style={{
            background: C.saffron, border: "none", color: "#fff",
            padding: isMobile ? "7px 14px" : "9px 22px",
            borderRadius: 6, fontSize: isMobile ? 12 : 13, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
          }}>
            {isMobile ? "File Complaint" : "File a Complaint"}
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ background: C.navy, color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -80, right: -80, width: 400, height: 400, borderRadius: "50%", background: "rgba(201,75,0,0.08)", filter: "blur(60px)" }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "52px 16px 56px" : "90px 56px 100px", display: "flex", alignItems: "center", gap: 64, position: "relative", zIndex: 1, boxSizing: "border-box" }}>
          <div style={{ flex: 1, minWidth: 0, animation: "fadeInUp 0.8s ease both" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(201,75,0,0.18)", border: "1px solid rgba(201,75,0,0.38)",
              color: "#ffb380", padding: "5px 14px", borderRadius: 4,
              fontSize: isMobile ? 10 : 11, letterSpacing: 2, textTransform: "uppercase",
              marginBottom: isMobile ? 20 : 28, fontWeight: 700,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff8c42", animation: "pulse 2s infinite", display: "inline-block" }} />
              Digital FIR Management System
            </div>

            <h1 style={{
              fontSize: isMobile ? "28px" : "clamp(36px, 5vw, 60px)",
              lineHeight: 1.15, fontWeight: 800,
              fontFamily: "'Georgia', serif",
              marginBottom: isMobile ? 16 : 24,
              letterSpacing: -0.5, wordBreak: "break-word",
            }}>
              Nyay AI — Voice-Powered{" "}
              <span style={{ color: "#ff8c42" }}>FIR Filing for Indian Police</span>
            </h1>

            <p style={{ fontSize: isMobile ? 14 : 17, lineHeight: 1.8, color: "rgba(255,255,255,0.72)", marginBottom: isMobile ? 28 : 40, maxWidth: 520 }}>
              AI-powered complaint intake for police stations across India. Accept complaints in Hindi, English, or Hinglish — AI extracts facts, maps IPC sections, and drafts the FIR in under 2 minutes.
            </p>

            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 10 : 14 }}>
              <button onClick={onGetStarted} style={{
                background: C.saffron, border: "none", color: "#fff",
                padding: isMobile ? "13px 20px" : "15px 38px",
                borderRadius: 6, fontSize: isMobile ? 14 : 15, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
                boxShadow: "0 4px 24px rgba(201,75,0,0.45)",
                textAlign: "center",
              }}>
                Start New FIR Intake →
              </button>
              <button onClick={onLogin} style={{
                background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.25)",
                color: "#fff", padding: isMobile ? "13px 20px" : "15px 32px",
                borderRadius: 6, fontSize: isMobile ? 14 : 15,
                cursor: "pointer", fontFamily: "inherit", textAlign: "center",
              }}>
                Officer Portal Login
              </button>
            </div>

            {/* Supported languages */}
            <div style={{ marginTop: isMobile ? 28 : 48, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 2, textTransform: "uppercase" }}>Supports</span>
              {["Hindi", "English", "Hinglish"].map(l => (
                <span key={l} style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.1)", padding: "3px 10px", borderRadius: 4 }}>{l}</span>
              ))}
            </div>
          </div>

          {/* Demo card — desktop only */}
          {!isMobile && (
            <div style={{ width: 340, flexShrink: 0, animation: "fadeInUp 0.8s ease 0.15s both" }}>
              <div style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 8px 48px rgba(0,0,0,0.25)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, paddingBottom: 14, borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#fff" }}>⚖️</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text1 }}>Case #FIR-2025-04821</div>
                    <div style={{ fontSize: 11, color: C.text3 }}>Created just now</div>
                  </div>
                  <span style={{ marginLeft: "auto", background: "#fef3c7", color: "#92400e", fontSize: 10, padding: "3px 9px", borderRadius: 4, fontWeight: 700 }}>DRAFT</span>
                </div>
                {[["Complainant", "Ravi Kumar Singh"], ["IPC Section", "Section 379 — Theft"], ["Location", "Sector 12, Noida"], ["Urgency", "Medium"]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 12, color: C.text3 }}>{k}</span>
                    <span style={{ fontSize: 12, color: C.text1, fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
                <div style={{ marginTop: 16, background: C.greenBg, border: "1px solid #bbf7d0", borderRadius: 7, padding: 10, fontSize: 12, color: C.green, fontWeight: 600 }}>
                  ✓ FIR Draft ready to print
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "48px 16px" : "80px 56px 64px" }}>
        <p style={{ fontSize: 11, letterSpacing: 3, color: C.saffron, textTransform: "uppercase", marginBottom: 10, fontWeight: 700 }}>Capabilities</p>
        <h2 style={{ fontSize: isMobile ? "22px" : "clamp(26px, 3.5vw, 38px)", fontWeight: 800, fontFamily: "'Georgia', serif", color: C.navy, lineHeight: 1.2, marginBottom: isMobile ? 28 : 48 }}>
          Everything a police station needs
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(230px, 1fr))", gap: isMobile ? 12 : 20 }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{
              background: C.white, border: `1px solid ${C.border}`,
              borderRadius: 10, padding: isMobile ? "20px 16px" : "26px 22px",
              boxShadow: "0 1px 4px rgba(13,36,97,0.06)",
            }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ fontSize: isMobile ? 15 : 16, fontWeight: 700, color: C.navy, marginBottom: 4 }}>{f.title}</h3>
              <div style={{ fontSize: 11, color: C.saffron, marginBottom: 8, fontWeight: 500 }}>{f.titleHi}</div>
              <p style={{ fontSize: isMobile ? 13 : 14, color: C.text2, lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ background: C.navy, color: "#fff", padding: isMobile ? "48px 16px" : "80px 56px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <p style={{ fontSize: 11, letterSpacing: 3, color: "#ff8c42", textTransform: "uppercase", marginBottom: 12, fontWeight: 700 }}>Workflow</p>
          <h2 style={{ fontSize: isMobile ? "22px" : "36px", fontWeight: 800, fontFamily: "'Georgia', serif", marginBottom: isMobile ? 36 : 52, color: "#fff" }}>
            From complaint to FIR in 3 steps
          </h2>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 20, alignItems: "flex-start", paddingBottom: i < 2 ? 36 : 0, position: "relative" }}>
                {i < 2 && <div style={{ position: "absolute", left: 19, top: 44, width: 2, height: "calc(100% - 8px)", background: "linear-gradient(to bottom, rgba(255,140,66,0.5), rgba(255,140,66,0.05))" }} />}
                <div style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0, background: "rgba(201,75,0,0.2)", border: "2px solid rgba(255,140,66,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#ff8c42" }}>
                  {s.step}
                </div>
                <div style={{ paddingTop: 6 }}>
                  <h3 style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: "#fff", marginBottom: 4, fontFamily: "'Georgia', serif" }}>{s.title}</h3>
                  <div style={{ fontSize: 11, color: "rgba(255,140,66,0.7)", marginBottom: 6 }}>{s.titleHi}</div>
                  <p style={{ fontSize: isMobile ? 13 : 15, color: "rgba(255,255,255,0.62)", lineHeight: 1.75 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: C.white, padding: isMobile ? "48px 16px" : "72px 56px", textAlign: "center", borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, margin: "0 auto 20px" }}>⚖️</div>
          <h2 style={{ fontSize: isMobile ? "22px" : "32px", fontWeight: 800, fontFamily: "'Georgia', serif", color: C.navy, marginBottom: 14 }}>
            Ready to modernise your police station?
          </h2>
          <p style={{ fontSize: isMobile ? 14 : 16, color: C.text2, marginBottom: 28, lineHeight: 1.75 }}>
            Deploy Nyay AI at your station and reduce FIR filing time significantly.
          </p>
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 10, justifyContent: "center" }}>
            <button onClick={onGetStarted} style={{ background: C.saffron, border: "none", color: "#fff", padding: "13px 32px", borderRadius: 6, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              Start Free Demo →
            </button>
            <button onClick={onLogin} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.navy, padding: "13px 28px", borderRadius: 6, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
              Officer Login
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: C.navyDk, padding: isMobile ? "20px 16px" : "24px 56px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>⚖️</span>
          <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: 2, color: "rgba(255,255,255,0.5)" }}>NYAY.AI</span>
        </div>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>© 2025 Nyay AI. For official use by Indian Police Departments.</p>
      </footer>
    </div>
  );
}
