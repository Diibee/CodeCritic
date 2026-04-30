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

const MEDALS = ['🥇', '🥈', '🥉']

type RawProject = {
  id: string
  title: string
  description: string | null
  github_url: string | null
  tech_stack: string[] | null
  reviews: { rating: number }[] | null
}

export default async function LeaderboardPage() {
  const supabase = await createClient()

  const { data: raw } = await supabase
    .from('projects')
    .select('id, title, description, github_url, tech_stack, reviews(rating)')
    .eq('is_public', true)

  const projects: RawProject[] = (raw ?? []) as RawProject[]

  const topRated = projects
    .filter((p) => (p.reviews?.length ?? 0) >= 2)
    .map((p) => {
      const reviews = p.reviews ?? []
      const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      return { ...p, avg, reviewCount: reviews.length }
    })
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 10)

  const mostReviewed = projects
    .map((p) => ({ ...p, reviewCount: p.reviews?.length ?? 0 }))
    .filter((p) => p.reviewCount > 0)
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 10)

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white">🏆 Leaderboard</h1>
          <p className="mt-2 text-zinc-500">
            The best-rated and most-discussed projects on CodeCritic.
          </p>
        </div>

        {/* Top Rated */}
        <section className="mb-12">
          <h2 className="mb-4 text-lg font-semibold text-white">Top Rated</h2>
          <p className="mb-4 text-xs text-zinc-600">Minimum 2 reviews required.</p>

          {topRated.length === 0 ? (
            <p className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center text-zinc-600">
              Not enough data yet — be the first to review some projects!
            </p>
          ) : (
            <div className="space-y-3">
              {topRated.map((project, i) => {
                const previewUrl = getGitHubPreviewUrl(project.github_url)
                return (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-700 transition-colors"
                  >
                    <div className="w-8 shrink-0 text-center">
                      {i < 3 ? (
                        <span className="text-xl">{MEDALS[i]}</span>
                      ) : (
                        <span className="text-sm font-medium text-zinc-600">#{i + 1}</span>
                      )}
                    </div>

                    <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                      {previewUrl ? (
                        <Image
                          src={previewUrl}
                          alt={project.title}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-900/40 to-zinc-800 text-base opacity-30">
                          {'</>'}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white truncate">{project.title}</div>
                      <div className="mt-0.5 flex flex-wrap gap-2">
                        {(project.tech_stack ?? []).slice(0, 3).map((t) => (
                          <span key={t} className="text-xs text-zinc-500">{t}</span>
                        ))}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="text-lg font-bold text-yellow-400">
                        ⭐ {project.avg.toFixed(1)}
                      </div>
                      <div className="text-xs text-zinc-600">{project.reviewCount} reviews</div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        {/* Most Discussed */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-white">Most Discussed</h2>

          {mostReviewed.length === 0 ? (
            <p className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center text-zinc-600">
              No reviews yet — start the conversation!
            </p>
          ) : (
            <div className="space-y-3">
              {mostReviewed.map((project, i) => {
                const previewUrl = getGitHubPreviewUrl(project.github_url)
                return (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-700 transition-colors"
                  >
                    <div className="w-8 shrink-0 text-center">
                      {i < 3 ? (
                        <span className="text-xl">{MEDALS[i]}</span>
                      ) : (
                        <span className="text-sm font-medium text-zinc-600">#{i + 1}</span>
                      )}
                    </div>

                    <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                      {previewUrl ? (
                        <Image
                          src={previewUrl}
                          alt={project.title}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-900/40 to-zinc-800 text-base opacity-30">
                          {'</>'}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white truncate">{project.title}</div>
                      <div className="mt-0.5 flex flex-wrap gap-2">
                        {(project.tech_stack ?? []).slice(0, 3).map((t) => (
                          <span key={t} className="text-xs text-zinc-500">{t}</span>
                        ))}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="text-lg font-bold text-violet-400">
                        💬 {project.reviewCount}
                      </div>
                      <div className="text-xs text-zinc-600">reviews</div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
