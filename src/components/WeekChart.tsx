interface Props {
  data: { day: string; count: number }[]
}

const dayLabels = ['一', '二', '三', '四', '五', '六', '日']

export default function WeekChart({ data }: Props) {
  const maxCount = Math.max(1, ...data.map(d => d.count))

  return (
    <div className="card animate-fade-in" style={{ padding: '20px 22px' }}>
      <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '18px' }}>
        📊 本周统计
      </h3>
      <div className="flex items-end justify-between" style={{ height: '140px', gap: '10px' }}>
        {data.map((d, i) => {
          const height = maxCount > 0 ? (d.count / maxCount) * 100 : 0
          const isToday = i === getTodayIndex()
          return (
            <div key={i} className="flex-1 flex flex-col items-center" style={{ gap: '10px', height: '100%' }}>
              <div className="w-full flex justify-center items-end" style={{ flex: 1 }}>
                <div
                  className="w-full"
                  style={{
                    maxWidth: '34px',
                    height: `${Math.max(height, d.count > 0 ? 14 : 6)}%`,
                    borderRadius: '10px 10px 6px 6px',
                    background: d.count > 0
                      ? isToday
                        ? 'linear-gradient(to top, var(--primary), var(--primary-light))'
                        : 'var(--primary-soft)'
                      : 'var(--chart-empty)',
                    boxShadow: d.count > 0 && isToday ? '0 0 16px var(--primary-glow)' : 'none',
                    transition: 'height 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                />
              </div>
              <div className="text-center">
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: isToday ? 800 : 500,
                    color: isToday ? 'var(--primary)' : 'var(--text-tertiary)',
                    letterSpacing: '0.02em',
                  }}
                >
                  {dayLabels[i]}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    fontVariantNumeric: 'tabular-nums',
                    fontWeight: 600,
                    color: isToday ? 'var(--text)' : 'var(--text-secondary)',
                    marginTop: '3px',
                  }}
                >
                  {d.count}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function getTodayIndex(): number {
  const day = new Date().getDay()
  return day === 0 ? 6 : day - 1
}
