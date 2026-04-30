import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/server'
import SettingsForm from './SettingsForm'
import type { UserIdentity } from '@supabase/supabase-js'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: identitiesData } = await supabase.auth.getUserIdentities()
  const identities: UserIdentity[] = identitiesData?.identities ?? []

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage your profile and account preferences.
          </p>
        </div>

        <SettingsForm
          userId={user.id}
          email={user.email ?? ''}
          initialDisplayName={profile?.full_name ?? user.user_metadata?.full_name ?? ''}
          initialBio={profile?.bio ?? ''}
          initialAvatarUrl={profile?.avatar_url ?? user.user_metadata?.avatar_url ?? ''}
          identities={identities}
        />
      </main>
    </div>
  )
}
