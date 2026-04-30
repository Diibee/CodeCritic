import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/server'
import ReviewForm from './ReviewForm'
import ProjectTabs from './ProjectTabs'
import ProjectOwnerActions from './ProjectOwnerActions'

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (!project) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === project.user_id

  // Private projects are only visible to their owner
  if (!project.is_public && !isOwner) notFound()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: false })

  // Fetch reviewer profiles
  const reviewerIds = [...new Set((reviews ?? []).map((r) => r.reviewer_id).filter(Boolean))]
  const { data: reviewerProfiles } = reviewerIds.length > 0
    ? await supabase.from('profiles').select('id, full_name, avatar_url').in('id', reviewerIds)
    : { data: [] }
  const profileMap = Object.fromEntries(
    (reviewerProfiles ?? []).map((p) => [p.id, p])
  )

  const avgRating =
    reviews && reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : null

  const demoUrl: string | null = project.demo_url ?? null
  const githubUrl: string | null = project.github_url ?? null

  const overview = (
    <div className="space-y-6">
      {/* Reviews section */}
      <div>
        <h2 className="mb-6 text-xl font-semibold text-white">
          Reviews{' '}
          <span className="text-zinc-600 font-normal">({reviews?.length ?? 0})</span>
        </h2>

        {user && user.id !== project.user_id && (
          <ReviewForm projectId={id} userId={user.id} />
        )}

        {!user && (
          <div className="mb-8 rounded-xl border border-dashed border-zinc-800 p-6 text-center">
            <p className="text-zinc-500">
              <Link href="/login" className="text-violet-400 hover:underline">Sign in</Link>
              {' '}to leave a review.
            </p>
          </div>
        )}

        {reviews && reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => {
              const reviewer = review.reviewer_id ? profileMap[review.reviewer_id] : null
              const reviewerName = reviewer?.full_name || 'Anonymous'
              return (
                <div key={review.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                  <div className="mb-3 flex items-center justify-between">
                    {review.reviewer_id ? (
                      <Link
                        href={`/u/${review.reviewer_id}`}
                        className="text-sm font-medium text-zinc-300 hover:text-violet-400 transition-colors"
                      >
                        {reviewerName}
                      </Link>
                    ) : (
                      <span className="text-sm font-medium text-zinc-300">{reviewerName}</span>
                    )}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-zinc-700'}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">{review.comment}</p>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-zinc-600">
            No reviews yet. Be the first to review this project!
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/projects" className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition-colors">
          ← Back to projects
        </Link>

        {/* Project header */}
        <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <h1 className="text-2xl font-bold text-white">{project.title}</h1>
              {!project.is_public && (
                <span className="shrink-0 rounded-full border border-yellow-800/60 bg-yellow-900/20 px-2.5 py-0.5 text-xs text-yellow-400">
                  Private
                </span>
              )}
            </div>
            {avgRating && (
              <div className="shrink-0 flex items-center gap-1.5 rounded-full bg-violet-600/20 px-3 py-1 text-sm text-violet-300">
                <span>⭐</span>
                <span>{avgRating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <p className="mb-6 text-zinc-400 leading-relaxed">{project.description}</p>

          <div className="mb-6 flex flex-wrap gap-2">
            {(project.tech_stack ?? []).map((tech: string) => (
              <span key={tech} className="rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-300">
                {tech}
              </span>
            ))}
          </div>

          <div className="flex gap-4">
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
              >
                GitHub →
              </a>
            )}
            {project.demo_url && (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-colors"
              >
                Live demo →
              </a>
            )}
          </div>

          {isOwner && (
            <ProjectOwnerActions
              projectId={project.id}
              isPublic={project.is_public ?? true}
            />
          )}
        </div>

        {/* Tabs: Overview + Preview */}
        <ProjectTabs githubUrl={githubUrl} demoUrl={demoUrl} overview={overview} />
      </main>
    </div>
  )
}
