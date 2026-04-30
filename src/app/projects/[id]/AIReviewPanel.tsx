'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { generateAIReview } from '@/app/actions/aiReview'

function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n')

  function parseLine(line: string): React.ReactNode {
    const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="rounded bg-zinc-800 px-1 py-0.5 text-xs text-violet-300 font-mono">
            {part.slice(1, -1)}
          </code>
        )
      }
      return part
    })
  }

  return (
    <div>
      {lines.map((line, i) => {
        if (line.startsWith('### ')) {
          return (
            <h3 key={i} className="mt-6 mb-2 text-base font-semibold text-white">
              {line.slice(4)}
            </h3>
          )
        }
        if (line.startsWith('## ')) {
          return (
            <h2 key={i} className="mt-8 mb-3 text-lg font-bold text-white">
              {line.slice(3)}
            </h2>
          )
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={i} className="flex gap-2 py-0.5">
              <span className="mt-1 shrink-0 text-xs text-zinc-600">•</span>
              <span className="text-sm text-zinc-400 leading-relaxed">{parseLine(line.slice(2))}</span>
            </div>
          )
        }
        if (/^\d+\.\s/.test(line)) {
          const num = line.match(/^(\d+)\.\s/)?.[1]
          return (
            <div key={i} className="flex gap-2 py-0.5">
              <span className="shrink-0 text-sm font-medium text-zinc-500">{num}.</span>
              <span className="text-sm text-zinc-400 leading-relaxed">
                {parseLine(line.replace(/^\d+\.\s/, ''))}
              </span>
            </div>
          )
        }
        if (line.trim() === '') return <div key={i} className="h-2" />
        return (
          <p key={i} className="py-0.5 text-sm text-zinc-400 leading-relaxed">
            {parseLine(line)}
          </p>
        )
      })}
    </div>
  )
}

export default function AIReviewPanel({
  projectId,
  isOwner,
  initialReview,
  reviewAt,
}: {
  projectId: string
  isOwner: boolean
  initialReview: string | null
  reviewAt: string | null
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const router = useRouter()

  function handleGenerate() {
    setError('')
    startTransition(async () => {
      try {
        await generateAIReview(projectId)
        router.refresh()
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : ''
        setError(msg === 'PREMIUM_REQUIRED'
          ? 'AI reviews are a Premium feature. Upgrade to unlock them.'
          : 'Failed to generate review. Please try again.')
      }
    })
  }

  if (!initialReview) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 text-3xl">
          🤖
        </div>
        <div>
          <p className="font-semibold text-white">No AI review yet</p>
          <p className="mt-1 text-sm text-zinc-500">
            {isOwner
              ? 'Generate an AI-powered analysis of your codebase.'
              : "The project owner hasn't generated an AI review yet."}
          </p>
        </div>
        {isOwner && (
          <button
            onClick={handleGenerate}
            disabled={isPending}
            className="flex items-center gap-2 rounded-full bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analyzing codebase…
              </>
            ) : (
              <>✨ Generate AI Review</>
            )}
          </button>
        )}
        {isPending && (
          <p className="text-xs text-zinc-600">This may take 10–20 seconds.</p>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    )
  }

  return (
    <div>
      {reviewAt && (
        <p className="mb-4 text-xs text-zinc-600">
          Generated{' '}
          {new Date(reviewAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </p>
      )}

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <MarkdownRenderer content={initialReview} />
      </div>
    </div>
  )
}
