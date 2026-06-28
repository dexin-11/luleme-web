import { useState, useEffect, useRef } from 'react'
import {
  exportData,
  importData,
  clearAll,
  initRecords,
} from '../lib/storage'
import { checkGitHubStatus, isGitHubConfigured } from '../lib/github'
import type { Theme } from '../lib/useTheme'

interface Props {
  theme: Theme
  resolved: 'light' | 'dark'
  onThemeChange: (t: Theme) => void
}

const themeOptions: { value: Theme; label: string; icon: string }[] = [
  { value: 'light', label: '浅色', icon: '☀️' },
  { value: 'dark', label: '深色', icon: '🌙' },
  { value: 'system', label: '跟随系统', icon: '💻' },
]

export default function SettingsScreen({ theme, resolved, onThemeChange }: Props) {
  const [toast, setToast] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [githubOk, setGithubOk] = useState(false)

  useEffect(() => {
    checkGitHubStatus().then(setGithubOk)
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2200)
  }

  const handleExport = () => {
    const data = exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `luleme-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('导出成功')
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      const success = await importData(reader.result as string)
      showToast(success ? '导入成功' : '导入失败，文件格式错误')
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleClearAll = async () => {
    await clearAll()
    setShowConfirm(false)
    showToast('数据已清除')
  }

  const handleRefreshStatus = async () => {
    const ok = await checkGitHubStatus()
    setGithubOk(ok)
    showToast(ok ? 'GitHub 已连接' : 'GitHub 未配置')
  }

  return (
    <div className="animate-fade-in" style={{ padding: '40px 20px 32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text)', textAlign: 'center', letterSpacing: '-0.02em' }}>
        ⚙️ 设置
      </h2>

      <div className="card" style={{ padding: '22px 20px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          外观
        </h3>
        <div className="grid grid-cols-3" style={{ gap: '8px' }}>
          {themeOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => onThemeChange(opt.value)}
              className="flex flex-col items-center cursor-pointer"
              style={{
                padding: '16px 8px',
                borderRadius: '16px',
                border: `2px solid ${theme === opt.value ? 'var(--primary)' : 'var(--border)'}`,
                background: theme === opt.value ? 'var(--primary-soft)' : 'transparent',
                color: theme === opt.value ? 'var(--primary)' : 'var(--text-secondary)',
                transition: 'all 0.2s',
                boxShadow: theme === opt.value ? 'var(--shadow-sm)' : 'none',
              }}
            >
              <span style={{ fontSize: '24px', marginBottom: '8px' }}>{opt.icon}</span>
              <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.02em' }}>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: '22px 20px' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            GitHub 存储
          </h3>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: githubOk ? 'var(--success)' : 'var(--text-tertiary)',
              background: githubOk ? 'var(--success-soft)' : 'var(--border)',
              padding: '4px 12px',
              borderRadius: '100px',
            }}
          >
            {githubOk ? '● 已连接' : '○ 未配置'}
          </span>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '16px', lineHeight: 1.7, fontWeight: 500 }}>
          GitHub 同步通过环境变量配置，在 Cloudflare Pages 后台设置以下变量即可启用：
        </p>
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '12px',
          padding: '14px',
          marginBottom: '16px',
          fontSize: '12px',
          fontFamily: 'monospace',
          color: 'var(--text-secondary)',
          lineHeight: 2,
        }}>
          <div>GITHUB_TOKEN</div>
          <div>GITHUB_OWNER</div>
          <div>GITHUB_REPO</div>
          <div>GITHUB_PATH</div>
          <div>GITHUB_BRANCH</div>
        </div>
        <button onClick={handleRefreshStatus} className="btn btn-outline w-full" style={{ padding: '12px', fontSize: '13px' }}>
          刷新连接状态
        </button>
      </div>

      <div className="card" style={{ padding: '22px 20px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          数据管理
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <MenuItem icon="📤" label="导出 JSON" onClick={handleExport} />
          <MenuItem icon="📥" label="导入 JSON" onClick={() => fileInputRef.current?.click()} />
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          <MenuItem icon="🗑️" label="清除所有数据" danger onClick={() => setShowConfirm(true)} />
        </div>
      </div>

      <div className="card" style={{ padding: '22px 20px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          关于
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, fontWeight: 500 }}>
          <p>撸了么 Web v1.2.0</p>
          <p>数据默认存储在浏览器本地，配置 GitHub 后自动同步到仓库。</p>
          <p style={{ color: 'var(--text-tertiary)' }}>
            基于{' '}
            <a href="https://github.com/sky22333/luleme" target="_blank" rel="noopener" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
              luleme
            </a>
            {' '}项目改编
          </p>
        </div>
      </div>

      {showConfirm && (
        <div className="overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)', marginBottom: '8px' }}>⚠️ 确认清除</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.7, fontWeight: 500 }}>
              此操作不可恢复，本地缓存将被清除。如已配置 GitHub，远程数据不受影响。
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="btn btn-outline flex-1" style={{ padding: '12px', fontSize: '14px' }}>
                取消
              </button>
              <button onClick={handleClearAll} className="btn flex-1" style={{ padding: '12px', fontSize: '14px', background: 'var(--danger)', color: 'white', fontWeight: 600 }}>
                确认清除
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

function MenuItem({ icon, label, danger, onClick }: { icon: string; label: string; danger?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full cursor-pointer"
      style={{
        padding: '14px',
        borderRadius: '14px',
        background: danger ? 'var(--danger-soft)' : 'transparent',
        border: 'none',
        transition: 'background 0.2s, transform 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = danger ? 'var(--danger-soft)' : 'var(--bg-card-hover)'
        e.currentTarget.style.transform = 'translateX(2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = danger ? 'var(--danger-soft)' : 'transparent'
        e.currentTarget.style.transform = 'translateX(0)'
      }}
    >
      <div className="flex items-center" style={{ gap: '14px' }}>
        <span style={{ fontSize: '18px' }}>{icon}</span>
        <span style={{ fontSize: '14px', fontWeight: 600, color: danger ? 'var(--danger)' : 'var(--text)' }}>{label}</span>
      </div>
      <span style={{ fontSize: '14px', color: 'var(--text-tertiary)', transition: 'transform 0.2s' }}>→</span>
    </button>
  )
}
