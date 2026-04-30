'use client'

import { useState } from 'react'

export default function RunEmbed({ demoUrl }: { demoUrl: string }) {
  const [started, setStarted] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/50 py-20 text-center">
        <div className="mb-4 text-5xl">🖥️</div>
        <h3 className="mb-2 text-lg font-semibold text-white">Live preview</h3>
        <p className="mb-6 max-w-sm text-sm text-zinc-500">
          Preview the running project directly here.
        </p>
        <button
          onClick={() => setStarted(true)}
          className="rounded-full bg-violet-600 px-8 py-3 text-sm font-semibold text-white hover:bg-violet-500 transition-colors"
        >
          Load preview
        </button>
      </div>
    )
  }

  return (
    <div className={fullscreen ? 'fixed inset-0 z-50 bg-zinc-950' : 'overflow-hidden rounded-2xl border border-zinc-800'}>
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="h-2 w-2 shrink-0 rounded-full bg-green-400" />
          <span className="truncate text-xs text-zinc-500">{demoUrl}</span>
        </div>
        <button
          onClick={() => setFullscreen((v) => !v)}
          className="ml-3 shrink-0 text-xs text-zinc-400 hover:text-white transition-colors"
          title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          {fullscreen ? '✕ Exit' : '⛶ Fullscreen'}
        </button>
      </div>

      <iframe
        src={demoUrl}
        className={fullscreen ? 'h-[calc(100vh-37px)] w-full' : 'h-[700px] w-full'}
        title="Project live preview"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  )
}
