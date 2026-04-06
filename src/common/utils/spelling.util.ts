import nspell from 'nspell'

let spellUS: any
let spellGB: any

const ALLOWED_WORDS = new Set(
  ['ielts', 'youtube', 'tiktok', 'whatsapp', 'wifi', 'covid', 'facebook', 'instagram', 'chatgpt', 'smartphone'].map(
    (w) => w.toLowerCase()
  )
)

// Helper để load từ điển từ callback sang Promise
const loadDict = (dictFn: any) => {
  return new Promise<any>((resolve, reject) => {
    dictFn((err: any, dict: any) => {
      if (err) return reject(err)
      resolve(dict)
    })
  })
}

export async function initSpelling() {
  try {
    // Import rõ ràng 2 bộ US và GB
    const [{ default: enUS }, { default: enGB }] = await Promise.all([
      import('dictionary-en'),
      import('dictionary-en-gb')
    ])

    const [dictUS, dictGB] = await Promise.all([loadDict(enUS), loadDict(enGB)])

    spellUS = nspell(dictUS)
    spellGB = nspell(dictGB)

    console.log('✅ Spelling engine: US & GB initialized separately')
  } catch (error) {
    console.error('❌ Spelling init failed:', error)
  }
}

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z'\s]/g, ' ') // Giữ lại dấu nháy đơn cho các từ như don't
    .replace(/\s+/g, ' ')
    .trim()
}

export function checkSpelling(text: string) {
  if (!spellUS || !spellGB) throw new Error('Spelling engine not initialized')

  const normalized = normalizeText(text)
  const words = normalized.split(' ')
  const errors: string[] = []

  for (const word of words) {
    if (!word || ALLOWED_WORDS.has(word)) continue

    const cleanWord = word.replace(/'$/, '')

    // LOGIC QUAN TRỌNG: Chỉ coi là lỗi nếu CẢ HAI từ điển đều báo sai
    const isCorrectUS = spellUS.correct(cleanWord)
    const isCorrectGB = spellGB.correct(cleanWord)

    if (!isCorrectUS && !isCorrectGB) {
      errors.push(word)
    }
  }

  return [...new Set(errors)]
}

export function getSuggestions(word: string) {
  if (!spellUS || !spellGB) return []

  // Gộp gợi ý từ cả hai từ điển và xóa trùng
  const suggestions = [...spellUS.suggest(word), ...spellGB.suggest(word)]
  return [...new Set(suggestions)]
}
