import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/server'
import NewProjectForm from './NewProjectForm'

export default async function NewProjectPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

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

        <NewProjectForm userId={user.id} />
      </main>
    </div>
  )
}
