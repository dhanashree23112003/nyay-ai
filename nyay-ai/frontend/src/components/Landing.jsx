import { useState, useEffect } from "react";

// Indian police theme: navy + saffron + white
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
  { icon: "🎙", title: "Multilingual Voice Intake", titleHi: "बहुभाषी वॉयस इनटेक", desc: "Accept complaints in Hindi, English, or Hinglish. Citizens speak naturally; Nyay AI structures the facts automatically." },
  { icon: "⚖️", title: "Instant IPC Classification", titleHi: "तत्काल IPC वर्गीकरण", desc: "AI identifies applicable IPC sections with confidence scores — 14+ offence categories covered, from theft to assault to fraud." },
  { icon: "📄", title: "FIR Draft Generation", titleHi: "FIR प्रारूप तैयार करना", desc: "Generates a court-ready, formally worded FIR draft in seconds. Print, save as PDF, or submit digitally." },
  { icon: "🗂️", title: "Case Management Dashboard", titleHi: "केस प्रबंधन डैशबोर्ड", desc: "Track all FIR cases by status, urgency, and IPC section. Update case progress from draft to closed in one click." },
];

const STATS = [
  ["2,400+", "FIRs Processed"],
  ["3",      "Languages Supported"],
  ["< 2 min","Average Intake Time"],
  ["14+",    "IPC Sections Covered"],
  ["98%",    "Extraction Accuracy"],
];

const STEPS = [
  { step: "01", title: "Officer Starts Intake", titleHi: "अधिकारी इनटेक शुरू करता है", desc: "Officer opens a new case and asks the complainant to describe the incident — by voice or text." },
  { step: "02", title: "AI Extracts Facts",     titleHi: "AI तथ्य निकालता है",          desc: "Nyay AI extracts complainant details, accused info, date, location, injuries, and maps applicable IPC sections." },
  { step: "03", title: "FIR Ready to File",    titleHi: "FIR दाखिल करने के लिए तैयार", desc: "A complete, formally worded FIR draft is generated instantly — ready to print, sign, and register." },
];

