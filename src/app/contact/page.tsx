import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ContactForm from './ContactForm'

export const metadata = {
  title: 'Contact — CodeCritic',
  description: 'Get in touch with the creator of CodeCritic.',
}

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
          <ContactForm />
        </div>
      </main>

      <Footer />
    </div>
  )
}
