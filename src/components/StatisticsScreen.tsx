import { useState, useEffect, useCallback } from 'react'
import WeekChart from './WeekChart'
import MonthHeatmap from './MonthHeatmap'
import {
  getDailyCountsBetween,
  getTotalCount,
  calculateMaxStreak,
  calculateAverageFrequency,
  getRecordsByDate,
  deleteRecord,
} from '../lib/storage'
import type { Record } from '../lib/types'

const dayLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

export default function StatisticsScreen() {
  const [weekData, setWeekData] = useState<{ day: string; count: number }[]>([])
  const [monthData, setMonthData] = useState<Map<string, number>>(new Map())
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [totalCount, setTotalCount] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [avgFreq, setAvgFreq] = useState(0)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedRecords, setSelectedRecords] = useState<Record[]>([])

  const refresh = useCallback(() => {
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

    const weekCounts = getDailyCountsBetween(fmt(monday), fmt(sunday))
    const weekArr = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      weekArr.push({ day: dayLabels[i], count: weekCounts.get(fmt(d)) ?? 0 })
    }
    setWeekData(weekArr)

    const monthStart = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1)
    const monthEnd = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0)
    setMonthData(getDailyCountsBetween(fmt(monthStart), fmt(monthEnd)))

    setTotalCount(getTotalCount())
    setMaxStreak(calculateMaxStreak())
    setAvgFreq(calculateAverageFrequency())
  }, [visibleMonth])

  useEffect(() => { refresh() }, [refresh])

  const handleSelectDate = (dateStr: string) => {
    if (selectedDate === dateStr) {
      setSelectedDate(null)
      setSelectedRecords([])
    } else {
      setSelectedDate(dateStr)
      setSelectedRecords(getRecordsByDate(dateStr))
    }
  }

  const handleDelete = async (id: string) => {
    await deleteRecord(id)
    if (selectedDate) setSelectedRecords(getRecordsByDate(selectedDate))
    refresh()
  }

  return (
    <div className="animate-fade-in" style={{ padding: '40px 20px 32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text)', textAlign: 'center', letterSpacing: '-0.02em' }}>
        📈 数据统计
      </h2>

      <div className="grid grid-cols-3" style={{ gap: '10px' }}>
        <StatCard label="总计" value={totalCount} suffix="次" icon="🏆" />
        <StatCard label="最长连续" value={maxStreak} suffix="天" icon="🔥" />
        <StatCard label="周均" value={Math.round(avgFreq * 10) / 10} suffix="次" icon="📊" />
      </div>

      <WeekChart data={weekData} />

      <MonthHeatmap
        monthData={monthData}
        visibleMonth={visibleMonth}
        onPrevMonth={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))}
        onNextMonth={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))}
        onCurrentMonth={() => {
          const now = new Date()
          setVisibleMonth(new Date(now.getFullYear(), now.getMonth(), 1))
        }}
        onSelectDate={handleSelectDate}
      />

      {selectedDate && (
        <div className="card animate-scale-in" style={{ padding: '18px 20px' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '14px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>📅 {selectedDate}</h3>
            <span
              style={{
                fontSize: '11px',
                color: 'var(--primary)',
                background: 'var(--primary-soft)',
                padding: '3px 10px',
                borderRadius: '100px',
                fontWeight: 600,
              }}
            >
              {selectedRecords.length} 条记录
            </span>
          </div>
          {selectedRecords.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', textAlign: 'center', padding: '20px 0', fontWeight: 500 }}>
              暂无记录
            </p>
          ) : (
            <div>
              {[...selectedRecords].sort((a, b) => b.timestamp - a.timestamp).map((r, i) => {
                const t = new Date(r.timestamp)
                const h = String(t.getHours()).padStart(2, '0')
                const m = String(t.getMinutes()).padStart(2, '0')
                return (
                  <div
                    key={r.id}
                    className="flex items-center justify-between group"
                    style={{
                      padding: '10px 12px',
                      borderRadius: '14px',
                      marginBottom: i < selectedRecords.length - 1 ? '4px' : 0,
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div className="flex items-center" style={{ gap: '12px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 6px var(--primary-glow)' }} />
                      <span style={{ fontSize: '14px', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>{h}:{m}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="cursor-pointer"
                      style={{
                        fontSize: '12px',
                        color: 'var(--text-tertiary)',
                        opacity: 0,
                        transition: 'opacity 0.2s, color 0.15s, background 0.15s',
                        padding: '4px 10px',
                        borderRadius: '100px',
                        background: 'none',
                        border: 'none',
                        fontWeight: 500,
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.color = 'var(--danger)'
                        e.currentTarget.style.background = 'var(--danger-soft)'
                        e.currentTarget.style.opacity = '1'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.color = 'var(--text-tertiary)'
                        e.currentTarget.style.background = 'none'
                        e.currentTarget.style.opacity = '0'
                      }}
                      ref={el => { if (el) el.style.opacity = '0' }}
                    >
                      删除
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, suffix, icon }: { label: string; value: number; suffix: string; icon: string }) {
  return (
    <div className="card" style={{ padding: '16px 12px', textAlign: 'center' }}>
      <div style={{ fontSize: '18px', marginBottom: '6px' }}>{icon}</div>
      <div className="flex items-baseline justify-center" style={{ gap: '2px' }}>
        <span
          style={{
            fontSize: '24px',
            fontWeight: 800,
            color: 'var(--text)',
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {value}
        </span>
        <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 500 }}>{suffix}</span>
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '6px', fontWeight: 600, letterSpacing: '0.04em' }}>
        {label}
      </div>
    </div>
  )
}
