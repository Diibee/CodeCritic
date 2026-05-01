'use client'

import { useState, useTransition } from 'react'
import { toggleFollow } from '@/app/actions/follows'

export default function FollowButton({
  targetUserId,
  initialFollowing,
  initialCount,
}: {
  targetUserId: string
  initialFollowing: boolean
  initialCount: number
}) {
  const [following, setFollowing] = useState(initialFollowing)
  const [count, setCount] = useState(initialCount)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    const wasFollowing = following
    setFollowing((v) => !v)
    setCount((v) => (wasFollowing ? v - 1 : v + 1))
    startTransition(() => toggleFollow(targetUserId))
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-40 ${
        following
          ? 'border-zinc-600 bg-zinc-800 text-zinc-300 hover:border-red-800 hover:text-red-400'
          : 'border-violet-700/60 bg-violet-600/10 text-violet-400 hover:bg-violet-600 hover:text-white'
      }`}
    >
      {following ? `Following (${count})` : `Follow${count > 0 ? ` (${count})` : ''}`}
    </button>
  )
}
