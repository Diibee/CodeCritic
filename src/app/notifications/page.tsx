import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/server'
import MarkReadButton from './MarkReadButton'
import DeleteAllButton from './DeleteAllButton'
import NotificationLink from './NotificationLink'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*, projects(id, title)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const items = notifications ?? []
  const unreadCount = items.filter((n) => !n.read).length

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
            Notifications
            {unreadCount > 0 && (
              <span className="rounded-full bg-violet-600 px-2.5 py-0.5 text-sm font-medium">
                {unreadCount}
              </span>
            )}
          </h1>
          <div className="flex items-center gap-4">
            {unreadCount > 0 && <MarkReadButton userId={user.id} />}
            {items.length > 0 && <DeleteAllButton userId={user.id} />}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="py-20 text-center text-zinc-600">
            No notifications yet — once someone reviews your project you&apos;ll see it here.
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((n) => {
              const project = (n as { projects?: { id: string; title: string } | null }).projects
              return (
                <NotificationLink
                  key={n.id}
                  id={n.id}
                  projectId={n.project_id}
                  read={n.read}
                >
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      n.read ? 'bg-transparent' : 'bg-violet-500'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-300">
                      Someone reviewed your project{' '}
                      <span className="font-semibold text-white">
                        {project?.title ?? 'Unknown project'}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-600">
                      {new Date(n.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </NotificationLink>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
