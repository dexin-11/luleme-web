import type { Record } from '../lib/types'

interface Props {
  records: Record[]
  onDelete: (id: string) => void
}

export default function TodayRecords({ records, onDelete }: Props) {
  if (records.length === 0) return null

  const sorted = [...records].sort((a, b) => b.timestamp - a.timestamp)

  return (
    <div className="card animate-fade-in" style={{ padding: '16px' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>今日记录</h3>
        <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{records.length} 条</span>
      </div>
      <div style={{ maxHeight: '192px', overflowY: 'auto' }}>
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
                borderRadius: '12px',
                marginBottom: i < sorted.length - 1 ? '4px' : 0,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div className="flex items-center gap-3">
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }} />
                <span style={{ fontSize: '14px', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{h}:{m}</span>
                {r.note && <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', maxWidth: '128px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.note}</span>}
              </div>
              <button
                onClick={() => onDelete(r.id)}
                className="cursor-pointer"
                style={{
                  fontSize: '12px',
                  color: 'var(--text-tertiary)',
                  opacity: 0,
                  transition: 'opacity 0.15s, color 0.15s',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  background: 'none',
                  border: 'none',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; (e.currentTarget as HTMLElement).style.opacity = '1' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-tertiary)'; (e.currentTarget as HTMLElement).style.opacity = '0' }}
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
