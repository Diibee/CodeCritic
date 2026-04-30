'use client'

import { useEffect, useState } from 'react'
import {
  SandpackProvider,
  SandpackPreview,
} from '@codesandbox/sandpack-react'

type Template = 'react' | 'react-ts' | 'vue' | 'vanilla' | 'static'

// Pin p5 to v1.x — registerMethod was removed in v2.0
const CDN_REPLACEMENTS: [RegExp, string][] = [
  [/src=["'][^"']*\bp5\.min\.js["']/g,       'src="https://cdn.jsdelivr.net/npm/p5@1/lib/p5.min.js"'],
  [/src=["'][^"']*\bp5\.js["']/g,            'src="https://cdn.jsdelivr.net/npm/p5@1/lib/p5.js"'],
  [/src=["'][^"']*\bp5\.sound\.min\.js["']/g,'src="https://cdn.jsdelivr.net/npm/p5@1/lib/addons/p5.sound.min.js"'],
  [/src=["'][^"']*\bp5\.sound\.js["']/g,     'src="https://cdn.jsdelivr.net/npm/p5@1/lib/addons/p5.sound.js"'],
  [/src=["'][^"']*\bthree\.min\.js["']/g,    'src="https://cdn.jsdelivr.net/npm/three/build/three.min.js"'],
  [/src=["'][^"']*\bthree\.js["']/g,         'src="https://cdn.jsdelivr.net/npm/three/build/three.js"'],
]

// Files that get CDN-replaced should be removed from the virtual FS to prevent double loading
const CDN_FILENAME_PATTERNS = [
  /\bp5\.min\.js$/,
  /\bp5\.js$/,
  /\bp5\.sound\.min\.js$/,
  /\bp5\.sound\.js$/,
  /\bthree\.min\.js$/,
  /\bthree\.js$/,
]

function patchFiles(files: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [path, content] of Object.entries(files)) {
    if (path.endsWith('.html')) {
      let patched = content
      for (const [pattern, replacement] of CDN_REPLACEMENTS) {
        patched = patched.replace(pattern, replacement)
      }
      result[path] = patched
    } else if (!CDN_FILENAME_PATTERNS.some((p) => p.test(path))) {
      // Drop local copies of CDN-replaced libs to avoid double-loading
      result[path] = content
    }
  }
  return result
}

function detectTemplate(files: Record<string, string>): Template {
  const pkg = files['/package.json']
  if (!pkg) return 'static'
  try {
    const json = JSON.parse(pkg) as { dependencies?: Record<string, string> }
    const deps = Object.keys(json.dependencies ?? {})
    if (deps.includes('react') || deps.includes('react-dom')) {
      return deps.includes('typescript') || !!files['/tsconfig.json'] ? 'react-ts' : 'react'
    }
    if (deps.includes('vue')) return 'vue'
    return 'vanilla'
  } catch {
    return 'static'
  }
}

export default function SandpackEmbed({ githubUrl }: { githubUrl: string }) {
  const [files, setFiles] = useState<Record<string, string> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`/api/github-files?url=${encodeURIComponent(githubUrl)}`)
      .then((r) => r.json())
      .then((data: { files?: Record<string, string>; error?: string }) => {
        if (data.error) {
          setError(data.error)
        } else if (data.files && Object.keys(data.files).length === 0) {
          setError('No supported source files found in this repository.')
        } else {
          setFiles(patchFiles(data.files ?? {}))
        }
      })
      .catch(() => setError('Failed to fetch repository files.'))
      .finally(() => setLoading(false))
  }, [githubUrl])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 py-20 text-center">
        <div className="mb-3 text-4xl animate-spin">⟳</div>
        <p className="text-sm text-zinc-400">Fetching repository files…</p>
      </div>
    )
  }

  if (error || !files) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/50 py-20 text-center">
        <div className="mb-3 text-4xl">⚠️</div>
        <p className="text-sm text-zinc-400 max-w-sm">{error ?? 'Unknown error'}</p>
        <p className="mt-2 text-xs text-zinc-600">
          Only front-end projects (React, Vue, HTML/JS) can be previewed.
        </p>
      </div>
    )
  }

  const template = detectTemplate(files)

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800">
      <SandpackProvider
        files={files}
        template={template}
        theme="dark"
        options={{ recompileMode: 'delayed', recompileDelay: 500 }}
      >
        <SandpackPreview
          style={{ height: 700 }}
          showNavigator={false}
          showRefreshButton
          showOpenInCodeSandbox={false}
        />
      </SandpackProvider>
    </div>
  )
}
