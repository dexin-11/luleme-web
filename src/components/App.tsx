import { useState, useCallback, useRef } from 'react'
import HomeScreen from './HomeScreen'
import StatisticsScreen from './StatisticsScreen'
import SettingsScreen from './SettingsScreen'
import { useTheme } from '../lib/useTheme'
import type { TabType } from '../lib/types'

const tabs: { id: TabType; label: string; icon: string; activeIcon: string }[] = [
  { id: 'home', label: '首页', icon: 'M12 5.69l5 4.5V18h-2v-6H9v6H7v-7.81l5-4.5M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z', activeIcon: 'M12 5.69l5 4.5V18h-2v-6H9v6H7v-7.81l5-4.5z' },
  { id: 'stats', label: '统计', icon: 'M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z', activeIcon: 'M3 13h2v8H3v-8zm4-4h2v12H7V9zm4-4h2v16h-2V5zm4 8h2v8h-2v-8zm4-4h2v12h-2V9z' },
  { id: 'settings', label: '设置', icon: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 00-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1115.6 12 3.6 3.6 0 0112 15.6z', activeIcon: 'M12 8a4 4 0 100 8 4 4 0 000-8z' },
]

function SvgIcon({ path, className, style }: { path: string; className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={style}>
      <path d={path} />
    </svg>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('stats')
  const { theme, resolved, setTheme } = useTheme()
  const [toast, setToast] = useState<string | null>(null)

  const revealedRef = useRef(false)
  const [revealed, setRevealedState] = useState(() => {
    try {
      const val = localStorage.getItem('luleme_revealed') === '1'
      revealedRef.current = val
      if (val) return val
    } catch {}
    return false
  })

  const setRevealed = (val: boolean) => {
    setRevealedState(val)
    revealedRef.current = val
    try { localStorage.setItem('luleme_revealed', val ? '1' : '0') } catch {}
  }

  const titleTapsRef = useRef({ count: 0, lastTime: 0 })

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2200)
  }

  const handleTitleTap = useCallback(() => {
    const now = Date.now()
    const prev = titleTapsRef.current
    if (now - prev.lastTime > 2000) {
      titleTapsRef.current = { count: 1, lastTime: now }
      return
    }
    if (prev.count + 1 >= 5) {
      const next = !revealedRef.current
      setRevealed(next)
      if (!next) setActiveTab('stats')
      showToast(next ? '🎉 已解锁完整功能' : '🔒 已隐藏')
      titleTapsRef.current = { count: 0, lastTime: 0 }
      return
    }
    titleTapsRef.current = { count: prev.count + 1, lastTime: now }
  }, [])

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--bg)' }}>
      <div
        className="flex-1 overflow-y-auto mx-auto w-full"
        style={{ maxWidth: '540px', paddingBottom: revealed ? '112px' : '20px' }}
      >
        {revealed ? (
          <>
            {activeTab === 'home' && <HomeScreen />}
            {activeTab === 'stats' && <StatisticsScreen onTitleTap={handleTitleTap} />}
            {activeTab === 'settings' && <SettingsScreen theme={theme} resolved={resolved} onThemeChange={setTheme} />}
          </>
        ) : (
          <StatisticsScreen onTitleTap={handleTitleTap} />
        )}
      </div>

      {revealed && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-40 animate-slide-up"
          style={{
            background: 'var(--bg-nav)',
            backdropFilter: 'blur(24px) saturate(1.4)',
            WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
            borderTop: '1px solid var(--border)',
            boxShadow: '0 -4px 24px rgba(0,0,0,0.06)',
          }}
        >
          <div className="mx-auto flex items-end" style={{ maxWidth: '540px', padding: '8px 12px 0' }}>
            {tabs.map(tab => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex-1 flex flex-col items-center relative cursor-pointer"
                  style={{
                    padding: '10px 0 12px',
                    color: isActive ? 'var(--primary)' : 'var(--text-tertiary)',
                    transition: 'color 0.2s',
                    background: 'none',
                    border: 'none',
                  }}
                >
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: '44px',
                      height: '32px',
                      borderRadius: '16px',
                      background: isActive ? 'var(--primary-soft)' : 'transparent',
                      transition: 'background 0.25s, transform 0.2s',
                      transform: isActive ? 'scale(1)' : 'scale(0.92)',
                      marginBottom: '4px',
                    }}
                  >
                    <SvgIcon
                      path={isActive ? tab.activeIcon : tab.icon}
                      style={{ transition: 'transform 0.2s', transform: isActive ? 'scale(1.08)' : 'scale(1)' }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: isActive ? 700 : 500,
                      letterSpacing: '0.02em',
                      transition: 'font-weight 0.2s',
                    }}
                  >
                    {tab.label}
                  </span>
                  {isActive && (
                    <div
                      className="absolute -top-1 left-1/2 -translate-x-1/2"
                      style={{
                        width: '20px',
                        height: '3px',
                        borderRadius: '2px',
                        background: 'var(--primary)',
                        opacity: 0.6,
                      }}
                    />
                  )}
                </button>
              )
            })}
          </div>
          <div className="h-[env(safe-area-inset-bottom)]" />
        </nav>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
