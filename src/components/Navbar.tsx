import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import NavbarClient from './NavbarClient'

export default async function Navbar() {
  let user = null
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // Supabase unavailable — render unauthenticated nav
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid h-16 grid-cols-3 items-center">

          {/* Left — logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-white">
              Code<span className="text-violet-500">Critic</span>
            </span>
          </Link>

          {/* Center — navigation */}
          <nav className="flex items-center justify-center gap-6 text-sm font-medium text-zinc-400">
            <Link href="/projects" className="hover:text-white transition-colors">
              Browse
            </Link>
            {user && (
              <Link href="/dashboard" className="hover:text-white transition-colors">
                Dashboard
              </Link>
            )}
          </nav>

          {/* Right — actions */}
          <div className="flex justify-end">
            <NavbarClient user={user} />
          </div>

        </div>
      </div>
    </header>
  )
}
