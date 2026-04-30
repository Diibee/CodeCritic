'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NotificationLink({
  id,
  projectId,
  read,
  children,
}: {
  id: string
  projectId: string
  read: boolean
  children: React.ReactNode
}) {
  const router = useRouter()

  async function handleClick() {
    if (!read) {
      const supabase = createClient()
      await supabase.from('notifications').update({ read: true }).eq('id', id)
    }
    router.push(`/projects/${projectId}`)
  }

  return (
    <button
      onClick={handleClick}
      className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors hover:border-zinc-600 ${
        read ? 'border-zinc-800 bg-zinc-900/40' : 'border-zinc-700 bg-zinc-900'
      }`}
    >
      {children}
    </button>
  )
}
