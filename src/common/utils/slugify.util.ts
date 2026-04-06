import slugify from 'slugify'

export const generateSlug = (text: string): string => {
  if (!text) return ''

  const preparedText = text
    .replace(/\//g, ' ')
    .replace(/&/g, ' and ')
    .replace(/[()]/g, ' ')
    .replace(/[_|]/g, ' ')
    .trim()

  return slugify(preparedText, {
    replacement: '-',
    remove: undefined,
    lower: true,
    strict: true,
    locale: 'vi',
    trim: true
  })
}
