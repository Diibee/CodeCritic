'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export const SORT_OPTIONS = [
  { value: 'newest',        label: 'Newest' },
  { value: 'trending',      label: 'Trending' },
  { value: 'top_rated',     label: 'Top rated' },
  { value: 'most_discussed', label: 'Most discussed' },
  { value: 'oldest',        label: 'Oldest' },
] as const

export type SortValue = typeof SORT_OPTIONS[number]['value']

export default function SortSelect({ current }: { current: SortValue }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', e.target.value)
    router.push(`/projects?${params.toString()}`)
  }

  return (
    <select
      value={current}
      onChange={handleChange}
      className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-300 focus:border-violet-500 focus:outline-none cursor-pointer hover:border-zinc-500 transition-colors"
    >
      {SORT_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}
