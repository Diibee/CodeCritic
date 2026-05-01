'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const TECH_OPTIONS = [
  'React', 'Next.js', 'Vue', 'Angular', 'Svelte',
  'TypeScript', 'JavaScript', 'Python', 'Rust', 'Go',
  'Node.js', 'Express', 'FastAPI', 'Django', 'Rails',
  'Tailwind', 'CSS', 'SASS', 'Supabase', 'Firebase',
  'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'AWS',
]

function extractGithubOwner(url: string): string | null {
  const match = url.trim().match(/github\.com\/([^/?#\s]+)\//)
  return match ? match[1] : null
}

function extractGithubRepo(url: string): { owner: string; repo: string } | null {
  const match = url.trim().match(/github\.com\/([^/?#\s]+)\/([^/?#\s.]+)/)
  return match ? { owner: match[1], repo: match[2] } : null
}

export default function NewProjectForm({
  userId,
  githubUsername,
}: {
  userId: string
  githubUsername: string
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [demoUrl, setDemoUrl] = useState('')
  const [selectedTech, setSelectedTech] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const urlOwner = extractGithubOwner(githubUrl)
  const ownerMismatch =
    githubUrl.trim().length > 0 &&
    urlOwner !== null &&
    urlOwner.toLowerCase() !== githubUsername.toLowerCase()
  const ownerOk =
    githubUrl.trim().length > 0 &&
    urlOwner !== null &&
    urlOwner.toLowerCase() === githubUsername.toLowerCase()

  function toggleTech(tech: string) {
    setSelectedTech((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    )
  }

  async function importFromGitHub() {
    const parsed = extractGithubRepo(githubUrl)
    if (!parsed) return
    setImporting(true)
    try {
      const res = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`)
      if (!res.ok) throw new Error('Could not fetch repo')
      const data = await res.json()

      if (!title.trim() && data.name) {
        setTitle(data.name.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()))
      }
      if (!description.trim() && data.description) {
        setDescription(data.description)
      }

      const topics: string[] = data.topics ?? []
      const language: string | null = data.language ?? null
      const matched = TECH_OPTIONS.filter((t) =>
        topics.some((topic) => topic.toLowerCase() === t.toLowerCase()) ||
        (language && language.toLowerCase() === t.toLowerCase())
      )
      if (matched.length > 0) {
        setSelectedTech((prev) => [...new Set([...prev, ...matched])])
      }
    } catch {
      // silently fail — user can fill in manually
    } finally {
      setImporting(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!title.trim() || !description.trim()) {
      setError('Title and description are required.')
      return
    }

    if (!githubUrl.trim()) {
      setError('GitHub URL is required.')
      return
    }

    if (ownerMismatch) {
      setError(`This repository doesn't belong to your GitHub account (@${githubUsername}).`)
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { data, error: err } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        title: title.trim(),
        description: description.trim(),
        github_url: githubUrl.trim(),
        demo_url: demoUrl.trim() || null,
        tech_stack: selectedTech,
      })
      .select('id')
      .single()

    setLoading(false)

    if (err || !data) {
      setError('Something went wrong. Please try again.')
      return
    }

    router.push(`/projects/${data.id}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* GitHub account badge */}
      <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-white">
          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
        <span className="text-zinc-400">Submitting as</span>
        <span className="font-medium text-white">@{githubUsername}</span>
        <span className="ml-auto text-xs text-zinc-600">Only your repos are accepted</span>
      </div>

      {/* Links (GitHub first so we can import) */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">
            GitHub URL <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder={`https://github.com/${githubUsername}/...`}
              className={`w-full rounded-xl border bg-zinc-900 px-4 py-3 pr-10 text-sm text-white placeholder-zinc-600 focus:outline-none ${
                ownerMismatch
                  ? 'border-red-600 focus:border-red-500'
                  : ownerOk
                  ? 'border-green-600 focus:border-green-500'
                  : 'border-zinc-700 focus:border-violet-500'
              }`}
              required
            />
            {(ownerMismatch || ownerOk) && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
                {ownerOk ? '✓' : '✗'}
              </span>
            )}
          </div>
          {ownerMismatch && (
            <p className="mt-1.5 text-xs text-red-400">
              This repo belongs to @{urlOwner}, not @{githubUsername}.
            </p>
          )}
          {ownerOk && (
            <div className="mt-1.5 flex items-center justify-between">
              <p className="text-xs text-green-400">Verified: repo belongs to @{githubUsername}.</p>
              <button
                type="button"
                onClick={importFromGitHub}
                disabled={importing}
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors disabled:opacity-40"
              >
                {importing ? 'Importing…' : '✨ Import from GitHub'}
              </button>
            </div>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">Live demo URL</label>
          <input
            type="url"
            value={demoUrl}
            onChange={(e) => setDemoUrl(e.target.value)}
            placeholder="https://myproject.vercel.app"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-violet-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-300">
          Project title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="My awesome project"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-violet-500 focus:outline-none"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-300">
          Description <span className="text-red-400">*</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What does your project do? What problem does it solve? What did you learn building it?"
          rows={5}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-violet-500 focus:outline-none resize-none"
          required
        />
      </div>

      {/* Tech stack */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-300">Tech stack</label>
        <div className="flex flex-wrap gap-2">
          {TECH_OPTIONS.map((tech) => (
            <button
              key={tech}
              type="button"
              onClick={() => toggleTech(tech)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                selectedTech.includes(tech)
                  ? 'bg-violet-600 text-white'
                  : 'border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
              }`}
            >
              {tech}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red-800/30 bg-red-900/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || ownerMismatch}
        className="w-full rounded-full bg-violet-600 py-3 text-sm font-semibold text-white hover:bg-violet-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? 'Submitting...' : 'Submit project'}
      </button>
    </form>
  )
}
