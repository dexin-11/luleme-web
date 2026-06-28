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

async function githubFetch(config: GitHubConfig, url: string, init?: RequestInit) {
  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
}

export async function fetchFromGitHub(): Promise<{ records: Record[]; sha: string } | null> {
  const config = getGitHubConfig()
  if (!config) return null

  try {
    const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.path}?ref=${config.branch}`
    const res = await githubFetch(config, url)

    if (res.status === 404) {
      return { records: [], sha: '' }
    }

    if (!res.ok) return null

    const data = await res.json()
    const content = atob(data.content.replace(/\n/g, ''))
    const records: Record[] = JSON.parse(content)
    return { records, sha: data.sha }
  } catch {
    return null
  }
}

export async function pushToGitHub(records: Record[]): Promise<boolean> {
  const config = getGitHubConfig()
  if (!config) return false

  try {
    const getUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.path}?ref=${config.branch}`
    const getRes = await githubFetch(config, getUrl)

    let sha: string | undefined
    if (getRes.ok) {
      const existing = await getRes.json()
      sha = existing.sha
    }

    const content = btoa(unescape(encodeURIComponent(JSON.stringify(records, null, 2))))
    const putUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.path}`

    const putRes = await githubFetch(config, putUrl, {
      method: 'PUT',
      body: JSON.stringify({
        message: `update records [${new Date().toISOString().slice(0, 10)}]`,
        content,
        sha,
        branch: config.branch,
      }),
    })

    if (putRes.ok) {
      const result = await putRes.json()
      if (result.content?.sha) setLastSha(result.content.sha)
      setCache(records)
      return true
    }

    return false
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
