'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { isStaff } from '@/lib/staff'

async function requireStaff() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const staff = await isStaff(user.id)
  if (!staff) throw new Error('Forbidden')
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
