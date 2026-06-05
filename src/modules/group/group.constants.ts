export const GROUP_KIND = {
  ADMIN: 1,
  USER: 2
} as const

export const GROUP_NAME: Record<keyof typeof GROUP_KIND, string> = {
  ADMIN: 'Admin',
  USER: 'User'
}
