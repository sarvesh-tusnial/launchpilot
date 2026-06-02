'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminLoginPage() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleLogin = async () => {
    if (!email || !password) { setError('Email and password required'); return }
    setLoading(true)
    setError('')

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) { setError(authError.message); setLoading(false); return }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', data.user.id)
      .single()

    if (!profile?.is_admin) {
      await supabase.auth.signOut()
      setError('You do not have admin access.')
      setLoading(false)
      return
    }

    window.location.href = '/admin'
  }

  return (
    <div style={{ background:'#05050A', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'DM Sans,sans-serif' }}>
      <div style={{ width:'100%', maxWidth:'400px', padding:'40px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'16px' }}>
        <div style={{ marginBottom:'32px', textAlign:'center' }}>
          <div style={{ fontSize:'22px', fontWeight:'700', color:'#F0EDE6', marginBottom:'4px' }}>
            Mento<span style={{ color:'#FF6A00' }}>gram</span>
          </div>
          <div style={{ fontFamily:'DM Mono,monospace', fontSize:'10px', color:'#555', textTransform:'uppercase', letterSpacing:'0.15em' }}>Admin Panel</div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          <div>
            <label style={{ display:'block', fontSize:'11px', color:'#666', marginBottom:'6px', fontFamily:'DM Mono,monospace', textTransform:'uppercase', letterSpacing:'0.1em' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="admin@mentogram.com"
              style={{ width:'100%', padding:'12px 16px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', color:'#F0EDE6', fontSize:'14px', fontFamily:'DM Sans,sans-serif', outline:'none', boxSizing:'border-box' }}
            />
          </div>
          <div>
            <label style={{ display:'block', fontSize:'11px', color:'#666', marginBottom:'6px', fontFamily:'DM Mono,monospace', textTransform:'uppercase', letterSpacing:'0.1em' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              style={{ width:'100%', padding:'12px 16px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', color:'#F0EDE6', fontSize:'14px', fontFamily:'DM Sans,sans-serif', outline:'none', boxSizing:'border-box' }}
            />
          </div>

          {error && (
            <div style={{ padding:'10px 14px', background:'rgba(249,112,102,0.1)', border:'1px solid rgba(249,112,102,0.2)', borderRadius:'8px', fontSize:'13px', color:'#F97066' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ width:'100%', padding:'13px', background:'#FF6A00', border:'none', borderRadius:'8px', color:'#fff', fontSize:'14px', fontWeight:'700', cursor:'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Signing in...' : 'Sign In to Admin →'}
          </button>
        </div>

        <div style={{ marginTop:'24px', textAlign:'center', fontSize:'12px', color:'#333' }}>
          Admin access only. Students log in at{' '}
          <a href="/auth/login" style={{ color:'#555', textDecoration:'none' }}>mentogram.com/auth/login</a>
        </div>
      </div>
    </div>
  )
}