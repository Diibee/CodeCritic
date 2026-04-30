'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteProject, toggleProjectVisibility } from '@/app/actions/project'

interface Props {
  projectId: string
  isPublic: boolean
}

export default function ProjectOwnerActions({ projectId, isPublic }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [confirming, setConfirming] = useState(false)

  function handleToggle() {
    startTransition(async () => {
      await toggleProjectVisibility(projectId, isPublic)
      router.refresh()
    })
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteProject(projectId)
    })
  }

  return (
    <div className="mt-6 flex items-center gap-3 border-t border-zinc-800 pt-5">
      <span className="mr-auto text-xs text-zinc-600">Owner controls</span>

      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
          isPublic
            ? 'border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white'
            : 'border-yellow-800/60 text-yellow-400 hover:border-yellow-600 hover:text-yellow-300'
        }`}
      >
        {isPublic ? '👁 Public' : '🔒 Private'}
      </button>

      {confirming ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-400">Sure?</span>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 transition-colors disabled:opacity-50"
          >
            Yes, delete
          </button>
          <button
            onClick={() => setConfirming(false)}
            disabled={isPending}
            className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          disabled={isPending}
          className="rounded-xl border border-red-900/50 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:border-red-700 hover:text-red-300 disabled:opacity-50"
        >
          Delete
        </button>
      )}
    </div>
  )
}
