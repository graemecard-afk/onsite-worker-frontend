import React from "react";

export default function ShiftEndedPage({ info, onBackToSites }) {
  const site = info?.siteName || "Unknown site";
  const startedAt = info?.startedAt || "—";
  const endedAt = info?.endedAt || "—";

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ maxWidth: 520, width: "100%", padding: 20, borderRadius: 14, border: "1px solid rgba(0,0,0,0.15)" }}>
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>Shift ended</div>
        <div style={{ marginBottom: 12, padding: 10, borderRadius: 10, background: "rgba(255, 193, 7, 0.18)" }}>
          Shift ended by supervisor.
        </div>

        <div style={{ fontSize: 14, lineHeight: 1.5 }}>
          <div><strong>Site:</strong> {site}</div>
          <div><strong>Started:</strong> {startedAt}</div>
          <div><strong>Ended:</strong> {endedAt}</div>
        </div>

        <button
          onClick={onBackToSites}
          style={{ marginTop: 16, width: "100%", padding: 12, borderRadius: 12, border: "none", fontWeight: 700, cursor: "pointer" }}
        >
          Back to site selection
        </button>
      </div>
    </div>
  );
}
