'use client'
import { useState, useEffect } from 'react'

const PATHWAY_NAMES: Record<string, string> = {
  P01: '🤖 AI Tech', P02: '🎓 Course', P03: '💼 Consulting',
  P04: '🏪 Marketplace', P05: '📦 E-commerce', P06: '👗 Fashion D2C',
  P07: '📚 EdTech', P08: '🌐 Community', P09: '🎬 Content', P10: '💻 Freelancing',
}

export default function AdminStudentsPage() {
  const [students, setStudents]   = useState<any[]>([])
  const [comps, setComps]         = useState<any[]>([])
  const [concepts, setConcepts]   = useState<any[]>([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const [studentsRes, compsRes, conceptsRes] = await Promise.all([
        fetch('/api/admin/list-students').then(r => r.json()),
        fetch('/api/admin/list-student-comps').then(r => r.json()),
        fetch('/api/admin/list-student-concepts').then(r => r.json()),
      ])
      setStudents(studentsRes.students || [])
      setComps(compsRes.data || [])
      setConcepts(conceptsRes.data || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div style={{ marginBottom: '40px' }}>
        <div style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin</div>
        <h1 style={{ fontSize: '28px', fontWeight: '600', letterSpacing: '-0.02em' }}>Students</h1>
        <p style={{ color: 'var(--text2)', fontSize: '14px', marginTop: '4px' }}>{students.length} active students</p>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)', fontSize: '13px', fontFamily: 'DM Mono, monospace' }}>Loading...</div>
      ) : students.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '16px' }}>
          <div style={{ fontSize: '14px', color: 'var(--text3)', marginBottom: '8px' }}>No students yet</div>
          <div style={{ fontSize: '12px', color: 'var(--text3)' }}>Approve applications to get students started</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {students.map(s => {
            const studentComps    = comps.filter(c => c.student_id === s.id)
            const studentConcepts = concepts.filter(c => c.student_id === s.id)
            const activeComp      = studentComps.find(c => c.status === 'active')
            const masteredConcepts = studentConcepts.filter(c => c.is_completed).length
            const activeCode = activeComp?.competency_code || null
            const activeName = PATHWAY_NAMES[activeCode] || '—'

            return (
              <div key={s.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(108,71,255,0.1)', border: '1px solid rgba(108,71,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#6C47FF', flexShrink: 0 }}>
                      {(s.full_name || s.email)[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text)' }}>{s.full_name || '—'}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '2px' }}>{s.email} · {s.job_title || 'No title'}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>
                    Joined {new Date(s.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
                  {[
                    { label: 'Active Pathway', value: activeName, col: 'var(--accent)' },
                    { label: 'Steps Completed', value: masteredConcepts, col: '#00C851' },
                    { label: 'Steps Remaining', value: Math.max(0, 25 - masteredConcepts), col: 'var(--text2)' },
                  ].map(stat => (
                    <div key={stat.label} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 12px' }}>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: stat.col, marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{stat.value}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text3)', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text3)', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                    Journey Progress — {masteredConcepts}/25 steps
                  </div>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div key={i} style={{ flex: 1, height: '6px', borderRadius: '3px', background: i < masteredConcepts ? '#6C47FF' : 'rgba(255,255,255,0.06)' }} />
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
