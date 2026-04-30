'use client'

import { useState } from 'react'
import RunEmbed from './RunEmbed'

type Tab = 'overview' | 'preview'

interface Props {
  demoUrl: string | null
  overview: React.ReactNode
}

export default function ProjectTabs({ demoUrl, overview }: Props) {
  const [tab, setTab] = useState<Tab>('overview')

  return (
    <div>
      <div className="mb-6 flex gap-1 rounded-xl border border-zinc-800 bg-zinc-900 p-1 w-fit">
        <TabButton active={tab === 'overview'} onClick={() => setTab('overview')}>
          Overview
        </TabButton>
        {demoUrl && (
          <TabButton active={tab === 'preview'} onClick={() => setTab('preview')}>
            <span className="flex items-center gap-1.5">
              <span className="text-green-400">▶</span> Preview
            </span>
          </TabButton>
        )}
      </div>

      {tab === 'overview' && overview}
      {tab === 'preview' && demoUrl && <RunEmbed demoUrl={demoUrl} />}
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
