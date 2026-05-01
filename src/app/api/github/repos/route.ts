import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Try provider_token from the current session first, fall back to stored token
  const { data: { session } } = await supabase.auth.getSession()
  let token: string | null = session?.provider_token ?? null

  if (!token) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('github_token')
      .eq('id', user.id)
      .single()
    token = profile?.github_token ?? null
  }

  if (!token) {
    return NextResponse.json({ error: 'no_token' }, { status: 401 })
  }

  const res = await fetch(
    'https://api.github.com/user/repos?per_page=100&sort=updated&type=owner',
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
      next: { revalidate: 60 }, // cache for 60 s
    }
  )

  if (res.status === 401) {
    // Token is invalid — clear it so we don't keep using a bad one
    await supabase.from('profiles').update({ github_token: null }).eq('id', user.id)
    return NextResponse.json({ error: 'no_token' }, { status: 401 })
  }

  if (!res.ok) {
    return NextResponse.json({ error: 'github_error' }, { status: 502 })
  }

  const repos = await res.json()
  return NextResponse.json(repos)
}
