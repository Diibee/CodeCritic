'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SubscriptionSection({
  isPremium,
  periodEnd,
}: {
  isPremium: boolean
  periodEnd: string | null
}) {
  const [loading, setLoading] = useState(false)

  async function handleUpgrade() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const { url } = await res.json()
      if (url) window.location.href = url
    } finally {
      setLoading(false)
    }
  }

  async function handleManage() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const { url } = await res.json()
      if (url) window.location.href = url
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-white">Subscription</h2>
          <div className="mt-1 flex items-center gap-2">
            {isPremium ? (
              <span className="rounded-full bg-violet-600/20 px-2.5 py-0.5 text-xs font-medium text-violet-300">
                👑 Premium
              </span>
            ) : (
              <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-400">
                Free
              </span>
            )}
            {isPremium && periodEnd && (
              <span className="text-xs text-zinc-600">
                Renews {new Date(periodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>

        {isPremium ? (
          <button
            onClick={handleManage}
            disabled={loading}
            className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading…' : 'Manage subscription'}
          </button>
        ) : (
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading…' : '✨ Upgrade to Premium'}
          </button>
        )}
      </div>

      {!isPremium && (
        <p className="text-sm text-zinc-500">
          Unlock AI reviews, unlimited projects, analytics, and more.{' '}
          <Link href="/pricing" className="text-violet-400 hover:underline">
            See all features →
          </Link>
        </p>
      )}
    </div>
  )
}
