export function normalizeCategory(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').toLowerCase()
}
