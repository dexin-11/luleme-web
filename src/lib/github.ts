import type { Record } from './types'

const CACHE_KEY = 'luleme_records_cache'
const LAST_SHA_KEY = 'luleme_last_sha'

let githubAvailable: boolean | null = null

function getCache(): Record[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(CACHE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function setCache(records: Record[]) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(records))
}

function getLastSha(): string | null {
  return localStorage.getItem(LAST_SHA_KEY)
}

function setLastSha(sha: string) {
  localStorage.setItem(LAST_SHA_KEY, sha)
}

export async function checkGitHubStatus(): Promise<boolean> {
  try {
    const res = await fetch('/api/github', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'status' }),
    })
    if (!res.ok) return false
    const data = await res.json()
    githubAvailable = !!data.configured
    return githubAvailable
  } catch {
    githubAvailable = false
    return false
  }
}

export function isGitHubConfigured(): boolean {
  return githubAvailable === true
}

export async function fetchFromGitHub(): Promise<{ records: Record[]; sha: string } | null> {
  try {
    const res = await fetch('/api/github', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'fetch' }),
    })

    if (!res.ok) return null

    const data = await res.json()
    if (data.error) return null

    return { records: data.records, sha: data.sha }
  } catch {
    return null
  }
}

export async function pushToGitHub(records: Record[]): Promise<boolean> {
  try {
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(records, null, 2))))

    const res = await fetch('/api/github', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'push',
        content,
        sha: getLastSha(),
      }),
    })

    if (!res.ok) return false

    const data = await res.json()
    if (data.error) return false

    if (data.sha) setLastSha(data.sha)
    setCache(records)
    return true
  } catch {
    return false
  }
}

export async function loadRecords(): Promise<Record[]> {
  if (githubAvailable === null) await checkGitHubStatus()
  if (githubAvailable) {
    const result = await fetchFromGitHub()
    if (result) {
      setCache(result.records)
      if (result.sha) setLastSha(result.sha)
      return result.records
    }
  }
  return getCache()
}

export async function saveRecords(records: Record[]): Promise<void> {
  setCache(records)
  if (githubAvailable) {
    await pushToGitHub(records)
  }
}
