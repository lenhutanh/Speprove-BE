import nspell from 'nspell'

let spell: any

const ALLOWED_WORDS = new Set(
  ['ielts', 'youtube', 'tiktok', 'whatsapp', 'wifi', 'covid', 'facebook', 'instagram', 'chatgpt', 'smartphone'].map(
    (w) => w.toLowerCase()
  )
)

export async function initSpelling() {
  const { default: dictionary } = await import('dictionary-en')
  await new Promise<void>((resolve, reject) => {
    ;(dictionary as unknown as (cb: (err: Error | null, dict: any) => void) => void)((err, dict) => {
      if (err) return reject(err)
      spell = nspell(dict)
      resolve()
    })
  })
}

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function checkSpelling(text: string) {
  if (!spell) {
    throw new Error('Spelling engine not initialized')
  }

  const normalized = normalizeText(text)

  const words = normalized.split(' ')

  const errors: string[] = []

  for (const word of words) {
    if (!word) continue

    if (ALLOWED_WORDS.has(word)) continue

    if (!spell.correct(word)) {
      errors.push(word)
    }
  }

  return [...new Set(errors)]
}

export function getSuggestions(word: string) {
  if (!spell) return []

  return spell.suggest(word)
}
