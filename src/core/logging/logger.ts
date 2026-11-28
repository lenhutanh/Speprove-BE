import winston from 'winston'
import { env } from '~/config/env.config'
import { getRequestId } from './request-context'
import { sanitize } from './sanitize'

const withRequestId = winston.format((info) => {
  const requestId = getRequestId()
  if (requestId) info.requestId = requestId
  return info
})

const pretty = winston.format.printf(({ timestamp, level, message, requestId, ...meta }) => {
  const id = requestId ? ` [${requestId}]` : ''
  const rest = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ''
  return `${timestamp} ${level}${id} ${message}${rest}`
})

const base = winston.createLogger({
  level: env.LOG_LEVEL,
  silent: env.NODE_ENV === 'test',
  format: winston.format.combine(
    winston.format.timestamp(),
    withRequestId(),
    env.NODE_ENV === 'development' ? winston.format.combine(winston.format.colorize(), pretty) : winston.format.json()
  ),
  transports: [new winston.transports.Console()]
})

type LogFn = (message: unknown, ...details: unknown[]) => void

function write(level: 'error' | 'warn' | 'info' | 'debug'): LogFn {
  return (message, ...details) => {
    const text = message instanceof Error ? message.message : String(message)
    const extra = message instanceof Error ? [message, ...details] : details
    const [only] = extra
    const isPlainObject = extra.length === 1 && typeof only === 'object' && only !== null && !(only instanceof Error)
    const meta = isPlainObject ? (sanitize(only) as object) : extra.length ? { details: sanitize(extra) } : {}
    base.log(level, text, meta)
  }
}

export const logger = {
  error: write('error'),
  warn: write('warn'),
  info: write('info'),
  debug: write('debug')
}
