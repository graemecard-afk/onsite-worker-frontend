import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import gdcLogo from './assets/NOW GDC Primary Logo_Colour.jpg';
import LoginPage from './pages/LoginPage.jsx';
import SelectSitePage from './pages/SelectSitePage.jsx';



function App() {
  const [loggedIn, setLoggedIn] = useState(false);
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
{!loggedIn
  ? <LoginPage onLogin={() => setLoggedIn(true)} />
  : <SelectSitePage
      sites={sites}
      onSelectSite={(site) => alert(`Selected: ${site.name}`)}
      onLogout={() => setLoggedIn(false)}
    />
}

   </>
     
  )
}

export default App
