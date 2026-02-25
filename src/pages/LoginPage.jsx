import React, { useState } from "react";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const callAuth = async (path) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) return null;

    const base = import.meta.env.VITE_API_BASE_URL || "";
    if (!base) throw new Error("Missing VITE_API_BASE_URL");

    const resp = await fetch(`${base.replace(/\/$/, "")}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail, password }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      alert(data?.error || "Request failed");
      return null;
    }

    onLogin?.(data.token, data.user);
    return data;
  };

  return (
    <main style={{ maxWidth: "360px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: "1rem", lineHeight: 1.3 }}>
  <div>Takiuru Kaimahi Kirimana</div>
  <div>Contractor Login</div>
</h2>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await callAuth("/auth/login");
          } catch (err) {
            console.error("Login failed:", err);
            alert("Login failed");
          }
        }}
      >
        <label style={{ display: "block", marginBottom: "0.5rem" }}>
          Email
          <input
            type="email"
            placeholder="name@example.com"
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label style={{ display: "block", marginBottom: "1rem" }}>
          Password
          <input
            type="password"
            placeholder="••••••••"
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            background: "#005bab",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          <div>Takiuru</div>
          <div>Log in</div>
        </button>

        <button
          type="button"
          onClick={async () => {
  try {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) return;

    const base = import.meta.env.VITE_API_BASE_URL || "";
    if (!base) throw new Error("Missing VITE_API_BASE_URL");

    // Register (do NOT attempt login from this response)
    const regResp = await fetch(`${base.replace(/\/$/, "")}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail, password }),
    });

    const regData = await regResp.json();

    if (!regResp.ok) {
      alert(regData?.error || "Registration failed");
      return;
    }

    // Now perform proper login to get token + user
    await callAuth("/auth/login");
  } catch (err) {
    console.error("Register failed:", err);
    alert("Register failed");
  }
}}
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "10px",
            background: "white",
            color: "#005bab",
            border: "1px solid #005bab",
            cursor: "pointer",
          }}
        >
<div>Rēhita</div>
 <div>Register</div>
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