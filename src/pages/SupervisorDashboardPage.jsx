import React from "react";
import BreadcrumbMap from "../components/BreadcrumbMap.jsx";


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

      <BreadcrumbMap breadcrumbs={breadcrumbs} />

      </div>
    </div>
  );
}
