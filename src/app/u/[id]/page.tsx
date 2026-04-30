import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/server'
import { checkAndGrantAchievements } from '@/app/actions/achievements'
import { ACHIEVEMENTS, ACHIEVEMENT_MAP, CATEGORIES } from '@/lib/achievements'
import { isPremium } from '@/lib/subscription'

function getGitHubPreviewUrl(githubUrl: string | null): string | null {
  if (!githubUrl) return null
  const match = githubUrl.match(/github\.com\/([^/?#]+\/[^/?#.]+)/)
  if (!match) return null
  return `https://opengraph.githubassets.com/1/${match[1]}`
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!profile) notFound()

  const { data: { user: currentUser } } = await supabase.auth.getUser()
  const isOwnProfile = currentUser?.id === id

  const { data: projects } = await supabase
    .from('projects')
    .select('*, reviews(rating)')
    .eq('user_id', id)
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  const allProjects = projects ?? []
  const totalReviews = allProjects.reduce((acc, p) => acc + (p.reviews?.length ?? 0), 0)
  const allRatings = allProjects.flatMap(p => (p.reviews ?? []).map((r: { rating: number }) => r.rating))
  const avgRating = allRatings.length > 0 ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length : null

  const displayName = profile.full_name || 'Anonymous'

  // Trigger achievement check for own profile, then fetch earned achievements
  if (isOwnProfile) {
    await checkAndGrantAchievements(id).catch(() => {})
  }

  const { data: earnedData } = await supabase
    .from('user_achievements')
    .select('achievement_key, unlocked_at')
    .eq('user_id', id)

  const earnedKeys = new Set(earnedData?.map((a) => a.achievement_key) ?? [])

  const userIsPremium = await isPremium(id)

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Profile header */}
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* Avatar */}
          <div className="shrink-0">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={displayName}
                width={96}
                height={96}
                className="h-24 w-24 rounded-full object-cover ring-2 ring-zinc-800"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-zinc-800 text-3xl font-bold text-zinc-500">
                {displayName[0].toUpperCase()}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{displayName}</h1>
              {userIsPremium && (
                <span className="rounded-full border border-violet-700/60 bg-violet-900/20 px-2.5 py-0.5 text-xs font-medium text-violet-400">
                  👑 Premium
                </span>
              )}
              {isOwnProfile && (
                <Link
                  href="/settings"
                  className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors"
                >
                  Edit profile
                </Link>
              )}
            </div>
            {profile.bio && (
              <p className="mt-2 max-w-xl text-zinc-400 leading-relaxed">{profile.bio}</p>
            )}
            {profile.created_at && (
              <p className="mt-2 text-xs text-zinc-600">
                Member since{' '}
                {new Date(profile.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                })}
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-3 divide-x divide-zinc-800 rounded-2xl border border-zinc-800 bg-zinc-900">
          <div className="px-6 py-5 text-center">
            <div className="text-2xl font-bold text-white">{allProjects.length}</div>
            <div className="mt-1 text-xs text-zinc-500">Projects</div>
          </div>
          <div className="px-6 py-5 text-center">
            <div className="text-2xl font-bold text-white">{totalReviews}</div>
            <div className="mt-1 text-xs text-zinc-500">Reviews received</div>
          </div>
          <div className="px-6 py-5 text-center">
            <div className="text-2xl font-bold text-white">
              {avgRating !== null ? avgRating.toFixed(1) : '—'}
            </div>
            <div className="mt-1 text-xs text-zinc-500">Avg rating</div>
          </div>
        </div>

        {/* Projects */}
        <h2 className="mb-4 text-lg font-semibold text-white">
          Projects{' '}
          <span className="font-normal text-zinc-600">({allProjects.length})</span>
        </h2>

        {allProjects.length === 0 ? (
          <div className="py-16 text-center text-zinc-600">
            {isOwnProfile ? (
              <>
                No public projects yet.{' '}
                <Link href="/projects/new" className="text-violet-400 hover:underline">
                  Submit your first one!
                </Link>
              </>
            ) : (
              'No public projects yet.'
            )}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {allProjects.map((project) => {
              const reviews = (project.reviews ?? []) as { rating: number }[]
              const reviewCount = reviews.length
              const avg =
                reviewCount > 0
                  ? reviews.reduce((a, r) => a + r.rating, 0) / reviewCount
                  : null
              const previewUrl = getGitHubPreviewUrl(project.github_url ?? null)

              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 hover:border-zinc-700 transition-colors"
                >
                  <div className="relative h-40 w-full shrink-0 overflow-hidden bg-zinc-800">
                    {previewUrl ? (
                      <Image
                        src={previewUrl}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-900/40 via-zinc-800 to-zinc-900">
                        <span className="text-3xl opacity-20">{'</>'}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="mb-1 font-semibold text-white group-hover:text-violet-300 transition-colors line-clamp-1">
                      {project.title}
                    </h3>
                    <p className="mb-3 flex-1 text-sm text-zinc-500 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>💬 {reviewCount}</span>
                      {avg !== null && <span>⭐ {avg.toFixed(1)}</span>}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Achievements */}
        <div className="mt-12">
          <h2 className="mb-5 text-lg font-semibold text-white">
            Achievements{' '}
            <span className="font-normal text-zinc-600">({earnedKeys.size}/{ACHIEVEMENTS.length})</span>
          </h2>

          {CATEGORIES.map((category) => {
            const categoryAchievements = ACHIEVEMENTS.filter((a) => a.category === category)
            return (
              <div key={category} className="mb-6">
                <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-600">
                  {category}
                </h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                  {categoryAchievements.map((achievement) => {
                    const earned = earnedKeys.has(achievement.key)
                    return (
                      <div
                        key={achievement.key}
                        title={achievement.description}
                        className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${
                          earned
                            ? 'border-violet-800/40 bg-violet-900/10'
                            : 'border-zinc-800 bg-zinc-900/50 opacity-40'
                        }`}
                      >
                        <span className="text-xl shrink-0">{earned ? achievement.emoji : '🔒'}</span>
                        <div className="min-w-0">
                          <p className={`text-xs font-medium truncate ${earned ? 'text-white' : 'text-zinc-500'}`}>
                            {achievement.name}
                          </p>
                          <p className="truncate text-[11px] text-zinc-600">{achievement.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
