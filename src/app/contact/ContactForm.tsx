'use client'

import { useState } from 'react'

const EMAIL = 'dibe.mtt@gmail.com'

export default function ContactForm() {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  function handleSend() {
    const url = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = url
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-zinc-300">
          Subject
        </label>
        <input
          id="subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-violet-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="body" className="mb-1.5 block text-sm font-medium text-zinc-300">
          Message
        </label>
        <textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          placeholder="Bug report, feedback, idea..."
          className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-violet-500 focus:outline-none resize-none"
        />
      </div>

      <button
        type="button"
        onClick={handleSend}
        className="w-full rounded-full bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 transition-colors"
      >
        Open in mail app →
      </button>

      <p className="text-center text-xs text-zinc-600">
        Opens your default mail client with the message pre-filled.
      </p>
    </div>
  )
}
