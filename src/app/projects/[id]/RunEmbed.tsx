'use client'

import { useState } from 'react'

export default function RunEmbed({ embedUrl }: { embedUrl: string }) {
  const [started, setStarted] = useState(false)

  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/50 py-20 text-center">
        <div className="mb-4 text-5xl">🖥️</div>
        <h3 className="mb-2 text-lg font-semibold text-white">Live preview</h3>
        <p className="mb-6 max-w-sm text-sm text-zinc-500">
          Runs the project directly in the browser via StackBlitz WebContainers.
          Works with JavaScript / Node.js projects.
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

  const fullUrl = embedUrl.replace('?embed=1&', '?').replace('&hideNavigation=1&hideDevTools=1', '')

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800">
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-zinc-500">Running via StackBlitz WebContainers</span>
        </div>
        <a
          href={fullUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-violet-400 hover:underline"
        >
          Open fullscreen ↗
        </a>
      </div>
      <iframe
        src={embedUrl}
        className="h-[700px] w-full bg-white"
        title="Project live preview"
      />
    </div>
  )
}
