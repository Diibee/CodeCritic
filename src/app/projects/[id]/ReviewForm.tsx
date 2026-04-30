'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { submitReview } from '@/app/actions/review'

export default function ReviewForm({ projectId, userId }: { projectId: string; userId: string }) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!rating || !comment.trim()) return

    setLoading(true)
    try {
      await submitReview(projectId, rating, comment)
      setSubmitted(true)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="mb-8 rounded-xl border border-green-800/30 bg-green-900/10 p-6 text-center text-sm text-green-400">
        Thanks for your review!
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <h3 className="mb-4 font-semibold text-white">Leave a review</h3>

      {/* Star rating */}
      <div className="mb-4 flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setRating(i + 1)}
            onMouseEnter={() => setHovered(i + 1)}
            onMouseLeave={() => setHovered(0)}
            className="text-2xl transition-colors"
          >
            <span className={(hovered || rating) > i ? 'text-yellow-400' : 'text-zinc-700'}>
              ★
            </span>
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your feedback — what works well, what could improve?"
        rows={4}
        className="mb-4 w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-violet-500 focus:outline-none resize-none"
        required
      />

      <button
        type="submit"
        disabled={loading || !rating || !comment.trim()}
        className="rounded-full bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? 'Submitting...' : 'Submit review'}
      </button>
    </form>
  )
}
