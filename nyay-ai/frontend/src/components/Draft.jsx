import { useState } from "react";

const C = {
  navy:    "#0d2461",
  saffron: "#c94b00",
  bg:      "#eef2f7",
  white:   "#ffffff",
  border:  "#d1dae8",
  text1:   "#0d1b3e",
  text2:   "#4a5d80",
  text3:   "#7a8fad",
};

const URGENCY = {
  low:      { label: "LOW",      color: "#166534", bg: "#dcfce7" },
  medium:   { label: "MEDIUM",   color: "#92400e", bg: "#fef3c7" },
  high:     { label: "HIGH",     color: "#991b1b", bg: "#fee2e2" },
  critical: { label: "CRITICAL", color: "#7f1d1d", bg: "#fef2f2" },
};

export default function Draft({ state, onDashboard, onNewCase }) {
  const { draft, caseId, urgency, extracted, ipcSections } = state || {};
  const [copied, setCopied] = useState(false);
  const urg = URGENCY[urgency] || URGENCY.low;

  const handleCopy = () => {
    navigator.clipboard.writeText(draft || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text1, fontFamily: "'Inter', sans-serif" }}>

      {/* Tricolor strip */}
      <div style={{ height: 4, background: "linear-gradient(to right, #FF9933 33.3%, #ffffff 33.3%, #ffffff 66.6%, #138808 66.6%)" }} />

      {/* Header */}
      <header style={{
        display: "flex", alignItems: "center", gap: 14, padding: "13px 28px",
        background: C.white, borderBottom: `1px solid ${C.border}`,
        boxShadow: "0 1px 6px rgba(13,36,97,0.06)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <button onClick={onDashboard} style={{
          background: "none", border: `1px solid ${C.border}`, color: C.text2,
          cursor: "pointer", fontSize: 12, fontFamily: "inherit",
          display: "flex", alignItems: "center", gap: 5,
          padding: "6px 12px", borderRadius: 5, transition: "all 0.2s",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = C.bg; e.currentTarget.style.color = C.navy; }}
        onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.text2; }}
        >
          ← Dashboard
        </button>

        <div style={{ width: 1, height: 20, background: C.border }} />

        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span style={{ fontSize: 18 }}>⚖️</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 2, color: C.navy }}>NYAY.AI</div>
            <div style={{ fontSize: 9, color: C.text3, letterSpacing: 1, textTransform: "uppercase" }}>FIR Draft</div>
          </div>
        </div>

        {caseId && (
          <div style={{ fontSize: 12, fontWeight: 700, color: C.text2, background: C.bg, padding: "5px 14px", borderRadius: 5, border: `1px solid ${C.border}`, letterSpacing: 1 }}>
            FIR #{caseId.slice(0, 8).toUpperCase()}
          </div>
        )}

        {urgency && urgency !== "low" && (
          <div style={{ fontSize: 11, fontWeight: 800, color: urg.color, background: urg.bg, padding: "4px 10px", borderRadius: 5 }}>
            {urg.label} URGENCY
          </div>
        )}

        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <ActionBtn onClick={handleCopy}>{copied ? "✓ Copied!" : "Copy Text"}</ActionBtn>
          <ActionBtn onClick={() => window.print()} amber>🖨️ Print / Save PDF</ActionBtn>
          <ActionBtn onClick={onNewCase} navy>+ New Intake</ActionBtn>
        </div>
      </header>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 24px 60px" }}>

        {/* Success banner */}
        <div style={{
          background: "#dcfce7", border: "1px solid #86efac",
          borderRadius: 10, padding: "18px 22px", marginBottom: 24,
          display: "flex", alignItems: "center", gap: 14,
          animation: "fadeInUp 0.5s ease both",
        }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0, background: "#bbf7d0", border: "2px solid #22c55e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>✓</div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "#166534", marginBottom: 3 }}>FIR Draft Generated Successfully — FIR मसौदा तैयार</h3>
            <p style={{ fontSize: 13, color: "#15803d" }}>Review the draft below. Print or save as PDF for official submission and signature.</p>
          </div>
          <button onClick={() => window.print()} style={{
            background: "#166534", border: "none", color: "#fff",
            padding: "10px 20px", borderRadius: 7, cursor: "pointer",
            fontSize: 13, fontWeight: 700, fontFamily: "inherit",
            boxShadow: "0 2px 10px rgba(22,101,52,0.35)",
            flexShrink: 0,
          }}>
            🖨️ Print FIR
          </button>
        </div>

        {/* Case summary strip */}
        {extracted && (
          <div style={{
            display: "flex", gap: 12, marginBottom: 22, flexWrap: "wrap",
            animation: "fadeInUp 0.5s ease 0.1s both",
          }}>
            {extracted.complainant_name && (
              <SummaryChip icon="👤" label="Complainant" value={extracted.complainant_name} />
            )}
            {extracted.incident_location && (
              <SummaryChip icon="📍" label="Location" value={extracted.incident_location} />
            )}
            {extracted.incident_date && (
              <SummaryChip icon="📅" label="Date of Incident" value={extracted.incident_date} />
            )}
            {ipcSections?.[0] && (
              <SummaryChip icon="⚖️" label="Primary IPC Section" value={`${ipcSections[0].section} — ${ipcSections[0].title}`} amber />
            )}
          </div>
        )}

        {/* FIR Document */}
        <div style={{ animation: "fadeInUp 0.6s ease 0.15s both" }}>
          {/* Document header bar */}
          <div style={{ background: C.navy, color: "#fff", padding: "14px 24px", borderRadius: "10px 10px 0 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 2 }}>FIRST INFORMATION REPORT (FIR)</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 2, letterSpacing: 1 }}>प्रथम सूचना रिपोर्ट — NYAY.AI Generated</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <ActionBtn onClick={handleCopy} white>{copied ? "✓ Copied" : "Copy"}</ActionBtn>
              <ActionBtn onClick={() => window.print()} white>Print</ActionBtn>
            </div>
          </div>

          {/* Document body */}
          <div id="fir-print-content" style={{
            background: C.white, borderRadius: "0 0 10px 10px",
            padding: "48px 56px",
            boxShadow: "0 6px 40px rgba(13,36,97,0.12)",
            border: `1px solid ${C.border}`, borderTop: "none",
          }}>
            {!draft ? (
              <div style={{ textAlign: "center", padding: 40, color: C.text3 }}>
                <p style={{ fontFamily: "'Georgia', serif", fontSize: 16 }}>No draft content available.</p>
              </div>
            ) : (
              <pre style={{
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontSize: 15, lineHeight: 2.05,
                color: "#1a1a1a", whiteSpace: "pre-wrap", margin: 0,
                wordBreak: "break-word",
              }}>
                {draft}
              </pre>
            )}
          </div>
        </div>

        {/* Bottom actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, padding: "18px 22px", background: C.white, borderRadius: 10, border: `1px solid ${C.border}`, animation: "fadeIn 0.5s ease 0.3s both" }}>
          <p style={{ fontSize: 13, color: C.text3 }}>Generated by Nyay AI · For official use only</p>
          <div style={{ display: "flex", gap: 10 }}>
            <ActionBtn onClick={onNewCase}>+ New FIR Intake</ActionBtn>
            <ActionBtn onClick={onDashboard} navy>Back to Dashboard</ActionBtn>
            <ActionBtn onClick={() => window.print()} amber>🖨️ Print / Save PDF</ActionBtn>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ children, onClick, amber, navy, white }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: navy ? (hov ? "#1a3578" : C.navy)
          : amber ? (hov ? "#e05c00" : C.saffron)
          : white ? "rgba(255,255,255,0.12)"
          : hov ? C.bg : "transparent",
        border: navy ? "none"
          : amber ? "none"
          : white ? "1px solid rgba(255,255,255,0.25)"
          : `1px solid ${C.border}`,
        color: navy ? "#fff" : amber ? "#fff" : white ? "#fff" : C.text2,
        padding: "8px 16px", borderRadius: 6, cursor: "pointer",
        fontSize: 13, fontFamily: "inherit", transition: "all 0.2s",
        fontWeight: navy || amber ? 700 : 500,
        boxShadow: amber && hov ? "0 2px 12px rgba(201,75,0,0.35)" : "none",
      }}
    >{children}</button>
  );
}

function SummaryChip({ icon, label, value, amber }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      background: amber ? "#fff7ed" : C.white,
      border: `1px solid ${amber ? "#fed7aa" : C.border}`,
      borderRadius: 8, padding: "10px 14px",
      boxShadow: "0 1px 3px rgba(13,36,97,0.06)",
    }}>
      <span style={{ fontSize: 15 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 9, letterSpacing: 1.5, color: amber ? C.saffron : C.text3, textTransform: "uppercase", fontWeight: 700, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 13, color: C.text1, fontWeight: 600 }}>{value}</div>
      </div>
    </div>
  );
}
