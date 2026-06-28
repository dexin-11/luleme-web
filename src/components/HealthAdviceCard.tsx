import { getHealthAdvice } from '../lib/health'

interface Props {
  weekCount: number
}

const levelStyles = {
  info: { bg: 'var(--success-soft)', border: 'var(--success)', text: 'var(--success)' },
  warning: { bg: 'var(--warning-soft)', border: 'var(--warning)', text: 'var(--warning)' },
  danger: { bg: 'var(--danger-soft)', border: 'var(--danger)', text: 'var(--danger)' },
}

export default function HealthAdviceCard({ weekCount }: Props) {
  const advice = getHealthAdvice(weekCount)
  const styles = levelStyles[advice.level]

  return (
    <div
      className="card animate-fade-in"
      style={{
        padding: '18px 20px',
        borderColor: styles.border + '30',
        background: styles.bg,
        borderRadius: '20px',
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="flex items-center justify-center"
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            background: styles.border + '18',
            fontSize: '22px',
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          {advice.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div style={{ fontSize: '14px', fontWeight: 700, color: styles.text, marginBottom: '4px' }}>
            {advice.title}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{advice.message}</p>
          <div
            className="flex items-center"
            style={{ gap: '10px', marginTop: '12px', fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 500 }}
          >
            <span style={{ padding: '3px 10px', borderRadius: '100px', background: styles.border + '15' }}>建议 3次/周</span>
            <span style={{ padding: '3px 10px', borderRadius: '100px', background: styles.border + '15' }}>上限 5次/周</span>
          </div>
        </div>
      </div>
    </div>
  )
}
