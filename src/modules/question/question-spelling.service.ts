import nspell from 'nspell'

let spellUS: any
let spellGB: any

const ALLOWED_WORDS = new Set(
  [
    'ielts',
    'youtube',
    'tiktok',
    'whatsapp',
    'wifi',
    'covid',
    'facebook',
    'instagram',
    'chatgpt',
    'smartphone',
    'tv'
  ].map((word) => word.toLowerCase())
)

const loadDict = (dictFn: any) => {
  return new Promise<any>((resolve, reject) => {
    dictFn((err: any, dict: any) => {
      if (err) return reject(err)
      resolve(dict)
    })
  })
}

export async function initQuestionSpelling() {
  try {
    const [{ default: enUS }, { default: enGB }] = await Promise.all([
      import('dictionary-en'),
      import('dictionary-en-gb')
    ])

    const [dictUS, dictGB] = await Promise.all([loadDict(enUS), loadDict(enGB)])

    spellUS = nspell(dictUS)
    spellGB = nspell(dictGB)

    console.log('Spelling engine initialized')
  } catch (error) {
    console.error('Spelling init failed:', error)
  }
}

function normalizeText(text: string) {
  return text
    .replace(/[\u2018\u2019]/g, "'")
    .toLowerCase()
    .replace(/[^a-z'\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function checkSpelling(text: string) {
  if (!spellUS || !spellGB) throw new Error('Spelling engine not initialized')

  const normalized = normalizeText(text)
  const words = normalized.split(' ')

  const errors: string[] = []
  const warnings: { word: string; suggestion: string[] }[] = []

  for (const word of words) {
    if (!word || ALLOWED_WORDS.has(word)) continue

    const cleanWord = word.replace(/'$/, '')
    const isCorrectUS = spellUS.correct(cleanWord)
    const isCorrectGB = spellGB.correct(cleanWord)

    if (!isCorrectUS && !isCorrectGB) {
      const capitalized = cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1)
      const isCapitalizedCorrect = spellUS.correct(capitalized) || spellGB.correct(capitalized)

      if (isCapitalizedCorrect) {
        warnings.push({
          word,
          suggestion: [capitalized]
        })
      } else {
        errors.push(word)
      }
    }
  }

  return {
    errors: [...new Set(errors)],
    warnings
  }
}

export function getSuggestions(word: string) {
  if (!spellUS || !spellGB) return []

  const suggestions = [...spellUS.suggest(word), ...spellGB.suggest(word)]
  return [...new Set(suggestions)]
}
