import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/server'

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ tech?: string }>
}) {
  const { tech } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('projects')
    .select('*, reviews(count)')
    .order('created_at', { ascending: false })
    .limit(24)

  if (tech) {
    query = query.contains('tech_stack', [tech])
  }

  const { data: projects } = await query

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-white">Browse projects</h1>
          <p className="text-zinc-500">
            Discover what developers are building and share your feedback.
          </p>
        </div>

        {/* Tech filter pills */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            href="/projects"
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              !tech
                ? 'bg-violet-600 text-white'
                : 'border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
            }`}
          >
            All
          </Link>
          {techFilters.map((t) => (
            <Link
              key={t}
              href={`/projects?tech=${t}`}
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
            No projects found. Be the first to{' '}
            <Link href="/projects/new" className="text-violet-400 hover:underline">
              submit one!
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group rounded-2xl border border-zinc-800 bg-zinc-900 p-6 hover:border-zinc-700 transition-colors"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-white group-hover:text-violet-300 transition-colors line-clamp-1">
                    {project.title}
                  </h3>
                  <div className="shrink-0 flex items-center gap-1 text-xs text-zinc-500">
                    <span>💬</span>
                    <span>{project.reviews?.[0]?.count ?? 0}</span>
                  </div>
                </div>

                <p className="mb-4 text-sm text-zinc-500 leading-relaxed line-clamp-2">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {(project.tech_stack ?? []).slice(0, 4).map((tech: string) => (
                    <span
                      key={tech}
                      className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-400"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {(project.github_url || project.demo_url) && (
                  <div className="mt-4 flex gap-3 border-t border-zinc-800 pt-4">
                    {project.github_url && (
                      <span className="text-xs text-zinc-600">GitHub ↗</span>
                    )}
                    {project.demo_url && (
                      <span className="text-xs text-zinc-600">Live demo ↗</span>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

const techFilters = [
  'React', 'Next.js', 'Vue', 'TypeScript', 'Python',
  'Node.js', 'Tailwind', 'Supabase', 'PostgreSQL',
]
