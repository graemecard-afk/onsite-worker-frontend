import { useEffect, useState } from "react";
import "./App.css";
import gdcLogo from "./assets/NOW GDC Primary Logo_Colour.jpg";

import LoginPage from "./pages/LoginPage.jsx";
import SelectSitePage from "./pages/SelectSitePage.jsx";
import ArrivePage from "./pages/ArrivePage.jsx";
import OnShiftPage from "./pages/OnShiftPages";
import SupervisorDashboardPage from "./pages/SupervisorDashboardPage.jsx";

const ADMIN_EMAILS = ["admin@example.com"].map(e => e.toLowerCase());

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);
  const [shiftStartTime, setShiftStartTime] = useState("");
  const [shiftEndTime, setShiftEndTime] = useState("");
  const [currentView, setCurrentView] = useState("login");
  const [hydrated, setHydrated] = useState(false);

  const [activeTask, setActiveTask] = useState(null);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  const [shiftId, setShiftId] = useState("");
  const [gpsStatus, setGpsStatus] = useState("idle"); // idle | requesting | ok | denied | error
  const [userEmail, setUserEmail] = useState("");

  const isAdmin = ADMIN_EMAILS.includes((userEmail || "").toLowerCase());

  // ---- hydrate from localStorage once ----
  useEffect(() => {
    try {
      const raw = localStorage.getItem("onsiteWorkerSession");
      if (raw) {
        const s = JSON.parse(raw);

        const storedEmail = typeof s?.userEmail === "string" ? s.userEmail : "";
const storedLoggedIn = !!s?.loggedIn;

if (storedLoggedIn && !String(storedEmail).trim()) {
  // Corrupt/partial session: logged in but no email — reset to login
  localStorage.removeItem("onsiteWorkerSession");
  setLoggedIn(false);
  setUserEmail("");
  setSelectedSite(null);
  setShiftStartTime("");
  setShiftEndTime("");
  setCurrentView("login");
  setActiveTask(null);
  setCompletedTasks([]);
  setBreadcrumbs([]);
  setShiftId("");
  setGpsStatus("idle");
} else {
  if (storedLoggedIn) setLoggedIn(true);
  if (typeof s?.userEmail === "string") setUserEmail(s.userEmail);
}

        if (s?.selectedSite) setSelectedSite(s.selectedSite);
        if (typeof s?.shiftStartTime === "string") setShiftStartTime(s.shiftStartTime);
        if (typeof s?.currentView === "string") setCurrentView(s.currentView);
        if (s?.activeTask) setActiveTask(s.activeTask);
        if (Array.isArray(s?.completedTasks)) setCompletedTasks(s.completedTasks);
        if (Array.isArray(s?.breadcrumbs)) setBreadcrumbs(s.breadcrumbs);
        if (typeof s?.shiftId === "string") setShiftId(s.shiftId);
        if (typeof s?.gpsStatus === "string") setGpsStatus(s.gpsStatus);
      }
    } catch {
      // ignore bad storage
    } finally {
      setHydrated(true);
    }
  }, []);

  // ---- persist session any time state changes (after hydrate) ----
  useEffect(() => {
    if (!hydrated) return;
    try {
      const session = {
        loggedIn,
        userEmail,
        selectedSite,
        shiftStartTime,
        currentView,
        activeTask,
        completedTasks,
        breadcrumbs,
        shiftId,
        gpsStatus,
      };
      localStorage.setItem("onsiteWorkerSession", JSON.stringify(session));
    } catch {
      // ignore storage errors
    }
  }, [
    hydrated,
    loggedIn,
    userEmail,
    selectedSite,
    shiftStartTime,
    currentView,
    activeTask,
    completedTasks,
    breadcrumbs,
    shiftId,
    gpsStatus,
  ]);

  // ---- prevent non-admins entering supervisor view (without setting state during render) ----
  useEffect(() => {
    if (!hydrated) return;
    if (currentView === "supervisor" && !isAdmin) {
      setCurrentView("onShift");
    }
  }, [hydrated, currentView, isAdmin]);

  const sites = [
    { id: "waiapu", name: "Waiapu Landfill Site" },
    { id: "paokahu", name: "Paokahu Landfill Site" },
  ];

  // ---- REAL GPS breadcrumbs while on shift ----
  useEffect(() => {
    if (currentView !== "onShift") return;

    if (!navigator.geolocation) {
      setGpsStatus("error");
      return;
    }

    setGpsStatus("requesting");

    const watchId = navigator.geolocation.watchPosition(
      pos => {
        setGpsStatus("ok");

        const { latitude, longitude, accuracy } = pos.coords;
        const point = {
          lat: latitude,
          lng: longitude,
          at: new Date().toISOString(),
        };

        // Update UI immediately (offline-friendly)
        setBreadcrumbs(prev => [...prev, point]);

        // Also post to backend if we have a shiftId
        if (shiftId) {
          try {
            const base = import.meta.env.VITE_API_BASE_URL || "";
            if (!base) throw new Error("Missing VITE_API_BASE_URL");

            fetch(`${base.replace(/\/$/, "")}/breadcrumbs`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                shiftId,
                at: point.at,
                lat: point.lat,
                lng: point.lng,
                accuracyM: typeof accuracy === "number" ? Math.round(accuracy) : null,
              }),
            }).catch(() => {
              // ignore network errors (we keep UI working regardless)
            });
          } catch {
            // ignore
          }
        }
      },
      err => {
        if (err.code === 1) setGpsStatus("denied");
        else setGpsStatus("error");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 20000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [currentView, shiftId]);

  // ---- logout helper ----
  const doLogout = () => {
    setLoggedIn(false);
    setUserEmail("");
    setSelectedSite(null);
    setShiftStartTime("");
    setShiftEndTime("");
    setCurrentView("login");
    setActiveTask(null);
    setCompletedTasks([]);
    setBreadcrumbs([]);
    setShiftId("");
    setGpsStatus("idle");
    localStorage.removeItem("onsiteWorkerSession");
  };

  return (
    <>
      <header style={{ textAlign: "center", marginBottom: "2rem" }}>
        <img src={gdcLogo} alt="GDC Logo" style={{ maxWidth: "280px", height: "auto" }} />
      </header>

      {!hydrated ? (
        <div style={{ textAlign: "center", padding: 24 }}>Loading...</div>
      ) : !loggedIn ? (
        <LoginPage
          onLogin={(email) => {
 

  const clean = String(email || "").trim().toLowerCase();
  

  if (!clean) {
    alert("Please enter an email address.");
    return;
  }

  setUserEmail(clean);
  setLoggedIn(true);

  // fresh start for new login
  setSelectedSite(null);
  setShiftStartTime("");
  setShiftEndTime("");
  setActiveTask(null);
  setCompletedTasks([]);
  setBreadcrumbs([]);
  setShiftId("");
  setGpsStatus("idle");
  setCurrentView("selectSite");
}}
/>
      ) : selectedSite ? (
        currentView === "supervisor" ? (
          <SupervisorDashboardPage
            selectedSite={selectedSite}
            breadcrumbs={breadcrumbs}
            onBack={() => setCurrentView("onShift")}
            onLogout={doLogout}
          />
        ) : currentView === "onShift" ? (
          <OnShiftPage
            siteName={selectedSite?.name}
            shiftStartTimeText={shiftStartTime}
            activeTask={activeTask}
            setActiveTask={setActiveTask}
            completedTasks={completedTasks}
            setCompletedTasks={setCompletedTasks}
            breadcrumbs={breadcrumbs}
            onSupervisor={isAdmin ? () => setCurrentView("supervisor") : undefined}
            onSignOut={async() => {
                            try {
                const base = import.meta.env.VITE_API_BASE_URL || "";
                if (base && shiftId) {
                  await fetch(`${base.replace(/\/$/, "")}/shifts/end`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ shiftId }),
                  });
                }
              } catch (e) {
                console.error("Backend /shifts/end failed:", e);
              }

              const now = new Date();
              const formatted = now.toLocaleString("en-NZ", {
                timeZone: "Pacific/Auckland",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              });

              setShiftEndTime(formatted);

              // front-end "sign out" ends session state
              setShiftStartTime("");
              setShiftId("");
              setCurrentView("selectSite");
              setSelectedSite(null);

              localStorage.removeItem("onsiteWorkerSession");
            }}
          />
        ) : (
          <ArrivePage
            site={selectedSite}
            onBack={() => {
              setSelectedSite(null);
              setCurrentView("selectSite");
            }}
            onArrive={async () => {
              const now = new Date();
              const formatted = now.toLocaleString("en-NZ", {
                timeZone: "Pacific/Auckland",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              });

              setShiftStartTime(formatted);

              try {
                const base = import.meta.env.VITE_API_BASE_URL || "";
                if (!base) throw new Error("Missing VITE_API_BASE_URL");

                const cleanEmail = String(userEmail || "").trim().toLowerCase();
                const siteId = selectedSite?.id || "";

                if (!siteId || !cleanEmail) {
                  throw new Error(`Missing siteId or workerEmail (siteId="${siteId}", email="${cleanEmail}")`);
                }

                const resp = await fetch(`${base.replace(/\/$/, "")}/shifts/start`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    siteId,
                    workerEmail: cleanEmail,
                  }),
                });

                const data = await resp.json().catch(() => ({}));
                if (!resp.ok) {
                  throw new Error(data?.error || `Start shift failed (${resp.status})`);
                }

                const newShiftId = data?.shift?.id || "";
                setShiftId(newShiftId);
              } catch (e) {
                console.error("Backend /shifts/start failed:", e);
                // keep user on Arrive page if shift start fails
                return;
              }

              setCurrentView("onShift");
            }}
          />
        )
      ) : (
        <SelectSitePage
          sites={sites}
          onSelectSite={site => {
            setSelectedSite(site);
            setCurrentView("arrive");
          }}
          onLogout={doLogout}
        />
      )}
    </>
  );
}

export default App;
