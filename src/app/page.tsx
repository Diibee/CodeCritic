import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-32 sm:px-6 lg:px-8">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[600px] w-[600px] rounded-full bg-violet-600/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="animate-fade-in-up mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
            Build · Showcase · Improve
          </div>

          <h1 className="animate-fade-in-up delay-100 mb-6 text-5xl font-bold leading-tight tracking-tight sm:text-7xl">
            Your code deserves
            <br />
            <span className="text-violet-400">real feedback</span>
          </h1>

          <p className="animate-fade-in-up delay-200 mx-auto mb-10 max-w-2xl text-lg text-zinc-400">
            CodeCritic is where developers showcase projects, get peer reviews,
            and grow their skills. From side projects to bootcamp capstones —
            share your work and level up.
          </p>

          <div className="animate-fade-in-up delay-300 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className="rounded-full bg-violet-600 px-8 py-3 text-base font-semibold text-white hover:bg-violet-500 transition-colors"
            >
              Start for free
            </Link>
            <Link
              href="/projects"
              className="rounded-full border border-zinc-700 px-8 py-3 text-base font-medium text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
            >
              Browse projects
            </Link>
          </div>

          {/* Stats */}
          <div className="animate-fade-in-up delay-400 mt-16 grid grid-cols-3 gap-8 border-t border-zinc-800 pt-12">
            {[
              { value: '2.4k+', label: 'Projects shared' },
              { value: '8.1k+', label: 'Reviews given' },
              { value: '1.2k+', label: 'Developers' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="mt-1 text-sm text-zinc-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-4 text-center text-3xl font-bold text-white">
            Everything you need to grow
          </h2>
          <p className="mb-16 text-center text-zinc-500">
            Built for developers who want to improve through community feedback.
          </p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 hover:border-zinc-700 transition-colors"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400 text-xl">
                  {f.icon}
                </div>
                <h3 className="mb-2 font-semibold text-white">{f.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-zinc-800 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-16 text-3xl font-bold text-white">How it works</h2>
          <div className="grid gap-10 sm:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.title} className="flex flex-col items-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet-600/20 text-violet-400 font-bold text-lg">
                  {i + 1}
                </div>
                <h3 className="mb-2 font-semibold text-white">{step.title}</h3>
                <p className="text-sm text-zinc-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-800 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">
            Ready to get your code reviewed?
          </h2>
          <p className="mb-8 text-zinc-500">
            Join thousands of developers sharing and improving their work.
          </p>
          <Link
            href="/login"
            className="rounded-full bg-violet-600 px-10 py-3 text-base font-semibold text-white hover:bg-violet-500 transition-colors"
          >
            Get started — it&apos;s free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-sm font-semibold text-white">
            Code<span className="text-violet-500">Critic</span>
          </span>
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} CodeCritic. Built with Next.js & Supabase.
          </p>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    icon: '🚀',
    title: 'Project showcase',
    description:
      'Upload your projects with description, tech stack, GitHub link, and live demo. Make your work visible.',
  },
  {
    icon: '💬',
    title: 'Peer reviews',
    description:
      'Get structured feedback from other developers. Rate code quality, design, and overall execution.',
  },
  {
    icon: '🏆',
    title: 'Skill badges',
    description:
      'Earn badges as you contribute reviews and receive positive feedback. Build your reputation.',
  },
  {
    icon: '🔍',
    title: 'Discover projects',
    description:
      'Browse projects filtered by tech stack, language, or skill level. Get inspired by others.',
  },
  {
    icon: '📊',
    title: 'Portfolio analytics',
    description:
      'Track views, reviews, and ratings on your projects over time. Measure your growth.',
  },
  {
    icon: '🤝',
    title: 'Collaborate',
    description:
      'Connect with developers who share your stack. Find collaborators for your next project.',
  },
]

const steps = [
  {
    title: 'Submit your project',
    description: 'Share your GitHub repo, add a description and your tech stack.',
  },
  {
    title: 'Get reviewed',
    description: 'The community leaves structured, constructive feedback.',
  },
  {
    title: 'Improve & grow',
    description: 'Apply the feedback, level up your skills, build your portfolio.',
  },
]
