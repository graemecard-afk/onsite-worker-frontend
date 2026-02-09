import { useEffect, useState } from "react";
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import gdcLogo from './assets/NOW GDC Primary Logo_Colour.jpg';
import LoginPage from './pages/LoginPage.jsx';
import SelectSitePage from './pages/SelectSitePage.jsx';
import ArrivePage from './pages/ArrivePage.jsx';
import OnShiftPage from "./pages/OnShiftPages";



function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);
  const [shiftStartTime, setShiftStartTime] = useState("");
  const [shiftEndTime, setShiftEndTime] = useState("");
const [currentView, setCurrentView] = useState("login");
  const [hydrated, setHydrated] = useState(false);


    useEffect(() => {
    try {
      const raw = localStorage.getItem("onsiteWorkerSession");
      if (raw) {
        const s = JSON.parse(raw);

        if (s?.loggedIn) setLoggedIn(true);
        if (s?.selectedSite) setSelectedSite(s.selectedSite);
        if (typeof s?.shiftStartTime === "string") setShiftStartTime(s.shiftStartTime);
        if (typeof s?.currentView === "string") setCurrentView(s.currentView);
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
        selectedSite,
        shiftStartTime,
        currentView,
      };
      localStorage.setItem("onsiteWorkerSession", JSON.stringify(session));
    } catch {
      // ignore storage errors
    }
  }, [loggedIn, selectedSite, shiftStartTime, currentView]);


  const sites = [
  { id: 'waiapu', name: 'Waiapu Landfill Site' },
  { id: 'paokahu', name: 'Paokahu Landfill Site' },
  
];



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
    onLogin={() => {
      setLoggedIn(true);
      setSelectedSite(null);
    }}
  />
): selectedSite ? (
  currentView === "onShift" ? (
    <OnShiftPage
  siteName={selectedSite?.name}
  shiftStartTimeText={shiftStartTime}
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
      onArrive={() => {
        const now = new Date();

        const formatted = now.toLocaleString("en-NZ", {
          timeZone: "Pacific/Auckland",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });

        setShiftStartTime(formatted);
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
