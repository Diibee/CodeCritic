'use client'

import { useState, useEffect, useTransition } from 'react'
import { addProjectUpdate, deleteProjectUpdate } from '@/app/actions/projectUpdates'

export type ProjectUpdate = {
  id: string
  body: string
  created_at: string
}

export default function ProjectUpdates({
  projectId,
  initialUpdates,
  isOwner,
}: {
  projectId: string
  initialUpdates: ProjectUpdate[]
  isOwner: boolean
}) {
  const [updates, setUpdates] = useState(initialUpdates)
  const [body, setBody] = useState('')
  const [isPending, startTransition] = useTransition()

  useEffect(() => { setUpdates(initialUpdates) }, [initialUpdates])

  function handlePost() {
    const msg = body.trim()
    if (!msg) return
    setBody('')
    const optimistic: ProjectUpdate = {
      id: `temp-${Date.now()}`,
      body: msg,
      created_at: new Date().toISOString(),
    }
    setUpdates((prev) => [optimistic, ...prev])
    startTransition(() => addProjectUpdate(projectId, msg))
  }

  function handleDelete(id: string) {
    setUpdates((prev) => prev.filter((u) => u.id !== id))
    startTransition(() => deleteProjectUpdate(id, projectId))
  }

  return (
    <div className="space-y-6">
      {isOwner && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h3 className="mb-3 text-sm font-semibold text-white">Post an update</h3>
          <p className="mb-3 text-xs text-zinc-600">Share a changelog, bug fix, or new feature with your reviewers.</p>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="e.g. Fixed the login bug reported in reviews. Added dark mode support."
            rows={3}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-violet-500 focus:outline-none resize-none"
          />
          <div className="mt-3 flex justify-end">
            <button
              onClick={handlePost}
              disabled={!body.trim() || isPending}
              className="rounded-full bg-violet-600 px-5 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-40 transition-colors"
            >
              {isPending ? 'Posting…' : 'Post update'}
            </button>
          </div>
        </div>
      )}

      {updates.length === 0 ? (
        <div className="py-12 text-center text-zinc-600">
          {isOwner ? "No updates yet. Post one to let reviewers know what's changed!" : 'No updates posted yet.'}
        </div>
      ) : (
        <div className="space-y-4">
          {updates.map((u) => (
            <div key={u.id} className={`rounded-2xl border border-zinc-800 bg-zinc-900 p-6 ${u.id.startsWith('temp-') ? 'opacity-60' : ''}`}>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-violet-800/40 bg-violet-900/20 px-2 py-0.5 text-[10px] font-medium text-violet-400">
                    Update
                  </span>
                  <span className="text-xs text-zinc-600">
                    {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                {isOwner && !u.id.startsWith('temp-') && (
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="text-xs text-zinc-600 hover:text-red-400 transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{u.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
