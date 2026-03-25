export function isPopulated<T extends object, K extends keyof T>(
  field: T[K],
  key: string
): field is Extract<T[K], object> {
  return !!field && typeof field === 'object' && key in field
}
