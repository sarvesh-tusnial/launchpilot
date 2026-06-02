'use client'
import { useState, useEffect } from 'react'

export default function AdminStudentsPage() {
  const [students, setStudents]     = useState<any[]>([])
  const [comps, setComps]           = useState<any[]>([])
  const [concepts, setConcepts]     = useState<any[]>([])
  const [loading, setLoading]       = useState(true)

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

  const getStudentComps    = (id: string) => comps.filter(c => c.student_id === id)
  const getStudentConcepts = (id: string) => concepts.filter(c => c.student_id === id)

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div style={{ marginBottom: '40px' }}>
        <div style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin</div>
        <h1 style={{ fontSize: '28px', fontWeight: '600', letterSpacing: '-0.02em' }}>Students</h1>
        <p style={{ color: 'var(--text2)', fontSize: '14px', marginTop: '4px' }}>{students.length} active employees</p>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)', fontSize: '13px', fontFamily: 'DM Mono, monospace' }}>Loading...</div>
      ) : students.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '16px' }}>
          <div style={{ fontSize: '14px', color: 'var(--text3)', marginBottom: '8px' }}>No students yet</div>
          <div style={{ fontSize: '12px', color: 'var(--text3)' }}>Add employees from the Applications tab</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {students.map(s => {
            const studentComps    = getStudentComps(s.id)
            const studentConcepts = getStudentConcepts(s.id)
            const activeComp      = studentComps.find(c => c.status === 'active')
            const completedComps  = studentComps.filter(c => c.is_completed).length
            const masteredConcepts = studentConcepts.filter(c => c.is_completed).length
            const activeName = activeComp?.competency_name || '—'
            const activeCode = activeComp?.competency_code || '—'

            return (
              <div key={s.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(0,130,195,0.1)', border: '1px solid rgba(0,130,195,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#0082C3', flexShrink: 0 }}>
                      {(s.full_name || s.email)[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text)' }}>{s.full_name || '—'}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '2px' }}>{s.email} · {s.job_title || 'No title'} · {s.department || 'No dept'}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>
                    Joined {new Date(s.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
                  {[
                    { label: 'Competencies Done', value: `${completedComps}/15`, col: '#00C851' },
                    { label: 'Concepts Mastered', value: masteredConcepts, col: 'var(--accent)' },
                    { label: 'Active Competency', value: activeCode, col: 'var(--text2)' },
                    { label: 'Currently Studying', value: activeName, col: 'var(--text2)', small: true },
                  ].map(stat => (
                    <div key={stat.label} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 12px' }}>
                      <div style={{ fontSize: stat.small ? '11px' : '18px', fontWeight: '700', color: stat.col, marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{stat.value}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text3)', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text3)', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Competency Progress</div>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {Array.from({ length: 15 }).map((_, i) => {
                      const code = `D${String(i + 1).padStart(2, '0')}`
                      const comp = studentComps.find(c => c.competency_code === code)
                      const status = comp?.status || 'locked'
                      return (
                        <div key={i} title={code} style={{ flex: 1, height: '6px', borderRadius: '3px', background: status === 'completed' ? '#00C851' : status === 'active' ? '#0082C3' : status === 'paused' ? 'rgba(0,130,195,0.3)' : 'rgba(255,255,255,0.06)' }} />
                      )
                    })}
                  </div>
                  <div style={{ display: 'flex', gap: '3px', marginTop: '3px' }}>
                    {Array.from({ length: 15 }).map((_, i) => (
                      <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '8px', color: 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>D{String(i + 1).padStart(2, '0')}</div>
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
