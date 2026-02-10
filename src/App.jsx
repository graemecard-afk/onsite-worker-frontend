import { useEffect, useState } from "react";
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import gdcLogo from './assets/NOW GDC Primary Logo_Colour.jpg';
import LoginPage from './pages/LoginPage.jsx';
import SelectSitePage from './pages/SelectSitePage.jsx';
import ArrivePage from './pages/ArrivePage.jsx';
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


    useEffect(() => {
    try {
      const raw = localStorage.getItem("onsiteWorkerSession");
      if (raw) {
        const s = JSON.parse(raw);

        if (s?.loggedIn) setLoggedIn(true);
        if (s?.selectedSite) setSelectedSite(s.selectedSite);
        if (typeof s?.shiftStartTime === "string") setShiftStartTime(s.shiftStartTime);
        if (typeof s?.currentView === "string") setCurrentView(s.currentView);
        if (s?.activeTask) setActiveTask(s.activeTask);
if (Array.isArray(s?.completedTasks)) setCompletedTasks(s.completedTasks);
if (Array.isArray(s?.breadcrumbs)) setBreadcrumbs(s.breadcrumbs);
if (typeof s?.gpsStatus === "string") setGpsStatus(s.gpsStatus);
if (typeof s?.userEmail === "string") setUserEmail(s.userEmail);

      }
    } catch {
      // ignore bad storage
    } finally {
      setHydrated(true);
    }
  }, []);


  useEffect(() => {
    if (!hydrated) return;
    try {
      const session = {
  loggedIn,
  userEmail,
  selectedSite,
  shiftStartTime,
  currentView,

  // task state (frontend only for now)
  activeTask,
  completedTasks,
  // gps breadcrumbs (mock)
  breadcrumbs,
  shiftId,
  gpsStatus,
};

      localStorage.setItem("onsiteWorkerSession", JSON.stringify(session));
    } catch {
      // ignore storage errors
    }
  }, [loggedIn, userEmail, selectedSite, shiftStartTime, currentView, activeTask, completedTasks, breadcrumbs, shiftId, gpsStatus]);

// --- REAL GPS breadcrumbs while on shift ---
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
        } catch (e) {
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
}, [currentView]);

  const sites = [
  { id: 'waiapu', name: 'Waiapu Landfill Site' },
  { id: 'paokahu', name: 'Paokahu Landfill Site' },
  
];


if (currentView === "supervisor" && !isAdmin) {
  setCurrentView("onShift");
  return null;
}

  return (
    <>
    <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
  <img
    src={gdcLogo}
    alt="GDC Logo"
    style={{ maxWidth: '280px', height: 'auto' }}
  />
</header>
{!hydrated ? (
  <div style={{ textAlign: "center", padding: 24 }}>
    Loading...
  </div>
) : !loggedIn ? (
<LoginPage
  onLogin={(email) => {
    setUserEmail(email);
    setLoggedIn(true);
    setSelectedSite(null);
  }}
/>

): selectedSite ? (
  currentView === "supervisor" ? (
    <SupervisorDashboardPage
      selectedSite={selectedSite}
      breadcrumbs={breadcrumbs}
      onBack={() => setCurrentView("onShift")}
      onLogout={() => {
  setLoggedIn(false);
  setUserEmail("");
  setSelectedSite(null);
  setCurrentView("login");
  localStorage.removeItem("onsiteWorkerSession");
}}
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
     onSignOut={() => {
        const now = new Date();

        const formatted = now.toLocaleString("en-NZ", {
          timeZone: "Pacific/Auckland",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });


    setShiftEndTime(formatted);
    setShiftStartTime("");
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
      onArrive={async() => {
        const now = new Date();

        const formatted = now.toLocaleString("en-NZ", {
          timeZone: "Pacific/Auckland",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });

        setShiftStartTime(formatted);
                // Start shift in backend and store shiftId for supervisor fetch
        try {
          const base = import.meta.env.VITE_API_BASE_URL || "";
          if (!base) throw new Error("Missing VITE_API_BASE_URL");

          const resp = await fetch(`${base.replace(/\/$/, "")}/shifts/start`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              siteId: selectedSite?.id || "",
              workerEmail: userEmail || "",
            }),
          });

          const data = await resp.json().catch(() => ({}));

          if (!resp.ok) {
            throw new Error(data?.error || `Start shift failed (${resp.status})`);
          }

          const newShiftId = data?.shift?.id || "";
          setShiftId(newShiftId);
          if (newShiftId) {
            // Update persisted session immediately
            const raw = localStorage.getItem("onsiteWorkerSession");
            const session = raw ? JSON.parse(raw) : {};
            session.shiftId = newShiftId;
            localStorage.setItem("onsiteWorkerSession", JSON.stringify(session));
          }
        } catch (e) {
          console.error("Backend /shifts/start failed:", e);
        }

        setCurrentView("onShift");
      }}
    />
  )
) : (
  <SelectSitePage

    sites={sites}
    onSelectSite={(site) => setSelectedSite(site)}
    onLogout={() => {
      setLoggedIn(false);
      setSelectedSite(null);
      localStorage.removeItem("onsiteWorkerSession");
    }}
  />
)}


   </>
     
  )
}

export default App
