'use client'

import { useState } from 'react'

export default function ShareButton({ url, label = 'Share profile' }: { url: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: select the URL in a prompt
      window.prompt('Copy this link:', url)
    }
  }

  return (
    <button
      onClick={handleClick}
      className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors"
    >
      {copied ? '✓ Copied!' : label}
    </button>
  )
}
