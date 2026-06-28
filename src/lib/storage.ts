import type { Record } from './types'
import { loadRecords, saveRecords as saveToBackend } from './github'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

let recordsCache: Record[] = []
let loaded = false

export async function initRecords(): Promise<Record[]> {
  recordsCache = await loadRecords()
  loaded = true
  return recordsCache
}

export function getAllRecords(): Record[] {
  return recordsCache
}

export function isLoaded(): boolean {
  return loaded
}

async function persist() {
  await saveToBackend(recordsCache)
}

export async function addRecord(timestamp?: number, note?: string): Promise<Record> {
  const now = Date.now()
  const ts = timestamp ?? now
  const record: Record = {
    id: generateId(),
    timestamp: ts,
    date: formatDate(new Date(ts)),
    note,
    createdAt: now,
    updatedAt: now,
  }
  recordsCache.push(record)
  await persist()
  return record
}

export async function deleteRecord(id: string) {
  recordsCache = recordsCache.filter(r => r.id !== id)
  await persist()
}

export async function updateRecord(record: Record) {
  recordsCache = recordsCache.map(r =>
    r.id === record.id ? { ...record, updatedAt: Date.now() } : r
  )
  await persist()
}

export function getRecordsByDate(dateStr: string): Record[] {
  return recordsCache.filter(r => r.date === dateStr)
}

export function getRecordsBetween(start: string, end: string): Record[] {
  return recordsCache.filter(r => r.date >= start && r.date <= end)
}

export function getDailyCountsBetween(start: string, end: string): Map<string, number> {
  const counts = new Map<string, number>()
  const records = getRecordsBetween(start, end)
  for (const r of records) {
    counts.set(r.date, (counts.get(r.date) ?? 0) + 1)
  }
  return counts
}

export function getRecordDates(): string[] {
  const dates = new Set(recordsCache.map(r => r.date))
  return Array.from(dates).sort()
}

export function getTotalCount(): number {
  return recordsCache.length
}

export function getTodayRecords(): Record[] {
  return getRecordsByDate(formatDate(new Date()))
}

export async function clearAll() {
  recordsCache = []
  await persist()
}

export function exportData(): string {
  return JSON.stringify({
    records: recordsCache,
    exportedAt: Date.now(),
  }, null, 2)
}

export async function importData(json: string): Promise<boolean> {
  try {
    const data = JSON.parse(json)
    if (data.records && Array.isArray(data.records)) {
      recordsCache = data.records
      await persist()
    }
    return true
  } catch {
    return false
  }
}

export function calculateMaxStreak(): number {
  const dates = getRecordDates()
  if (dates.length === 0) return 0

  let maxStreak = 1
  let currentStreak = 1

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1])
    const curr = new Date(dates[i])
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
    if (diff === 1) {
      currentStreak++
      maxStreak = Math.max(maxStreak, currentStreak)
    } else {
      currentStreak = 1
    }
  }

  return maxStreak
}

export function calculateAverageFrequency(): number {
  const total = getTotalCount()
  if (total === 0) return 0
  const dates = getRecordDates()
  const first = dates[0]
  const today = formatDate(new Date())
  const days = Math.max(1, Math.ceil(
    (new Date(today).getTime() - new Date(first).getTime()) / (1000 * 60 * 60 * 24) + 1
  ))
  const weeks = Math.ceil(days / 7)
  return total / weeks
}
