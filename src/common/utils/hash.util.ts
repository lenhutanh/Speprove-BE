import crypto from 'crypto'

export function hashContent(data: { text: string; voiceId: string; speed: number; pitch: number }) {
  const normalized = data.text.trim().replace(/\s+/g, ' ').toLowerCase()

  const canonical = `${normalized}|${data.voiceId}|${data.speed}|${data.pitch}`

  return crypto.createHash('sha256').update(canonical).digest('hex')
}
