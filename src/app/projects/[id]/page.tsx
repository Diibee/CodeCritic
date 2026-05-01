import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/server'
import { isPremium } from '@/lib/subscription'
import ReviewForm from './ReviewForm'
import ReviewCard from './ReviewCard'
import type { ReviewComment } from './ReviewCard'
import ProjectTabs from './ProjectTabs'
import ProjectOwnerActions from './ProjectOwnerActions'
import AIReviewPanel from './AIReviewPanel'
import AnalyticsPanel, { computeAnalytics } from './AnalyticsPanel'
import ProjectUpdates from './ProjectUpdates'
import type { ProjectUpdate } from './ProjectUpdates'

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('*, ai_review, ai_review_at, is_featured')
    .eq('id', id)
    .single()

  if (!project) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === project.user_id

  if (!project.is_public && !isOwner) notFound()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: false })

  // Reviewer profiles
  const reviewerIds = [...new Set((reviews ?? []).map((r) => r.reviewer_id).filter(Boolean))]
  const { data: reviewerProfiles } = reviewerIds.length > 0
    ? await supabase.from('profiles').select('id, full_name, avatar_url, role').in('id', reviewerIds)
    : { data: [] }
  const profileMap = Object.fromEntries((reviewerProfiles ?? []).map((p) => [p.id, p]))

  // Review votes
  const reviewIds = (reviews ?? []).map((r) => r.id)
  const { data: allVotes } = reviewIds.length > 0
    ? await supabase.from('review_votes').select('review_id, user_id').in('review_id', reviewIds)
    : { data: [] }
  const voteCountMap: Record<string, number> = {}
  const userVotedSet = new Set<string>()
  for (const v of allVotes ?? []) {
    voteCountMap[v.review_id] = (voteCountMap[v.review_id] ?? 0) + 1
    if (v.user_id === user?.id) userVotedSet.add(v.review_id)
  }

  // Review comments
  const { data: rawComments } = reviewIds.length > 0
    ? await supabase
        .from('review_comments')
        .select('id, review_id, user_id, comment, created_at')
        .in('review_id', reviewIds)
        .order('created_at', { ascending: true })
    : { data: [] }
  const commentUserIds = [...new Set((rawComments ?? []).map((c) => c.user_id))]
  const { data: commentProfiles } = commentUserIds.length > 0
    ? await supabase.from('profiles').select('id, full_name').in('id', commentUserIds)
    : { data: [] }
  const commentUserMap = Object.fromEntries((commentProfiles ?? []).map((p) => [p.id, p.full_name]))
  const commentsByReview: Record<string, ReviewComment[]> = {}
  for (const c of rawComments ?? []) {
    if (!commentsByReview[c.review_id]) commentsByReview[c.review_id] = []
    commentsByReview[c.review_id].push({
      id: c.id,
      user_id: c.user_id,
      comment: c.comment,
      created_at: c.created_at,
      user_name: commentUserMap[c.user_id] ?? null,
    })
  }

  // Project updates
  const { data: rawUpdates } = await supabase
    .from('project_updates')
    .select('id, body, created_at')
    .eq('project_id', id)
    .order('created_at', { ascending: false })
  const projectUpdates: ProjectUpdate[] = (rawUpdates ?? []).map((u) => ({
    id: u.id,
    body: u.body,
    created_at: u.created_at,
  }))

  // Current user name (for optimistic comments) + owner profile
  const [{ data: currentProfile }, { data: ownerProfile }] = await Promise.all([
    user
      ? supabase.from('profiles').select('full_name').eq('id', user.id).single()
      : Promise.resolve({ data: null }),
    supabase.from('profiles').select('full_name, avatar_url').eq('id', project.user_id).single(),
  ])

  const avgRating =
    reviews && reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : null

  const demoUrl: string | null = project.demo_url ?? null
  const githubUrl: string | null = project.github_url ?? null

  const ownerIsPremium = isOwner ? await isPremium(project.user_id) : false

  const overview = (
    <div className="space-y-6">
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
              return (
                <ReviewCard
                  key={review.id}
                  projectId={id}
                  review={review}
                  reviewer={reviewer ?? null}
                  voteCount={voteCountMap[review.id] ?? 0}
                  userVoted={userVotedSet.has(review.id)}
                  comments={commentsByReview[review.id] ?? []}
                  currentUserId={user?.id ?? null}
                  currentUserName={currentProfile?.full_name ?? null}
                />
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

  const updatesNode = (
    <ProjectUpdates
      projectId={id}
      initialUpdates={projectUpdates}
      isOwner={isOwner}
    />
  )

  const analyticsNode = isOwner && ownerIsPremium ? (
    <AnalyticsPanel analytics={computeAnalytics(reviews ?? [])} />
  ) : undefined

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
              {project.is_featured && (
                <span className="shrink-0 rounded-full border border-amber-700/60 bg-amber-900/20 px-2.5 py-0.5 text-xs text-amber-400">
                  Featured
                </span>
              )}
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

          {ownerProfile?.full_name && (
            <div className="mb-4 flex items-center gap-2">
              {ownerProfile.avatar_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={ownerProfile.avatar_url}
                  alt={ownerProfile.full_name}
                  className="h-5 w-5 rounded-full"
                />
              )}
              <Link
                href={`/u/${project.user_id}`}
                className="text-sm text-zinc-500 hover:text-violet-400 transition-colors"
              >
                {ownerProfile.full_name}
              </Link>
            </div>
          )}

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
              isFeatured={project.is_featured ?? false}
              isPremium={ownerIsPremium}
            />
          )}
        </div>

        <ProjectTabs
          githubUrl={githubUrl}
          demoUrl={demoUrl}
          overview={overview}
          updates={updatesNode}
          updatesCount={projectUpdates.length}
          aiReview={
            <AIReviewPanel
              projectId={id}
              isOwner={isOwner}
              initialReview={project.ai_review ?? null}
              reviewAt={project.ai_review_at ?? null}
            />
          }
          analytics={analyticsNode}
        />
      </main>
    </div>
  )
}
