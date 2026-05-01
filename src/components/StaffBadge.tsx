import { isStaffRole, STAFF_ROLES } from '@/lib/staff-config'

export function StaffBadge({ role, size = 'sm' }: { role: string | null | undefined; size?: 'sm' | 'md' }) {
  if (!isStaffRole(role)) return null
  const cfg = STAFF_ROLES[role]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-medium ${cfg.borderColor} ${cfg.bgColor} ${cfg.textColor} ${
      size === 'md' ? 'px-2.5 py-0.5 text-xs' : 'px-2 py-0.5 text-[10px]'
    }`}>
      <span>{cfg.emoji}</span>
      {cfg.label}
    </span>
  )
}
