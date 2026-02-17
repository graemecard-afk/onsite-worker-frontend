import React, { useState } from "react";


export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  return (
    <main style={{ maxWidth: '360px', margin: '0 auto' }}>
      <h2>Contractor Login</h2>

      <form
        onSubmit={async (e) => {
  e.preventDefault();

  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !password) return;

  try {
    const base = import.meta.env.VITE_API_BASE_URL || "";
    if (!base) throw new Error("Missing VITE_API_BASE_URL");

    const resp = await fetch(`${base.replace(/\/$/, "")}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: cleanEmail,
        password,
      }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      alert(data?.error || "Login failed");
      return;
    }

    onLogin?.(data.token, data.user);
  } catch (err) {
    console.error("Login failed:", err);
    alert("Login failed");
  }
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
  value={password}
  onChange={(e) => setPassword(e.target.value)}
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
        <div style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
  <p style={{ margin: "0 0 0.5rem 0" }}>
    <strong>Forgot your password?</strong>
  </p>
  <p style={{ margin: "0 0 0.5rem 0" }}>
    Please contact the system administrator to reset your password.
  </p>
  <p style={{ margin: 0 }}>
    📧{" "}
    <a href="mailto:graeme.card@gdc.govt.nz?subject=Onsite%20Worker%20Password%20Reset">
      graeme.card@gdc.govt.nz
    </a>
    <br />
    📞 Contact your supervisor directly if urgent.
  </p>
</div>
      </form>
    </main>
  );
}
