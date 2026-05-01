export type StaffRole = 'developer' | 'admin' | 'moderator' | 'support'

export type StaffPower =
  | 'access_admin'
  | 'manage_projects'
  | 'feature_projects'
  | 'manage_reviews'
  | 'manage_users'
  | 'view_analytics'
  | 'manage_subscriptions'
  | 'send_notifications'
  | 'manage_roles'

export const STAFF_ROLES: Record<StaffRole, {
  label: string
  emoji: string
  borderColor: string
  bgColor: string
  textColor: string
  powers: StaffPower[]
}> = {
  developer: {
    label: 'Developer',
    emoji: '⚙️',
    borderColor: 'border-blue-700/60',
    bgColor: 'bg-blue-900/20',
    textColor: 'text-blue-400',
    powers: ['access_admin', 'manage_projects', 'feature_projects', 'manage_reviews', 'manage_users', 'view_analytics', 'manage_subscriptions', 'send_notifications', 'manage_roles'],
  },
  admin: {
    label: 'Admin',
    emoji: '🛡️',
    borderColor: 'border-red-700/60',
    bgColor: 'bg-red-900/20',
    textColor: 'text-red-400',
    powers: ['access_admin', 'manage_projects', 'feature_projects', 'manage_reviews', 'manage_users', 'view_analytics', 'manage_subscriptions', 'send_notifications'],
  },
  moderator: {
    label: 'Moderator',
    emoji: '🔨',
    borderColor: 'border-orange-700/60',
    bgColor: 'bg-orange-900/20',
    textColor: 'text-orange-400',
    powers: ['access_admin', 'manage_projects', 'feature_projects', 'manage_reviews', 'send_notifications'],
  },
  support: {
    label: 'Support',
    emoji: '💬',
    borderColor: 'border-green-700/60',
    bgColor: 'bg-green-900/20',
    textColor: 'text-green-400',
    powers: ['access_admin', 'manage_users', 'view_analytics', 'manage_subscriptions', 'send_notifications'],
  },
}

const STAFF_ROLE_KEYS = Object.keys(STAFF_ROLES) as StaffRole[]

export function isStaffRole(role: string | null | undefined): role is StaffRole {
  return STAFF_ROLE_KEYS.includes(role as StaffRole)
}
