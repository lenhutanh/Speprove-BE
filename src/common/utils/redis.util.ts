export type KeyConfig = { PREFIX: string }

export function buildRedisKey(config: KeyConfig, suffix: string): string {
  return `${config.PREFIX}:${suffix}`
}
