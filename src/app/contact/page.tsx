import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Contact — CodeCritic',
  description: 'Get in touch with the creator of CodeCritic.',
}

const EMAIL = 'dibe.mtt@gmail.com'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-white mb-3">Get in touch</h1>
          <p className="text-zinc-500">
            CodeCritic is a solo project. Have a question, found a bug, or just want to say hi?
            Drop me a message.
          </p>
        </div>

        {/* Email card */}
        <a
          href={`mailto:${EMAIL}`}
          className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 hover:border-violet-600/50 transition-colors group mb-8"
        >
          <span className="text-2xl shrink-0">📧</span>
          <div>
            <p className="text-xs text-zinc-500 mb-0.5">Email me directly</p>
            <p className="font-medium text-violet-400 group-hover:text-violet-300 transition-colors">
              {EMAIL}
            </p>
          </div>
        </a>

        {/* Form */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-base font-semibold text-white mb-5">Send a message</h2>
          <form
            action={`mailto:${EMAIL}`}
            method="get"
            encType="text/plain"
            className="space-y-4"
          >
            <div>
              <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-zinc-300">
                Subject
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                placeholder="What's on your mind?"
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
                placeholder="Bug report, feedback, idea..."
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
              Opens your default mail client with the message pre-filled.
            </p>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}
