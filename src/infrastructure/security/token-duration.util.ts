import { StatusCodes } from 'http-status-codes'
import ms, { StringValue } from 'ms'
import { AppError } from '~/common/errors'

export const tokenLifeToMs = (life: StringValue | number | undefined, label: string): number => {
  if (typeof life === 'number') {
    return life * 1000
  }

  if (!life) {
    throw new AppError(`Missing ${label} duration`, StatusCodes.INTERNAL_SERVER_ERROR)
  }

  const durationMs = ms(life)

  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    throw new AppError(`Invalid ${label} duration`, StatusCodes.INTERNAL_SERVER_ERROR)
  }

  return durationMs
}
