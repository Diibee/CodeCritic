/** Clamp a string to a max length and strip null bytes. */
export function sanitizeString(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return ''
  return value.replace(/\0/g, '').slice(0, maxLength)
}

/** Validate a rating is an integer 1–5. */
export function validateRating(value: unknown): number | null {
  const n = Number(value)
  if (!Number.isInteger(n) || n < 1 || n > 5) return null
  return n
}

/** Basic email format check. */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/** Check if a UUID looks valid (prevents injection via route params). */
export function isValidUUID(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
}
