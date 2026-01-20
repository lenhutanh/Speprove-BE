export const parseQueryParams = <T>(query: any) => {
  const { page, limit, sortBy, sortOrder, search, ...filters } = query
  return {
    page,
    limit,
    skip: (page - 1) * limit,
    sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 },
    search,
    filters: filters as T
  }
}
