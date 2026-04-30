import { NextRequest, NextResponse } from 'next/server'

const EXCLUDED = new Set([
  'node_modules', 'dist', '.next', 'build', 'out', '.git',
  'coverage', '.turbo', '.vercel',
])

const ALLOWED_EXTENSIONS = new Set([
  'js', 'jsx', 'ts', 'tsx', 'css', 'html', 'json', 'svg', 'md',
])

function isAllowed(path: string): boolean {
  const parts = path.split('/')
  if (parts.some((p) => EXCLUDED.has(p))) return false
  const ext = path.split('.').pop()?.toLowerCase() ?? ''
  return ALLOWED_EXTENSIONS.has(ext)
}

interface GithubTreeItem {
  path: string
  type: string
  sha: string
  size?: number
  url: string
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const githubUrl = searchParams.get('url')

  if (!githubUrl) {
    return NextResponse.json({ error: 'Missing url param' }, { status: 400 })
  }

  const match = githubUrl.trim().match(
    /github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+?)(?:\.git)?(\/tree\/([^?#\s]+))?([?#]|$)/,
  )
  if (!match) {
    return NextResponse.json({ error: 'Invalid GitHub URL' }, { status: 400 })
  }

  const owner = match[1]
  const repo = match[2]
  const branch = match[4] ?? 'HEAD'

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`
  }

  // Fetch the git tree (recursive)
  const treeRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    { headers },
  )

  if (!treeRes.ok) {
    const msg = treeRes.status === 404 ? 'Repository not found' : 'GitHub API error'
    return NextResponse.json({ error: msg }, { status: treeRes.status })
  }

  const tree = await treeRes.json() as { tree: GithubTreeItem[] }
  const blobs = tree.tree
    .filter((item) => item.type === 'blob' && isAllowed(item.path) && (item.size ?? 0) < 100_000)
    .slice(0, 40)

  // Fetch file contents in parallel (batched to avoid rate limits)
  const files: Record<string, string> = {}

  const BATCH = 10
  for (let i = 0; i < blobs.length; i += BATCH) {
    const batch = blobs.slice(i, i + BATCH)
    await Promise.all(
      batch.map(async (item) => {
        const res = await fetch(item.url, { headers })
        if (!res.ok) return
        const data = await res.json() as { content?: string; encoding?: string }
        if (data.encoding === 'base64' && data.content) {
          files[`/${item.path}`] = Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf-8')
        }
      }),
    )
  }

  return NextResponse.json({ files })
}
