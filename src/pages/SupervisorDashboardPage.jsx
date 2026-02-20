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
const [siteFilter, setSiteFilter] = useState(""); // "" = All sites (default)
const [ending, setEnding] = useState(false);
const [endMsg, setEndMsg] = useState("");
const SITE_OPTIONS = [
  { id: "", name: "All sites" },
  { id: "waiapu", name: "Waiapu" },
  { id: "paokahu", name: "Paokahu" },
];

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
async function forceEndSelectedShift() {
  const currentShiftId = (shiftId || "").trim();
  const base = import.meta.env.VITE_API_BASE_URL || "";
const token = (session?.authToken || "").trim();

if (!base) {
  setEndMsg("Missing VITE_API_BASE_URL");
  return;
}

if (!token) {
 setEndMsg("Missing auth token (please log in again)");
  return;
}


  if (!currentShiftId) {
    setEndMsg("No shift selected.");
    return;
  }

  const ok = window.confirm(
    `Force end shift?\n\nShift ID: ${currentShiftId}`
  );
  if (!ok) return;

  setEnding(true);
  setEndMsg("");

  try {
   const url = `${base.replace(/\/$/, "")}/shifts/end`;


    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ shiftId: currentShiftId }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg =
        data?.error || data?.message || `HTTP ${res.status}`;
      throw new Error(msg);
    }

    const endedAt = data?.shift?.ended_at || "";
    setEndMsg(
      endedAt ? `Ended at ${endedAt}` : "Shift ended."
    );

  } catch (e) {
    setEndMsg(
      `Force end failed: ${e?.message || String(e)}`
    );
  } finally {
    setEnding(false);
  }
}
async function downloadCsvForSelectedShift() {
  const currentShiftId = (shiftId || "").trim();
  const base = import.meta.env.VITE_API_BASE_URL || "";
  const token = (session?.authToken || "").trim();

  if (!base) {
    setEndMsg("Missing VITE_API_BASE_URL");
    return;
  }
  if (!token) {
    setEndMsg("Missing auth token (please log in again)");
    return;
  }
  if (!currentShiftId) {
    setEndMsg("No shift selected.");
    return;
  }

  const url = `${base.replace(/\/$/, "")}/admin/shifts/report.csv?shiftId=${encodeURIComponent(
    currentShiftId
  )}`;

  // Force a download in-browser with auth header
  try {
    setEndMsg("");
    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(text || `HTTP ${resp.status}`);
    }

    const blob = await resp.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `shift-${currentShiftId}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  } catch (e) {
    setEndMsg(`CSV download failed: ${e?.message || String(e)}`);
  }
}

async function refreshActiveShiftsNow() {
  const siteId = selectedSite?.id;
  if (!siteId) {
    setEndMsg("Select a site first.");
    return;
  }

  try {
    const shifts = await fetchActiveShifts(siteId);

    const latestPerWorker = Object.values(
      shifts.reduce((acc, s) => {
        if (!acc[s.worker_email]) acc[s.worker_email] = s;
        return acc;
      }, {})
    );

    setActiveShifts(latestPerWorker);

    if (shifts.length > 0 && !selectedShiftId) {
      setSelectedShiftId(shifts[0].id);
    }
  } catch (e) {
    setEndMsg(`Refresh failed: ${e?.message || String(e)}`);
  }
}


  // Decide what to display:
  // 1) If parent passed breadcrumbs prop, use it.
  // 2) Else if we fetched from API, use that.
  // 3) Else fallback to persisted session breadcrumbs.
 let breadcrumbsList = [];

if (shiftId) {
  breadcrumbsList = Array.isArray(apiBreadcrumbs) ? apiBreadcrumbs : [];
} else if (Array.isArray(breadcrumbs) && breadcrumbs.length > 0) {
  breadcrumbsList = breadcrumbs;
} else if (Array.isArray(session?.breadcrumbs)) {
  breadcrumbsList = session.breadcrumbs;
} else {
  breadcrumbsList = [];
}


  const rawCount = Array.isArray(breadcrumbsList) ? breadcrumbsList.length : 0;
  const lastBreadcrumbTs = rawCount > 0 ? breadcrumbsList[rawCount - 1]?.at : null;
  const displayedCount = rawCount; // display-throttling happens in BreadcrumbMap
// --- Breadcrumb gap auditing (detect likely phone sleep / app background) ---
const GAP_THRESHOLD_MINUTES = 8;

const breadcrumbStats = (() => {
  if (!Array.isArray(breadcrumbsList) || breadcrumbsList.length < 2) {
    return { maxGapMin: 0, gapCount: 0, lastAgeMin: null };
  }

  // Ensure chronological order just in case
  const times = breadcrumbsList
    .map((b) => (b?.at ? new Date(b.at).getTime() : NaN))
    .filter((t) => Number.isFinite(t))
    .sort((a, b) => a - b);

  if (times.length < 2) return { maxGapMin: 0, gapCount: 0, lastAgeMin: null };

  let maxGapMin = 0;
  let gapCount = 0;

  for (let i = 1; i < times.length; i++) {
    const gapMin = (times[i] - times[i - 1]) / 60000;
    if (gapMin > maxGapMin) maxGapMin = gapMin;
    if (gapMin >= GAP_THRESHOLD_MINUTES) gapCount++;
  }

  const lastAgeMin = (Date.now() - times[times.length - 1]) / 60000;

  return {
    maxGapMin: Math.round(maxGapMin),
    gapCount,
    lastAgeMin: Math.max(0, Math.round(lastAgeMin)),
  };
})();
const trackingLikelyPaused =
  breadcrumbStats.lastAgeMin !== null && breadcrumbStats.lastAgeMin >= GAP_THRESHOLD_MINUTES;

const hasBigGaps = breadcrumbStats.gapCount > 0;


async function fetchActiveShifts(siteId) {
  const base = import.meta.env.VITE_API_BASE_URL || "";
  const token = (session?.authToken || "").trim();

  if (!base) throw new Error("Missing VITE_API_BASE_URL");
  if (!token) throw new Error("Missing auth token (please log in again)");

  const url = siteId
  ? `${base.replace(/\/$/, "")}/shifts/active?siteId=${encodeURIComponent(siteId)}`
  : `${base.replace(/\/$/, "")}/shifts/active`;

  const resp = await fetch(url, {
    headers: {
  Authorization: `Bearer ${token}`,
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
    const token = (session?.authToken || "").trim();

if (!base) {
  throw new Error("Missing VITE_API_BASE_URL");
}
if (!token) {
  throw new Error("Missing auth token (please log in again)");
}

const url = `${base.replace(/\/$/, "")}/breadcrumbs?shiftId=${encodeURIComponent(
  currentShiftId
)}`;

const resp = await fetch(url, {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
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
  const siteId = siteFilter || "";

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
}, [selectedSite?.id]);



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


      <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 10 }}>
  <div style={{ marginBottom: 6 }}>
  <div style={{ marginBottom: 8 }}>
  <div style={{ marginBottom: 4 }}>
    <strong>Site filter:</strong>
  </div>
  <select
    value={siteFilter}
    onChange={(e) => setSiteFilter(e.target.value)}
    style={{
      padding: "6px 8px",
      borderRadius: 8,
      border: "1px solid #ccc",
      background: "white",
      minWidth: 220,
    }}
  >
    <option value="">All sites</option>
    <option value="waiapu">Waiapu</option>
    <option value="paokahu">Paokahu</option>
  </select>
</div>
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
          {s.worker_email} — {s.site_id} — {new Date(s.started_at).toLocaleString()}
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
  <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 10 }}>
  <button
    onClick={forceEndSelectedShift}
    disabled={!shiftId || ending}
    style={{
      padding: "8px 10px",
      borderRadius: 8,
      border: "1px solid #ccc",
      cursor: !shiftId || ending ? "not-allowed" : "pointer",
      opacity: !shiftId || ending ? 0.6 : 1,
      fontWeight: 600,
    }}
  >
    {ending ? "Ending…" : "Force end selected shift"}
  </button>
<button
  onClick={downloadCsvForSelectedShift}
  disabled={!shiftId}
  style={{
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid #ccc",
    cursor: !shiftId ? "not-allowed" : "pointer",
    opacity: !shiftId ? 0.6 : 1,
    fontWeight: 600,
  }}
>
  Download CSV
</button>

  {endMsg ? (
    <span style={{ fontSize: 12, opacity: 0.8 }}>{endMsg}</span>
  ) : null}
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
        <div>
  <strong>Status:</strong>{" "}
  {trackingLikelyPaused ? (
    <span style={{ padding: "2px 8px", borderRadius: 999, border: "1px solid #cc0000", color: "#cc0000" }}>
      Tracking likely paused
    </span>
  ) : (
    <span style={{ padding: "2px 8px", borderRadius: 999, border: "1px solid #0a7a0a", color: "#0a7a0a" }}>
      {hasBigGaps ? "Tracking resumed (gaps detected)" : "Tracking healthy"}
    </span>
  )}
</div>

        <div>
  <strong>Last breadcrumb:</strong>{" "}
  {breadcrumbStats.lastAgeMin === null ? "—" : `${breadcrumbStats.lastAgeMin} min ago`}
</div>
<div>
  <strong>Gaps ≥ {GAP_THRESHOLD_MINUTES} min:</strong> {breadcrumbStats.gapCount}{" "}
  {breadcrumbStats.gapCount ? `(max gap ${breadcrumbStats.maxGapMin} min)` : ""}
</div>

      </div>

      <BreadcrumbMap breadcrumbs={breadcrumbsList} />
    </div>
  );
}
