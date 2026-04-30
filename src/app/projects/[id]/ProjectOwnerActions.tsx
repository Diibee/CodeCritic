'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { deleteProject, toggleProjectVisibility, toggleFeatured } from '@/app/actions/project'

interface Props {
  projectId: string
  isPublic: boolean
  isFeatured: boolean
  isPremium: boolean
}

export default function ProjectOwnerActions({ projectId, isPublic, isFeatured, isPremium }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showModal, setShowModal] = useState(false)
  const [privateError, setPrivateError] = useState(false)

  function handleToggle() {
    setPrivateError(false)
    startTransition(async () => {
      try {
        await toggleProjectVisibility(projectId, isPublic)
        router.refresh()
      } catch (e: unknown) {
        if (e instanceof Error && e.message === 'PRIVATE_LIMIT') {
          setPrivateError(true)
        }
      }
    })
  }

  function handleToggleFeatured() {
    startTransition(async () => {
      await toggleFeatured(projectId, isFeatured)
      router.refresh()
    })
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteProject(projectId)
    })
  }

  return (
    <>
      <div className="mt-6 flex flex-col gap-3 border-t border-zinc-800 pt-5">
        <div className="flex items-center gap-3">
          <span className="mr-auto text-xs text-zinc-600">Owner controls</span>

          {/* Featured toggle */}
          {isPremium ? (
            <button
              onClick={handleToggleFeatured}
              disabled={isPending}
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
                isFeatured
                  ? 'border-amber-700/60 bg-amber-900/20 text-amber-400 hover:border-amber-600'
                  : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
              }`}
            >
              {isFeatured ? '📌 Featured' : '📌 Feature'}
            </button>
          ) : (
            <Link
              href="/pricing"
              className="rounded-xl border border-zinc-800 px-4 py-2 text-sm font-medium text-zinc-600 hover:border-zinc-700 hover:text-zinc-400 transition-colors"
              title="Premium feature"
            >
              📌 Feature
            </Link>
          )}

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

          <button
            onClick={() => setShowModal(true)}
            disabled={isPending}
            className="rounded-xl border border-red-900/50 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:border-red-700 hover:text-red-300 disabled:opacity-50"
          >
            Delete
          </button>
        </div>

        {privateError && (
          <p className="text-xs text-amber-400">
            Free plan allows only 1 private project.{' '}
            <Link href="/pricing" className="underline hover:text-amber-300">
              Upgrade to Premium
            </Link>{' '}
            for unlimited private projects.
          </p>
        )}
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-2 text-lg font-semibold text-white">Delete project?</h2>
            <p className="mb-6 text-sm text-zinc-400">
              This action is permanent and cannot be undone. All reviews will be deleted too.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={isPending}
                className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 transition-colors disabled:opacity-50"
              >
                {isPending ? 'Deleting…' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
