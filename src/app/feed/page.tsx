import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/server'

function getGitHubPreviewUrl(githubUrl: string | null): string | null {
  if (!githubUrl) return null
  const match = githubUrl.match(/github\.com\/([^/?#]+\/[^/?#.]+)/)
  if (!match) return null
  return `https://opengraph.githubassets.com/1/${match[1]}`
}

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get who the current user follows
  const { data: followRows } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id)

  const followingIds = (followRows ?? []).map((f) => f.following_id)

  if (followingIds.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8 text-center">
          <p className="text-4xl mb-4">👥</p>
          <h1 className="text-xl font-semibold text-white mb-2">Your feed is empty</h1>
          <p className="text-zinc-500 mb-6">
            Follow other developers to see their projects and reviews here.
          </p>
          <Link
            href="/projects"
            className="rounded-full bg-violet-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-violet-500 transition-colors"
          >
            Browse projects
          </Link>
        </main>
      </div>
    )
  }

  // Fetch recent projects and reviews from followed users (last 90 days)
  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()

  const [{ data: recentProjects }, { data: recentReviews }] = await Promise.all([
    supabase
      .from('projects')
      .select('id, title, description, github_url, tech_stack, created_at, user_id, is_featured')
      .in('user_id', followingIds)
      .eq('is_public', true)
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(30),
    supabase
      .from('reviews')
      .select('id, project_id, reviewer_id, rating, comment, created_at')
      .in('reviewer_id', followingIds)
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(30),
  ])

  // Fetch profiles for all people in feed
  const allUserIds = [...new Set([
    ...(recentProjects ?? []).map((p) => p.user_id),
    ...(recentReviews ?? []).map((r) => r.reviewer_id),
  ])]
  const { data: feedProfiles } = allUserIds.length > 0
    ? await supabase.from('profiles').select('id, full_name, avatar_url').in('id', allUserIds)
    : { data: [] }
  const profileMap = Object.fromEntries((feedProfiles ?? []).map((p) => [p.id, p]))

  // Fetch project titles for reviewed projects
  const reviewedProjectIds = [...new Set((recentReviews ?? []).map((r) => r.project_id))]
  const { data: reviewedProjects } = reviewedProjectIds.length > 0
    ? await supabase.from('projects').select('id, title').in('id', reviewedProjectIds)
    : { data: [] }
  const projectTitleMap = Object.fromEntries((reviewedProjects ?? []).map((p) => [p.id, p.title]))

  // Merge and sort by date
  type FeedItem =
    | { type: 'project'; date: string; data: NonNullable<typeof recentProjects>[number] }
    | { type: 'review'; date: string; data: NonNullable<typeof recentReviews>[number] }

  const feed: FeedItem[] = [
    ...(recentProjects ?? []).map((p) => ({ type: 'project' as const, date: p.created_at, data: p })),
    ...(recentReviews ?? []).map((r) => ({ type: 'review' as const, date: r.created_at, data: r })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Your Feed</h1>
          <p className="mt-1 text-sm text-zinc-500">Recent activity from people you follow.</p>
        </div>

        {feed.length === 0 ? (
          <div className="py-16 text-center text-zinc-600">
            No recent activity from the people you follow. Check back later!
          </div>
        ) : (
          <div className="space-y-4">
            {feed.map((item) => {
              if (item.type === 'project') {
                const p = item.data
                const author = profileMap[p.user_id]
                const previewUrl = getGitHubPreviewUrl(p.github_url ?? null)
                return (
                  <div key={`project-${p.id}`} className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
                    {/* Author row */}
                    <div className="flex items-center gap-2 px-5 py-3 border-b border-zinc-800">
                      {author?.avatar_url ? (
                        <Image src={author.avatar_url} alt={author.full_name ?? ''} width={24} height={24} className="h-6 w-6 rounded-full object-cover" />
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                          {(author?.full_name ?? 'A')[0].toUpperCase()}
                        </div>
                      )}
                      <Link href={`/u/${p.user_id}`} className="text-sm font-medium text-zinc-300 hover:text-violet-400 transition-colors">
                        {author?.full_name ?? 'Anonymous'}
                      </Link>
                      <span className="text-xs text-zinc-600">posted a project</span>
                      <span className="ml-auto text-xs text-zinc-600">
                        {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    {/* Preview */}
                    {previewUrl && (
                      <div className="relative h-32 w-full overflow-hidden bg-zinc-800">
                        <Image src={previewUrl} alt={p.title} fill className="object-cover" sizes="672px" />
                      </div>
                    )}
                    <div className="p-5">
                      <Link href={`/projects/${p.id}`} className="font-semibold text-white hover:text-violet-400 transition-colors">
                        {p.title}
                      </Link>
                      {p.is_featured && (
                        <span className="ml-2 rounded-full border border-amber-700/60 bg-amber-900/20 px-2 py-0.5 text-[10px] text-amber-400">Featured</span>
                      )}
                      {p.description && (
                        <p className="mt-1 text-sm text-zinc-500 line-clamp-2">{p.description}</p>
                      )}
                      {(p.tech_stack ?? []).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {(p.tech_stack ?? []).slice(0, 4).map((t: string) => (
                            <span key={t} className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-400">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              }

              const r = item.data
              const reviewer = profileMap[r.reviewer_id]
              return (
                <div key={`review-${r.id}`} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    {reviewer?.avatar_url ? (
                      <Image src={reviewer.avatar_url} alt={reviewer.full_name ?? ''} width={24} height={24} className="h-6 w-6 rounded-full object-cover" />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                        {(reviewer?.full_name ?? 'A')[0].toUpperCase()}
                      </div>
                    )}
                    <Link href={`/u/${r.reviewer_id}`} className="text-sm font-medium text-zinc-300 hover:text-violet-400 transition-colors">
                      {reviewer?.full_name ?? 'Anonymous'}
                    </Link>
                    <span className="text-xs text-zinc-600">reviewed</span>
                    <Link href={`/projects/${r.project_id}`} className="text-sm text-violet-400 hover:text-violet-300 transition-colors font-medium">
                      {projectTitleMap[r.project_id] ?? 'a project'}
                    </Link>
                    <span className="ml-auto text-xs text-zinc-600">
                      {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < r.rating ? 'text-yellow-400 text-sm' : 'text-zinc-700 text-sm'}>★</span>
                    ))}
                  </div>
                  <p className="text-sm text-zinc-400 line-clamp-3 leading-relaxed">{r.comment}</p>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
