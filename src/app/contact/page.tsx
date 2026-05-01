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

      <main className="flex-1 mx-auto w-full max-w-lg px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-white mb-3">Get in touch</h1>
          <p className="text-zinc-500">
            CodeCritic is a solo project. Have a question, found a bug, or just want to say hi?
            Fill in the form and I&apos;ll get back to you.
          </p>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <ContactForm />
        </div>
      </main>

      <Footer />
    </div>
  )
}