export default function Landing({ onLogin, onGetStarted }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 52);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text1, fontFamily: "'Inter', sans-serif" }}>

      {/* ── Tricolor top strip ── */}
      <div style={{ height: 4, background: `linear-gradient(to right, #FF9933 33.3%, #ffffff 33.3%, #ffffff 66.6%, #138808 66.6%)` }} />

      {/* ── Navbar ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        display: "flex", alignItems: "center", padding: "0 56px", height: 62,
        background: scrolled ? C.navy : C.white,
        borderBottom: `1px solid ${scrolled ? "transparent" : C.border}`,
        boxShadow: scrolled ? "0 2px 16px rgba(13,36,97,0.18)" : "none",
        transition: "all 0.35s ease",
      }}>
        <NavLogo white={scrolled} />
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 10 }}>
          <GhostBtn onClick={onLogin} white={scrolled}>Officer Login</GhostBtn>
          <SaffronBtn onClick={onGetStarted}>File a Complaint</SaffronBtn>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ background: C.navy, color: "#fff", position: "relative", overflow: "hidden" }}>
        {/* Decorative background elements */}
        <div style={{ position: "absolute", top: -80, right: -80, width: 500, height: 500, borderRadius: "50%", background: "rgba(201,75,0,0.08)", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 360, height: 360, borderRadius: "50%", background: "rgba(255,255,255,0.04)", filter: "blur(50px)" }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "90px 56px 100px", display: "flex", alignItems: "center", gap: 64, position: "relative", zIndex: 1 }}>
          <div style={{ flex: 1, animation: "fadeInUp 0.8s ease both" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(201,75,0,0.18)", border: "1px solid rgba(201,75,0,0.38)",
              color: "#ffb380", padding: "6px 16px", borderRadius: 4, fontSize: 11,
              letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 28, fontWeight: 700,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff8c42", animation: "pulse 2s infinite", display: "inline-block" }} />
              Digital FIR Management System
            </div>

            <h1 style={{ fontSize: "clamp(36px, 5vw, 60px)", lineHeight: 1.12, fontWeight: 800, fontFamily: "'Georgia', serif", marginBottom: 24, letterSpacing: -0.5 }}>
              Nyay AI — Voice-Powered<br />
              <span style={{ color: "#ff8c42" }}>FIR Filing for Indian Police</span>
            </h1>

            <p style={{ fontSize: 17, lineHeight: 1.85, color: "rgba(255,255,255,0.72)", maxWidth: 520, marginBottom: 40 }}>
              AI-powered complaint intake system for police stations across India. Accept complaints in Hindi, English, or Hinglish — AI extracts facts, maps IPC sections, and drafts the FIR in under 2 minutes.
            </p>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <button onClick={onGetStarted} style={{
                background: C.saffron, border: "none", color: "#fff",
                padding: "15px 38px", borderRadius: 6, fontSize: 15, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit", letterSpacing: 0.3,
                boxShadow: "0 4px 24px rgba(201,75,0,0.45)",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = C.saffronL; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = C.saffron; e.currentTarget.style.transform = ""; }}
              >
                Start New FIR Intake →
              </button>
              <button onClick={onLogin} style={{
                background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.25)",
                color: "#fff", padding: "15px 32px", borderRadius: 6, fontSize: 15,
                cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.17)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
              >
                Officer Portal Login
              </button>
            </div>

            {/* Supported by strip */}
            <div style={{ marginTop: 48, display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 2, textTransform: "uppercase" }}>Supports</span>
              {["Hindi", "English", "Hinglish", "Marathi*"].map(l => (
                <span key={l} style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.08)", padding: "3px 10px", borderRadius: 4 }}>{l}</span>
              ))}
            </div>
          </div>

          {/* Right: demo card */}
          <div style={{ width: 340, flexShrink: 0, animation: "fadeInUp 0.8s ease 0.15s both" }}>
            <div style={{
              background: "#fff", borderRadius: 12, padding: 24,
              boxShadow: "0 8px 48px rgba(0,0,0,0.25)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, paddingBottom: 14, borderBottom: `1px solid ${C.border}` }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#fff" }}>⚖️</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text1 }}>Case #FIR-2025-04821</div>
                  <div style={{ fontSize: 11, color: C.text3 }}>Created just now</div>
                </div>
                <span style={{ marginLeft: "auto", background: "#fef3c7", color: "#92400e", fontSize: 10, padding: "3px 9px", borderRadius: 4, fontWeight: 700, letterSpacing: 1 }}>DRAFT</span>
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
        </div>
      </section>

      {/* ── Stats ── */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 56px", display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 20 }}>
          {STATS.map(([num, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: C.navy, fontFamily: "'Georgia', serif" }}>{num}</div>
              <div style={{ fontSize: 11, color: C.text3, letterSpacing: 2, textTransform: "uppercase", marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "88px 56px 72px" }}>
        <SectionEyebrow>Capabilities</SectionEyebrow>
        <SectionTitle>Everything a police station needs</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginTop: 48 }}>
          {FEATURES.map((f, i) => (
            <FeatureCard key={i} {...f} delay={`${i * 0.1}s`} />
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ background: C.navy, color: "#fff", padding: "88px 56px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <p style={{ fontSize: 11, letterSpacing: 3, color: "#ff8c42", textTransform: "uppercase", marginBottom: 14, fontWeight: 700 }}>Workflow</p>
          <h2 style={{ fontSize: 38, fontWeight: 800, fontFamily: "'Georgia', serif", marginBottom: 56, color: "#fff" }}>From complaint to FIR in 3 steps</h2>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 24, alignItems: "flex-start", paddingBottom: i < 2 ? 44 : 0, position: "relative" }}>
                {i < 2 && <div style={{ position: "absolute", left: 19, top: 48, width: 2, height: "calc(100% - 12px)", background: "linear-gradient(to bottom, rgba(255,140,66,0.5), rgba(255,140,66,0.05))" }} />}
                <div style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0, background: "rgba(201,75,0,0.2)", border: "2px solid rgba(255,140,66,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#ff8c42", letterSpacing: 1 }}>
                  {s.step}
                </div>
                <div style={{ paddingTop: 8 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 4, fontFamily: "'Georgia', serif" }}>{s.title}</h3>
                  <div style={{ fontSize: 12, color: "rgba(255,140,66,0.7)", marginBottom: 8 }}>{s.titleHi}</div>
                  <p style={{ fontSize: 15, color: "rgba(255,255,255,0.62)", lineHeight: 1.8 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: C.white, padding: "80px 56px", textAlign: "center", borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 24px" }}>⚖️</div>
          <h2 style={{ fontSize: 36, fontWeight: 800, fontFamily: "'Georgia', serif", color: C.navy, marginBottom: 16 }}>Ready to modernise your police station?</h2>
          <p style={{ fontSize: 16, color: C.text2, marginBottom: 36, lineHeight: 1.75 }}>Deploy Nyay AI at your station and reduce FIR filing time by up to 80%.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <SaffronBtn onClick={onGetStarted} large>Start Free Demo →</SaffronBtn>
            <GhostBtn onClick={onLogin} navy>Officer Login</GhostBtn>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: C.navyDk, padding: "28px 56px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <NavLogo white />
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>© 2025 Nyay AI. For official use by Indian Police Departments.</p>
        <div style={{ display: "flex", gap: 6 }}>
          {["#FF9933", "#ffffff", "#138808"].map((c, i) => (
            <div key={i} style={{ width: 22, height: 8, background: c, borderRadius: 2 }} />
          ))}
        </div>
      </footer>
    </div>
  );
}

