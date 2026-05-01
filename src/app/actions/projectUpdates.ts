'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'
import { sanitizeString, isValidUUID } from '@/lib/validate'

const MAX_UPDATE_LENGTH = 3000
const MIN_UPDATE_LENGTH = 10

export async function addProjectUpdate(projectId: string, body: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  if (!isValidUUID(projectId)) throw new Error('Invalid request.')

  const clean = sanitizeString(body, MAX_UPDATE_LENGTH).trim()
  if (clean.length < MIN_UPDATE_LENGTH) throw new Error('Update is too short.')

  const { allowed } = await rateLimit(`update:${user.id}`, 10, 60)
  if (!allowed) throw new Error('Too many updates. Please wait before posting again.')

  const { data: project } = await supabase
    .from('projects')
    .select('user_id')
    .eq('id', projectId)
    .single()
  if (!project || project.user_id !== user.id) throw new Error('Forbidden')

  const { error } = await supabase
    .from('project_updates')
    .insert({ project_id: projectId, user_id: user.id, body: clean })
  if (error) throw new Error(error.message)

  revalidatePath(`/projects/${projectId}`)
}

export async function deleteProjectUpdate(updateId: string, projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  if (!isValidUUID(updateId) || !isValidUUID(projectId)) throw new Error('Invalid request.')

  await supabase.from('project_updates').delete().eq('id', updateId).eq('user_id', user.id)
  revalidatePath(`/projects/${projectId}`)
}
