import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/server'
import ReviewForm from './ReviewForm'

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

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, reviewer:reviewer_id(email, raw_user_meta_data)')
    .eq('project_id', id)
    .order('created_at', { ascending: false })

  const { data: { user } } = await supabase.auth.getUser()

  const avgRating =
    reviews && reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : null

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Back */}
        <Link href="/projects" className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition-colors">
          ← Back to projects
        </Link>

        {/* Project header */}
        <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
          <div className="mb-4 flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold text-white">{project.title}</h1>
            {avgRating && (
              <div className="shrink-0 flex items-center gap-1.5 rounded-full bg-violet-600/20 px-3 py-1 text-sm text-violet-300">
                <span>⭐</span>
                <span>{avgRating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <p className="mb-6 text-zinc-400 leading-relaxed">{project.description}</p>

          {/* Tech stack */}
          <div className="mb-6 flex flex-wrap gap-2">
            {(project.tech_stack ?? []).map((tech: string) => (
              <span
                key={tech}
                className="rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-300"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Links */}
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
        </div>

        {/* Reviews section */}
        <div>
          <h2 className="mb-6 text-xl font-semibold text-white">
            Reviews{' '}
            <span className="text-zinc-600 font-normal">({reviews?.length ?? 0})</span>
          </h2>

          {/* Leave a review */}
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

          {/* Reviews list */}
          {reviews && reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-300">
                      Anonymous reviewer
                    </span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={i < review.rating ? 'text-yellow-400' : 'text-zinc-700'}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-zinc-600">
              No reviews yet. Be the first to review this project!
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
