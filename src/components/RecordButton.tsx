import { useState, useCallback, useRef } from 'react'

interface Props {
  onRecord: () => void
  todayCount: number
}

export default function RecordButton({ onRecord, todayCount }: Props) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])
  const [floats, setFloats] = useState<{ id: number }[]>([])
  const [pressed, setPressed] = useState(false)
  const nextId = useRef(0)

  const handleClick = useCallback((e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = nextId.current++

    setRipples(prev => [...prev, { id, x, y }])
    setFloats(prev => [...prev, { id }])
    setPressed(true)

    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600)
    setTimeout(() => setFloats(prev => prev.filter(f => f.id !== id)), 800)
    setTimeout(() => setPressed(false), 150)

    onRecord()
  }, [onRecord])

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'var(--primary-glow)',
            animation: 'pulse-ring 2.5s ease-out infinite',
          }}
        />
        <div
          className="absolute -inset-3 rounded-full"
          style={{
            background: 'var(--primary-glow)',
            animation: 'pulse-ring 2.5s ease-out infinite 0.8s',
            opacity: 0.5,
          }}
        />

        <button
          onClick={handleClick}
          className="relative cursor-pointer overflow-hidden flex items-center justify-center"
          style={{
            width: '144px',
            height: '144px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
            boxShadow: `0 8px 32px var(--primary-glow), inset 0 1px 0 rgba(255,255,255,0.15)`,
            transform: pressed ? 'scale(0.93)' : 'scale(1)',
            transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {ripples.map(r => (
            <span
              key={r.id}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: '32px',
                height: '32px',
                left: r.x,
                top: r.y,
                transform: 'translate(-50%, -50%)',
                background: 'rgba(255,255,255,0.25)',
                animation: 'pulse-ring 0.6s ease-out forwards',
              }}
            />
          ))}

          <div className="text-center relative z-10">
            <div style={{ fontSize: '40px', lineHeight: 1, marginBottom: '6px' }}>💪</div>
            <div className="text-white font-semibold text-sm tracking-wide">打卡</div>
          </div>
        </button>

        {floats.map(f => (
          <div
            key={f.id}
            className="absolute top-1/2 left-1/2 pointer-events-none"
            style={{
              transform: 'translate(-50%, -50%)',
              fontSize: '24px',
              animation: 'float-up 0.8s ease-out forwards',
            }}
          >
            ✨
          </div>
        ))}
      </div>

      <div className="text-center">
        <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>今日已记录</div>
        <div className="flex items-baseline justify-center gap-1 mt-1">
          <span style={{ fontSize: '36px', fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{todayCount}</span>
          <span style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>次</span>
        </div>
      </div>
    </div>
  )
}
