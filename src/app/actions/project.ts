'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isPremium } from '@/lib/subscription'

export async function deleteProject(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  redirect('/projects')
}

export async function toggleProjectVisibility(projectId: string, currentIsPublic: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Enforce private project limit for free users
  if (currentIsPublic) {
    const premium = await isPremium(user.id)
    if (!premium) {
      const { count } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_public', false)
      if ((count ?? 0) >= 1) throw new Error('PRIVATE_LIMIT')
    }
  }

  const { error } = await supabase
    .from('projects')
    .update({ is_public: !currentIsPublic })
    .eq('id', projectId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
  revalidatePath('/projects')
}

export async function toggleFeatured(projectId: string, currentIsFeatured: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const premium = await isPremium(user.id)
  if (!premium) throw new Error('PREMIUM_REQUIRED')

  const { error } = await supabase
    .from('projects')
    .update({ is_featured: !currentIsFeatured })
    .eq('id', projectId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
  revalidatePath('/projects')
}
