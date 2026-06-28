export interface HealthAdvice {
  level: 'info' | 'warning' | 'danger'
  title: string
  message: string
  icon: string
}

const IDEAL_WEEKLY = 3
const MAX_WEEKLY = 5

export function getHealthAdvice(weekCount: number): HealthAdvice {
  if (weekCount === 0) {
    return {
      level: 'info',
      title: '本周暂无记录',
      message: '保持适度频率，注意身体健康。',
      icon: '📋',
    }
  }

  if (weekCount <= IDEAL_WEEKLY) {
    return {
      level: 'info',
      title: '频率适中',
      message: `建议每周${IDEAL_WEEKLY}次左右，当前${weekCount}次，保持良好状态！`,
      icon: '✅',
    }
  }

  if (weekCount <= MAX_WEEKLY) {
    return {
      level: 'warning',
      title: '频率偏高',
      message: `建议每周不超过${MAX_WEEKLY}次，当前${weekCount}次，注意适当控制。`,
      icon: '⚠️',
    }
  }

  return {
    level: 'danger',
    title: '频率过高',
    message: `建议每周不超过${MAX_WEEKLY}次，当前已${weekCount}次，请注意节制，保护身体健康！`,
    icon: '🚨',
  }
}
