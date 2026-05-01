'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  adminToggleVisibility,
  adminToggleFeatured,
  adminDeleteProject,
  adminDeleteReview,
  adminSetUserRole,
  adminSendNotification,
  adminSetPremium,
} from '@/app/actions/admin'
import { STAFF_ROLES, isStaffRole, type StaffRole, type StaffPower } from '@/lib/staff-config'
import { StaffBadge } from '@/components/StaffBadge'

type Project = {
  id: string
  title: string
  is_public: boolean
  is_featured: boolean
  created_at: string
  user_id: string
  owner_name: string | null
  review_count: number
}

type User = {
  id: string
  full_name: string | null
  role: string | null
  created_at: string
  project_count: number
  review_count: number
  is_premium: boolean
}

type Review = {
  id: string
  project_id: string
  project_title: string | null
  reviewer_id: string
  reviewer_name: string | null
  rating: number
  comment: string
  created_at: string
}

type Tab = 'projects' | 'reviews' | 'users' | 'analytics'

function can(role: string, power: StaffPower): boolean {
  if (!isStaffRole(role)) return false
  return (STAFF_ROLES[role as StaffRole].powers as string[]).includes(power)
}

export default function AdminPanel({
  projects,
  users,
  reviews,
  currentRole,
}: {
  projects: Project[]
  users: User[]
  reviews: Review[]
  currentRole: string
}) {
  const [tab, setTab] = useState<Tab>('projects')

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'projects', label: 'Projects', count: projects.length },
    { key: 'reviews', label: 'Reviews', count: reviews.length },
    { key: 'users', label: 'Users', count: users.length },
    { key: 'analytics', label: 'Analytics' },
  ]

  return (
    <div>
      <div className="mb-8 flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Staff Panel</h1>
          <p className="mt-1 text-sm text-zinc-500">Moderation and administration tools.</p>
        </div>
        <span className="rounded-full border border-red-800/60 bg-red-900/20 px-3 py-1 text-xs font-medium text-red-400">
          Staff only
        </span>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: 'Total projects', value: projects.length },
          { label: 'Public projects', value: projects.filter((p) => p.is_public).length },
          { label: 'Featured', value: projects.filter((p) => p.is_featured).length },
          { label: 'Total users', value: users.length },
          { label: 'Total reviews', value: reviews.length },
          { label: 'Premium users', value: users.filter((u) => u.is_premium).length },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-4 text-center">
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="mt-1 text-xs text-zinc-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl border border-zinc-800 bg-zinc-900 p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-5 py-2 text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {t.label}{t.count !== undefined ? ` (${t.count})` : ''}
          </button>
        ))}
      </div>

      {tab === 'projects' && (
        <ProjectsTable
          projects={projects}
          canManageProjects={can(currentRole, 'manage_projects')}
          canFeature={can(currentRole, 'feature_projects')}
        />
      )}
      {tab === 'reviews' && (
        <ReviewsTable
          reviews={reviews}
          canManageReviews={can(currentRole, 'manage_reviews')}
        />
      )}
      {tab === 'users' && (
        <UsersTable
          users={users}
          canManageUsers={can(currentRole, 'manage_users')}
          canManageRoles={can(currentRole, 'manage_roles')}
          canSendNotifications={can(currentRole, 'send_notifications')}
          canManageSubscriptions={can(currentRole, 'manage_subscriptions')}
        />
      )}
      {tab === 'analytics' && can(currentRole, 'view_analytics') && (
        <AnalyticsSection projects={projects} users={users} reviews={reviews} />
      )}
      {tab === 'analytics' && !can(currentRole, 'view_analytics') && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 py-16 text-center text-zinc-600">
          You don&apos;t have permission to view analytics.
        </div>
      )}
    </div>
  )
}

