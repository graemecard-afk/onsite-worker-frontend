import React from "react";
import { MapContainer, TileLayer, Polyline, Marker } from "react-leaflet";
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

  const positions = breadcrumbs.map(p => [p.lat, p.lng]);
  const last = positions[positions.length - 1];

  return (
    <div style={{ height: 360, width: "100%", borderRadius: 12, overflow: "hidden" }}>
      <MapContainer
        center={last}
        zoom={16}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
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
