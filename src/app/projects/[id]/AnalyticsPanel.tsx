type WeekData = { label: string; count: number }
type RatingDist = { stars: number; count: number; pct: number }

export type ProjectAnalytics = {
  totalReviews: number
  avgRating: number | null
  ratingDistribution: RatingDist[]
  weeklyData: WeekData[]
}

export function computeAnalytics(
  reviews: { rating: number; created_at: string }[]
): ProjectAnalytics {
  const totalReviews = reviews.length
  const avgRating = totalReviews > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / totalReviews
    : null

  const counts = [0, 0, 0, 0, 0]
  for (const r of reviews) counts[r.rating - 1]++
  const ratingDistribution: RatingDist[] = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: counts[stars - 1],
    pct: totalReviews > 0 ? Math.round((counts[stars - 1] / totalReviews) * 100) : 0,
  }))

  const WEEK_MS = 7 * 24 * 60 * 60 * 1000
  const now = Date.now()
  const weeklyData: WeekData[] = Array.from({ length: 8 }, (_, i) => {
    const start = now - (7 - i) * WEEK_MS
    const end = start + WEEK_MS
    const count = reviews.filter((r) => {
      const t = new Date(r.created_at).getTime()
      return t >= start && t < end
    }).length
    const d = new Date(start)
    return { label: `${d.getMonth() + 1}/${d.getDate()}`, count }
  })

  return { totalReviews, avgRating, ratingDistribution, weeklyData }
}

export default function AnalyticsPanel({ analytics }: { analytics: ProjectAnalytics }) {
  const { totalReviews, avgRating, ratingDistribution, weeklyData } = analytics
  const maxWeek = Math.max(...weeklyData.map((w) => w.count), 1)

  return (
    <div className="space-y-8">
      {/* Summary stats */}
      <div className="grid grid-cols-3 divide-x divide-zinc-800 rounded-2xl border border-zinc-800 bg-zinc-900">
        <div className="px-6 py-5 text-center">
          <div className="text-2xl font-bold text-white">{totalReviews}</div>
          <div className="mt-1 text-xs text-zinc-500">Total reviews</div>
        </div>
        <div className="px-6 py-5 text-center">
          <div className="text-2xl font-bold text-white">
            {avgRating !== null ? avgRating.toFixed(2) : '—'}
          </div>
          <div className="mt-1 text-xs text-zinc-500">Avg rating</div>
        </div>
        <div className="px-6 py-5 text-center">
          <div className="text-2xl font-bold text-white">
            {weeklyData[weeklyData.length - 1]?.count ?? 0}
          </div>
          <div className="mt-1 text-xs text-zinc-500">This week</div>
        </div>
      </div>

      {/* Rating distribution */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h3 className="mb-4 text-sm font-semibold text-white">Rating distribution</h3>
        <div className="space-y-2.5">
          {ratingDistribution.map(({ stars, count, pct }) => (
            <div key={stars} className="flex items-center gap-3">
              <span className="w-6 shrink-0 text-right text-xs text-zinc-400">{stars}★</span>
              <div className="flex-1 overflow-hidden rounded-full bg-zinc-800 h-2">
                <div
                  className="h-full rounded-full bg-yellow-400 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right text-xs text-zinc-500">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly reviews chart */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h3 className="mb-4 text-sm font-semibold text-white">Reviews — last 8 weeks</h3>
        <div className="flex h-32 items-end gap-1.5">
          {weeklyData.map((w, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[10px] text-zinc-600">{w.count > 0 ? w.count : ''}</span>
              <div
                className="w-full rounded-t-sm bg-violet-600/60 transition-all"
                style={{ height: `${Math.round((w.count / maxWeek) * 100)}%`, minHeight: w.count > 0 ? '4px' : '2px' }}
              />
              <span className="text-[9px] text-zinc-700">{w.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
