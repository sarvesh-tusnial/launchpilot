import Link from 'next/link'

const PATHWAYS = [
  { code: 'P01', emoji: '🤖', name: 'AI Tech Business',     tagline: 'Build and sell an AI product' },
  { code: 'P02', emoji: '🎓', name: 'Course Business',       tagline: 'Package your knowledge' },
  { code: 'P03', emoji: '💼', name: 'Consulting Business',   tagline: 'Get paid for what you know' },
  { code: 'P04', emoji: '🏪', name: 'Marketplace',           tagline: 'Connect buyers and sellers' },
  { code: 'P05', emoji: '📦', name: 'E-commerce',            tagline: 'Sell products online' },
  { code: 'P06', emoji: '👗', name: 'Fashion D2C Brand',     tagline: 'Build a brand people wear' },
  { code: 'P07', emoji: '📚', name: 'EdTech Business',       tagline: 'Build a learning product' },
  { code: 'P08', emoji: '🌐', name: 'Community Business',    tagline: 'Turn audience into revenue' },
  { code: 'P09', emoji: '🎬', name: 'Content Business',      tagline: 'Monetise your content' },
  { code: 'P10', emoji: '💻', name: 'Freelancing Business',  tagline: 'Build your client base' },
]

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'DM Sans, sans-serif' }}>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', height: '64px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
        <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text)' }}>
          Launch<span style={{ color: 'var(--accent)' }}>Pilot</span>
          <span style={{ fontSize: '9px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', marginLeft: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', verticalAlign: 'middle' }}>School</span>
        </div>
        <Link href="/auth/login" style={{ padding: '9px 22px', borderRadius: '8px', background: 'var(--accent)', color: '#fff', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }}>
          Sign In →
        </Link>
      </nav>

      {/* HERO */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '80px 24px 60px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 18px', borderRadius: '100px', background: 'rgba(108,71,255,0.08)', border: '1px solid rgba(108,71,255,0.2)', marginBottom: '32px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--accent2)', textTransform: 'uppercase', letterSpacing: '0.16em' }}>AI Launch Coach</span>
        </div>

        <h1 style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: '800', letterSpacing: '-0.03em', color: 'var(--text)', lineHeight: '1.08', marginBottom: '24px' }}>
          Launch your business.<br />
          <span style={{ color: 'var(--accent)' }}>With an AI coach by your side.</span>
        </h1>

        <p style={{ fontSize: '17px', color: 'var(--text2)', lineHeight: '1.75', maxWidth: '560px', margin: '0 auto 48px' }}>
          Pick your pathway. Maya guides you through 25 steps — from idea validation to first revenue. Built for working professionals who are serious about launching.
        </p>

        <Link href="/auth/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 40px', borderRadius: '10px', background: 'var(--accent)', color: '#fff', fontSize: '16px', fontWeight: '700', textDecoration: 'none', marginBottom: '72px' }}>
          Start your launch →
        </Link>

        {/* Pathways grid */}
        <div style={{ textAlign: 'left', marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>10 Launch Pathways</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
            {PATHWAYS.map(p => (
              <div key={p.code} style={{ padding: '16px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>{p.emoji}</div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', marginBottom: '3px', lineHeight: '1.3' }}>{p.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{p.tagline}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', paddingTop: '48px', borderTop: '1px solid var(--border)' }}>
          {[
            { n: '10', l: 'Pathways' },
            { n: '25', l: 'Steps each' },
            { n: '8', l: 'Learning stages' },
            { n: '24/7', l: 'Maya AI Coach' },
          ].map(s => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--accent)', letterSpacing: '-0.02em', marginBottom: '4px' }}>{s.n}</div>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ padding: '20px 48px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--text3)' }}>© 2025 LaunchPilot School</span>
        <Link href="/admin-login" style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--text3)', textDecoration: 'none' }}>Admin →</Link>
      </footer>
    </div>
  )
}
