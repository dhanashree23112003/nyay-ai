import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const C = {
  navy:    "#0d2461",
  navyLt:  "#1a3578",
  saffron: "#c94b00",
  bg:      "#eef2f7",
  white:   "#ffffff",
  border:  "#d1dae8",
  borderLt:"#e8edf5",
  text1:   "#0d1b3e",
  text2:   "#4a5d80",
  text3:   "#7a8fad",
  sidebar: "#0d2461",
};

const STATUS_META = {
  draft:        { label: "Draft",        bg: "#fef9c3", color: "#854d0e", border: "#fde047" },
  submitted:    { label: "Submitted",    bg: "#ede9fe", color: "#5b21b6", border: "#c4b5fd" },
  under_review: { label: "Under Review", bg: "#dbeafe", color: "#1e40af", border: "#93c5fd" },
  closed:       { label: "Closed",       bg: "#dcfce7", color: "#166534", border: "#86efac" },
};

const URGENCY = {
  low:      { color: "#166534", bg: "#dcfce7", dot: "#22c55e" },
  medium:   { color: "#92400e", bg: "#fef3c7", dot: "#f59e0b" },
  high:     { color: "#991b1b", bg: "#fee2e2", dot: "#ef4444" },
  critical: { color: "#7f1d1d", bg: "#fef2f2", dot: "#dc2626" },
};

