'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { isStaff, hasPermission } from '@/lib/staff'
import type { StaffPower } from '@/lib/staff-config'

async function requireStaff() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const staff = await isStaff(user.id)
  if (!staff) throw new Error('Forbidden')
}

async function requirePower(power: StaffPower) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const ok = await hasPermission(user.id, power)
  if (!ok) throw new Error('Forbidden')
}

export async function adminToggleVisibility(projectId: string, currentIsPublic: boolean) {
  await requireStaff()
  const { error } = await supabaseAdmin
    .from('projects')
    .update({ is_public: !currentIsPublic })
    .eq('id', projectId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin')
  revalidatePath(`/projects/${projectId}`)
  revalidatePath('/projects')
}

export async function adminToggleFeatured(projectId: string, currentIsFeatured: boolean) {
  await requireStaff()
  const { error } = await supabaseAdmin
    .from('projects')
    .update({ is_featured: !currentIsFeatured })
    .eq('id', projectId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin')
  revalidatePath(`/projects/${projectId}`)
  revalidatePath('/projects')
}

export async function adminDeleteProject(projectId: string) {
  await requireStaff()
  const { error } = await supabaseAdmin
    .from('projects')
    .delete()
    .eq('id', projectId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin')
  revalidatePath('/projects')
}

export async function adminDeleteReview(reviewId: string) {
  await requirePower('manage_reviews')
  const { error } = await supabaseAdmin
    .from('reviews')
    .delete()
    .eq('id', reviewId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

export async function adminSetUserRole(userId: string, role: string) {
  await requirePower('manage_roles')
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ role })
    .eq('id', userId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin')
  revalidatePath(`/u/${userId}`)
}

export async function adminSendNotification(userId: string, message: string) {
  await requirePower('send_notifications')
  const { error } = await supabaseAdmin
    .from('notifications')
    .insert({ user_id: userId, type: 'staff_message', message })
  if (error) throw new Error(error.message)
}

export async function adminSetPremium(userId: string, active: boolean) {
  await requirePower('manage_subscriptions')
  if (active) {
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .upsert({
        user_id: userId,
        status: 'active',
        current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      }, { onConflict: 'user_id' })
    if (error) throw new Error(error.message)
  } else {
    await supabaseAdmin
      .from('subscriptions')
      .update({ status: 'inactive' })
      .eq('user_id', userId)
    await supabaseAdmin
      .from('projects')
      .update({ is_featured: false })
      .eq('user_id', userId)
  }
  revalidatePath('/admin')
}
