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

export default function NewProjectForm({ userId }: { userId: string }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [demoUrl, setDemoUrl] = useState('')
  const [selectedTech, setSelectedTech] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  function toggleTech(tech: string) {
    setSelectedTech((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

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
        github_url: githubUrl.trim() || null,
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
        <label className="mb-1.5 block text-sm font-medium text-zinc-300">
          Tech stack
        </label>
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

      {/* Links */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">
            GitHub URL
          </label>
          <input
            type="url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/..."
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-violet-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">
            Live demo URL
          </label>
          <input
            type="url"
            value={demoUrl}
            onChange={(e) => setDemoUrl(e.target.value)}
            placeholder="https://myproject.vercel.app"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-violet-500 focus:outline-none"
          />
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red-800/30 bg-red-900/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-violet-600 py-3 text-sm font-semibold text-white hover:bg-violet-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? 'Submitting...' : 'Submit project'}
      </button>
    </form>
  )
}
