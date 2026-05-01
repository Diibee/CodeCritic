import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 mb-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <span className="text-base font-bold text-white">
              Code<span className="text-violet-500">Critic</span>
            </span>
            <p className="mt-2 text-xs text-zinc-600 leading-relaxed">
              Where developers showcase projects, get peer reviews, and grow their skills.
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Product</p>
            <ul className="space-y-2">
              {[
                { href: '/projects', label: 'Browse' },
                { href: '/leaderboard', label: 'Leaderboard' },
                { href: '/pricing', label: 'Pricing' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-zinc-500 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Contact</p>
            <ul className="space-y-2">
              {[
                { href: '/contact', label: 'Get in touch' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-zinc-500 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Legal</p>
            <ul className="space-y-2">
              {[
                { href: '/privacy', label: 'Privacy policy' },
                { href: '/terms', label: 'Terms of service' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-zinc-500 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-800/60 pt-6 flex flex-col items-center justify-between gap-2 sm:flex-row">
          <p className="text-xs text-zinc-700">
            © {new Date().getFullYear()} CodeCritic. Built with Next.js &amp; Supabase.
          </p>
          <p className="text-xs text-zinc-700">A solo project by <a href="mailto:dibe.mtt@gmail.com" className="hover:text-zinc-500 transition-colors">Matteo</a></p>
        </div>
      </div>
    </footer>
  )
}
