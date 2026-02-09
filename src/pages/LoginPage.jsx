import React, { useState } from "react";


export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");

  return (
    <main style={{ maxWidth: '360px', margin: '0 auto' }}>
      <h2>Contractor Login</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onLogin?.(email.trim());
        }}
      >
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
          Email
          <input
            type="email"
            placeholder="name@example.com"
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            value={email}
onChange={(e) => setEmail(e.target.value)}
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
  );
}
