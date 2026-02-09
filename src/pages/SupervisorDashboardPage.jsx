import React from "react";

export default function SupervisorDashboardPage({ selectedSite, breadcrumbs = [] }) {
  const count = Array.isArray(breadcrumbs) ? breadcrumbs.length : 0;

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Supervisor Dashboard</h2>

      <div style={{ marginBottom: 12 }}>
        <div>
          <strong>Site:</strong> {selectedSite?.name || "—"}
        </div>
        <div>
          <strong>Breadcrumb points:</strong> {count}
        </div>
      </div>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 12,
          background: "#fafafa",
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Map (placeholder)</div>
        <div style={{ fontSize: 14, opacity: 0.8 }}>
          Next: add a map component and plot the breadcrumb trail.
        </div>
      </div>
    </div>
  );
}