export default function Dashboard({ user, onLogout, onNewIntake, onContinueCase }) {
  const [cases,     setCases]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState("all");
  const [search,    setSearch]    = useState("");
  const [activeNav, setActiveNav] = useState("cases");

  useEffect(() => { fetchCases(); }, []);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/cases/`);
      const data = await res.json();
      setCases(Array.isArray(data) ? data : []);
    } catch { setCases([]); }
    finally   { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      await fetch(`${API}/cases/${id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      fetchCases();
    } catch {}
  };

  const deleteCase = async (id) => {
    if (!window.confirm("Delete this FIR case permanently?")) return;
    try { await fetch(`${API}/cases/${id}`, { method: "DELETE" }); fetchCases(); } catch {}
  };

  const filtered = cases.filter(c => {
    const mf = filter === "all" || c.status === filter;
    const ms = !search ||
      (c.extracted_data?.complainant_name || "").toLowerCase().includes(search.toLowerCase()) ||
      c.id.includes(search.toLowerCase()) ||
      (c.urgency || "").includes(search.toLowerCase());
    return mf && ms;
  });

  const stats = {
    total:    cases.length,
    active:   cases.filter(c => c.status === "submitted" || c.status === "under_review").length,
    draft:    cases.filter(c => c.status === "draft").length,
    critical: cases.filter(c => c.urgency === "critical" || c.urgency === "high").length,
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: "'Inter', sans-serif", color: C.text1 }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 252, flexShrink: 0, background: C.sidebar,
        display: "flex", flexDirection: "column",
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>⚖️</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: 2.5, color: "#fff" }}>NYAY.AI</div>
              <div style={{ fontSize: 9, letterSpacing: 1.5, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Digital FIR System</div>
            </div>
          </div>
        </div>

        {/* Station info */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.15)" }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>Police Station</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>District Cyber Cell</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>PS Code: MH-001</div>
        </div>

        {/* New FIR */}
        <div style={{ padding: "14px 14px 0" }}>
          <button onClick={onNewIntake} style={{
            width: "100%", background: C.saffron, border: "none", color: "#fff",
            padding: "12px 16px", borderRadius: 7, fontSize: 14, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: "0 2px 16px rgba(201,75,0,0.4)",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#e05c00"; }}
          onMouseLeave={e => { e.currentTarget.style.background = C.saffron; }}
          >
            + New FIR Intake
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "14px 10px 0" }}>
          {[
            { id: "cases",     icon: "📋", label: "FIR Cases",  count: cases.length },
            { id: "analytics", icon: "📊", label: "Analytics",  count: null },
            { id: "settings",  icon: "⚙️", label: "Settings",   count: null },
          ].map(item => (
            <SideNavItem key={item.id} item={item} active={activeNav === item.id} onClick={() => setActiveNav(item.id)} />
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={user?.name} size={36} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name || "Officer"}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{user?.badge || "—"}</div>
          </div>
          <button onClick={onLogout} title="Logout" style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", cursor: "pointer", fontSize: 16, padding: 4, flexShrink: 0, transition: "color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}
          >⎋</button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ marginLeft: 252, flex: 1 }}>
        {/* Top bar */}
        <div style={{
          padding: "18px 32px", background: C.white,
          borderBottom: `1px solid ${C.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          position: "sticky", top: 0, zIndex: 40,
          boxShadow: "0 1px 6px rgba(13,36,97,0.06)",
        }}>
          <div>
            <h1 style={{ fontSize: 19, fontWeight: 700, color: C.navy, fontFamily: "'Georgia', serif" }}>
              {activeNav === "cases" ? "FIR Case Management" : activeNav === "analytics" ? "Case Analytics" : "Settings"}
            </h1>
            <p style={{ fontSize: 12, color: C.text3, marginTop: 2 }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={fetchCases} style={{
              background: C.bg, border: `1px solid ${C.border}`, color: C.text2,
              padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontSize: 13,
              fontFamily: "inherit", transition: "all 0.2s", fontWeight: 500,
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = C.navy}
            onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
            >↻ Refresh</button>
            <button onClick={onNewIntake} style={{
              background: C.saffron, border: "none", color: "#fff",
              padding: "9px 22px", borderRadius: 6, cursor: "pointer",
              fontSize: 13, fontWeight: 700, fontFamily: "inherit",
              boxShadow: "0 2px 10px rgba(201,75,0,0.3)",
            }}>+ New FIR Intake</button>
          </div>
        </div>

        <div style={{ padding: "28px 32px" }}>
          {activeNav === "cases" && (
            <CasesView cases={cases} filtered={filtered} loading={loading} stats={stats} filter={filter} search={search} onFilter={setFilter} onSearch={setSearch} onNewIntake={onNewIntake} onUpdateStatus={updateStatus} onDelete={deleteCase} onContinue={onContinueCase} onRefresh={fetchCases} />
          )}
          {activeNav === "analytics" && <AnalyticsPanel cases={cases} />}
          {activeNav === "settings"  && <SettingsPanel  user={user} />}
        </div>
      </main>
    </div>
  );
}

/* ── Cases View ── */

function CasesView({ cases, filtered, loading, stats, filter, search, onFilter, onSearch, onNewIntake, onUpdateStatus, onDelete, onContinue, onRefresh }) {
  const statCards = [
    { label: "Total FIR Cases", labelHi: "कुल FIR",      value: stats.total,    icon: "📁", color: C.navy,    bg: "#e8edf8"  },
    { label: "Under Review",    labelHi: "समीक्षाधीन",    value: stats.active,   icon: "🔄", color: "#1e40af", bg: "#dbeafe"  },
    { label: "Draft Cases",     labelHi: "मसौदा",         value: stats.draft,    icon: "📝", color: "#92400e", bg: "#fef3c7"  },
    { label: "High Priority",   labelHi: "उच्च प्राथमिकता",value: stats.critical, icon: "🚨", color: "#991b1b", bg: "#fee2e2"  },
  ];

  return (
    <>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 26 }}>
        {statCards.map((s, i) => (
          <div key={i} style={{
            background: C.white, border: `1px solid ${C.border}`,
            borderRadius: 10, padding: "18px 20px",
            boxShadow: "0 1px 4px rgba(13,36,97,0.05)",
            animation: `fadeIn 0.4s ease ${i * 0.08}s both`,
            borderLeft: `4px solid ${s.color}`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <span style={{ fontSize: 10, letterSpacing: 1.5, color: C.text3, textTransform: "uppercase", fontWeight: 700 }}>{s.label}</span>
                <div style={{ fontSize: 10, color: C.saffron, marginTop: 1 }}>{s.labelHi}</div>
              </div>
              <div style={{ background: s.bg, borderRadius: 7, padding: "6px 7px", fontSize: 14 }}>{s.icon}</div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: s.color, fontFamily: "'Georgia', serif", lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.text3, fontSize: 14, pointerEvents: "none" }}>🔍</span>
          <input
            placeholder="Search by complainant name, case ID, or urgency..."
            value={search} onChange={e => onSearch(e.target.value)}
            style={{
              width: "100%", background: C.white, border: `1.5px solid ${C.border}`,
              borderRadius: 7, color: C.text1, padding: "9px 14px 9px 36px",
              fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box",
              transition: "border-color 0.2s",
            }}
            onFocus={e => e.target.style.borderColor = C.navy}
            onBlur={e => e.target.style.borderColor = C.border}
          />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[["all","All Cases"],["draft","Draft"],["submitted","Submitted"],["under_review","Under Review"],["closed","Closed"]].map(([val, lbl]) => (
            <FilterPill key={val} label={lbl} active={filter === val} onClick={() => onFilter(val)} />
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden", boxShadow: "0 1px 6px rgba(13,36,97,0.05)" }}>
        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: "110px 160px 1fr 120px 90px 110px 100px", padding: "11px 20px", background: "#f8fafc", borderBottom: `1px solid ${C.border}` }}>
          {["CASE ID", "CASE NAME ✏️", "COMPLAINANT", "IPC SECTION", "URGENCY", "STATUS", "ACTIONS"].map(h => (
            <span key={h} style={{ fontSize: 10, letterSpacing: 1.5, color: C.text3, textTransform: "uppercase", fontWeight: 700 }}>{h}</span>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: 52, textAlign: "center", color: C.text3 }}>
            <div style={{ fontSize: 22, display: "inline-block", animation: "spin 1.2s linear infinite" }}>⟳</div>
            <div style={{ marginTop: 10, fontSize: 14 }}>Loading FIR cases...</div>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState hasData={cases.length > 0} onNewIntake={onNewIntake} />
        ) : (
          filtered.map((c, i) => (
            <CaseRow key={c.id} c={c} i={i} onUpdateStatus={onUpdateStatus} onDelete={onDelete} onContinue={onContinue} onRefresh={onRefresh} />
          ))
        )}
      </div>
    </>
  );
}

function CaseRow({ c, i, onUpdateStatus, onDelete, onContinue, onRefresh }) {
  const [expanded,  setExpanded]  = useState(false);
  const [nameEdit,  setNameEdit]  = useState(false);
  const [nameVal,   setNameVal]   = useState(c.case_name || "");
  const [savingName, setSavingName] = useState(false);

  const sm  = STATUS_META[c.status] || STATUS_META.draft;
  const urg = URGENCY[c.urgency]    || URGENCY.low;
  const extracted = c.extracted_data || {};
  const ipc = c.ipc_sections?.[0];

  const saveName = async () => {
    setSavingName(true);
    try {
      await fetch(`${API}/cases/${c.id}/name`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameVal }),
      });
      onRefresh?.();
    } catch {}
    setSavingName(false);
    setNameEdit(false);
  };

  return (
    <>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "grid", gridTemplateColumns: "110px 160px 1fr 120px 90px 110px 100px",
          padding: "12px 20px", borderBottom: `1px solid ${C.borderLt}`,
          alignItems: "center", cursor: "pointer",
          background: expanded ? "#f8fafc" : C.white,
          transition: "background 0.15s",
          animation: `fadeIn 0.3s ease ${i * 0.04}s both`,
        }}
        onMouseEnter={e => { if (!expanded) e.currentTarget.style.background = "#f8fafc"; }}
        onMouseLeave={e => { if (!expanded) e.currentTarget.style.background = C.white; }}
      >
        {/* Case ID */}
        <span style={{ fontSize: 10, fontFamily: "monospace", color: C.navy, fontWeight: 700, letterSpacing: 0.5 }}>
          #{c.id.slice(0, 8).toUpperCase()}
        </span>

        {/* Case Name — inline editable */}
        <div onClick={e => e.stopPropagation()}>
          {nameEdit ? (
            <div style={{ display: "flex", gap: 4 }}>
              <input
                autoFocus value={nameVal} onChange={e => setNameVal(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setNameEdit(false); }}
                placeholder="e.g. Laptop theft Pune"
                style={{
                  flex: 1, border: `1.5px solid ${C.navy}`, borderRadius: 5,
                  padding: "4px 8px", fontSize: 12, fontFamily: "inherit",
                  color: C.text1, outline: "none", width: "100%",
                }}
              />
              <button onClick={saveName} disabled={savingName} style={{ background: C.navy, border: "none", color: "#fff", borderRadius: 5, padding: "4px 8px", cursor: "pointer", fontSize: 11 }}>
                {savingName ? "…" : "✓"}
              </button>
            </div>
          ) : (
            <div
              onClick={() => setNameEdit(true)}
              title="Click to name this case"
              style={{
                fontSize: 13, color: c.case_name ? C.text1 : C.text3,
                fontWeight: c.case_name ? 600 : 400,
                fontStyle: c.case_name ? "normal" : "italic",
                cursor: "text", padding: "2px 4px", borderRadius: 4,
                border: "1px solid transparent",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.bg; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.background = "transparent"; }}
            >
              {c.case_name || "Click to name…"}
            </div>
          )}
        </div>

        {/* Complainant */}
        <div>
          <div style={{ fontSize: 13, color: C.text1, fontWeight: 600 }}>{extracted.complainant_name || "—"}</div>
          {extracted.complainant_contact && <div style={{ fontSize: 11, color: C.text3, marginTop: 1 }}>{extracted.complainant_contact}</div>}
        </div>

        {/* IPC */}
        <span style={{ fontSize: 12, color: C.text2, fontWeight: 500 }}>{ipc?.section || "—"}</span>

        {/* Urgency */}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: urg.dot, flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: urg.color }}>{(c.urgency || "low").toUpperCase()}</span>
        </div>

        {/* Status */}
        <span style={{ display: "inline-block", padding: "3px 8px", borderRadius: 5, fontSize: 11, fontWeight: 700, background: sm.bg, color: sm.color, border: `1px solid ${sm.border}` }}>
          {sm.label}
        </span>

        {/* Actions */}
        <div style={{ display: "flex", gap: 5 }} onClick={e => e.stopPropagation()}>
          <button onClick={() => onContinue?.(c)} title="Continue intake" style={{
            background: "#e8edf8", border: `1px solid ${C.border}`,
            color: C.navy, padding: "4px 9px", borderRadius: 5,
            cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: "inherit",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = C.navy; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#e8edf8"; e.currentTarget.style.color = C.navy; }}
          >Open</button>
          <button onClick={() => onDelete(c.id)} title="Delete" style={{
            background: "#fee2e2", border: "1px solid #fecaca",
            color: "#b91c1c", padding: "4px 8px", borderRadius: 5,
            cursor: "pointer", fontSize: 12, transition: "all 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#fecaca"}
          onMouseLeave={e => e.currentTarget.style.background = "#fee2e2"}
          >🗑</button>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: "16px 20px 20px", borderBottom: `1px solid ${C.border}`, background: "#f8fafc", animation: "fadeIn 0.2s ease" }}>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <ExpandLabel>Incident Summary</ExpandLabel>
              <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.75, marginTop: 7 }}>{extracted.incident_description || "No description available."}</p>
              {extracted.incident_location && <p style={{ fontSize: 12, color: C.text3, marginTop: 5 }}>📍 {extracted.incident_location}</p>}
              {extracted.incident_date && <p style={{ fontSize: 12, color: C.text3, marginTop: 3 }}>📅 {extracted.incident_date} {extracted.incident_time || ""}</p>}
            </div>
            <div style={{ minWidth: 180 }}>
              <ExpandLabel>IPC Sections</ExpandLabel>
              <div style={{ marginTop: 7 }}>
                {c.ipc_sections?.length > 0 ? c.ipc_sections.map((s, j) => (
                  <div key={j} style={{ fontSize: 12, marginBottom: 5 }}>
                    <span style={{ color: C.saffron, fontWeight: 700 }}>{s.section}</span>
                    <span style={{ color: C.text3, marginLeft: 5 }}>— {s.title}</span>
                  </div>
                )) : <span style={{ fontSize: 12, color: C.text3 }}>None identified</span>}
              </div>
            </div>
            <div style={{ minWidth: 160 }}>
              <ExpandLabel>Update Status</ExpandLabel>
              <select value={c.status} onChange={e => onUpdateStatus(c.id, e.target.value)}
                style={{ marginTop: 7, background: C.white, border: `1.5px solid ${C.border}`, color: C.text1, padding: "7px 10px", borderRadius: 6, fontSize: 13, fontFamily: "inherit", cursor: "pointer", outline: "none" }}>
                {Object.entries(STATUS_META).map(([v, m]) => (
                  <option key={v} value={v}>{m.label}</option>
                ))}
              </select>
              <button onClick={() => onContinue?.(c)} style={{
                display: "block", marginTop: 8, width: "100%",
                background: C.navy, border: "none", color: "#fff",
                padding: "9px 0", borderRadius: 6, cursor: "pointer",
                fontSize: 13, fontWeight: 700, fontFamily: "inherit",
              }}>
                Continue Intake →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function EmptyState({ hasData, onNewIntake }) {
  return (
    <div style={{ padding: 64, textAlign: "center", animation: "fadeIn 0.4s ease" }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>📁</div>
      <p style={{ color: C.text2, fontSize: 15, marginBottom: hasData ? 0 : 20 }}>
        {hasData ? "No cases match your current filter." : "No FIR cases yet. Start a new intake to register the first case."}
      </p>
      {!hasData && (
        <button onClick={onNewIntake} style={{ background: C.saffron, border: "none", color: "#fff", padding: "11px 28px", borderRadius: 7, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 12px rgba(201,75,0,0.3)" }}>
          Start First FIR Intake →
        </button>
      )}
    </div>
  );
}

/* ── Analytics ── */

function AnalyticsPanel({ cases }) {
  const urgency = { low: 0, medium: 0, high: 0, critical: 0 };
  const status  = { draft: 0, submitted: 0, under_review: 0, closed: 0 };
  cases.forEach(c => {
    if (urgency[c.urgency] !== undefined) urgency[c.urgency]++;
    if (status[c.status]   !== undefined) status[c.status]++;
  });
  const total = cases.length;

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      {cases.length === 0 ? (
        <div style={{ textAlign: "center", padding: 64, color: C.text3, background: C.white, borderRadius: 10, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>📊</div>
          <p>Analytics will appear once FIR cases are registered.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <ChartCard title="Cases by Urgency" titleHi="प्राथमिकता के अनुसार">
            {Object.entries(urgency).map(([k, v]) => (
              <BarRow key={k} label={k} value={v} total={total} color={URGENCY[k]?.dot || "#64748b"} bg={URGENCY[k]?.bg || "#f1f5f9"} />
            ))}
          </ChartCard>
          <ChartCard title="Cases by Status" titleHi="स्थिति के अनुसार">
            {Object.entries(status).map(([k, v]) => (
              <BarRow key={k} label={STATUS_META[k]?.label || k} value={v} total={total} color={STATUS_META[k]?.color || C.text3} bg={STATUS_META[k]?.bg || C.bg} />
            ))}
          </ChartCard>
        </div>
      )}
    </div>
  );
}

function ChartCard({ title, titleHi, children }) {
  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 24, boxShadow: "0 1px 4px rgba(13,36,97,0.05)" }}>
      <div style={{ marginBottom: 22 }}>
        <h3 style={{ fontSize: 15, color: C.navy, fontWeight: 700 }}>{title}</h3>
        <div style={{ fontSize: 11, color: C.saffron, marginTop: 2 }}>{titleHi}</div>
      </div>
      {children}
    </div>
  );
}

function BarRow({ label, value, total, color, bg }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: C.text1, textTransform: "capitalize", fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 13, color: C.text3, fontWeight: 600 }}>{value}</span>
      </div>
      <div style={{ height: 6, background: C.bg, borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 3, background: color, width: `${pct}%`, transition: "width 1s ease" }} />
      </div>
    </div>
  );
}

/* ── Settings ── */

function SettingsPanel({ user }) {
  return (
    <div style={{ maxWidth: 580, animation: "fadeIn 0.4s ease" }}>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 28, marginBottom: 16, boxShadow: "0 1px 4px rgba(13,36,97,0.05)" }}>
        <h3 style={{ fontSize: 14, color: C.navy, marginBottom: 22, fontWeight: 700, borderBottom: `1px solid ${C.border}`, paddingBottom: 14 }}>Officer Account Details</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24, paddingBottom: 22, borderBottom: `1px solid ${C.borderLt}` }}>
          <Avatar name={user?.name} size={52} />
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: C.navy }}>{user?.name || "—"}</div>
            <div style={{ fontSize: 13, color: C.text3, marginTop: 2 }}>{user?.role} · Badge: {user?.badge}</div>
          </div>
        </div>
        {[["Email", user?.email], ["Role / Designation", user?.role], ["Badge / Employee ID", user?.badge]].map(([lbl, val]) => (
          <div key={lbl} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${C.borderLt}` }}>
            <span style={{ fontSize: 13, color: C.text3 }}>{lbl}</span>
            <span style={{ fontSize: 13, color: C.text1, fontWeight: 600 }}>{val || "—"}</span>
          </div>
        ))}
      </div>
      <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10, padding: 20 }}>
        <p style={{ fontSize: 11, color: C.saffron, letterSpacing: 1, marginBottom: 8, fontWeight: 800 }}>⚠️ DEMO MODE</p>
        <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.75 }}>
          This is a demonstration account. In production, officer accounts are managed by the Station House Officer with full authentication and audit logs.
        </p>
      </div>
    </div>
  );
}