/* ── Shared atoms ── */

function NavLogo({ white }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 20 }}>⚖️</span>
      <div>
        <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: 2.5, color: white ? "#fff" : C.navy, lineHeight: 1.1 }}>NYAY.AI</div>
        <div style={{ fontSize: 9, letterSpacing: 1.5, color: white ? "rgba(255,255,255,0.5)" : C.text3, textTransform: "uppercase" }}>Digital FIR System</div>
      </div>
    </div>
  );
}

function SaffronBtn({ children, onClick, large }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? C.saffronL : C.saffron, border: "none", color: "#fff",
        padding: large ? "14px 36px" : "9px 22px",
        borderRadius: 6, fontSize: large ? 15 : 13, fontWeight: 700,
        cursor: "pointer", fontFamily: "inherit", letterSpacing: 0.3,
        transition: "all 0.2s", transform: hov ? "translateY(-1px)" : "",
        boxShadow: hov ? "0 4px 18px rgba(201,75,0,0.4)" : "none",
      }}>{children}</button>
  );
}

function GhostBtn({ children, onClick, white, navy }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: navy && hov ? "#eef2f7" : white && hov ? "rgba(255,255,255,0.1)" : "transparent",
        border: `1px solid ${navy ? C.border : white ? "rgba(255,255,255,0.3)" : C.border}`,
        color: navy ? C.navy : white ? "#fff" : C.text2,
        padding: "9px 20px", borderRadius: 6, fontSize: 13,
        cursor: "pointer", fontFamily: "inherit", fontWeight: 500,
        transition: "all 0.2s",
      }}>{children}</button>
  );
}

function SectionEyebrow({ children }) {
  return <p style={{ fontSize: 11, letterSpacing: 3, color: C.saffron, textTransform: "uppercase", marginBottom: 12, fontWeight: 700 }}>{children}</p>;
}

function SectionTitle({ children }) {
  return <h2 style={{ fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 800, fontFamily: "'Georgia', serif", color: C.navy, lineHeight: 1.18 }}>{children}</h2>;
}

function FeatureCard({ icon, title, titleHi, desc, delay }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: C.white,
        border: `1px solid ${hov ? C.saffron + "66" : C.border}`,
        borderRadius: 10, padding: "26px 22px",
        boxShadow: hov ? "0 8px 28px rgba(13,36,97,0.1)" : "0 1px 4px rgba(13,36,97,0.06)",
        transform: hov ? "translateY(-4px)" : "translateY(0)",
        transition: "all 0.3s ease",
        animation: `fadeIn 0.6s ease ${delay} both`,
        cursor: "default",
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 14 }}>{icon}</div>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 4 }}>{title}</h3>
      <div style={{ fontSize: 12, color: C.saffron, marginBottom: 10, fontWeight: 500 }}>{titleHi}</div>
      <p style={{ fontSize: 14, color: C.text2, lineHeight: 1.75 }}>{desc}</p>
    </div>
  );
}
