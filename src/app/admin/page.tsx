import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getStaffRole } from '@/lib/staff'
import AdminPanel from './AdminPanel'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const staffRole = await getStaffRole(user.id)
  if (!staffRole) redirect('/')

  // Fetch all projects (including private)
  const { data: rawProjects } = await supabaseAdmin
    .from('projects')
    .select('id, title, is_public, is_featured, created_at, user_id')
    .order('created_at', { ascending: false })
    .limit(200)

  // Fetch owner names separately
  const ownerIds = [...new Set((rawProjects ?? []).map((p) => p.user_id))]
  const { data: ownerProfiles } = ownerIds.length > 0
    ? await supabaseAdmin.from('profiles').select('id, full_name').in('id', ownerIds)
    : { data: [] }
  const ownerMap = Object.fromEntries((ownerProfiles ?? []).map((p) => [p.id, p.full_name]))

  // Fetch review counts per project
  const { data: allReviews } = await supabaseAdmin
    .from('reviews')
    .select('project_id')
  const reviewCountMap: Record<string, number> = {}
  for (const r of allReviews ?? []) {
    reviewCountMap[r.project_id] = (reviewCountMap[r.project_id] ?? 0) + 1
  }

  // Fetch all users
  const { data: rawUsers } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, role, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  // Fetch project + review counts per user
  const { data: allProjectsForCount } = await supabaseAdmin.from('projects').select('user_id')
  const { data: allUserReviews } = await supabaseAdmin.from('reviews').select('reviewer_id')

  const projectCountMap: Record<string, number> = {}
  for (const p of allProjectsForCount ?? []) {
    projectCountMap[p.user_id] = (projectCountMap[p.user_id] ?? 0) + 1
  }
  const userReviewCountMap: Record<string, number> = {}
  for (const r of allUserReviews ?? []) {
    userReviewCountMap[r.reviewer_id] = (userReviewCountMap[r.reviewer_id] ?? 0) + 1
  }

  // Fetch premium subscriptions
  const { data: subscriptions } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id, status')
  const premiumUserIds = new Set(
    (subscriptions ?? []).filter((s) => s.status === 'active').map((s) => s.user_id)
  )

  // Fetch reviews for manage_reviews tab
  const { data: rawReviews } = await supabaseAdmin
    .from('reviews')
    .select('id, project_id, reviewer_id, rating, comment, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  const reviewerIds = [...new Set((rawReviews ?? []).map((r) => r.reviewer_id))]
  const reviewProjectIds = [...new Set((rawReviews ?? []).map((r) => r.project_id))]
  const [{ data: reviewerProfiles }, { data: reviewProjects }] = await Promise.all([
    reviewerIds.length > 0
      ? supabaseAdmin.from('profiles').select('id, full_name').in('id', reviewerIds)
      : Promise.resolve({ data: [] }),
    reviewProjectIds.length > 0
      ? supabaseAdmin.from('projects').select('id, title').in('id', reviewProjectIds)
      : Promise.resolve({ data: [] }),
  ])
  const reviewerMap = Object.fromEntries((reviewerProfiles ?? []).map((p) => [p.id, p.full_name]))
  const reviewProjectMap = Object.fromEntries((reviewProjects ?? []).map((p) => [p.id, p.title]))

  const projects = (rawProjects ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    is_public: p.is_public,
    is_featured: p.is_featured ?? false,
    created_at: p.created_at,
    user_id: p.user_id,
    owner_name: ownerMap[p.user_id] ?? null,
    review_count: reviewCountMap[p.id] ?? 0,
  }))

  const users = (rawUsers ?? []).map((u) => ({
    id: u.id,
    full_name: u.full_name,
    role: u.role ?? 'user',
    created_at: u.created_at,
    project_count: projectCountMap[u.id] ?? 0,
    review_count: userReviewCountMap[u.id] ?? 0,
    is_premium: premiumUserIds.has(u.id),
  }))

  const reviews = (rawReviews ?? []).map((r) => ({
    id: r.id,
    project_id: r.project_id,
    project_title: reviewProjectMap[r.project_id] ?? null,
    reviewer_id: r.reviewer_id,
    reviewer_name: reviewerMap[r.reviewer_id] ?? null,
    rating: r.rating as number,
    comment: r.comment as string,
    created_at: r.created_at,
  }))

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <AdminPanel projects={projects} users={users} reviews={reviews} currentRole={staffRole} />
      </main>
    </div>
  )
}
