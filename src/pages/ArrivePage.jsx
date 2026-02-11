import React from 'react';

export default function ArrivePage({ site, onArrive, onBack, error, loading }) {
  return (
    <main style={{ maxWidth: '520px', margin: '0 auto' }}>
      <button type="button" onClick={onBack} style={{ marginBottom: '1rem' }}>
        ← Back
      </button>

      <h2>Arrive on site</h2>

      <div style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '1.5rem' }}>
        <div style={{ fontWeight: 600 }}>{site?.name || 'Unknown site'}</div>
      </div>

      {error ? (
  <div style={{ marginBottom: 12, color: "crimson", fontSize: 13 }}>
    {error}
  </div>
) : null}

<button
  type="button"
  disabled={!!loading}
  onClick={() => onArrive?.()}
  style={{
    width: "100%",
    padding: "14px",
    background: loading ? "#999" : "green",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: loading ? "not-allowed" : "pointer",
    fontSize: "1.05rem",
    fontWeight: 700,
  }}
>
  {loading ? "Starting shift…" : "Arrive on site"}
</button>


      <p style={{ marginTop: '1rem', opacity: 0.8 }}>
        This will record your arrival time (and later, your GPS location).
      </p>
    </main>
  );
}
