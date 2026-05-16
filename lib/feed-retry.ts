const BACKOFF_DELAYS_MS = [
  5 * 60 * 1000,
  15 * 60 * 1000,
  60 * 60 * 1000,
  6 * 60 * 60 * 1000,
  24 * 60 * 60 * 1000,
]

export function calculateNextRetryAt(currentRetryCount: number): Date {
  const safeCount = Number.isFinite(currentRetryCount) ? currentRetryCount : 0
  const index = Math.min(safeCount, BACKOFF_DELAYS_MS.length - 1)
  return new Date(Date.now() + BACKOFF_DELAYS_MS[index])
}
