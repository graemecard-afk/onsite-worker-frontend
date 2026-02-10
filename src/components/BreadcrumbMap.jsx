import React from "react";
import { MapContainer, TileLayer, Polyline, Marker, useMap} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function FitBounds({ points }) {
  const map = useMap();

  React.useEffect(() => {
    if (!map || !Array.isArray(points) || points.length === 0) return;

    const latLngs = points.map(p => [p.lat, p.lng]);

    try {
      map.fitBounds(latLngs, {
        padding: [20, 20],
        maxZoom: 18,
      });
    } catch (e) {
      // ignore bad bounds
    }
  }, [map, points]);

  return null;
}

export default function BreadcrumbMap({ breadcrumbs = [] }) {
  if (!Array.isArray(breadcrumbs) || breadcrumbs.length === 0) {
    return (
      <div
        style={{
          height: 360,
          width: "100%",
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid #ddd",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          opacity: 0.7,
        }}
      >
        No GPS points yet
      </div>
    );
  }

  const intervalMs = 5 * 60 * 1000;

// Keep at most one point every 5 minutes (based on p.at), but always keep the last point
const filtered = [];
let lastKeptAtMs = null;

for (const p of breadcrumbs) {
  const t = new Date(p.at).getTime();
  if (Number.isNaN(t)) continue;

  if (lastKeptAtMs === null || (t - lastKeptAtMs) >= intervalMs) {
    filtered.push(p);
    lastKeptAtMs = t;
  }
}

// Always include the very last breadcrumb (if it isn't already)
const lastRaw = breadcrumbs[breadcrumbs.length - 1];
if (lastRaw) {
  const alreadyLast =
    filtered.length > 0 &&
    filtered[filtered.length - 1].at === lastRaw.at;

  if (!alreadyLast) filtered.push(lastRaw);
}

const positions = filtered.map(p => [p.lat, p.lng]);
const last = positions[positions.length - 1];


  return (
    <div style={{ height: 360, width: "100%", borderRadius: 12, overflow: "hidden" }}>
      <MapContainer
        center={last}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <FitBounds points={positions} />
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Polyline positions={positions} />

        <Marker position={last} />
      </MapContainer>
    </div>
  );
}
