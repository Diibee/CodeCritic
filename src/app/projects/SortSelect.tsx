'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export const SORT_OPTIONS = [
  { value: 'newest',         label: 'Newest' },
  { value: 'trending',       label: 'Trending' },
  { value: 'top_rated',      label: 'Top rated' },
  { value: 'most_discussed', label: 'Most discussed' },
  { value: 'oldest',         label: 'Oldest' },
] as const

export type SortValue = typeof SORT_OPTIONS[number]['value']

export default function SortSelect({ current }: { current: SortValue }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const currentLabel = SORT_OPTIONS.find((o) => o.value === current)?.label ?? 'Newest'

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function select(value: SortValue) {
    setOpen(false)
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', value)
    router.push(`/projects?${params.toString()}`)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-48 items-center justify-between gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
      >
        {currentLabel}
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-1.5 w-44 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 shadow-xl">
          {SORT_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => select(o.value)}
              className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                o.value === current
                  ? 'bg-violet-600/20 text-violet-300'
                  : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
