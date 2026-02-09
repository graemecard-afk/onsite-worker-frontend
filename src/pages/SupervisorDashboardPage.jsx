import React from "react";
import BreadcrumbMap from "../components/BreadcrumbMap.jsx";


export default function SupervisorDashboardPage({ selectedSite, breadcrumbs = [], onBack, onLogout }) {
  const count = Array.isArray(breadcrumbs) ? breadcrumbs.length : 0;

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Supervisor Dashboard</h2>
<div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
  <button
    type="button"
    onClick={() => onBack?.()}
    style={{
      padding: "8px 12px",
      borderRadius: 8,
      border: "1px solid #ccc",
      background: "white",
      cursor: "pointer",
    }}
  >
    ← Back to shift
  </button>

  <button
    type="button"
    onClick={() => onLogout?.()}
    style={{
      padding: "8px 12px",
      borderRadius: 8,
      border: "1px solid #ccc",
      background: "white",
      cursor: "pointer",
    }}
  >
    Log out
  </button>
</div>

      <div style={{ marginBottom: 12 }}>
        <div>
          <strong>Site:</strong> {selectedSite?.name || "—"}
        </div>
        <div>
          <strong>Breadcrumb points:</strong> {count}
        </div>
      </div>

      <BreadcrumbMap breadcrumbs={breadcrumbs} />

      </div>
    
  );
}
