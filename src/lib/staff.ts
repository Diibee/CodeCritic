import { createClient } from '@/lib/supabase/server'

export async function isStaff(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
    return data?.role === 'staff' || data?.role === 'admin'
  } catch {
    return false
  }
}
