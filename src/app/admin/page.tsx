import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { isStaff, getStaffRole } from '@/lib/staff'
import AdminPanel from './AdminPanel'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const staffRole = await getStaffRole(user.id)
  if (!staffRole) redirect('/')

  // Fetch all projects (including private) with owner and review count
  const { data: rawProjects } = await supabaseAdmin
    .from('projects')
    .select('id, title, is_public, is_featured, created_at, user_id, profiles(full_name), reviews(id)')
    .order('created_at', { ascending: false })
    .limit(200)

  // Fetch all profiles with project + review counts
  const { data: rawUsers } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, role, created_at, projects(id), reviews(id)')
    .order('created_at', { ascending: false })
    .limit(200)

  const projects = (rawProjects ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    description: '',
    is_public: p.is_public,
    is_featured: p.is_featured ?? false,
    created_at: p.created_at,
    user_id: p.user_id,
    owner_name: (Array.isArray(p.profiles) ? p.profiles[0] : p.profiles as { full_name: string | null } | null)?.full_name ?? null,
    review_count: Array.isArray(p.reviews) ? p.reviews.length : 0,
  }))

  const users = (rawUsers ?? []).map((u) => ({
    id: u.id,
    full_name: u.full_name,
    role: u.role ?? 'user',
    created_at: u.created_at,
    project_count: Array.isArray(u.projects) ? u.projects.length : 0,
    review_count: Array.isArray(u.reviews) ? u.reviews.length : 0,
  }))

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <AdminPanel projects={projects} users={users} currentRole={staffRole} />
      </main>
    </div>
  )
}
