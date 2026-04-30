import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/server'
import SearchBar from './SearchBar'

// Keep in sync with NewProjectForm TECH_OPTIONS
const TECH_FILTERS = [
  'React', 'Next.js', 'Vue', 'Angular', 'Svelte',
  'TypeScript', 'JavaScript', 'Python', 'Rust', 'Go',
  'Node.js', 'Express', 'FastAPI', 'Django', 'Rails',
  'Tailwind', 'CSS', 'SASS', 'Supabase', 'Firebase',
  'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'AWS',
]

function getGitHubPreviewUrl(githubUrl: string | null): string | null {
  if (!githubUrl) return null
  const match = githubUrl.match(/github\.com\/([^/?#]+\/[^/?#.]+)/)
  if (!match) return null
  return `https://opengraph.githubassets.com/1/${match[1]}`
}

function Stars({ avg, count }: { avg: number | null; count: number }) {
  if (avg === null) return <span className="text-xs text-zinc-600">No reviews yet</span>
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={`text-sm ${i < Math.round(avg) ? 'text-yellow-400' : 'text-zinc-700'}`}>
            ★
          </span>
        ))}
      </div>
      <span className="text-xs text-zinc-400">{avg.toFixed(1)}</span>
      <span className="text-xs text-zinc-600">({count})</span>
    </div>
  )
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ tech?: string; q?: string }>
}) {
  const { tech, q } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('projects')
    .select('*, reviews(rating)')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(24)

  if (tech) {
    query = query.contains('tech_stack', [tech])
  }

  if (q?.trim()) {
    query = query.or(`title.ilike.%${q.trim()}%,description.ilike.%${q.trim()}%`)
  }

  const { data: projects } = await query

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="mb-1 text-3xl font-bold text-white">Browse projects</h1>
            <p className="text-zinc-500">Discover what developers are building and share your feedback.</p>
          </div>
          <Suspense>
            <SearchBar />
          </Suspense>
        </div>

        {/* Tech filter pills */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            href={q ? `/projects?q=${q}` : '/projects'}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              !tech
                ? 'bg-violet-600 text-white'
                : 'border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
            }`}
          >
            All
          </Link>
          {TECH_FILTERS.map((t) => (
            <Link
              key={t}
              href={q ? `/projects?q=${q}&tech=${t}` : `/projects?tech=${t}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                tech === t
                  ? 'bg-violet-600 text-white'
                  : 'border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
              }`}
            >
              {t}
            </Link>
          ))}
        </div>

        {/* Grid */}
        {!projects || projects.length === 0 ? (
          <div className="py-20 text-center text-zinc-500">
            {q
              ? <>No projects found for "{q}". <Link href="/projects" className="text-violet-400 hover:underline">Clear search</Link></>
              : <>No projects found. Be the first to <Link href="/projects/new" className="text-violet-400 hover:underline">submit one!</Link></>
            }
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const reviews = (project.reviews ?? []) as { rating: number }[]
              const reviewCount = reviews.length
              const avgRating = reviewCount > 0
                ? reviews.reduce((a, r) => a + r.rating, 0) / reviewCount
                : null
              const previewUrl = getGitHubPreviewUrl(project.github_url ?? null)

              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 hover:border-zinc-700 transition-colors"
                >
                  {/* Preview image */}
                  <div className="relative h-44 w-full shrink-0 overflow-hidden bg-zinc-800">
                    {previewUrl ? (
                      <Image
                        src={previewUrl}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-violet-900/40 via-zinc-800 to-zinc-900 flex items-center justify-center">
                        <span className="text-4xl opacity-20">{'</>'}</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-white group-hover:text-violet-300 transition-colors line-clamp-1">
                        {project.title}
                      </h3>
                      <div className="shrink-0 flex items-center gap-1 text-xs text-zinc-500">
                        <span>💬</span>
                        <span>{reviewCount}</span>
                      </div>
                    </div>

                    <p className="mb-4 text-sm text-zinc-500 leading-relaxed line-clamp-2 flex-1">
                      {project.description}
                    </p>

                    <div className="mb-4 flex flex-wrap gap-1.5">
                      {(project.tech_stack ?? []).slice(0, 4).map((t: string) => (
                        <span
                          key={t}
                          className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-400"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
                      <Stars avg={avgRating} count={reviewCount} />
                      <div className="flex gap-3">
                        {project.github_url && (
                          <span className="text-xs text-zinc-600">GitHub ↗</span>
                        )}
                        {project.demo_url && (
                          <span className="text-xs text-zinc-600">Demo ↗</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
