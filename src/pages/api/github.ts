import type { APIRoute } from 'astro'

export const prerender = false

interface Env {
  GITHUB_TOKEN: string
  GITHUB_OWNER: string
  GITHUB_REPO: string
  GITHUB_PATH: string
  GITHUB_BRANCH?: string
}

async function githubFetch(token: string, url: string, init?: RequestInit) {
  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'luleme-web',
      ...init?.headers,
    },
  })
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const env = (locals as any).runtime?.env as Env | undefined
    const token = env?.GITHUB_TOKEN
    const owner = env?.GITHUB_OWNER
    const repo = env?.GITHUB_REPO
    const path = env?.GITHUB_PATH
    const branch = env?.GITHUB_BRANCH || 'main'

    if (!token || !owner || !repo || !path) {
      return new Response(JSON.stringify({ error: 'GitHub environment variables not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const body = await request.json()
    const { action, content, sha } = body

    const baseUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`

    if (action === 'fetch') {
      const url = `${baseUrl}?ref=${branch}`
      const res = await githubFetch(token, url)

      if (res.status === 404) {
        return new Response(JSON.stringify({ records: [], sha: '' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      if (!res.ok) {
        return new Response(JSON.stringify({ error: `GitHub API error: ${res.status}` }), {
          status: res.status,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      const data = await res.json()
      const decoded = atob(data.content.replace(/\n/g, ''))
      const records = JSON.parse(decoded)

      return new Response(JSON.stringify({ records, sha: data.sha }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (action === 'push') {
      if (!content) {
        return new Response(JSON.stringify({ error: 'Missing content for push' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      let existingSha = sha
      if (!existingSha) {
        const getUrl = `${baseUrl}?ref=${branch}`
        const getRes = await githubFetch(token, getUrl)
        if (getRes.ok) {
          const existing = await getRes.json()
          existingSha = existing.sha
        }
      }

      const putRes = await githubFetch(token, baseUrl, {
        method: 'PUT',
        body: JSON.stringify({
          message: `update records [${new Date().toISOString().slice(0, 10)}]`,
          content,
          sha: existingSha,
          branch,
        }),
      })

      if (!putRes.ok) {
        const errText = await putRes.text()
        return new Response(JSON.stringify({ error: `GitHub API error: ${putRes.status}`, detail: errText }), {
          status: putRes.status,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      const result = await putRes.json()
      return new Response(JSON.stringify({ sha: result.content?.sha }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (action === 'status') {
      return new Response(JSON.stringify({ configured: true, owner, repo, path, branch }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
