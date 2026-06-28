import type { Record, GitHubConfig } from './types'

const CONFIG_KEY = 'luleme_github_config'
const CACHE_KEY = 'luleme_records_cache'
const LAST_SHA_KEY = 'luleme_last_sha'

export function getGitHubConfig(): GitHubConfig | null {
  if (typeof window === 'undefined') return null
  try {
    const data = localStorage.getItem(CONFIG_KEY)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

export function saveGitHubConfig(config: GitHubConfig) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
}

export function clearGitHubConfig() {
  localStorage.removeItem(CONFIG_KEY)
}

export function isGitHubConfigured(): boolean {
  const c = getGitHubConfig()
  return !!(c?.token && c?.owner && c?.repo && c?.path)
}

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

export async function fetchFromGitHub(): Promise<{ records: Record[]; sha: string } | null> {
  const config = getGitHubConfig()
  if (!config) return null

  try {
    const res = await fetch('/api/github', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'fetch',
        token: config.token,
        owner: config.owner,
        repo: config.repo,
        path: config.path,
        branch: config.branch,
      }),
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
  const config = getGitHubConfig()
  if (!config) return false

  try {
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(records, null, 2))))

    const res = await fetch('/api/github', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'push',
        token: config.token,
        owner: config.owner,
        repo: config.repo,
        path: config.path,
        branch: config.branch,
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
  if (isGitHubConfigured()) {
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
  if (isGitHubConfigured()) {
    await pushToGitHub(records)
  }
}
