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

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    const supabase = createClient()
    await supabase.from('notifications').delete().eq('id', id)
    router.refresh()
  }

  return (
    <div className={`group relative flex items-center gap-3 rounded-2xl border p-4 transition-colors hover:border-zinc-600 ${
      read ? 'border-zinc-800 bg-zinc-900/40' : 'border-zinc-700 bg-zinc-900'
    }`}>
      <button onClick={handleClick} className="flex flex-1 items-center gap-3 text-left">
        {children}
      </button>
      <button
        onClick={handleDelete}
        className="shrink-0 rounded-lg p-1 text-zinc-600 opacity-0 transition-all hover:bg-zinc-800 hover:text-zinc-300 group-hover:opacity-100"
        title="Delete"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
