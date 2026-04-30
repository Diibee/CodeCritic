'use client'

import { useState } from 'react'
import RunEmbed from './RunEmbed'

type Tab = 'overview' | 'run'

interface Props {
  embedUrl: string | null
  overview: React.ReactNode
}

export default function ProjectTabs({ embedUrl, overview }: Props) {
  const [tab, setTab] = useState<Tab>('overview')

  return (
    <div>
      {/* Tab bar */}
      <div className="mb-6 flex gap-1 rounded-xl border border-zinc-800 bg-zinc-900 p-1 w-fit">
        <TabButton active={tab === 'overview'} onClick={() => setTab('overview')}>
          Overview
        </TabButton>
        {embedUrl && (
          <TabButton active={tab === 'run'} onClick={() => setTab('run')}>
            <span className="flex items-center gap-1.5">
              <span className="text-green-400">▶</span> Run
            </span>
          </TabButton>
        )}
      </div>

      {/* Content */}
      {tab === 'overview' && overview}
      {tab === 'run' && embedUrl && <RunEmbed embedUrl={embedUrl} />}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
        active ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
      }`}
    >
      {children}
    </button>
  )
}
