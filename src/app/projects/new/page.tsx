import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/server'
import NewProjectForm from './NewProjectForm'

export default async function NewProjectPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: identitiesData } = await supabase.auth.getUserIdentities()
  const githubIdentity = identitiesData?.identities?.find((i) => i.provider === 'github')
  const githubUsername: string | null =
    githubIdentity?.identity_data?.user_name ??
    githubIdentity?.identity_data?.preferred_username ??
    null

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Submit a project</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Share your work and get feedback from the community.
          </p>
        </div>

        {!githubUsername ? (
          <div className="rounded-2xl border border-zinc-700 bg-zinc-900 p-8 text-center">
            <div className="mb-4 text-4xl">🔗</div>
            <h2 className="mb-2 text-lg font-semibold text-white">Connect GitHub first</h2>
            <p className="mb-6 text-sm text-zinc-400 max-w-sm mx-auto">
              To submit a project you need to connect your GitHub account so we can verify the repository belongs to you.
            </p>
            <Link
              href="/settings"
              className="inline-block rounded-full bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 transition-colors"
            >
              Go to Settings →
            </Link>
          </div>
        ) : (
          <NewProjectForm userId={user.id} githubUsername={githubUsername} />
        )}
      </main>
    </div>
  )
}
