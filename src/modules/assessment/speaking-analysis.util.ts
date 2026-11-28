export const normalizeForAssessment = (text: string): string => {
  if (!text) return ''

  return text
    .toLowerCase()
    .replace(/[.]{2,}/g, ' ')
    .replace(/[^a-zA-Z0-9'\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
