import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: projects }, { data: profile }] = await Promise.all([
    supabase
      .from('projects')
      .select('*, reviews(count)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .single(),
  ])

  const displayName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Developer'
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={displayName}
                className="h-12 w-12 rounded-full ring-2 ring-violet-500/30"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-600/30 text-violet-300 text-lg font-bold">
                {displayName[0].toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-white">
                Hey, {displayName.split(' ')[0]} 👋
              </h1>
              <p className="text-sm text-zinc-500">{user.email}</p>
            </div>
          </div>

          <Link
            href="/projects/new"
            className="rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 transition-colors"
          >
            + New project
          </Link>
        </div>

        {/* Stats */}
        <div className="mb-10 grid grid-cols-3 gap-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center">
            <div className="text-3xl font-bold text-white">{projects?.length ?? 0}</div>
            <div className="mt-1 text-sm text-zinc-500">Projects</div>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center">
            <div className="text-3xl font-bold text-white">
              {projects?.reduce((acc, p) => acc + (p.reviews?.[0]?.count ?? 0), 0) ?? 0}
            </div>
            <div className="mt-1 text-sm text-zinc-500">Reviews received</div>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center">
            <div className="text-3xl font-bold text-violet-400">0</div>
            <div className="mt-1 text-sm text-zinc-500">Reviews given</div>
          </div>
        </div>

        {/* Projects */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-white">Your projects</h2>

          {!projects || projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 p-16 text-center">
              <p className="mb-4 text-zinc-500">No projects yet.</p>
              <Link
                href="/projects/new"
                className="rounded-full bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 transition-colors"
              >
                Submit your first project
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
                  <div className="mb-3 flex items-start justify-between">
                    <h3 className="font-semibold text-white group-hover:text-violet-300 transition-colors line-clamp-1">
                      {project.title}
                    </h3>
                    <span className="ml-2 shrink-0 rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                      {project.reviews?.[0]?.count ?? 0} reviews
                    </span>
                  </div>
                  <p className="mb-4 text-sm text-zinc-500 line-clamp-2">{project.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(project.tech_stack ?? []).slice(0, 3).map((tech: string) => (
                      <span
                        key={tech}
                        className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-400"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
