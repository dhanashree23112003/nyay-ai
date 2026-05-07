import { useState, useRef, useCallback, useEffect } from "react";
import { useMobile } from "../hooks/useMobile";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const C = {
  navy:    "#0d2461",
  saffron: "#c94b00",
  bg:      "#eef2f7",
  white:   "#ffffff",
  border:  "#d1dae8",
  borderLt:"#e8edf5",
  text1:   "#0d1b3e",
  text2:   "#4a5d80",
  text3:   "#7a8fad",
};

const URGENCY = {
  low:      { label: "LOW",      color: "#166534", bg: "#dcfce7", dot: "#22c55e" },
  medium:   { label: "MEDIUM",   color: "#92400e", bg: "#fef3c7", dot: "#f59e0b" },
  high:     { label: "HIGH",     color: "#991b1b", bg: "#fee2e2", dot: "#ef4444" },
  critical: { label: "CRITICAL", color: "#7f1d1d", bg: "#fef2f2", dot: "#dc2626" },
};

const CONFIDENCE_DOT = { high: "#22c55e", medium: "#f59e0b", low: "#94a3b8" };

export default function Intake({ user, onDraft, onDashboard, initialCase }) {
  const isMobile = useMobile();
  const [lang,           setLang]           = useState(initialCase ? "english" : null);
  const [subPhase,       setSubPhase]       = useState(initialCase ? "intake" : "home");
  const [inputText,      setInputText]      = useState("");
  const [caseId,         setCaseId]         = useState(initialCase?.id || null);
  const [extracted,      setExtracted]      = useState(initialCase?.extracted_data || null);
  const [ipcSections,    setIpcSections]    = useState(initialCase?.ipc_sections || []);
  const [missingFields,  setMissingFields]  = useState(initialCase?.missing_fields || []);
  const [followupQ,      setFollowupQ]      = useState(null);
  const [complaintReady, setComplaintReady] = useState(initialCase?.complaint_ready || false);
  const [urgency,        setUrgency]        = useState(initialCase?.urgency || "low");
  const [fieldEdits,     setFieldEdits]     = useState({});   // user corrections to extracted fields
  const [loading,        setLoading]        = useState(false);
  const [recording,      setRecording]      = useState(false);
  const [transcript,     setTranscript]     = useState("");
  const [chatHistory,    setChatHistory]    = useState([]);
  const [followupAns,    setFollowupAns]    = useState("");

  const recognitionRef  = useRef(null);
  const chatEndRef      = useRef(null);
  const [speechSupported] = useState(() =>
    typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
  );

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory]);

  const analyze = useCallback(async (text, existingCaseId = null, selectedLang = "hindi") => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/analyze/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, case_id: existingCaseId, language: selectedLang }) });
      const data = await res.json();
      setCaseId(data.case_id);
      setExtracted(data.extracted);
      setIpcSections(data.ipc_sections || []);
      setMissingFields(data.missing_fields || []);
      setFollowupQ(data.followup_question);
      setComplaintReady(data.complaint_ready);
      setUrgency(data.urgency || "low");
      setSubPhase("intake");
      setChatHistory(prev => [
        ...prev,
        { role: "user", content: text },
        ...(data.followup_question ? [{ role: "ai", content: data.followup_question }] : []),
      ]);
    } catch {
      alert("Cannot connect to backend. Ensure the server is running on port 8000.");
    } finally { setLoading(false); }
  }, []);

  const handleSubmit   = () => { if (!inputText.trim()) return; setChatHistory([]); analyze(inputText, null, lang || "hindi"); };
  const handleFollowup = () => { if (!followupAns.trim()) return; const a = followupAns; setFollowupAns(""); analyze(a, caseId, lang || "hindi"); };

  const startRecording = () => {
    if (!speechSupported) { alert("Please use Google Chrome for voice input."); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r  = new SR();

    r.continuous     = true;
    r.interimResults = true;
    r.lang           = lang === "english" ? "en-US" : "hi-IN";

    r.onresult = (e) => {
      // Rebuild from ALL results every event — this is the correct Web Speech API pattern.
      // Final results never change. Interim results replace, not append.
      let finalText = "";
      let interimText = "";
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          finalText += e.results[i][0].transcript + " ";
        } else {
          interimText += e.results[i][0].transcript;
        }
      }
      setTranscript(finalText + interimText);
      setInputText(finalText + interimText);
    };

    r.onerror = () => { setRecording(false); };
    r.onend   = () => { setRecording(false); };  // no restart — avoids duplication

    r.start();
    recognitionRef.current = r;
    setRecording(true);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setRecording(false);
  };
  const generateDraft  = async () => {
    setLoading(true);
    try {
      // Save any field edits the officer made before generating
      if (Object.keys(fieldEdits).length > 0) {
        await fetch(`${API}/cases/${caseId}/extracted`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ extracted_data: fieldEdits }),
        });
        setExtracted(prev => ({ ...prev, ...fieldEdits }));
      }
      const res  = await fetch(`${API}/analyze/${caseId}/generate-draft`, { method: "POST" });
      const data = await res.json();
      const mergedExtracted = { ...(extracted || {}), ...fieldEdits };
      onDraft({ draft: data.draft, caseId, urgency, extracted: mergedExtracted, ipcSections });
    } catch { alert("Failed to generate FIR draft. Check backend connection."); }
    finally   { setLoading(false); }
  };

  const urg = URGENCY[urgency] || URGENCY.low;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text1, fontFamily: "'Inter', sans-serif" }}>

      {/* Loading bar */}
      {loading && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, background: "#d1dae8", zIndex: 200, overflow: "hidden" }}>
          <div style={{ height: "100%", background: C.saffron, width: "60%", animation: "loading 1.4s ease infinite" }} />
        </div>
      )}

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
            <div style={{ fontSize: 9, color: C.text3, letterSpacing: 1, textTransform: "uppercase" }}>FIR Intake</div>
          </div>
        </div>

        {lang && (
          <button onClick={() => { setLang(null); setSubPhase("home"); setInputText(""); setCaseId(null); setExtracted(null); setChatHistory([]); }} style={{
            display: "flex", alignItems: "center", gap: 6,
            background: C.bg, border: `1px solid ${C.border}`,
            borderRadius: 5, padding: "5px 12px", cursor: "pointer",
            fontSize: 12, color: C.text2, fontFamily: "inherit", fontWeight: 600,
          }}>
            {lang === "english" ? "🇬🇧 English" : "🇮🇳 हिंदी"}
            <span style={{ fontSize: 10, color: C.text3 }}>· change</span>
          </button>
        )}

        {caseId && (
          <div style={{
            marginLeft: "auto", display: "flex", alignItems: "center", gap: 8,
            fontSize: 11, letterSpacing: 1.5, color: C.text2,
            background: C.bg, padding: "5px 14px", borderRadius: 5,
            border: `1px solid ${C.border}`, fontWeight: 600,
          }}>
            FIR #{caseId.slice(0, 8).toUpperCase()}
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: urg.dot, display: "inline-block" }} />
          </div>
        )}

        {caseId && (
          <div style={{ fontSize: 11, fontWeight: 700, color: urg.color, background: urg.bg, padding: "4px 10px", borderRadius: 5 }}>
            {urg.label} URGENCY
          </div>
        )}
      </header>

      <main style={{ padding: "0 24px 48px" }}>

        {/* ── LANGUAGE PICKER ── */}
        {!lang && (
          <div style={{ maxWidth: 560, margin: "0 auto", paddingTop: 72, animation: "fadeInUp 0.5s ease both" }}>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <div style={{ fontSize: 44, marginBottom: 16 }}>🗣️</div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: C.navy, fontFamily: "'Georgia', serif", marginBottom: 10 }}>
                Choose Language
              </h2>
              <p style={{ fontSize: 15, color: C.text2, lineHeight: 1.7 }}>
                Select the language for the AI's questions and voice recognition.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
              {/* English */}
              <button onClick={() => setLang("english")} style={{
                background: C.white, border: `2px solid ${C.border}`,
                borderRadius: 12, padding: "28px 20px", cursor: "pointer",
                fontFamily: "inherit", textAlign: "center",
                transition: "all 0.2s", boxShadow: "0 2px 8px rgba(13,36,97,0.07)",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.navy; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(13,36,97,0.14)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 8px rgba(13,36,97,0.07)"; }}
              >
                <div style={{ fontSize: 36, marginBottom: 12 }}>🇬🇧</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: C.navy, marginBottom: 4 }}>English</div>
                <div style={{ fontSize: 13, color: C.text3 }}>Questions & voice in English</div>
              </button>

              {/* Hindi */}
              <button onClick={() => setLang("hindi")} style={{
                background: C.white, border: `2px solid ${C.border}`,
                borderRadius: 12, padding: "28px 20px", cursor: "pointer",
                fontFamily: "inherit", textAlign: "center",
                transition: "all 0.2s", boxShadow: "0 2px 8px rgba(13,36,97,0.07)",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.saffron; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(201,75,0,0.14)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 8px rgba(13,36,97,0.07)"; }}
              >
                <div style={{ fontSize: 36, marginBottom: 12 }}>🇮🇳</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: C.navy, marginBottom: 4 }}>हिंदी</div>
                <div style={{ fontSize: 13, color: C.text3 }}>प्रश्न और वॉयस हिंदी में</div>
              </button>
            </div>

            <div style={{ marginTop: 20, padding: "12px 16px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, fontSize: 13, color: "#1e40af", textAlign: "center" }}>
              ℹ️ You can still type in any language — this controls the AI's questions and voice input.
            </div>
          </div>
        )}

        {/* ── HOME ── */}
        {lang && subPhase === "home" && (
          <div style={{ maxWidth: 700, margin: "0 auto", paddingTop: 48, animation: "fadeInUp 0.5s ease both" }}>

            {/* Page header */}
            <div style={{ background: C.navy, borderRadius: 10, padding: "24px 28px", marginBottom: 28, color: "#fff" }}>
              <div style={{ fontSize: 11, letterSpacing: 2, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", marginBottom: 8 }}>
                New FIR Intake — नई FIR दर्ज करें
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Georgia', serif", lineHeight: 1.2 }}>
                Record Complainant Statement
              </h1>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 8, lineHeight: 1.7 }}>
                Ask the complainant to describe the incident. Speak or type in Hindi, English, or Hinglish.
              </p>
            </div>

            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 24, boxShadow: "0 2px 10px rgba(13,36,97,0.07)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.navy, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14 }}>
                Complainant Statement / शिकायतकर्ता का बयान
              </div>

              {/* Voice button */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <button onClick={recording ? stopRecording : startRecording} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: recording ? "#fee2e2" : "#e8edf8",
                  border: `1.5px solid ${recording ? "#fecaca" : C.border}`,
                  color: recording ? "#b91c1c" : C.navy,
                  padding: "10px 20px", borderRadius: 7, cursor: "pointer",
                  fontSize: 14, fontFamily: "inherit", fontWeight: 600, transition: "all 0.2s",
                }}>
                  {recording
                    ? <><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", animation: "pulse 1s infinite", display: "inline-block" }} />Recording… Tap to Stop</>
                    : <><span style={{ fontSize: 16 }}>🎙</span> Voice Input</>
                  }
                </button>
                <span style={{ color: C.text3, fontSize: 12 }}>or type below</span>
              </div>

              {transcript && (
                <div style={{ background: "#dcfce7", border: "1px solid #86efac", color: "#166534", padding: "9px 13px", borderRadius: 7, fontSize: 13, marginBottom: 12, fontWeight: 500, animation: "fadeIn 0.3s ease" }}>
                  ✓ Voice transcribed: "{transcript.slice(0, 90)}{transcript.length > 90 ? "…" : ""}"
                </div>
              )}

              <textarea
                value={inputText} onChange={e => setInputText(e.target.value)}
                placeholder="Enter the complaint in the complainant's own words...&#10;&#10;Example: 'Kal raat mere ghar mein chor ghus aaya aur mere 50,000 rupaye aur phone chura ke bhaag gaya...'"
                rows={7}
                style={{
                  width: "100%", background: C.bg, border: `1.5px solid ${C.border}`,
                  borderRadius: 8, color: C.text1, padding: "13px 15px", fontSize: 14, lineHeight: 1.75,
                  fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => e.target.style.borderColor = C.navy}
                onBlur={e => e.target.style.borderColor = C.border}
              />

              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <button onClick={handleSubmit} disabled={loading || !inputText.trim()} style={{
                  flex: 1, background: loading || !inputText.trim() ? "#94a3b8" : C.saffron,
                  border: "none", color: "#fff", padding: "14px 0", borderRadius: 8,
                  fontSize: 15, fontWeight: 700, cursor: loading || !inputText.trim() ? "not-allowed" : "pointer",
                  fontFamily: "inherit", transition: "all 0.2s",
                  boxShadow: !loading && inputText.trim() ? "0 3px 16px rgba(201,75,0,0.35)" : "none",
                }}>
                  {loading ? "Analysing Statement…" : "Analyse & Extract Facts →"}
                </button>
              </div>

              <div style={{ marginTop: 14, padding: "10px 14px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 7, fontSize: 12, color: "#1e40af" }}>
                ℹ️ AI will extract: complainant details, accused info, incident date/time/location, injuries, IPC sections, and missing information.
              </div>
            </div>
          </div>
        )}

        {/* ── INTAKE ── */}
        {lang && subPhase === "intake" && extracted && (
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 16, paddingTop: 16, maxWidth: 1260, margin: "0 auto", animation: "fadeIn 0.5s ease" }}>

            {/* Chat panel */}
            <div style={{
              width: isMobile ? "100%" : 360, flexShrink: 0,
              background: C.white, border: `1px solid ${C.border}`,
              borderRadius: 10, padding: 16,
              display: "flex", flexDirection: "column", gap: 10,
              maxHeight: isMobile ? 320 : "calc(100vh - 96px)",
              position: isMobile ? "static" : "sticky", top: 72,
              boxShadow: "0 2px 10px rgba(13,36,97,0.07)",
            }}>
              <div style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: 10, marginBottom: 2 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: C.navy, letterSpacing: 2, textTransform: "uppercase" }}>AI Conversation</div>
                <div style={{ fontSize: 10, color: C.text3, marginTop: 2 }}>AI अधिकारी सहायक</div>
              </div>

              <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, paddingRight: 2 }}>
                {chatHistory.map((msg, i) => (
                  <div key={i} style={{
                    borderRadius: 8, padding: "10px 13px", animation: "fadeIn 0.3s ease",
                    ...(msg.role === "user"
                      ? { background: C.bg, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.navy}` }
                      : { background: "#eff6ff", border: "1px solid #bfdbfe", borderLeft: "3px solid #3b82f6" }),
                  }}>
                    <span style={{ fontSize: 10, letterSpacing: 1.5, fontWeight: 800, textTransform: "uppercase", color: msg.role === "user" ? C.navy : "#1e40af" }}>
                      {msg.role === "user" ? "👮 Officer / Complainant" : "🤖 Nyay AI"}
                    </span>
                    <p style={{ fontSize: 13, lineHeight: 1.65, color: C.text1, margin: "5px 0 0" }}>{msg.content}</p>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {followupQ && !complaintReady && (
                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#1e40af", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Additional Information Required</div>
                  <p style={{ fontSize: 13, color: C.text1, lineHeight: 1.6, marginBottom: 10, background: "#eff6ff", border: "1px solid #bfdbfe", padding: "8px 12px", borderRadius: 7 }}>{followupQ}</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      value={followupAns} onChange={e => setFollowupAns(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleFollowup()}
                      placeholder="Enter response..."
                      style={{
                        flex: 1, background: C.bg, border: `1.5px solid ${C.border}`,
                        borderRadius: 6, color: C.text1, padding: "9px 12px",
                        fontSize: 13, fontFamily: "inherit", outline: "none",
                        transition: "border-color 0.2s",
                      }}
                      onFocus={e => e.target.style.borderColor = C.navy}
                      onBlur={e => e.target.style.borderColor = C.border}
                    />
                    <button onClick={handleFollowup} disabled={loading} style={{
                      background: C.navy, color: "#fff", border: "none",
                      padding: "9px 16px", borderRadius: 6, cursor: "pointer", fontWeight: 700, fontSize: 15,
                    }}>→</button>
                  </div>
                </div>
              )}

              {complaintReady && (
                <div style={{ background: "#dcfce7", border: "1px solid #86efac", borderRadius: 9, padding: 14, animation: "fadeIn 0.3s ease" }}>
                  <div style={{ fontSize: 12, color: "#166534", fontWeight: 800, marginBottom: 10 }}>✓ All required information collected — FIR ready to generate</div>
                  <button onClick={generateDraft} disabled={loading} style={{
                    width: "100%", background: "#166534", border: "none", color: "#fff",
                    padding: "12px 0", borderRadius: 7, cursor: "pointer",
                    fontWeight: 700, fontSize: 14, fontFamily: "inherit",
                    boxShadow: "0 2px 12px rgba(22,101,52,0.3)",
                  }}>
                    {loading ? "Generating FIR Draft…" : "Generate FIR Draft →"}
                  </button>
                </div>
              )}
            </div>

            {/* Extracted info panel */}
            <div style={{
              flex: 1, background: C.white, border: `1px solid ${C.border}`,
              borderRadius: 10, padding: 20, overflowY: "auto",
              maxHeight: "calc(100vh - 96px)",
              boxShadow: "0 2px 10px rgba(13,36,97,0.07)",
            }}>
              {/* Panel header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: C.navy, letterSpacing: 1.5, textTransform: "uppercase" }}>Extracted Information</div>
                  <div style={{ fontSize: 10, color: C.text3, marginTop: 2 }}>AI द्वारा निकाली गई जानकारी</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: urg.color, background: urg.bg, padding: "4px 12px", borderRadius: 5 }}>
                    {urg.label} URGENCY
                  </span>
                </div>
              </div>

              {/* Fields grid — editable */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <SectionTitle>Complainant & Case Details</SectionTitle>
                  <span style={{ fontSize: 11, color: C.text3 }}>✏️ Click any field to correct</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    ["complainant_name",    "Complainant Name / शिकायतकर्ता"],
                    ["complainant_contact", "Contact / संपर्क"],
                    ["accused_name",        "Accused Name / आरोपी"],
                    ["accused_description", "Accused Description"],
                    ["incident_date",       "Incident Date / तारीख"],
                    ["incident_time",       "Incident Time / समय"],
                    ["incident_location",   "Location / स्थान"],
                    ["injury_or_loss",      "Injury / Loss / चोट / नुकसान"],
                  ].map(([field, label]) => (
                    <EditableField
                      key={field} label={label}
                      value={fieldEdits[field] !== undefined ? fieldEdits[field] : (extracted[field] || "")}
                      onChange={v => setFieldEdits(prev => ({ ...prev, [field]: v }))}
                    />
                  ))}
                </div>
              </div>

              {extracted.incident_description && (
                <div style={{ marginBottom: 16 }}>
                  <SectionTitle>Incident Summary / घटना का विवरण</SectionTitle>
                  <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px", marginTop: 10 }}>
                    <p style={{ fontSize: 14, lineHeight: 1.8, color: C.text1, margin: 0 }}>{extracted.incident_description}</p>
                  </div>
                </div>
              )}

              {extracted.witnesses?.length > 0 && (
                <TagSection label="Witnesses / गवाह" tags={extracted.witnesses} color={C.navy} bg="#e8edf8" border={C.border} />
              )}
              {extracted.evidence?.length > 0 && (
                <TagSection label="Evidence / सबूत" tags={extracted.evidence} color="#1e40af" bg="#dbeafe" border="#93c5fd" />
              )}

              {ipcSections.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <SectionTitle>Applicable IPC Sections / लागू धाराएँ</SectionTitle>
                  {ipcSections.map((s, i) => (
                    <div key={i} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                      padding: "12px 14px", background: "#fff7ed",
                      border: "1px solid #fed7aa", borderLeft: "4px solid #c94b00",
                      borderRadius: 8, marginTop: 8,
                      animation: `fadeIn 0.3s ease ${i * 0.08}s both`,
                    }}>
                      <div>
                        <span style={{ fontSize: 14, fontWeight: 800, color: C.saffron, letterSpacing: 0.5, display: "block" }}>{s.section}</span>
                        <span style={{ fontSize: 13, color: C.text1, fontWeight: 600 }}>{s.title}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 7, maxWidth: "52%" }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: CONFIDENCE_DOT[s.confidence] || "#94a3b8", display: "inline-block", flexShrink: 0, marginTop: 5 }} />
                        <span style={{ fontSize: 12, color: C.text2, lineHeight: 1.55 }}>{s.reason}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {missingFields.length > 0 && (
                <div style={{ background: "#fef9c3", border: "1px solid #fde047", borderRadius: 8, padding: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#854d0e", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>
                    ⚠️ Missing Information Required
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                    {missingFields.map((f, i) => (
                      <span key={i} style={{ fontSize: 12, padding: "4px 11px", borderRadius: 5, background: "#fff", color: "#92400e", border: "1px solid #fde047", fontWeight: 600 }}>{f}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function EditableField({ label, value, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = () => { onChange(draft); setEditing(false); };

  return (
    <div style={{
      padding: "9px 11px", borderRadius: 7,
      background: value ? "#eff6ff" : C.bg,
      border: `1px solid ${editing ? C.navy : value ? "#bfdbfe" : C.border}`,
      borderLeft: `3px solid ${value ? C.navy : C.border}`,
      transition: "border-color 0.15s",
      cursor: editing ? "default" : "text",
    }}
    onClick={() => { if (!editing) { setDraft(value); setEditing(true); } }}
    >
      <div style={{ fontSize: 9, letterSpacing: 1.5, color: C.text3, textTransform: "uppercase", fontWeight: 700, marginBottom: 5 }}>{label}</div>
      {editing ? (
        <div style={{ display: "flex", gap: 6 }}>
          <input
            autoFocus value={draft} onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 13, color: C.text1, fontFamily: "inherit", fontWeight: 600 }}
          />
          <button onClick={commit} style={{ background: C.navy, border: "none", color: "#fff", borderRadius: 4, padding: "2px 8px", cursor: "pointer", fontSize: 11 }}>✓</button>
          <button onClick={() => setEditing(false)} style={{ background: "none", border: "none", color: C.text3, cursor: "pointer", fontSize: 13 }}>✕</button>
        </div>
      ) : (
        <span style={{ fontSize: 13, color: value ? C.text1 : C.text3, fontWeight: value ? 600 : 400 }}>
          {value || "Not provided"}
        </span>
      )}
    </div>
  );
}

function SectionTitle({ children }) {
  return <div style={{ fontSize: 11, fontWeight: 800, color: C.navy, letterSpacing: 1.5, textTransform: "uppercase" }}>{children}</div>;
}

function TagSection({ label, tags, color, bg, border }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <SectionTitle>{label}</SectionTitle>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 8 }}>
        {tags.map((t, i) => (
          <span key={i} style={{ fontSize: 12, padding: "4px 12px", borderRadius: 5, background: bg, color, border: `1px solid ${border}`, fontWeight: 600 }}>{t}</span>
        ))}
      </div>
    </div>
  );
}
