import winston from 'winston'
import { env } from './env.config'

const logger = winston.createLogger({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }), // Log cả stack trace khi có lỗi
    winston.format.splat(),
    winston.format.json()
  ),
  transports: [
    // 1. In log ra console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // Thêm màu sắc cho dễ nhìn
        winston.format.printf(({ timestamp, level, message, stack }) => {
          return `[${timestamp}] ${level}: ${stack || message}`
        })
      )
    }),
    // 2. Ghi log lỗi vào file (tùy chọn)
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
})

export default logger
