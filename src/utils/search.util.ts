export const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
export const getSearchQuery = (search?: string, fields: string[] = []) => {
  const cleanSearch = search?.trim()
  if (!cleanSearch || fields.length === 0) {
    return {}
  }

  const safeSearch = escapeRegExp(cleanSearch)
  const regexRule = { $regex: safeSearch, $options: 'i' }
  return fields.length === 1 ? { [fields[0]]: regexRule } : { $or: fields.map((field) => ({ [field]: regexRule })) }
}
