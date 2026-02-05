import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import gdcLogo from './assets/NOW GDC Primary Logo_Colour.jpg';
import LoginPage from './pages/LoginPage.jsx';



function App() {
  const [loggedIn, setLoggedIn] = useState(false);


  return (
    <>
    <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
  <img
    src={gdcLogo}
    alt="GDC Logo"
    style={{ maxWidth: '280px', height: 'auto' }}
  />
</header>
{!loggedIn ? <LoginPage onLogin={() => setLoggedIn(true)} /> : <div style={{ textAlign: 'center' }}>Select Site (next step)</div>}

   </>
     
  )
}

export default App
