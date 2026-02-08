import { useState } from 'react'
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
const [currentView, setCurrentView] = useState("login");


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
{!loggedIn ? (
  <LoginPage
    onLogin={() => {
      setLoggedIn(true);
      setSelectedSite(null);
    }}
  />
) : selectedSite ? (
  <ArrivePage
    site={selectedSite}
    onBack={() => setSelectedSite(null)}
    onArrive={() => {
  const now = new Date();

  const formatted = now.toLocaleString('en-NZ', {
    timeZone: 'Pacific/Auckland',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  alert(`Arrived at: ${selectedSite.name} at ${formatted}`);
}}

  />
) : (
  <SelectSitePage
    sites={sites}
    onSelectSite={(site) => setSelectedSite(site)}
    onLogout={() => {
      setLoggedIn(false);
      setSelectedSite(null);
    }}
  />
)}


   </>
     
  )
}

export default App
