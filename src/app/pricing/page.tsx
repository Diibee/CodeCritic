import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/server'
import { isPremium } from '@/lib/subscription'
import UpgradeButton from './UpgradeButton'

const FREE_FEATURES = [
  'Up to 3 projects',
  'Leave unlimited reviews',
  '1 private project',
  'Public profile & achievements',
  'Browse & leaderboard',
]

const PREMIUM_FEATURES = [
  'Unlimited projects',
  'Unlimited private projects',
  '✨ AI code review (Llama 3.3)',
  '📊 Project analytics',
  '📌 Feature a project on browse',
  '🔔 Email notifications on reviews',
  '👑 Premium badge on profile',
  '🚀 Early access to new features',
]

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const premium = user ? await isPremium(user.id) : false

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-white">Simple pricing</h1>
          <p className="mt-3 text-zinc-400">Start free. Upgrade when you need more.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Free */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">Free</h2>
              <div className="mt-3 flex items-end gap-1">
                <span className="text-4xl font-bold text-white">€0</span>
                <span className="mb-1 text-zinc-500">/month</span>
              </div>
              <p className="mt-2 text-sm text-zinc-500">Everything you need to get started.</p>
            </div>

            <ul className="mb-8 space-y-3">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-400">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs text-zinc-400">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            {!user ? (
              <Link
                href="/login"
                className="block w-full rounded-full border border-zinc-700 py-2.5 text-center text-sm font-semibold text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
              >
                Get started
              </Link>
            ) : (
              <div className="block w-full rounded-full border border-zinc-800 py-2.5 text-center text-sm font-semibold text-zinc-600">
                {premium ? 'Your previous plan' : 'Current plan'}
              </div>
            )}
          </div>

          {/* Premium */}
          <div className="relative rounded-2xl border border-violet-600/50 bg-zinc-900 p-8">
            <div className="absolute -top-3 left-6">
              <span className="rounded-full bg-violet-600 px-3 py-1 text-xs font-semibold text-white">
                Most popular
              </span>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">Premium</h2>
              <div className="mt-3 flex items-end gap-1">
                <span className="text-4xl font-bold text-white">€7</span>
                <span className="mb-1 text-zinc-500">/month</span>
              </div>
              <p className="mt-2 text-sm text-zinc-500">For developers serious about feedback.</p>
            </div>

            <ul className="mb-8 space-y-3">
              {PREMIUM_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-300">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-600/20 text-xs text-violet-400">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            {premium ? (
              <div className="block w-full rounded-full border border-violet-600/50 py-2.5 text-center text-sm font-semibold text-violet-400">
                Current plan ✓
              </div>
            ) : (
              <UpgradeButton isLoggedIn={!!user} />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
