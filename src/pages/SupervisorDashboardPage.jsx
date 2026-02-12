import React, { useEffect, useMemo, useState } from "react";
import BreadcrumbMap from "../components/BreadcrumbMap.jsx";

export default function SupervisorDashboardPage({
  selectedSite,
  breadcrumbs = [],
  onBack,
  onLogout,
}) {
  const [apiBreadcrumbs, setApiBreadcrumbs] = useState([]);
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeShifts, setActiveShifts] = useState([]);
const [selectedShiftId, setSelectedShiftId] = useState("");


  // Read session once per render (small + safe)
  const session = useMemo(() => {
    try {
      const raw = localStorage.getItem("onsiteWorkerSession");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }, []);

  const workerEmail = (session?.userEmail || "").trim();
  const shiftId = (selectedShiftId || session?.shiftId || "").trim();


  // Decide what to display:
  // 1) If parent passed breadcrumbs prop, use it.
  // 2) Else if we fetched from API, use that.
  // 3) Else fallback to persisted session breadcrumbs.
  let breadcrumbsList = breadcrumbs;

  if (!Array.isArray(breadcrumbsList) || breadcrumbsList.length === 0) {
    if (Array.isArray(apiBreadcrumbs) && apiBreadcrumbs.length > 0) {
      breadcrumbsList = apiBreadcrumbs;
    } else if (Array.isArray(session?.breadcrumbs)) {
      breadcrumbsList = session.breadcrumbs;
    } else {
      breadcrumbsList = [];
    }
  }

  const rawCount = Array.isArray(breadcrumbsList) ? breadcrumbsList.length : 0;
  const lastBreadcrumbTs = rawCount > 0 ? breadcrumbsList[rawCount - 1]?.at : null;
  const displayedCount = rawCount; // display-throttling happens in BreadcrumbMap
async function fetchActiveShifts(siteId) {
  const base = import.meta.env.VITE_API_BASE_URL || "";
  const token = import.meta.env.VITE_SUPERVISOR_TOKEN || "";

  if (!base) throw new Error("Missing VITE_API_BASE_URL");
  if (!token) throw new Error("Missing VITE_SUPERVISOR_TOKEN");

  const url = `${base.replace(/\/$/, "")}/shifts/active?siteId=${encodeURIComponent(
    siteId
  )}`;

  const resp = await fetch(url, {
    headers: {
      "x-api-token": token,
    },
  });

  const data = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    throw new Error(data?.error || `Request failed (${resp.status})`);
  }

  return Array.isArray(data?.shifts) ? data.shifts : [];
}

  async function fetchBreadcrumbsOnce(currentShiftId) {
    const base = import.meta.env.VITE_API_BASE_URL || "";
    const token = import.meta.env.VITE_SUPERVISOR_TOKEN || "";

    if (!base) {
      throw new Error("Missing VITE_API_BASE_URL");
    }
    if (!token) {
      throw new Error("Missing VITE_SUPERVISOR_TOKEN");
    }

    const url = `${base.replace(/\/$/, "")}/breadcrumbs?shiftId=${encodeURIComponent(
      currentShiftId
    )}`;

    const resp = await fetch(url, {
      method: "GET",
      headers: {
        "x-api-token": token,
      },
    });

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      const msg = data?.error || `Request failed (${resp.status})`;
      throw new Error(msg);
    }

    return Array.isArray(data?.breadcrumbs) ? data.breadcrumbs : [];
  }
  useEffect(() => {
  const siteId = selectedSite?.id;
  if (!siteId) return;

  let cancelled = false;

  async function run() {
    try {
      const shifts = await fetchActiveShifts(siteId);
      if (cancelled) return;

            // Keep only the most recent active shift per worker_email
      const latestPerWorker = Object.values(
        shifts.reduce((acc, s) => {
          if (!acc[s.worker_email]) {
            acc[s.worker_email] = s;
          }
          return acc;
        }, {})
      );

      setActiveShifts(latestPerWorker);


      // If nothing selected yet, auto-pick the newest active shift
      if (!selectedShiftId && shifts.length > 0) {
        setSelectedShiftId(shifts[0].id);
      }
    } catch (e) {
      // Non-fatal: we can still show local breadcrumbs
      console.error("Fetch active shifts failed:", e);
    }
  }

  run();

  return () => {
    cancelled = true;
  };
}, [selectedSite?.id, selectedShiftId]);


  useEffect(() => {
    // Only fetch if we have a real shiftId in session
    if (!shiftId) return;

    let cancelled = false;
    let intervalId = null;

    async function run() {
      setIsLoading(true);
      setApiError("");
      try {
        const rows = await fetchBreadcrumbsOnce(shiftId);
        if (!cancelled) setApiBreadcrumbs(rows);
      } catch (e) {
        if (!cancelled) setApiError(String(e?.message || e));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    run();

    // Poll every 10s for supervisor view
    intervalId = window.setInterval(run, 10000);

    return () => {
      cancelled = true;
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [shiftId]);

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Supervisor Dashboard</h2>

      {workerEmail ? (
        <div
          style={{
            fontSize: 14,
            opacity: 0.8,
            marginTop: 4,
            marginBottom: 8,
          }}
        >
          Worker: <strong>{workerEmail}</strong>
        </div>
      ) : null}
<div style={{ padding: 8, marginBottom: 8, border: "2px solid red" }}>
  DEBUG: SUPERVISOR DROPDOWN BLOCK RENDERING
</div>
<div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>
  DEBUG siteId: {selectedSite?.id || "—"}
</div>


      <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 10 }}>
  <div style={{ marginBottom: 6 }}>
    <strong>Active shift:</strong>
  </div>

  {activeShifts.length > 0 ? (
    <select
      value={selectedShiftId || ""}
      onChange={e => setSelectedShiftId(e.target.value)}
      style={{
        padding: "6px 8px",
        borderRadius: 8,
        border: "1px solid #ccc",
        background: "white",
        minWidth: 280,
      }}
    >
      <option value="" disabled>
        Select a shift…
      </option>
      {activeShifts.map(s => (
        <option key={s.id} value={s.id}>
          {s.worker_email} — {new Date(s.started_at).toLocaleString()}
        </option>
      ))}
    </select>
  ) : (
    <div style={{ fontSize: 12, opacity: 0.7 }}>
      No active shifts found for this site.
    </div>
  )}

  <div style={{ fontSize: 11, opacity: 0.6, marginTop: 6 }}>
    Shift ID: {shiftId || "—"}
  </div>
</div>


      <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 4 }}>
        Breadcrumbs: <strong>{rawCount}</strong> raw /{" "}
        <strong>{displayedCount}</strong> displayed
      </div>

      {lastBreadcrumbTs ? (
        <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 8 }}>
          Last update: {new Date(lastBreadcrumbTs).toLocaleString()}
        </div>
      ) : null}

      {isLoading ? (
        <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
          Loading from backend…
        </div>
      ) : null}

      {apiError ? (
        <div style={{ fontSize: 12, color: "crimson", marginBottom: 8 }}>
          Backend fetch error: {apiError}
        </div>
      ) : null}

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
          onClick={() => {
            if (!window.confirm("Clear breadcrumbs for this session?")) return;
            try {
              const raw = localStorage.getItem("onsiteWorkerSession");
              const s = raw ? JSON.parse(raw) : {};
              s.breadcrumbs = [];
              localStorage.setItem("onsiteWorkerSession", JSON.stringify(s));
            } catch (e) {
              // ignore
            }
            window.location.reload();
          }}
        >
          Clear breadcrumbs
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
          <strong>Breadcrumb points:</strong> {rawCount}
        </div>
      </div>

      <BreadcrumbMap breadcrumbs={breadcrumbsList} />
    </div>
  );
}
