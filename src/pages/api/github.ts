import type { APIRoute } from 'astro'

export const prerender = false

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

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json()
    const { action, token, owner, repo, path, branch, content, sha } = body

    if (!token || !owner || !repo || !path) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const baseUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`

    if (action === 'fetch') {
      const url = `${baseUrl}?ref=${branch || 'main'}`
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
        const getUrl = `${baseUrl}?ref=${branch || 'main'}`
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
          branch: branch || 'main',
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
