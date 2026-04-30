'use client'

import { useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { updateProfile, updateAvatarUrl, deleteAccount } from '@/app/actions/profile'
import type { UserIdentity } from '@supabase/supabase-js'

interface Props {
  userId: string
  email: string
  initialDisplayName: string
  initialBio: string
  initialAvatarUrl: string
  identities: UserIdentity[]
}

function validatePassword(pw: string) {
  return {
    length: pw.length >= 8,
    uppercase: /[A-Z]/.test(pw),
    number: /[0-9]/.test(pw),
    special: /[^a-zA-Z0-9]/.test(pw),
  }
}

const PROVIDERS = [
  { id: 'google',  label: 'Google',  icon: <GoogleIcon /> },
  { id: 'github',  label: 'GitHub',  icon: <GithubIcon /> },
  { id: 'discord', label: 'Discord', icon: <DiscordIcon /> },
] as const

export default function SettingsForm({
  userId, email, initialDisplayName, initialBio, initialAvatarUrl, identities,
}: Props) {
  const router = useRouter()

  // Profile
  const [displayName, setDisplayName] = useState(initialDisplayName)
  const [bio, setBio] = useState(initialBio)
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [isPending, startTransition] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)

  // Email change
  const [newEmail, setNewEmail] = useState('')
  const [emailMsg, setEmailMsg] = useState('')
  const [emailError, setEmailError] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)

  // Password change
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwMsg, setPwMsg] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const pwChecks = validatePassword(newPassword)
  const pwValid = Object.values(pwChecks).every(Boolean)

  // Delete
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')

  // Connected accounts
  const connectedProviders = new Set(identities.map((i) => i.provider))
  const hasEmailAuth = connectedProviders.has('email')
  const canUnlink = identities.length > 1

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${userId}/avatar.${ext}`
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (uploadError) { setAvatarUploading(false); return }
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

  async function handleEmailChange(e: React.FormEvent) {
    e.preventDefault()
    setEmailError('')
    setEmailMsg('')
    if (!newEmail.trim()) return
    setEmailLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser(
      { email: newEmail.trim() },
      { emailRedirectTo: `${window.location.origin}/auth/callback?next=/settings` },
    )
    setEmailLoading(false)
    if (error) { setEmailError(error.message); return }
    setEmailMsg('Check your new email address to confirm the change.')
    setNewEmail('')
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setPwError('')
    setPwMsg('')
    if (!pwValid) { setPwError('Password does not meet the requirements.'); return }
    if (newPassword !== confirmPassword) { setPwError('Passwords do not match.'); return }
    setPwLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setPwLoading(false)
    if (error) { setPwError(error.message); return }
    setPwMsg('Password updated successfully.')
    setNewPassword('')
    setConfirmPassword('')
  }

  async function handleConnect(provider: 'google' | 'github' | 'discord') {
    const supabase = createClient()
    await supabase.auth.linkIdentity({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/settings` },
    })
  }

  async function handleUnlink(identity: UserIdentity) {
    const supabase = createClient()
    const { error } = await supabase.auth.unlinkIdentity(identity)
    if (!error) router.refresh()
  }

  return (
    <div className="space-y-6">

      {/* Profile */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-6 text-base font-semibold text-white">Profile</h2>

        <div className="mb-6 flex items-center gap-5">
          <div className="relative">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="Avatar" className="h-20 w-20 rounded-full object-cover ring-2 ring-zinc-700" />
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
            <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </div>
        </div>

        <form action={handleProfileSave} className="space-y-4">
          <input type="hidden" name="displayName" value={displayName} />
          <input type="hidden" name="bio" value={bio} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-400">Display name</label>
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
          {profileError && <p className="text-sm text-red-400">{profileError}</p>}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-500 transition-colors disabled:opacity-40"
            >
              {isPending ? 'Saving...' : 'Save changes'}
            </button>
            {profileSaved && <span className="text-sm text-green-400">Saved!</span>}
          </div>
        </form>
      </section>

      {/* Change email */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-1 text-base font-semibold text-white">Email address</h2>
        <p className="mb-5 text-sm text-zinc-500">Current: <span className="text-zinc-300">{email}</span></p>
        <form onSubmit={handleEmailChange} className="space-y-3">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="New email address"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-violet-500 focus:outline-none"
          />
          {emailError && <p className="text-sm text-red-400">{emailError}</p>}
          {emailMsg && <p className="text-sm text-green-400">{emailMsg}</p>}
          <button
            type="submit"
            disabled={emailLoading || !newEmail.trim()}
            className="rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-500 transition-colors disabled:opacity-40"
          >
            {emailLoading ? 'Sending...' : 'Update email'}
          </button>
        </form>
      </section>

      {/* Change password */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-1 text-base font-semibold text-white">Password</h2>
        <p className="mb-5 text-sm text-zinc-500">
          {hasEmailAuth ? 'Choose a new password for your account.' : 'Set a password to enable email sign-in.'}
        </p>
        <form onSubmit={handlePasswordChange} className="space-y-3">
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 pr-11 text-sm text-white placeholder-zinc-600 focus:border-violet-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              tabIndex={-1}
            >
              {showPw ? '🙈' : '👁'}
            </button>
          </div>

          {newPassword.length > 0 && (
            <ul className="space-y-1 rounded-xl bg-zinc-800/50 px-4 py-3 text-xs">
              {[
                [pwChecks.length, 'At least 8 characters'],
                [pwChecks.uppercase, 'At least 1 uppercase letter'],
                [pwChecks.number, 'At least 1 number'],
                [pwChecks.special, 'At least 1 special character'],
              ].map(([ok, label]) => (
                <li key={label as string} className={`flex items-center gap-2 ${ok ? 'text-green-400' : 'text-zinc-500'}`}>
                  <span>{ok ? '✓' : '○'}</span>{label}
                </li>
              ))}
            </ul>
          )}

          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className={`w-full rounded-xl border bg-zinc-800 px-4 py-2.5 pr-11 text-sm text-white placeholder-zinc-600 focus:outline-none ${
                confirmPassword.length > 0 && newPassword !== confirmPassword
                  ? 'border-red-600 focus:border-red-500'
                  : 'border-zinc-700 focus:border-violet-500'
              }`}
            />
            {confirmPassword.length > 0 && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
                {newPassword === confirmPassword ? '✓' : '✗'}
              </span>
            )}
          </div>

          {pwError && <p className="text-sm text-red-400">{pwError}</p>}
          {pwMsg && <p className="text-sm text-green-400">{pwMsg}</p>}

          <button
            type="submit"
            disabled={pwLoading || !newPassword}
            className="rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-500 transition-colors disabled:opacity-40"
          >
            {pwLoading ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </section>

      {/* Connected accounts */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-1 text-base font-semibold text-white">Connected accounts</h2>
        <p className="mb-5 text-sm text-zinc-500">
          Sign in with multiple providers. You need at least one connected account.
        </p>
        <div className="space-y-3">
          {PROVIDERS.map(({ id, label, icon }) => {
            const identity = identities.find((i) => i.provider === id)
            const connected = !!identity
            return (
              <div key={id} className="flex items-center justify-between rounded-xl border border-zinc-800 p-4">
                <div className="flex items-center gap-3">
                  {icon}
                  <div>
                    <p className="text-sm font-medium text-white">{label}</p>
                    <p className="text-xs text-zinc-500">{connected ? 'Connected' : 'Not connected'}</p>
                  </div>
                </div>
                {connected ? (
                  <button
                    onClick={() => identity && handleUnlink(identity)}
                    disabled={!canUnlink}
                    title={!canUnlink ? 'Cannot remove your only login method' : undefined}
                    className="rounded-full border border-zinc-700 px-4 py-1.5 text-xs font-medium text-zinc-400 hover:border-red-800 hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnect(id)}
                    className="rounded-full border border-zinc-700 px-4 py-1.5 text-xs font-medium text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
                  >
                    Connect
                  </button>
                )}
              </div>
            )
          })}
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

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

function DiscordIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#5865F2">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  )
}
