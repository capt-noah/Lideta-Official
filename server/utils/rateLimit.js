const WINDOW = 10 * 60 * 1000 // 10 minutes
const MAX    = 5
const map    = {}

export function isRateLimited(key) {
  const now = Date.now()
  if (!map[key]) map[key] = []
  map[key] = map[key].filter(ts => now - ts < WINDOW)
  if (map[key].length >= MAX) return true
  map[key].push(now)
  return false
}
