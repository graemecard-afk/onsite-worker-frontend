// src/components/GpsBreadcrumbs.jsx
import React from "react";

export default function GpsBreadcrumbs({ boxStyle, breadcrumbs = [] }) {
  const last = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1] : null;

  return (
    <div style={boxStyle}>
      <strong>GPS tracking</strong>

      {last ? (
        <div style={{ marginTop: 6, opacity: 0.85 }}>
          Last point:
          <div>
            Lat: {Number(last.lat).toFixed(5)}, Lng: {Number(last.lng).toFixed(5)}
          </div>
          <div>
            At: {new Date(last.at).toLocaleTimeString()}
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 6, opacity: 0.85 }}>No GPS points yet.</div>
      )}
    </div>
  );
}
