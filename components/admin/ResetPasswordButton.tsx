'use client'
import { useState } from 'react'

export default function ResetPasswordButton({ studentId }: { studentId: string }) {
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState('')
  const [error,   setError]   = useState('')

  const handleReset = async () => {
    if (!confirm('Generate a new temporary password for this student?')) return
    setLoading(true)
    setResult('')
    setError('')
    const res  = await fetch('/api/admin/reset-password', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ student_id: studentId }),
    })
    const data = await res.json()
    setLoading(false)
    if (data.error) { setError(data.error) }
    else { setResult(data.temp_pass) }
  }

  return (
    <div>
      <button onClick={handleReset} disabled={loading}
        style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'var(--text2)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
        {loading ? 'Generating...' : '🔑 Reset Password'}
      </button>
      {result && (
        <div style={{ marginTop: '8px', padding: '10px 14px', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '8px' }}>
          <div style={{ fontSize: '10px', fontFamily: 'DM Mono, monospace', color: '#4ADE80', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>New temp password — share with student</div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#4ADE80', fontFamily: 'DM Mono, monospace', letterSpacing: '0.05em' }}>{result}</div>
        </div>
      )}
      {error && (
        <div style={{ marginTop: '8px', fontSize: '12px', color: '#F97066' }}>{error}</div>
      )}
    </div>
  )
}
