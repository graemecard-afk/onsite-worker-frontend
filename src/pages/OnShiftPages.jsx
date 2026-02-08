// src/pages/OnShiftPage.jsx
import React, { useEffect, useState } from "react";


export default function OnShiftPage({
  theme,
  siteName,
  shiftStartTimeText,
   onSignOut,
}) {
  const isDark = theme === "dark";
  const [minutesOnSite, setMinutesOnSite] = useState(0);

useEffect(() => {
  const id = setInterval(() => {
    setMinutesOnSite(m => m + 1);
  }, 60000);

  return () => clearInterval(id);
}, []);


  const pageStyle = {
    minHeight: "100vh",
    background: isDark ? "#0b1220" : "#f6f7fb",
    color: isDark ? "#e7eaf0" : "#111827",
    padding: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const cardStyle = {
    width: "100%",
    maxWidth: 520,
    background: isDark ? "rgba(255,255,255,0.06)" : "#ffffff",
    border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 20,
    boxShadow: isDark
      ? "0 10px 30px rgba(0,0,0,0.35)"
      : "0 10px 30px rgba(17,24,39,0.08)",
  };

  const labelStyle = {
    fontSize: 12,
    letterSpacing: 0.3,
    opacity: 0.75,
    marginBottom: 6,
  };

  const bigStyle = {
    fontSize: 22,
    fontWeight: 700,
    lineHeight: 1.2,
    margin: 0,
  };

  const subStyle = {
    marginTop: 10,
    fontSize: 14,
    opacity: 0.85,
  };

  const boxStyle = {
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    border: isDark ? "1px dashed rgba(255,255,255,0.25)" : "1px dashed #cbd5e1",
    background: isDark ? "rgba(255,255,255,0.04)" : "#f8fafc",
    fontSize: 14,
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={labelStyle}>On site</div>
        <p style={bigStyle}>
          {siteName ? siteName : "Unknown site"}
        </p>

                <div style={subStyle}>
          On site since{" "}
          <strong>{shiftStartTimeText ? shiftStartTimeText : "—"}</strong>
          <div style={{ marginTop: 6 }}>
            Minutes on site: <strong>{minutesOnSite}</strong>
          </div>
        </div>

        <div style={boxStyle}>
          <strong>GPS tracking (placeholder)</strong>
          <div style={{ marginTop: 6, opacity: 0.85 }}>
            Breadcrumb capture every 5 minutes will appear here later.
          </div>
        </div>

                <button
          type="button"
          style={{
            marginTop: 20,
            width: "100%",
            padding: "14px 16px",
            borderRadius: 12,
            border: "none",
            background: "#dc2626",
            color: "white",
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
          }}
          onClick={() => {
  onSignOut?.();
}}

        >
          Sign out
        </button>

      </div>
    </div>
  );
}
