import { useState } from 'react'

interface Props {
  onConfirm: (timestamp: number) => void
  onClose: () => void
}

export default function BackfillModal({ onConfirm, onClose }: Props) {
  const now = new Date()
  const [date, setDate] = useState(() => {
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  })
  const [time, setTime] = useState(() => {
    const h = String(now.getHours()).padStart(2, '0')
    const m = String(now.getMinutes()).padStart(2, '0')
    return `${h}:${m}`
  })

  const handleConfirm = () => {
    const timestamp = new Date(`${date}T${time}:00`).getTime()
    if (!isNaN(timestamp)) onConfirm(timestamp)
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)', marginBottom: '6px' }}>📝 补录记录</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '22px', fontWeight: 500 }}>
          选择要补录的日期和时间
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '8px', fontWeight: 600, letterSpacing: '0.04em' }}>
              日期
            </label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '8px', fontWeight: 600, letterSpacing: '0.04em' }}>
              时间
            </label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)} className="input" />
          </div>
        </div>

        <div className="flex gap-3" style={{ marginTop: '24px' }}>
          <button onClick={onClose} className="btn btn-outline flex-1" style={{ padding: '12px', fontSize: '14px' }}>
            取消
          </button>
          <button onClick={handleConfirm} className="btn btn-primary flex-1" style={{ padding: '12px', fontSize: '14px' }}>
            确认补录
          </button>
        </div>
      </div>
    </div>
  )
}
