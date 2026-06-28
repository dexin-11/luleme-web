import { useState, useEffect, useRef } from 'react'
import {
  exportData,
  importData,
  clearAll,
  initRecords,
} from '../lib/storage'
import {
  getGitHubConfig,
  saveGitHubConfig,
  clearGitHubConfig,
  isGitHubConfigured,
  fetchFromGitHub,
} from '../lib/github'
import type { Theme } from '../lib/useTheme'
import type { GitHubConfig } from '../lib/types'

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

  const [ghConfig, setGhConfig] = useState<GitHubConfig>({ token: '', owner: '', repo: '', path: 'luleme-data.json', branch: 'main' })
  const [ghStatus, setGhStatus] = useState<'idle' | 'testing' | 'ok' | 'error'>('idle')
  const [ghErrorMsg, setGhErrorMsg] = useState('')

  useEffect(() => {
    const saved = getGitHubConfig()
    if (saved) setGhConfig(saved)
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

  const handleTestGitHub = async () => {
    if (!ghConfig.token || !ghConfig.owner || !ghConfig.repo || !ghConfig.path) {
      setGhStatus('error')
      setGhErrorMsg('请填写所有必填字段')
      return
    }
    setGhStatus('testing')
    setGhErrorMsg('')
    saveGitHubConfig(ghConfig)
    const result = await fetchFromGitHub()
    if (result !== null) {
      setGhStatus('ok')
      await initRecords()
      showToast('GitHub 连接成功 ✨')
    } else {
      setGhStatus('error')
      setGhErrorMsg('连接失败，请检查 Token 和仓库信息')
    }
  }

  const handleDisconnectGitHub = () => {
    clearGitHubConfig()
    setGhConfig({ token: '', owner: '', repo: '', path: 'luleme-data.json', branch: 'main' })
    setGhStatus('idle')
    showToast('已断开 GitHub 连接')
  }

  const updateGhField = (field: keyof GitHubConfig, value: string) => {
    setGhConfig(prev => ({ ...prev, [field]: value }))
    setGhStatus('idle')
  }

  const connected = isGitHubConfigured()

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
          {connected && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--success)',
                background: 'var(--success-soft)',
                padding: '4px 12px',
                borderRadius: '100px',
              }}
            >
              ● 已连接
            </span>
          )}
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '16px', lineHeight: 1.7, fontWeight: 500 }}>
          配置 GitHub 仓库后，数据将自动同步到仓库中的 JSON 文件。未配置时使用浏览器本地存储。
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '8px', fontWeight: 600, letterSpacing: '0.04em' }}>
              Personal Access Token
            </label>
            <input
              type="password"
              value={ghConfig.token}
              onChange={e => updateGhField('token', e.target.value)}
              placeholder="ghp_xxxxxxxxxxxx"
              className="input"
            />
          </div>
          <div className="grid grid-cols-2" style={{ gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '8px', fontWeight: 600, letterSpacing: '0.04em' }}>
                Owner
              </label>
              <input
                type="text"
                value={ghConfig.owner}
                onChange={e => updateGhField('owner', e.target.value)}
                placeholder="用户名"
                className="input"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '8px', fontWeight: 600, letterSpacing: '0.04em' }}>
                Repo
              </label>
              <input
                type="text"
                value={ghConfig.repo}
                onChange={e => updateGhField('repo', e.target.value)}
                placeholder="仓库名"
                className="input"
              />
            </div>
          </div>
          <div className="grid grid-cols-2" style={{ gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '8px', fontWeight: 600, letterSpacing: '0.04em' }}>
                文件路径
              </label>
              <input
                type="text"
                value={ghConfig.path}
                onChange={e => updateGhField('path', e.target.value)}
                placeholder="data/records.json"
                className="input"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '8px', fontWeight: 600, letterSpacing: '0.04em' }}>
                分支
              </label>
              <input
                type="text"
                value={ghConfig.branch}
                onChange={e => updateGhField('branch', e.target.value)}
                placeholder="main"
                className="input"
              />
            </div>
          </div>

          {ghStatus === 'error' && (
            <div style={{ fontSize: '12px', color: 'var(--danger)', padding: '10px 14px', background: 'var(--danger-soft)', borderRadius: '14px', fontWeight: 500 }}>
              {ghErrorMsg}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={handleTestGitHub} className="btn btn-primary flex-1" style={{ padding: '12px', fontSize: '13px' }}>
              {ghStatus === 'testing' ? '测试中…' : connected ? '重新连接' : '测试并保存'}
            </button>
            {connected && (
              <button onClick={handleDisconnectGitHub} className="btn btn-outline" style={{ padding: '12px 18px', fontSize: '13px' }}>
                断开
              </button>
            )}
          </div>
        </div>
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
