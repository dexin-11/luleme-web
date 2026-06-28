import { useState, useEffect, useCallback } from 'react'
import RecordButton from './RecordButton'
import TodayRecords from './TodayRecords'
import HealthAdviceCard from './HealthAdviceCard'
import BackfillModal from './BackfillModal'
import {
  initRecords,
  addRecord,
  deleteRecord,
  getTodayRecords,
  getDailyCountsBetween,
} from '../lib/storage'
import { isGitHubConfigured } from '../lib/github'
import type { Record } from '../lib/types'

export default function HomeScreen() {
  const [todayRecords, setTodayRecords] = useState<Record[]>([])
  const [weekCount, setWeekCount] = useState(0)
  const [showBackfill, setShowBackfill] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  const refresh = useCallback(async () => {
    if (!isGitHubConfigured() && !loading) {
      setTodayRecords(getTodayRecords())
      return
    }
    setSyncing(true)
    try {
      await initRecords()
    } finally {
      setSyncing(false)
    }
    setTodayRecords(getTodayRecords())

    const now = new Date()
    const day = now.getDay()
    const monday = new Date(now)
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)

    const fmt = (d: Date) => {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${dd}`
    }

    const counts = getDailyCountsBetween(fmt(monday), fmt(sunday))
    let total = 0
    counts.forEach(v => { total += v })
    setWeekCount(total)
    setLoading(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2200)
  }

  const handleRecord = async () => {
    await addRecord()
    setTodayRecords(getTodayRecords())
    refresh()
    showToast('记录成功 ✨')
  }

  const handleDelete = async (id: string) => {
    await deleteRecord(id)
    setTodayRecords(getTodayRecords())
    refresh()
    showToast('已撤销')
  }

  const handleBackfill = async (timestamp: number) => {
    await addRecord(timestamp)
    setShowBackfill(false)
    setTodayRecords(getTodayRecords())
    refresh()
    showToast('补录成功 ✨')
  }

  return (
    <div className="animate-fade-in" style={{ padding: '40px 20px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px' }}>
      <div className="text-center">
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
          撸了么
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '6px', fontWeight: 500, letterSpacing: '0.04em' }}>
          健康记录，科学管理
          {syncing && (
            <span style={{ marginLeft: '10px', opacity: 0.5, fontSize: '12px' }}>⟳ 同步中…</span>
          )}
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '80px 0', color: 'var(--text-tertiary)', fontSize: '14px', fontWeight: 500 }}>
          加载中…
        </div>
      ) : (
        <>
          <RecordButton onRecord={handleRecord} todayCount={todayRecords.length} />

          <button
            onClick={() => setShowBackfill(true)}
            className="btn btn-ghost"
            style={{
              fontSize: '13px',
              padding: '8px 20px',
              borderRadius: '100px',
              fontWeight: 500,
              letterSpacing: '0.02em',
            }}
          >
            补录历史记录 →
          </button>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <HealthAdviceCard weekCount={weekCount} />
            <TodayRecords records={todayRecords} onDelete={handleDelete} />
          </div>
        </>
      )}

      {showBackfill && (
        <BackfillModal onConfirm={handleBackfill} onClose={() => setShowBackfill(false)} />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
