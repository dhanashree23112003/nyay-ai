import { useState } from "react";
import { useMobile } from "../hooks/useMobile";

const C = {
  navy:    "#0d2461",
  saffron: "#c94b00",
  saffronL:"#e05c00",
  bg:      "#eef2f7",
  white:   "#ffffff",
  border:  "#d1dae8",
  text1:   "#0d1b3e",
  text2:   "#4a5d80",
  text3:   "#7a8fad",
};

const DEMO_USERS = [
  { email: "officer@nyay.ai", password: "demo123", name: "Inspector R. Sharma", role: "Investigating Officer", badge: "MH-CID-1042" },
  { email: "admin@nyay.ai",   password: "demo123", name: "SI Priya Kulkarni",   role: "Station House Officer",badge: "DL-SHO-007"  },
];

export default function Login({ onLogin, onBack }) {
  const isMobile = useMobile();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [name,     setName]     = useState("");
  const [badge,    setBadge]    = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [mode,     setMode]     = useState("login");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));

    if (mode === "login") {
      const user = DEMO_USERS.find(u => u.email === email && u.password === password);
      if (user) onLogin(user);
      else setError("Invalid credentials. Please use a demo account below.");
    } else {
      if (!name.trim()) { setError("Please enter your full name."); setLoading(false); return; }
      onLogin({ email, name: name.trim(), role: "Officer", badge: badge.trim() || "NEW" });
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column" }}>

      {/* Tricolor strip */}
      <div style={{ height: 4, background: "linear-gradient(to right, #FF9933 33.3%, #ffffff 33.3%, #ffffff 66.6%, #138808 66.6%)", flexShrink: 0 }} />

      {/* Header */}
      <div style={{ background: C.navy, padding: "16px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>⚖️</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: 2.5, color: "#fff" }}>NYAY.AI</div>
            <div style={{ fontSize: 9, letterSpacing: 1.5, color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Digital FIR System</div>
          </div>
        </div>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.8)", padding: "7px 16px", borderRadius: 5, cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>
          ← Back to Home
        </button>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ display: "flex", background: C.white, borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 48px rgba(13,36,97,0.14)", border: `1px solid ${C.border}`, width: "100%", maxWidth: 900 }}>

          {/* Left panel — hidden on mobile */}
          {!isMobile && <div style={{ flex: 1, background: C.navy, padding: "52px 44px", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -60, right: -60, width: 260, height: 260, borderRadius: "50%", background: "rgba(201,75,0,0.12)", filter: "blur(50px)" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: 36, marginBottom: 20 }}>🛡️</div>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: "#fff", fontFamily: "'Georgia', serif", lineHeight: 1.2, marginBottom: 16 }}>
                Officer Portal<br /><span style={{ color: "#ff8c42" }}>Nyay AI</span>
              </h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.85, marginBottom: 36 }}>
                Secure login for authorised police personnel. Access FIR intake, case management, and reporting tools.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  "✓  Accept multilingual complaints",
                  "✓  AI-powered IPC classification",
                  "✓  Generate FIR drafts instantly",
                  "✓  Track & manage all cases",
                ].map(f => <div key={f} style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{f}</div>)}
              </div>

              {/* Emblem watermark */}
              <div style={{ marginTop: 48, padding: "14px 16px", background: "rgba(255,255,255,0.06)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>Authorised System</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>For use by Indian Police Personnel only. Unauthorised access is prohibited under IT Act 2000.</div>
              </div>
            </div>
          </div>}

          {/* Right form */}
          <div style={{ width: isMobile ? "100%" : 420, padding: isMobile ? "32px 20px" : "52px 44px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ marginBottom: 6 }}>
              <div style={{ display: "flex", borderRadius: 7, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 28 }}>
                {["login", "signup"].map(m => (
                  <button key={m} onClick={() => { setMode(m); setError(""); }} style={{
                    flex: 1, padding: "10px", border: "none", cursor: "pointer",
                    background: mode === m ? C.navy : "transparent",
                    color: mode === m ? "#fff" : C.text3,
                    fontSize: 13, fontWeight: mode === m ? 700 : 400,
                    fontFamily: "inherit", transition: "all 0.2s",
                  }}>
                    {m === "login" ? "Sign In" : "New Officer"}
                  </button>
                ))}
              </div>
            </div>

            <h3 style={{ fontSize: 21, fontWeight: 700, color: C.text1, marginBottom: 6 }}>
              {mode === "login" ? "Welcome back, Officer" : "Register Officer Account"}
            </h3>
            <p style={{ fontSize: 13, color: C.text3, marginBottom: 28 }}>
              {mode === "login" ? "Enter your station credentials to continue" : "Create a new officer account for your station"}
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {mode === "signup" && (
                <>
                  <Field label="Full Name" value={name} onChange={setName} placeholder="Inspector Rahul Sharma" />
                  <Field label="Badge / Employee ID" value={badge} onChange={setBadge} placeholder="MH-CID-1042" />
                </>
              )}
              <Field label="Email Address" type="email" value={email} onChange={setEmail} placeholder="officer@station.gov.in" required />
              <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" required />

              {error && (
                <div style={{ background: "#fee2e2", border: "1px solid #fecaca", color: "#b91c1c", padding: "10px 14px", borderRadius: 7, fontSize: 13, animation: "fadeIn 0.2s ease" }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} style={{
                background: loading ? "#94a3b8" : C.saffron,
                border: "none", color: "#fff", padding: "13px", borderRadius: 7,
                fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit", marginTop: 6,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                transition: "all 0.2s",
                boxShadow: loading ? "none" : "0 2px 16px rgba(201,75,0,0.35)",
              }}>
                {loading ? (
                  <><div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Authenticating...</>
                ) : mode === "login" ? "Sign In →" : "Create Account →"}
              </button>
            </form>

            {/* Demo accounts */}
            <div style={{ marginTop: 24, background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 9, padding: 18 }}>
              <p style={{ fontSize: 10, letterSpacing: 2, color: C.saffron, textTransform: "uppercase", marginBottom: 12, fontWeight: 800 }}>
                Demo Accounts — Click to Fill
              </p>
              {DEMO_USERS.map(u => (
                <DemoCard key={u.email} user={u} onClick={() => { setEmail(u.email); setPassword(u.password); }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, type = "text", value, onChange, placeholder, required }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ fontSize: 11, color: C.text2, letterSpacing: 1, display: "block", marginBottom: 7, fontWeight: 600, textTransform: "uppercase" }}>{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} required={required}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: "100%", background: focused ? "#fff" : C.bg,
          border: `1.5px solid ${focused ? C.navy : C.border}`,
          borderRadius: 7, color: C.text1, padding: "11px 14px", fontSize: 14,
          fontFamily: "inherit", outline: "none", boxSizing: "border-box",
          transition: "all 0.2s",
          boxShadow: focused ? "0 0 0 3px rgba(13,36,97,0.08)" : "none",
        }}
      />
    </div>
  );
}

function DemoCard({ user, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10, width: "100%",
        background: hov ? "#fff" : "transparent",
        border: `1px solid ${hov ? C.border : "transparent"}`,
        borderRadius: 7, padding: "9px 10px", marginBottom: 6,
        cursor: "pointer", textAlign: "left", fontFamily: "inherit",
        transition: "all 0.2s",
        boxShadow: hov ? "0 1px 6px rgba(13,36,97,0.08)" : "none",
      }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
        {user.name.charAt(0)}
      </div>
      <div style={{ textAlign: "left" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.text1 }}>{user.name}</div>
        <div style={{ fontSize: 11, color: C.text3 }}>{user.badge} · {user.role}</div>
      </div>
    </button>
  );
}
