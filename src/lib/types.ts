export interface Record {
  id: string
  timestamp: number
  date: string
  note?: string
  createdAt: number
  updatedAt: number
}

export interface GitHubConfig {
  token: string
  owner: string
  repo: string
  path: string
  branch: string
}

export type TabType = 'home' | 'stats' | 'settings'

export interface WeekData {
  day: string
  count: number
  date: Date
}
