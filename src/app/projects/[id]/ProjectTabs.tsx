'use client'

import { useState } from 'react'
import RunEmbed from './RunEmbed'

type Tab = 'overview' | 'ai_review' | 'analytics' | 'preview' | 'updates'

interface Props {
  githubUrl: string | null
  demoUrl: string | null
  overview: React.ReactNode
  aiReview: React.ReactNode
  updates: React.ReactNode
  analytics?: React.ReactNode
  updatesCount?: number
}

export default function ProjectTabs({ githubUrl, demoUrl, overview, aiReview, analytics, updates, updatesCount }: Props) {
  const [tab, setTab] = useState<Tab>('overview')

  const hasPreview = !!(githubUrl || demoUrl)

  return (
    <div>
      <div className="mb-6 flex gap-1 rounded-xl border border-zinc-800 bg-zinc-900 p-1 w-fit flex-wrap">
        <TabButton active={tab === 'overview'} onClick={() => setTab('overview')}>
          Overview
        </TabButton>
        <TabButton active={tab === 'updates'} onClick={() => setTab('updates')}>
          <span className="flex items-center gap-1.5">
            📋 Updates{updatesCount ? ` (${updatesCount})` : ''}
          </span>
        </TabButton>
        <TabButton active={tab === 'ai_review'} onClick={() => setTab('ai_review')}>
          <span className="flex items-center gap-1.5">
            <span>✨</span> AI Review
          </span>
        </TabButton>
        {analytics && (
          <TabButton active={tab === 'analytics'} onClick={() => setTab('analytics')}>
            <span className="flex items-center gap-1.5">
              <span>📊</span> Analytics
            </span>
          </TabButton>
        )}
        {hasPreview && (
          <TabButton active={tab === 'preview'} onClick={() => setTab('preview')}>
            <span className="flex items-center gap-1.5">
              <span className="text-green-400">▶</span> Preview
            </span>
          </TabButton>
        )}
      </div>

      {tab === 'overview' && overview}
      {tab === 'updates' && updates}
      {tab === 'ai_review' && aiReview}
      {tab === 'analytics' && analytics}
      {tab === 'preview' && hasPreview && (
        <RunEmbed githubUrl={githubUrl} demoUrl={demoUrl} />
      )}
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
