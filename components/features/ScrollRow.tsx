'use client'

export default function ScrollRow({ children, direction, speed }: {
  children: React.ReactNode
  direction: 'left' | 'right'
  speed?: number
}) {
  const anim = direction === 'left'
    ? `scrollLeft ${speed || 40}s linear infinite`
    : `scrollRight ${speed || 40}s linear infinite`

  return (
    <div
      style={{ overflow: 'hidden', marginBottom: '14px' }}
      onMouseEnter={e => (e.currentTarget.firstChild as HTMLElement).style.animationPlayState = 'paused'}
      onMouseLeave={e => (e.currentTarget.firstChild as HTMLElement).style.animationPlayState = 'running'}
    >
      <div style={{ display: 'flex', gap: '14px', animation: anim, width: 'max-content' }}>
        {children}
      </div>
    </div>
  )
}