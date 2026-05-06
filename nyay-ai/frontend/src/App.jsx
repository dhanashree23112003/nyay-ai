import { useState, useEffect } from "react";
import Landing from "./components/Landing";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Intake from "./components/Intake";
import Draft from "./components/Draft";

export default function App() {
  const [view, setView] = useState("landing");
  const [user, setUser] = useState(null);
  const [draftState, setDraftState] = useState(null);
  const [continueCase, setContinueCase] = useState(null); // case data to resume

  useEffect(() => {
    const stored = localStorage.getItem("nyay_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
        setView("dashboard");
      } catch {
        localStorage.removeItem("nyay_user");
      }
    }
  }, []);

  const login = (userData) => {
    localStorage.setItem("nyay_user", JSON.stringify(userData));
    setUser(userData);
    setView("dashboard");
  };

  const logout = () => {
    localStorage.removeItem("nyay_user");
    setUser(null);
    setView("landing");
  };

  return (
    <>
      {view === "landing" && (
        <Landing onLogin={() => setView("login")} onGetStarted={() => setView("login")} />
      )}
      {view === "login" && (
        <Login onLogin={login} onBack={() => setView("landing")} />
      )}
      {view === "dashboard" && (
        <Dashboard
          user={user}
          onLogout={logout}
          onNewIntake={() => { setContinueCase(null); setDraftState(null); setView("intake"); }}
          onContinueCase={(c) => { setContinueCase(c); setDraftState(null); setView("intake"); }}
        />
      )}
      {view === "intake" && (
        <Intake
          user={user}
          initialCase={continueCase}
          onDashboard={() => { setContinueCase(null); setView("dashboard"); }}
          onDraft={(state) => { setDraftState(state); setView("draft"); }}
        />
      )}
      {view === "draft" && (
        <Draft
          state={draftState}
          onDashboard={() => setView("dashboard")}
          onNewCase={() => { setDraftState(null); setView("intake"); }}
        />
      )}
    </>
  );
}
