'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DeleteAllButton({ userId }: { userId: string }) {
  const router = useRouter()

  async function deleteAll() {
    const supabase = createClient()
    await supabase.from('notifications').delete().eq('user_id', userId)
    router.refresh()
  }

  return (
    <button
      onClick={deleteAll}
      className="text-sm text-zinc-600 hover:text-red-400 transition-colors"
    >
      Delete all
    </button>
  )
}
