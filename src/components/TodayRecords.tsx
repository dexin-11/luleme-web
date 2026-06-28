import type { Record } from '../lib/types'

interface Props {
  records: Record[]
  onDelete: (id: string) => void
}

export default function TodayRecords({ records, onDelete }: Props) {
  if (records.length === 0) return null

  const sorted = [...records].sort((a, b) => b.timestamp - a.timestamp)

  return (
    <div className="card animate-fade-in" style={{ padding: '18px 20px' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: '14px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>📋 今日记录</h3>
        <span
          style={{
            fontSize: '11px',
            color: 'var(--primary)',
            background: 'var(--primary-soft)',
            padding: '3px 10px',
            borderRadius: '100px',
            fontWeight: 600,
          }}
        >
          {records.length} 条
        </span>
      </div>
      <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
        {sorted.map((r, i) => {
          const time = new Date(r.timestamp)
          const h = String(time.getHours()).padStart(2, '0')
          const m = String(time.getMinutes()).padStart(2, '0')
          return (
            <div
              key={r.id}
              className="flex items-center justify-between group"
              style={{
                padding: '10px 12px',
                borderRadius: '14px',
                marginBottom: i < sorted.length - 1 ? '4px' : 0,
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div className="flex items-center" style={{ gap: '12px' }}>
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    boxShadow: '0 0 6px var(--primary-glow)',
                  }}
                />
                <span
                  style={{
                    fontSize: '14px',
                    color: 'var(--text)',
                    fontFamily: 'var(--font-mono)',
                    fontVariantNumeric: 'tabular-nums',
                    fontWeight: 500,
                  }}
                >
                  {h}:{m}
                </span>
                {r.note && (
                  <span
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-tertiary)',
                      maxWidth: '120px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {r.note}
                  </span>
                )}
              </div>
              <button
                onClick={() => onDelete(r.id)}
                className="cursor-pointer"
                style={{
                  fontSize: '12px',
                  color: 'var(--text-tertiary)',
                  opacity: 0,
                  transition: 'opacity 0.2s, color 0.15s, background 0.15s',
                  padding: '4px 10px',
                  borderRadius: '100px',
                  background: 'none',
                  border: 'none',
                  fontWeight: 500,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--danger)'
                  e.currentTarget.style.background = 'var(--danger-soft)'
                  e.currentTarget.style.opacity = '1'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--text-tertiary)'
                  e.currentTarget.style.background = 'none'
                  e.currentTarget.style.opacity = '0'
                }}
                ref={el => { if (el) el.style.opacity = '0' }}
              >
                撤销
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