function ProjectsTable({
  projects,
  canManageProjects,
  canFeature,
}: {
  projects: Project[]
  canManageProjects: boolean
  canFeature: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  function handleToggleVisibility(id: string, isPublic: boolean) {
    startTransition(() => adminToggleVisibility(id, isPublic))
  }

  function handleToggleFeatured(id: string, isFeatured: boolean) {
    startTransition(() => adminToggleFeatured(id, isFeatured))
  }

  function handleDelete(id: string) {
    if (confirmDelete === id) {
      startTransition(() => adminDeleteProject(id))
      setConfirmDelete(null)
    } else {
      setConfirmDelete(id)
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800">
            <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500">Project</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500">Owner</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500">Status</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500">Reviews</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500">Created</th>
            <th className="px-5 py-3 text-right text-xs font-medium text-zinc-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/50">
          {projects.map((project) => (
            <tr key={project.id} className="hover:bg-zinc-800/30 transition-colors">
              <td className="px-5 py-3">
                <Link
                  href={`/projects/${project.id}`}
                  className="font-medium text-white hover:text-violet-400 transition-colors line-clamp-1 max-w-[200px] block"
                >
                  {project.title}
                </Link>
              </td>
              <td className="px-5 py-3">
                <Link
                  href={`/u/${project.user_id}`}
                  className="text-zinc-400 hover:text-violet-400 transition-colors"
                >
                  {project.owner_name ?? 'Unknown'}
                </Link>
              </td>
              <td className="px-5 py-3">
                <div className="flex flex-wrap gap-1.5">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                    project.is_public
                      ? 'border-green-800/60 bg-green-900/20 text-green-400'
                      : 'border-yellow-800/60 bg-yellow-900/20 text-yellow-400'
                  }`}>
                    {project.is_public ? 'Public' : 'Private'}
                  </span>
                  {project.is_featured && (
                    <span className="rounded-full border border-amber-700/60 bg-amber-900/20 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                      Featured
                    </span>
                  )}
                </div>
              </td>
              <td className="px-5 py-3 text-zinc-400">{project.review_count}</td>
              <td className="px-5 py-3 text-zinc-600 text-xs">
                {new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </td>
              <td className="px-5 py-3">
                <div className="flex items-center justify-end gap-1.5">
                  {canManageProjects && (
                    <button
                      onClick={() => handleToggleVisibility(project.id, project.is_public)}
                      disabled={isPending}
                      title={project.is_public ? 'Make private' : 'Make public'}
                      className="rounded-lg border border-zinc-700 px-2.5 py-1 text-xs text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors disabled:opacity-40"
                    >
                      {project.is_public ? '👁 Hide' : '👁 Show'}
                    </button>
                  )}
                  {canFeature && (
                    <button
                      onClick={() => handleToggleFeatured(project.id, project.is_featured)}
                      disabled={isPending}
                      title={project.is_featured ? 'Unfeature' : 'Feature'}
                      className={`rounded-lg border px-2.5 py-1 text-xs transition-colors disabled:opacity-40 ${
                        project.is_featured
                          ? 'border-amber-700/60 text-amber-400 hover:border-amber-600'
                          : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
                      }`}
                    >
                      📌
                    </button>
                  )}
                  {canManageProjects && (
                    <>
                      <button
                        onClick={() => handleDelete(project.id)}
                        disabled={isPending}
                        className={`rounded-lg border px-2.5 py-1 text-xs transition-colors disabled:opacity-40 ${
                          confirmDelete === project.id
                            ? 'border-red-600 bg-red-900/30 text-red-300'
                            : 'border-red-900/50 text-red-400 hover:border-red-700'
                        }`}
                      >
                        {confirmDelete === project.id ? 'Confirm?' : '🗑 Delete'}
                      </button>
                      {confirmDelete === project.id && (
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="rounded-lg border border-zinc-700 px-2.5 py-1 text-xs text-zinc-400 hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {projects.length === 0 && (
        <div className="py-12 text-center text-zinc-600">No projects found.</div>
      )}
    </div>
  )
}

function ReviewsTable({
  reviews,
  canManageReviews,
}: {
  reviews: Review[]
  canManageReviews: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  function handleDelete(id: string) {
    if (confirmDelete === id) {
      startTransition(() => adminDeleteReview(id))
      setConfirmDelete(null)
    } else {
      setConfirmDelete(id)
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800">
            <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500">Project</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500">Reviewer</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500">Rating</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500">Comment</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500">Date</th>
            {canManageReviews && (
              <th className="px-5 py-3 text-right text-xs font-medium text-zinc-500">Actions</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/50">
          {reviews.map((review) => (
            <tr key={review.id} className="hover:bg-zinc-800/30 transition-colors">
              <td className="px-5 py-3">
                <Link
                  href={`/projects/${review.project_id}`}
                  className="font-medium text-white hover:text-violet-400 transition-colors line-clamp-1 max-w-[160px] block"
                >
                  {review.project_title ?? 'Unknown'}
                </Link>
              </td>
              <td className="px-5 py-3">
                <Link
                  href={`/u/${review.reviewer_id}`}
                  className="text-zinc-400 hover:text-violet-400 transition-colors"
                >
                  {review.reviewer_name ?? 'Unknown'}
                </Link>
              </td>
              <td className="px-5 py-3">
                <span className="text-amber-400 text-xs">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
              </td>
              <td className="px-5 py-3 text-zinc-400 text-xs max-w-[280px]">
                <span className="line-clamp-2">{review.comment}</span>
              </td>
              <td className="px-5 py-3 text-zinc-600 text-xs whitespace-nowrap">
                {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </td>
              {canManageReviews && (
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => handleDelete(review.id)}
                      disabled={isPending}
                      className={`rounded-lg border px-2.5 py-1 text-xs transition-colors disabled:opacity-40 ${
                        confirmDelete === review.id
                          ? 'border-red-600 bg-red-900/30 text-red-300'
                          : 'border-red-900/50 text-red-400 hover:border-red-700'
                      }`}
                    >
                      {confirmDelete === review.id ? 'Confirm?' : '🗑 Delete'}
                    </button>
                    {confirmDelete === review.id && (
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="rounded-lg border border-zinc-700 px-2.5 py-1 text-xs text-zinc-400 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {reviews.length === 0 && (
        <div className="py-12 text-center text-zinc-600">No reviews found.</div>
      )}
    </div>
  )
}

const ROLE_OPTIONS = ['user', 'support', 'moderator', 'admin', 'developer'] as const

function UsersTable({
  users,
  canManageUsers,
  canManageRoles,
  canSendNotifications,
  canManageSubscriptions,
}: {
  users: User[]
  canManageUsers: boolean
  canManageRoles: boolean
  canSendNotifications: boolean
  canManageSubscriptions: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const [notifyUserId, setNotifyUserId] = useState<string | null>(null)
  const [notifyMessage, setNotifyMessage] = useState('')
  const [notifySent, setNotifySent] = useState<string | null>(null)

  function handleRoleChange(userId: string, role: string) {
    startTransition(() => adminSetUserRole(userId, role))
  }

  function handleSendNotification(userId: string) {
    if (!notifyMessage.trim()) return
    startTransition(async () => {
      await adminSendNotification(userId, notifyMessage.trim())
      setNotifySent(userId)
      setNotifyUserId(null)
      setNotifyMessage('')
    })
  }

  function handleSetPremium(userId: string, active: boolean) {
    startTransition(() => adminSetPremium(userId, active))
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800">
            <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500">User</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500">Role</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500">Projects</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500">Reviews given</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500">Joined</th>
            <th className="px-5 py-3 text-right text-xs font-medium text-zinc-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/50">
          {users.map((user) => (
            <React.Fragment key={user.id}>
              <tr className="hover:bg-zinc-800/30 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/u/${user.id}`}
                      className="font-medium text-white hover:text-violet-400 transition-colors"
                    >
                      {user.full_name ?? 'Anonymous'}
                    </Link>
                    {user.is_premium && (
                      <span className="rounded-full border border-amber-700/60 bg-amber-900/20 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                        👑 Premium
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3">
                  {canManageRoles ? (
                    <select
                      value={user.role ?? 'user'}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={isPending}
                      className="rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-300 focus:border-violet-500 focus:outline-none disabled:opacity-40"
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  ) : (
                    <>
                      <StaffBadge role={user.role} />
                      {!isStaffRole(user.role) && (
                        <span className="rounded-full border border-zinc-800 px-2.5 py-0.5 text-[10px] text-zinc-600">user</span>
                      )}
                    </>
                  )}
                </td>
                <td className="px-5 py-3 text-zinc-400">{user.project_count}</td>
                <td className="px-5 py-3 text-zinc-400">{user.review_count}</td>
                <td className="px-5 py-3 text-zinc-600 text-xs">
                  {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      href={`/u/${user.id}`}
                      className="rounded-lg border border-zinc-700 px-2.5 py-1 text-xs text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors"
                    >
                      View
                    </Link>
                    {canSendNotifications && (
                      <button
                        onClick={() => {
                          setNotifyUserId(notifyUserId === user.id ? null : user.id)
                          setNotifyMessage('')
                          setNotifySent(null)
                        }}
                        disabled={isPending}
                        className={`rounded-lg border px-2.5 py-1 text-xs transition-colors disabled:opacity-40 ${
                          notifyUserId === user.id
                            ? 'border-violet-600 bg-violet-900/20 text-violet-300'
                            : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
                        }`}
                      >
                        💬 Notify
                      </button>
                    )}
                    {canManageSubscriptions && (
                      <button
                        onClick={() => handleSetPremium(user.id, !user.is_premium)}
                        disabled={isPending}
                        className={`rounded-lg border px-2.5 py-1 text-xs transition-colors disabled:opacity-40 ${
                          user.is_premium
                            ? 'border-amber-700/60 text-amber-400 hover:border-amber-600'
                            : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
                        }`}
                      >
                        {user.is_premium ? '👑 Revoke' : '👑 Grant'}
                      </button>
                    )}
                    {notifySent === user.id && (
                      <span className="text-xs text-green-400">Sent!</span>
                    )}
                  </div>
                </td>
              </tr>
              {notifyUserId === user.id && (
                <tr className="bg-zinc-800/40">
                  <td colSpan={6} className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500 shrink-0">Message to {user.full_name ?? 'user'}:</span>
                      <input
                        type="text"
                        value={notifyMessage}
                        onChange={(e) => setNotifyMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendNotification(user.id)}
                        placeholder="Type a notification message..."
                        className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:border-violet-500 focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSendNotification(user.id)}
                        disabled={isPending || !notifyMessage.trim()}
                        className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-500 disabled:opacity-40 transition-colors"
                      >
                        Send
                      </button>
                      <button
                        onClick={() => setNotifyUserId(null)}
                        className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      {users.length === 0 && (
        <div className="py-12 text-center text-zinc-600">No users found.</div>
      )}
    </div>
  )
}

function AnalyticsSection({
  projects,
  users,
  reviews,
}: {
  projects: Project[]
  users: User[]
  reviews: Review[]
}) {
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2)
      : 'N/A'
  const premiumCount = users.filter((u) => u.is_premium).length
  const staffCount = users.filter((u) => isStaffRole(u.role)).length

  const topProjects = [...projects]
    .sort((a, b) => b.review_count - a.review_count)
    .slice(0, 5)

  const topReviewers = [...users]
    .filter((u) => u.review_count > 0)
    .sort((a, b) => b.review_count - a.review_count)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total reviews', value: reviews.length },
          { label: 'Avg rating', value: avgRating },
          { label: 'Premium users', value: premiumCount },
          { label: 'Staff members', value: staffCount },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-4 text-center">
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="mt-1 text-xs text-zinc-500">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top projects */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800">
            <h3 className="text-sm font-semibold text-white">Most reviewed projects</h3>
          </div>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-zinc-800/50">
              {topProjects.map((p, i) => (
                <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-3 text-zinc-600 text-xs w-8">{i + 1}</td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/projects/${p.id}`}
                      className="text-white hover:text-violet-400 transition-colors line-clamp-1"
                    >
                      {p.title}
                    </Link>
                    <div className="text-xs text-zinc-600">{p.owner_name ?? 'Unknown'}</div>
                  </td>
                  <td className="px-5 py-3 text-right text-zinc-400 text-xs">
                    {p.review_count} review{p.review_count !== 1 ? 's' : ''}
                  </td>
                </tr>
              ))}
              {topProjects.length === 0 && (
                <tr><td colSpan={3} className="px-5 py-8 text-center text-zinc-600 text-xs">No data</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Top reviewers */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800">
            <h3 className="text-sm font-semibold text-white">Most active reviewers</h3>
          </div>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-zinc-800/50">
              {topReviewers.map((u, i) => (
                <tr key={u.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-3 text-zinc-600 text-xs w-8">{i + 1}</td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/u/${u.id}`}
                      className="text-white hover:text-violet-400 transition-colors"
                    >
                      {u.full_name ?? 'Anonymous'}
                    </Link>
                    {isStaffRole(u.role) && (
                      <span className="ml-1.5"><StaffBadge role={u.role} /></span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right text-zinc-400 text-xs">
                    {u.review_count} review{u.review_count !== 1 ? 's' : ''}
                  </td>
                </tr>
              ))}
              {topReviewers.length === 0 && (
                <tr><td colSpan={3} className="px-5 py-8 text-center text-zinc-600 text-xs">No data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
