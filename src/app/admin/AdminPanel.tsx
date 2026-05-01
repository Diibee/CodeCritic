'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  adminToggleVisibility,
  adminToggleFeatured,
  adminDeleteProject,
} from '@/app/actions/admin'

type Project = {
  id: string
  title: string
  description: string
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
}

type Tab = 'projects' | 'users'

export default function AdminPanel({ projects, users }: { projects: Project[]; users: User[] }) {
  const [tab, setTab] = useState<Tab>('projects')

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
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total projects', value: projects.length },
          { label: 'Public projects', value: projects.filter((p) => p.is_public).length },
          { label: 'Featured projects', value: projects.filter((p) => p.is_featured).length },
          { label: 'Total users', value: users.length },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-4 text-center">
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="mt-1 text-xs text-zinc-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl border border-zinc-800 bg-zinc-900 p-1 w-fit">
        {(['projects', 'users'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-5 py-2 text-sm font-medium capitalize transition-colors ${
              tab === t ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {t} ({t === 'projects' ? projects.length : users.length})
          </button>
        ))}
      </div>

      {tab === 'projects' && <ProjectsTable projects={projects} />}
      {tab === 'users' && <UsersTable users={users} />}
    </div>
  )
}

function ProjectsTable({ projects }: { projects: Project[] }) {
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
                  <button
                    onClick={() => handleToggleVisibility(project.id, project.is_public)}
                    disabled={isPending}
                    title={project.is_public ? 'Make private' : 'Make public'}
                    className="rounded-lg border border-zinc-700 px-2.5 py-1 text-xs text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors disabled:opacity-40"
                  >
                    {project.is_public ? '👁 Hide' : '👁 Show'}
                  </button>
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

function UsersTable({ users }: { users: User[] }) {
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
            <tr key={user.id} className="hover:bg-zinc-800/30 transition-colors">
              <td className="px-5 py-3">
                <Link
                  href={`/u/${user.id}`}
                  className="font-medium text-white hover:text-violet-400 transition-colors"
                >
                  {user.full_name ?? 'Anonymous'}
                </Link>
              </td>
              <td className="px-5 py-3">
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium border ${
                  user.role === 'admin'
                    ? 'border-red-700/60 bg-red-900/20 text-red-400'
                    : user.role === 'staff'
                    ? 'border-violet-700/60 bg-violet-900/20 text-violet-400'
                    : 'border-zinc-700 text-zinc-500'
                }`}>
                  {user.role ?? 'user'}
                </span>
              </td>
              <td className="px-5 py-3 text-zinc-400">{user.project_count}</td>
              <td className="px-5 py-3 text-zinc-400">{user.review_count}</td>
              <td className="px-5 py-3 text-zinc-600 text-xs">
                {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </td>
              <td className="px-5 py-3 text-right">
                <Link
                  href={`/u/${user.id}`}
                  className="rounded-lg border border-zinc-700 px-2.5 py-1 text-xs text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors"
                >
                  View profile
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && (
        <div className="py-12 text-center text-zinc-600">No users found.</div>
      )}
    </div>
  )
}
