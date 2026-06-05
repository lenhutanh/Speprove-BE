export type RedisKeyConfig = { PREFIX: string }

export function buildRedisKey(config: RedisKeyConfig, suffix: string): string {
  return `${config.PREFIX}:${suffix}`
}
