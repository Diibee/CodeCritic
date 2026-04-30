'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function validatePassword(pw: string) {
  return {
    length: pw.length >= 8,
    uppercase: /[A-Z]/.test(pw),
    number: /[0-9]/.test(pw),
    special: /[^a-zA-Z0-9]/.test(pw),
  }
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  const pwChecks = validatePassword(password)
  const pwValid = Object.values(pwChecks).every(Boolean)

  useEffect(() => {
    // Verify there's an active recovery session
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login')
      } else {
        setReady(true)
      }
    })
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!pwValid) { setError('Password does not meet the requirements.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }

    setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (err) { setError(err.message); return }
    router.push('/dashboard')
  }

  if (!ready) return null

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12">
      <div className="w-full max-w-sm">

        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold text-white">
            Code<span className="text-violet-500">Critic</span>
          </Link>
          <p className="mt-2 text-sm text-zinc-500">Choose a new password</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
          <form onSubmit={handleSubmit} className="space-y-3">

            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                required
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 pr-11 text-sm text-white placeholder-zinc-600 focus:border-violet-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                tabIndex={-1}
              >
                {showPw ? '🙈' : '👁'}
              </button>
            </div>

            {password.length > 0 && (
              <ul className="space-y-1 rounded-xl bg-zinc-800/50 px-4 py-3 text-xs">
                {([
                  [pwChecks.length, 'At least 8 characters'],
                  [pwChecks.uppercase, 'At least 1 uppercase letter'],
                  [pwChecks.number, 'At least 1 number'],
                  [pwChecks.special, 'At least 1 special character (!@#$…)'],
                ] as [boolean, string][]).map(([ok, label]) => (
                  <li key={label} className={`flex items-center gap-2 ${ok ? 'text-green-400' : 'text-zinc-500'}`}>
                    <span>{ok ? '✓' : '○'}</span>{label}
                  </li>
                ))}
              </ul>
            )}

            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm new password"
                required
                className={`w-full rounded-xl border bg-zinc-800 px-4 py-2.5 pr-11 text-sm text-white placeholder-zinc-600 focus:outline-none ${
                  confirm.length > 0 && password !== confirm
                    ? 'border-red-600 focus:border-red-500'
                    : 'border-zinc-700 focus:border-violet-500'
                }`}
              />
              {confirm.length > 0 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
                  {password === confirm ? '✓' : '✗'}
                </span>
              )}
            </div>

            {error && (
              <p className="rounded-lg bg-red-900/20 px-3 py-2 text-xs text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 transition-colors disabled:opacity-40"
            >
              {loading ? 'Saving...' : 'Set new password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
