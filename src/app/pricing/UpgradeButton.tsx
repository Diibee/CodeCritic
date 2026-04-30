'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function UpgradeButton({ isLoggedIn }: { isLoggedIn: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleUpgrade() {
    if (!isLoggedIn) { router.push('/login'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const { url } = await res.json()
      if (url) window.location.href = url
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className="w-full rounded-full bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 transition-colors disabled:opacity-50"
    >
      {loading ? 'Redirecting…' : 'Upgrade to Premium →'}
    </button>
  )
}
