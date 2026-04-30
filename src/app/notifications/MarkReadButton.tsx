'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function MarkReadButton({ userId }: { userId: string }) {
  const router = useRouter()

  async function markAllRead() {
    const supabase = createClient()
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)
    router.refresh()
  }

  return (
    <button
      onClick={markAllRead}
      className="text-sm text-zinc-400 hover:text-white transition-colors"
    >
      Mark all as read
    </button>
  )
}
