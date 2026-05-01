'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { StaffBadge } from '@/components/StaffBadge'
import { toggleReviewVote } from '@/app/actions/reviewVotes'
import { addReviewComment, deleteReviewComment } from '@/app/actions/reviewComments'

export type ReviewComment = {
  id: string
  user_id: string
  comment: string
  created_at: string
  user_name: string | null
}

type Reviewer = {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: string | null
} | null

type Review = {
  id: string
  reviewer_id: string | null
  rating: number
  comment: string
  created_at: string
}

export default function ReviewCard({
  projectId,
  review,
  reviewer,
  voteCount: initialVoteCount,
  userVoted: initialUserVoted,
  comments: initialComments,
  currentUserId,
  currentUserName,
}: {
  projectId: string
  review: Review
  reviewer: Reviewer
  voteCount: number
  userVoted: boolean
  comments: ReviewComment[]
  currentUserId: string | null
  currentUserName: string | null
}) {
  const [voteCount, setVoteCount] = useState(initialVoteCount)
  const [userVoted, setUserVoted] = useState(initialUserVoted)
  const [comments, setComments] = useState(initialComments)
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isPending, startTransition] = useTransition()

  useEffect(() => { setComments(initialComments) }, [initialComments])
  useEffect(() => { setVoteCount(initialVoteCount) }, [initialVoteCount])
  useEffect(() => { setUserVoted(initialUserVoted) }, [initialUserVoted])

  const reviewerName = reviewer?.full_name || 'Anonymous'
  const canVote = !!currentUserId && currentUserId !== review.reviewer_id

  function handleVote() {
    if (!canVote) return
    setVoteCount((v) => (userVoted ? v - 1 : v + 1))
    setUserVoted((v) => !v)
    startTransition(() => toggleReviewVote(review.id, projectId))
  }

  function handleAddComment() {
    const msg = newComment.trim()
    if (!msg || !currentUserId) return
    setNewComment('')
    const optimistic: ReviewComment = {
      id: `temp-${Date.now()}`,
      user_id: currentUserId,
      comment: msg,
      created_at: new Date().toISOString(),
      user_name: currentUserName,
    }
    setComments((prev) => [...prev, optimistic])
    startTransition(() => addReviewComment(review.id, projectId, msg))
  }

  function handleDeleteComment(commentId: string) {
    setComments((prev) => prev.filter((c) => c.id !== commentId))
    startTransition(() => deleteReviewComment(commentId, projectId))
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
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
          <StaffBadge role={reviewer?.role} />
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-zinc-700'}>★</span>
          ))}
        </div>
      </div>

      {/* Body */}
      <p className="text-sm text-zinc-400 leading-relaxed mb-4">{review.comment}</p>

      {/* Actions */}
      <div className="flex items-center gap-3 border-t border-zinc-800 pt-3">
        <button
          onClick={handleVote}
          disabled={!canVote || isPending}
          title={!currentUserId ? 'Sign in to upvote' : !canVote ? 'Your own review' : userVoted ? 'Remove upvote' : 'Mark as helpful'}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs transition-colors disabled:cursor-default ${
            userVoted
              ? 'border border-violet-700/50 bg-violet-600/20 text-violet-400'
              : canVote
              ? 'border border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300'
              : 'text-zinc-600'
          }`}
        >
          ▲{voteCount > 0 ? ` ${voteCount}` : ''} Helpful
        </button>
        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          💬{comments.length > 0 ? ` ${comments.length}` : ''} {showComments ? 'Hide replies' : 'Reply'}
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="mt-4 space-y-3 border-t border-zinc-800 pt-4">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2 text-xs">
              <span className="font-medium text-zinc-400 shrink-0">{c.user_name ?? 'User'}</span>
              <span className="text-zinc-500 flex-1 leading-relaxed">{c.comment}</span>
              {c.user_id === currentUserId && (
                <button
                  onClick={() => handleDeleteComment(c.id)}
                  className="shrink-0 text-zinc-600 hover:text-red-400 transition-colors"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {currentUserId ? (
            <div className="flex gap-2 pt-1">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment() } }}
                placeholder="Add a reply..."
                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:border-violet-500 focus:outline-none"
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim() || isPending}
                className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-500 disabled:opacity-40 transition-colors"
              >
                Post
              </button>
            </div>
          ) : (
            <p className="text-xs text-zinc-600">
              <Link href="/login" className="text-violet-400 hover:underline">Sign in</Link> to reply.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
