export const CACHE_CONFIG = {
  REGISTER: {
    PREFIX: 'auth:register',
    TTL: 300
  },
  VERIFY: {
    PREFIX: 'auth:verify',
    TTL: 180
  },
  RESET_PASSWORD_TOKEN: {
    PREFIX: 'auth:reset-password-token',
    TTL: 300
  }
}
