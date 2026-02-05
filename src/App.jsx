import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import gdcLogo from './assets/NOW GDC Primary Logo_Colour.jpg';


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
  <img
    src={gdcLogo}
    alt="GDC Logo"
    style={{ maxWidth: '280px', height: 'auto' }}
  />
</header>
<main style={{ maxWidth: '360px', margin: '0 auto' }}>
  <h2>Contractor Login</h2>

  <form>
    <label style={{ display: 'block', marginBottom: '0.5rem' }}>
      Email
      <input
        type="email"
        placeholder="name@example.com"
        style={{ width: '100%', padding: '8px', marginTop: '4px' }}
      />
    </label>

    <label style={{ display: 'block', marginBottom: '1rem' }}>
      Password
      <input
        type="password"
        placeholder="••••••••"
        style={{ width: '100%', padding: '8px', marginTop: '4px' }}
      />
    </label>

    <button
      type="submit"
      style={{
        width: '100%',
        padding: '10px',
        background: '#005bab',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      Log in
    </button>
  </form>
</main>

 </>
     
  )
}

export default App
