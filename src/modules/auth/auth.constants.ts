export const LOGIN_PROVIDER = {
  GOOGLE: 'google'
} as const

export type LoginProviderType = (typeof LOGIN_PROVIDER)[keyof typeof LOGIN_PROVIDER]

export const CACHE_CONFIG = {
  REGISTER: {
    PREFIX: 'register',
    TTL: 300
  },
  VERIFY: {
    PREFIX: 'verify',
    TTL: 180
  },
  RESET_PASSWORD_TOKEN: {
    PREFIX: 'reset-password-token',
    TTL: 300
  },
  GOOGLE_OAUTH_STATE: {
    PREFIX: 'google-oauth-state',
    TTL: 300
  },
  SOCKET_TICKET: {
    PREFIX: 'socket-ticket',
    TTL: 30
  }
}
