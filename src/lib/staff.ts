import { createClient } from '@/lib/supabase/server'
import { STAFF_ROLES, isStaffRole, type StaffRole, type StaffPower } from './staff-config'

export type { StaffRole, StaffPower }
export { STAFF_ROLES, isStaffRole }

export async function getStaffRole(userId: string): Promise<StaffRole | null> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
    return isStaffRole(data?.role) ? data.role : null
  } catch {
    return null
  }
}

export async function isStaff(userId: string): Promise<boolean> {
  return (await getStaffRole(userId)) !== null
}

export async function hasPermission(userId: string, power: StaffPower): Promise<boolean> {
  const role = await getStaffRole(userId)
  if (!role) return false
  return (STAFF_ROLES[role].powers as string[]).includes(power)
}
