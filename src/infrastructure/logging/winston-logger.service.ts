import { injectable } from 'tsyringe'
import winston from 'winston'
import { ILogger } from '~/common/interfaces/logger.interface'
import { env } from '~/common/config/env.config'
import DailyRotateFile from 'winston-daily-rotate-file'

@injectable()
export class WinstonLogger implements ILogger {
  private logger: winston.Logger

  constructor() {
    const logFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.json()
    )

    this.logger = winston.createLogger({
      level: env.LOG_LEVEL,
      format: logFormat,
      transports: [
        new DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxFiles: '14d'
        }),
        new DailyRotateFile({
          filename: 'logs/combined-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxFiles: '14d'
        })
      ]
    })

    if (env.NODE_ENV !== 'production') {
      this.logger.add(
        new winston.transports.Console({
          format: winston.format.combine(winston.format.colorize(), winston.format.simple())
        })
      )
    }
  }

  info(message: string, meta?: any): void {
    this.logger.info(message, meta)
  }

  error(message: string, meta?: any): void {
    this.logger.error(message, meta)
  }

  warn(message: string, meta?: any): void {
    this.logger.warn(message, meta)
  }

  debug(message: string, meta?: any): void {
    this.logger.debug(message, meta)
  }
}
