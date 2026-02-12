import React from 'react';

export default function ArrivePage({ site, onArrive, onBack }) {
  return (
    <main style={{ maxWidth: '520px', margin: '0 auto' }}>
      <button type="button" onClick={onBack} style={{ marginBottom: '1rem' }}>
        ← Back
      </button>

      <h2>Arrive on site</h2>

      <div style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '1.5rem' }}>
        <div style={{ fontWeight: 600 }}>{site?.name || 'Unknown site'}</div>
      </div>

      <button
        type="button"
        onClick={() => onArrive?.()}
        style={{
          width: '100%',
          padding: '14px',
          background: 'green',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer',
          fontSize: '1.05rem',
          fontWeight: 700,
        }}
      >
        Arrive on site
      </button>

      <p style={{ marginTop: '1rem', opacity: 0.8 }}>
        This will record your arrival time (and later, your GPS location).
      </p>
    </main>
  );
}
