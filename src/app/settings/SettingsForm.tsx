'use client'

import { useState, useRef, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateProfile, updateAvatarUrl, deleteAccount } from '@/app/actions/profile'

interface Props {
  userId: string
  email: string
  initialDisplayName: string
  initialBio: string
  initialAvatarUrl: string
  hasGithub: boolean
}

export default function SettingsForm({
  userId,
  email,
  initialDisplayName,
  initialBio,
  initialAvatarUrl,
  hasGithub,
}: Props) {
  const [displayName, setDisplayName] = useState(initialDisplayName)
  const [bio, setBio] = useState(initialBio)
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [isPending, startTransition] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${userId}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setAvatarUploading(false)
      return
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    const publicUrl = `${data.publicUrl}?t=${Date.now()}`
    setAvatarUrl(publicUrl)
    await updateAvatarUrl(publicUrl)
    setAvatarUploading(false)
  }

  function handleProfileSave(formData: FormData) {
    setProfileError('')
    setProfileSaved(false)
    startTransition(async () => {
      const result = await updateProfile(formData)
      if (result?.error) {
        setProfileError(result.error)
      } else {
        setProfileSaved(true)
        setTimeout(() => setProfileSaved(false), 3000)
      }
    })
  }

  async function handleConnectGithub() {
    const supabase = createClient()
    await supabase.auth.linkIdentity({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/settings` },
    })
  }

  return (
    <div className="space-y-6">

      {/* Profile section */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-6 text-base font-semibold text-white">Profile</h2>

        {/* Avatar */}
        <div className="mb-6 flex items-center gap-5">
          <div className="relative">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt="Avatar"
                className="h-20 w-20 rounded-full object-cover ring-2 ring-zinc-700"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-violet-600/30 text-2xl font-bold text-violet-300">
                {displayName?.[0]?.toUpperCase() ?? '?'}
              </div>
            )}
            {avatarUploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60">
                <span className="text-xs text-white">...</span>
              </div>
            )}
          </div>
          <div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={avatarUploading}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors disabled:opacity-40"
            >
              {avatarUploading ? 'Uploading...' : 'Change photo'}
            </button>
            <p className="mt-1.5 text-xs text-zinc-600">JPG, PNG or GIF. Max 2MB.</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Form */}
        <form action={handleProfileSave} className="space-y-4">
          <input type="hidden" name="displayName" value={displayName} />
          <input type="hidden" name="bio" value={bio} />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-400">
              Display name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              name="displayName"
              placeholder="Your name"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-400">Email</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full rounded-xl border border-zinc-800 bg-zinc-800/50 px-4 py-2.5 text-sm text-zinc-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-400">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              name="bio"
              placeholder="Tell the community about yourself..."
              rows={3}
              className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-violet-500 focus:outline-none"
            />
          </div>

          {profileError && (
            <p className="text-sm text-red-400">{profileError}</p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-500 transition-colors disabled:opacity-40"
            >
              {isPending ? 'Saving...' : 'Save changes'}
            </button>
            {profileSaved && (
              <span className="text-sm text-green-400">Saved!</span>
            )}
          </div>
        </form>
      </section>

      {/* Connected accounts */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-1 text-base font-semibold text-white">Connected accounts</h2>
        <p className="mb-6 text-sm text-zinc-500">
          Link other accounts to sign in with multiple providers.
        </p>

        <div className="flex items-center justify-between rounded-xl border border-zinc-800 p-4">
          <div className="flex items-center gap-3">
            <GithubIcon />
            <div>
              <p className="text-sm font-medium text-white">GitHub</p>
              <p className="text-xs text-zinc-500">
                {hasGithub ? 'Connected' : 'Not connected'}
              </p>
            </div>
          </div>
          {hasGithub ? (
            <span className="rounded-full bg-green-900/30 px-3 py-1 text-xs font-medium text-green-400">
              Connected
            </span>
          ) : (
            <button
              onClick={handleConnectGithub}
              className="rounded-full border border-zinc-700 px-4 py-1.5 text-xs font-medium text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
            >
              Connect
            </button>
          )}
        </div>
      </section>

      {/* Danger zone */}
      <section className="rounded-2xl border border-red-900/40 bg-zinc-900 p-6">
        <h2 className="mb-1 text-base font-semibold text-red-400">Danger zone</h2>
        <p className="mb-6 text-sm text-zinc-500">
          Permanently delete your account and all your data. This cannot be undone.
        </p>

        {!deleteConfirm ? (
          <button
            onClick={() => setDeleteConfirm(true)}
            className="rounded-full border border-red-800 px-5 py-2 text-sm font-medium text-red-400 hover:bg-red-900/20 transition-colors"
          >
            Delete account
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-zinc-400">
              Type <span className="font-mono text-red-400">DELETE</span> to confirm.
            </p>
            <input
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="DELETE"
              className="w-full rounded-xl border border-red-800/50 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-red-500 focus:outline-none"
            />
            <div className="flex gap-3">
              <form action={deleteAccount}>
                <button
                  type="submit"
                  disabled={deleteInput !== 'DELETE'}
                  className="rounded-full bg-red-700 px-5 py-2 text-sm font-semibold text-white hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Yes, delete my account
                </button>
              </form>
              <button
                type="button"
                onClick={() => { setDeleteConfirm(false); setDeleteInput('') }}
                className="rounded-full border border-zinc-700 px-5 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>

    </div>
  )
}

function GithubIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}
