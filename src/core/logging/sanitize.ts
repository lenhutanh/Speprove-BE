const SENSITIVE_KEY = /pass(word)?|token|authorization|cookie|secret|api[-_]?key|signature|checksum/i
const MAX_DEPTH = 5

function serializeError(error: Error) {
  return { name: error.name, message: error.message, stack: error.stack }
}

/** Makes a value safe to log: redacts sensitive keys, serializes errors, dates and ObjectIds, limits depth. */
export function sanitize(value: unknown, depth = 0): unknown {
  if (value instanceof Error) return serializeError(value)
  if (value === null || typeof value !== 'object') return value
  if (depth >= MAX_DEPTH) return '[truncated]'
  if ('toJSON' in value && typeof value.toJSON === 'function') return sanitize(value.toJSON(), depth + 1)
  if (Array.isArray(value)) return value.map((item) => sanitize(item, depth + 1))

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      SENSITIVE_KEY.test(key) ? '[redacted]' : sanitize(item, depth + 1)
    ])
  )
}