/* ── Atoms ── */

function SideNavItem({ item, active, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 11,
        padding: "10px 12px", borderRadius: 7, border: "none", cursor: "pointer",
        fontFamily: "inherit", fontSize: 13, marginBottom: 3, textAlign: "left",
        background: active ? "rgba(255,255,255,0.14)" : hov ? "rgba(255,255,255,0.07)" : "transparent",
        color: active ? "#fff" : hov ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.5)",
        transition: "all 0.2s", fontWeight: active ? 700 : 400,
        borderLeft: active ? "3px solid #ff8c42" : "3px solid transparent",
      }}>
      <span style={{ fontSize: 15 }}>{item.icon}</span>
      <span style={{ flex: 1 }}>{item.label}</span>
      {item.count !== null && (
        <span style={{ background: active ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)", color: active ? "#fff" : "rgba(255,255,255,0.5)", fontSize: 10, padding: "2px 8px", borderRadius: 8, fontWeight: 700 }}>
          {item.count}
        </span>
      )}
    </button>
  );
}

function FilterPill({ label, active, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: "7px 13px", borderRadius: 6,
        border: `1.5px solid ${active ? C.navy : C.border}`,
        fontSize: 12, cursor: "pointer", fontFamily: "inherit",
        background: active ? C.navy : hov ? C.bg : C.white,
        color: active ? "#fff" : hov ? C.text1 : C.text2,
        fontWeight: active ? 700 : 400, transition: "all 0.2s",
      }}>
      {label}
    </button>
  );
}

function Avatar({ name, size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: "linear-gradient(135deg, #ff8c42, #c94b00)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.4, fontWeight: 800, color: "#fff",
    }}>
      {(name || "O").charAt(0)}
    </div>
  );
}

function ExpandLabel({ children }) {
  return <span style={{ fontSize: 10, letterSpacing: 1.5, color: C.text3, textTransform: "uppercase", fontWeight: 700 }}>{children}</span>;
}
