import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Contact Us — CodeCritic',
  description: 'Get in touch with the CodeCritic team.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-white mb-3">Contact us</h1>
          <p className="text-zinc-500 max-w-md mx-auto">
            Have a question, found a bug, or want to share feedback? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          {/* Contact options */}
          <div className="space-y-4">
            {[
              {
                icon: '📧',
                title: 'Email',
                description: 'For general inquiries and support.',
                value: 'hello@codecritic.dev',
                href: 'mailto:hello@codecritic.dev',
              },
              {
                icon: '🐛',
                title: 'Bug reports',
                description: 'Found something broken? Let us know.',
                value: 'bugs@codecritic.dev',
                href: 'mailto:bugs@codecritic.dev',
              },
              {
                icon: '🔒',
                title: 'Security',
                description: 'Report security vulnerabilities responsibly.',
                value: 'security@codecritic.dev',
                href: 'mailto:security@codecritic.dev',
              },
              {
                icon: '💼',
                title: 'Business',
                description: 'Partnerships, sponsorships, and press.',
                value: 'business@codecritic.dev',
                href: 'mailto:business@codecritic.dev',
              },
            ].map((item) => (
              <a
                key={item.title}
                href={item.href}
                className="flex items-start gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 hover:border-zinc-700 transition-colors group"
              >
                <span className="text-2xl shrink-0">{item.icon}</span>
                <div>
                  <p className="font-semibold text-white group-hover:text-violet-300 transition-colors">
                    {item.title}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5 mb-1">{item.description}</p>
                  <p className="text-sm text-violet-400">{item.value}</p>
                </div>
              </a>
            ))}
          </div>

          {/* Quick contact form */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-lg font-semibold text-white mb-5">Send a message</h2>
            <form
              action="mailto:hello@codecritic.dev"
              method="get"
              encType="text/plain"
              className="space-y-4"
            >
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your name"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-violet-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Subject
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  placeholder="What's this about?"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-violet-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label htmlFor="body" className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Message
                </label>
                <textarea
                  id="body"
                  name="body"
                  rows={5}
                  placeholder="Tell us how we can help..."
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-violet-500 focus:outline-none resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 transition-colors"
              >
                Open in mail app →
              </button>

              <p className="text-center text-xs text-zinc-600">
                This will open your default mail client.
              </p>
            </form>
          </div>
        </div>

        {/* Response time notice */}
        <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
          <p className="text-sm text-zinc-500">
            <span className="text-zinc-300 font-medium">Typical response time: </span>
            We aim to respond to all messages within 48 hours on business days.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
