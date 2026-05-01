'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function addProjectUpdate(projectId: string, body: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: project } = await supabase
    .from('projects')
    .select('user_id')
    .eq('id', projectId)
    .single()
  if (!project || project.user_id !== user.id) throw new Error('Forbidden')

  const { error } = await supabase
    .from('project_updates')
    .insert({ project_id: projectId, user_id: user.id, body })
  if (error) throw new Error(error.message)

  revalidatePath(`/projects/${projectId}`)
}

export async function deleteProjectUpdate(updateId: string, projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase.from('project_updates').delete().eq('id', updateId).eq('user_id', user.id)
  revalidatePath(`/projects/${projectId}`)
}
