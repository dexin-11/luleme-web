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
        padding: '16px',
        borderColor: styles.border + '33',
        background: styles.bg,
      }}
    >
      <div className="flex items-start gap-3">
        <span style={{ fontSize: '24px', lineHeight: 1 }}>{advice.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm" style={{ color: styles.text }}>{advice.title}</div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.6 }}>{advice.message}</p>
          <div className="flex items-center gap-3 mt-3" style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
            <span>建议 3次/周</span>
            <span style={{ width: '1px', height: '12px', background: 'var(--border)' }} />
            <span>上限 5次/周</span>
          </div>
        </div>
      </div>
    </div>
  )
}
