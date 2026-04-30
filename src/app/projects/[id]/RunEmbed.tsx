'use client'

import { useState } from 'react'

export default function RunEmbed({ embedUrl }: { embedUrl: string }) {
  const [started, setStarted] = useState(false)

  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/50 py-20 text-center">
        <div className="mb-4 text-5xl">▶</div>
        <h3 className="mb-2 text-lg font-semibold text-white">Run this project</h3>
        <p className="mb-6 max-w-sm text-sm text-zinc-500">
          Opens an interactive editor + preview powered by StackBlitz WebContainers.
          Works best with JavaScript / Node.js projects.
        </p>
        <button
          onClick={() => setStarted(true)}
          className="rounded-full bg-violet-600 px-8 py-3 text-sm font-semibold text-white hover:bg-violet-500 transition-colors"
        >
          Launch environment
        </button>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800">
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-2">
        <span className="text-xs text-zinc-500">StackBlitz — powered by WebContainers</span>
        <a
          href={embedUrl.replace('?embed=1&', '?')}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-violet-400 hover:underline"
        >
          Open in StackBlitz ↗
        </a>
      </div>
      <iframe
        src={embedUrl}
        className="h-[600px] w-full"
        allow="cross-origin-isolated"
        title="Project preview"
      />
    </div>
  )
}
