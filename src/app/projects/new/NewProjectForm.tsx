'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const TECH_OPTIONS = [
  'React', 'Next.js', 'Vue', 'Angular', 'Svelte',
  'TypeScript', 'JavaScript', 'Python', 'Rust', 'Go',
  'Node.js', 'Express', 'FastAPI', 'Django', 'Rails',
  'Tailwind', 'CSS', 'SASS', 'Supabase', 'Firebase',
  'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'AWS',
]

type GitHubRepo = {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  language: string | null
  private: boolean
  topics: string[]
  stargazers_count: number
  updated_at: string
  fork: boolean
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
  const [selectedTech, setSelectedTech] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [reposLoading, setReposLoading] = useState(true)
  const [reposError, setReposError] = useState(false)
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function fetchRepos() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.provider_token
      if (!token) {
        setReposError(true)
        setReposLoading(false)
        return
      }
      try {
        const res = await fetch(
          'https://api.github.com/user/repos?per_page=100&sort=updated&type=owner',
          { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' } }
        )
        if (!res.ok) throw new Error()
        const data: GitHubRepo[] = await res.json()
        setRepos(data.filter((r) => !r.fork))
      } catch {
        setReposError(true)
      } finally {
        setReposLoading(false)
      }
    }
    fetchRepos()
  }, [])

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  useEffect(() => {
    if (dropdownOpen) setTimeout(() => searchRef.current?.focus(), 50)
  }, [dropdownOpen])

  function selectRepo(repo: GitHubRepo) {
    setSelectedRepo(repo)
    setDropdownOpen(false)
    setSearch('')

    setTitle(repo.name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()))
    if (repo.description) setDescription(repo.description)

    const tags = [repo.language, ...(repo.topics ?? [])].filter(Boolean) as string[]
    const matched = TECH_OPTIONS.filter((t) =>
      tags.some((tag) => tag.toLowerCase() === t.toLowerCase())
    )
    if (matched.length > 0) {
      setSelectedTech((prev) => [...new Set([...prev, ...matched])])
    }
  }

  function toggleTech(tech: string) {
    setSelectedTech((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!selectedRepo) {
      setError('Please select a repository.')
      return
    }
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required.')
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
        github_url: selectedRepo.html_url,
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

  const filteredRepos = repos.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.description ?? '').toLowerCase().includes(search.toLowerCase())
  )

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

      {/* Repository picker */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-300">
          Repository <span className="text-red-400">*</span>
        </label>
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={() => !reposError && setDropdownOpen((v) => !v)}
            disabled={reposLoading}
            className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm transition-colors disabled:opacity-50 ${
              selectedRepo
                ? 'border-violet-600/60 bg-zinc-900 text-white'
                : 'border-zinc-700 bg-zinc-900 text-zinc-500 hover:border-zinc-600'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {reposLoading ? (
                <span className="text-zinc-500">Loading repositories…</span>
              ) : reposError ? (
                <span className="text-zinc-600">Could not load repositories</span>
              ) : selectedRepo ? (
                <>
                  {selectedRepo.private && (
                    <span className="shrink-0 rounded border border-zinc-700 px-1.5 py-0.5 text-[10px] text-zinc-500">Private</span>
                  )}
                  <span className="font-medium text-white truncate">{selectedRepo.name}</span>
                  {selectedRepo.language && (
                    <span className="shrink-0 text-xs text-zinc-500">{selectedRepo.language}</span>
                  )}
                </>
              ) : (
                <span>Select a repository…</span>
              )}
            </div>
            {!reposError && (
              <svg
                width="12" height="12" viewBox="0 0 12 12" fill="none"
                className={`shrink-0 text-zinc-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
              >
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 right-0 top-full z-20 mt-1.5 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl">
              {/* Search bar */}
              <div className="border-b border-zinc-800 p-2">
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search repositories…"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-violet-500 focus:outline-none"
                />
              </div>
              {/* List */}
              <div className="max-h-64 overflow-y-auto">
                {filteredRepos.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-zinc-600">
                    {search ? `No repos matching "${search}"` : 'No repositories found.'}
                  </div>
                ) : (
                  filteredRepos.map((repo) => (
                    <button
                      key={repo.id}
                      type="button"
                      onClick={() => selectRepo(repo)}
                      className={`flex w-full flex-col gap-0.5 px-4 py-3 text-left transition-colors hover:bg-zinc-800/60 ${
                        selectedRepo?.id === repo.id ? 'bg-violet-600/10' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {repo.private && (
                          <span className="shrink-0 rounded border border-zinc-700 px-1 py-0.5 text-[10px] text-zinc-500">Private</span>
                        )}
                        <span className="font-medium text-white text-sm truncate">{repo.name}</span>
                        <div className="ml-auto flex items-center gap-2 shrink-0">
                          {repo.language && (
                            <span className="text-xs text-zinc-500">{repo.language}</span>
                          )}
                          {repo.stargazers_count > 0 && (
                            <span className="text-xs text-zinc-600">⭐ {repo.stargazers_count}</span>
                          )}
                          {selectedRepo?.id === repo.id && (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-violet-400">
                              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                      </div>
                      {repo.description && (
                        <p className="text-xs text-zinc-500 line-clamp-1 pr-2">{repo.description}</p>
                      )}
                    </button>
                  ))
                )}
              </div>
              <div className="border-t border-zinc-800 px-4 py-2 text-[11px] text-zinc-600">
                Showing {filteredRepos.length} of {repos.length} repos · sorted by recently updated
              </div>
            </div>
          )}
        </div>
        {reposError && (
          <p className="mt-1.5 text-xs text-zinc-600">
            Unable to load repositories. Try signing out and back in with GitHub.
          </p>
        )}
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
          Description <span className="text-sm font-normal text-zinc-600 ml-1">(tell reviewers what you built and what feedback you want)</span>
          <span className="text-red-400"> *</span>
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
        disabled={loading || !selectedRepo}
        className="w-full rounded-full bg-violet-600 py-3 text-sm font-semibold text-white hover:bg-violet-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? 'Submitting…' : 'Submit project'}
      </button>
    </form>
  )
}
