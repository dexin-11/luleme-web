interface Props {
  monthData: Map<string, number>
  visibleMonth: Date
  onPrevMonth: () => void
  onNextMonth: () => void
  onCurrentMonth: () => void
  onSelectDate?: (dateStr: string) => void
}

const dayLabels = ['一', '二', '三', '四', '五', '六', '日']

function getHeatColor(count: number): string {
  if (count === 0) return 'var(--chart-empty)'
  if (count === 1) return 'var(--primary-soft)'
  if (count === 2) return 'var(--primary-glow)'
  if (count === 3) return 'var(--primary-light)'
  return 'var(--primary)'
}

export default function MonthHeatmap({
  monthData,
  visibleMonth,
  onPrevMonth,
  onNextMonth,
  onCurrentMonth,
  onSelectDate,
}: Props) {
  const year = visibleMonth.getFullYear()
  const month = visibleMonth.getMonth()

  const firstDay = new Date(year, month, 1)
  let startWeekday = firstDay.getDay()
  startWeekday = startWeekday === 0 ? 6 : startWeekday - 1

  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month

  const cells: { day: number; dateStr: string; count: number; isToday: boolean }[] = []

  for (let i = 0; i < startWeekday; i++) {
    cells.push({ day: 0, dateStr: '', count: 0, isToday: false })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const count = monthData.get(dateStr) ?? 0
    const isToday = isCurrentMonth && today.getDate() === d
    cells.push({ day: d, dateStr, count, isToday })
  }

  const monthLabel = `${year}年${month + 1}月`

  return (
    <div className="card animate-fade-in" style={{ padding: '20px 22px' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
        <button
          onClick={onPrevMonth}
          className="btn btn-ghost"
          style={{ width: '36px', height: '36px', borderRadius: '12px', padding: 0, fontSize: '18px', fontWeight: 600 }}
        >
          ‹
        </button>
        <button
          onClick={onCurrentMonth}
          className="btn btn-ghost"
          style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', padding: '6px 14px', borderRadius: '12px' }}
        >
          🗓️ {monthLabel}
        </button>
        <button
          onClick={onNextMonth}
          className="btn btn-ghost"
          style={{ width: '36px', height: '36px', borderRadius: '12px', padding: 0, fontSize: '18px', fontWeight: 600 }}
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7" style={{ gap: '5px', marginBottom: '6px' }}>
        {dayLabels.map(d => (
          <div
            key={d}
            className="text-center"
            style={{ fontSize: '11px', color: 'var(--text-tertiary)', padding: '4px 0', fontWeight: 600, letterSpacing: '0.04em' }}
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7" style={{ gap: '5px' }}>
        {cells.map((cell, i) => {
          const hasCount = cell.count > 0
          return (
            <div
              key={i}
              className="flex items-center justify-center"
              style={{
                aspectRatio: '1',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: cell.isToday ? 800 : 500,
                background: cell.day === 0 ? 'transparent' : getHeatColor(cell.count),
                color: cell.isToday ? 'var(--primary)' : hasCount ? 'var(--text)' : 'var(--text-tertiary)',
                boxShadow: cell.count >= 4 ? '0 0 12px var(--primary-glow)' : 'none',
                cursor: cell.day > 0 && onSelectDate ? 'pointer' : 'default',
                transition: 'background 0.2s, box-shadow 0.2s, transform 0.15s',
                outline: cell.isToday ? '2px solid var(--primary)' : 'none',
                outlineOffset: '-2px',
              }}
              onClick={() => cell.day > 0 && onSelectDate?.(cell.dateStr)}
              onMouseEnter={e => { if (cell.day > 0) e.currentTarget.style.transform = 'scale(1.08)' }}
              onMouseLeave={e => { if (cell.day > 0) e.currentTarget.style.transform = 'scale(1)' }}
            >
              {cell.day > 0 ? cell.day : ''}
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-center" style={{ gap: '8px', marginTop: '16px' }}>
        <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 500 }}>少</span>
        {[0, 1, 2, 3, 4].map(n => (
          <div
            key={n}
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '4px',
              background: getHeatColor(n),
            }}
          />
        ))}
        <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 500 }}>多</span>
      </div>
    </div>
  )
}
