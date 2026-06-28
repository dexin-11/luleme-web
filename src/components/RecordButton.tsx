import { useState, useCallback, useRef } from 'react'

interface Props {
  onRecord: () => void
  todayCount: number
}

export default function RecordButton({ onRecord, todayCount }: Props) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])
  const [floats, setFloats] = useState<{ id: number; emoji: string }[]>([])
  const [pressed, setPressed] = useState(false)
  const nextId = useRef(0)
  const emojis = ['✨', '⭐', '🌟', '💫', '🔥']

  const handleClick = useCallback((e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = nextId.current++
    const emoji = emojis[id % emojis.length]

    setRipples(prev => [...prev, { id, x, y }])
    setFloats(prev => [...prev, { id, emoji }])
    setPressed(true)

    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600)
    setTimeout(() => setFloats(prev => prev.filter(f => f.id !== id)), 900)
    setTimeout(() => setPressed(false), 150)

    onRecord()
  }, [onRecord])

  return (
    <div className="flex flex-col items-center gap-10">
      <div className="relative">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'var(--primary-glow)',
            animation: 'pulse-ring 2.8s ease-out infinite',
          }}
        />
        <div
          className="absolute -inset-4 rounded-full"
          style={{
            background: 'var(--primary-glow)',
            animation: 'pulse-ring 2.8s ease-out infinite 1s',
            opacity: 0.4,
          }}
        />

        <button
          onClick={handleClick}
          className="relative cursor-pointer overflow-hidden flex items-center justify-center"
          style={{
            width: '148px',
            height: '148px',
            borderRadius: '50%',
            background: 'linear-gradient(145deg, var(--primary-light), var(--primary), var(--primary-dark))',
            boxShadow: pressed
              ? `0 4px 16px var(--primary-glow), inset 0 2px 4px rgba(0,0,0,0.1)`
              : `0 8px 40px var(--primary-glow), 0 4px 16px oklch(0.6 0.12 260 / 0.2), inset 0 1px 0 rgba(255,255,255,0.2)`,
            transform: pressed ? 'scale(0.92)' : 'scale(1)',
            transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s',
            border: 'none',
          }}
        >
          {ripples.map(r => (
            <span
              key={r.id}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: '40px',
                height: '40px',
                left: r.x,
                top: r.y,
                transform: 'translate(-50%, -50%)',
                background: 'rgba(255,255,255,0.3)',
                animation: 'pulse-ring 0.6s ease-out forwards',
              }}
            />
          ))}

          <div className="text-center relative z-10">
            <div style={{ fontSize: '44px', lineHeight: 1, marginBottom: '8px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>💪</div>
            <div className="text-white font-bold text-sm tracking-widest" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.15)' }}>打卡</div>
          </div>
        </button>

        {floats.map(f => (
          <div
            key={f.id}
            className="absolute top-1/2 left-1/2 pointer-events-none"
            style={{
              transform: 'translate(-50%, -50%)',
              fontSize: '26px',
              animation: 'float-up 0.9s ease-out forwards',
            }}
          >
            {f.emoji}
          </div>
        ))}
      </div>

      <div className="text-center">
        <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', fontWeight: 500, letterSpacing: '0.04em' }}>
          今日已记录
        </div>
        <div className="flex items-baseline justify-center gap-1.5 mt-1">
          <span
            style={{
              fontSize: '40px',
              fontWeight: 800,
              color: 'var(--primary)',
              lineHeight: 1,
              fontFamily: 'var(--font-mono)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {todayCount}
          </span>
          <span style={{ fontSize: '14px', color: 'var(--text-tertiary)', fontWeight: 500 }}>次</span>
        </div>
      </div>
    </div>
  )
}
