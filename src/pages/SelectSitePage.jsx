import React from 'react';

export default function SelectSitePage({ sites = [], onSelectSite, onLogout }) {
  return (
    <main style={{ maxWidth: '520px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Select Site</h2>
        <button type="button" onClick={onLogout}>
          Log out
        </button>
      </div>

      <p>Select the site you are working at today.</p>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {sites.map((s) => (
          <li key={s.id} style={{ marginBottom: '0.75rem' }}>
            <button
              type="button"
              onClick={() => onSelectSite?.(s)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontWeight: 600 }}>{s.name}</div>
              {s.address ? (
                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                  {s.address}
                </div>
              ) : null}
            </button>
          </li>
        ))}
      </ul>

      {sites.length === 0 ? (
        <p style={{ opacity: 0.8 }}>No sites available.</p>
      ) : null}
    </main>
  );
}
