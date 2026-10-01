import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        color: '#0f172a',
        padding: '24px',
        textAlign: 'center',
        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
      }}
    >
      <div style={{
        width: '72px', height: '72px', borderRadius: '20px',
        background: 'linear-gradient(135deg, #ff6b00, #ff881a)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 24px auto',
        boxShadow: '0 8px 24px rgba(255,107,0,0.3)',
        fontSize: '32px',
      }}>
        🔍
      </div>
      <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px', color: '#0f172a', letterSpacing: '-0.02em' }}>
        404 — Page Not Found
      </h1>
      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '28px', maxWidth: '380px', lineHeight: 1.6 }}>
        The financial view or report you are looking for does not exist.
      </p>
      <Link
        href="/dashboard"
        style={{
          padding: '12px 24px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #ff6b00, #ff881a)',
          border: 'none',
          color: '#ffffff',
          fontWeight: 700,
          textDecoration: 'none',
          fontSize: '14px',
          boxShadow: '0 4px 14px rgba(255,107,0,0.35)',
        }}
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
