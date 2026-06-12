import 'dotenv/config'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { StringValue } from 'ms'

const envSchema = z.object({
  APP_NAME: z.string(),
  APP_URL: z.string().url(),
  MONGODB_URI: z.string().url(),
  DATABASE_NAME: z.string(),
  APP_HOST: z.string().default('localhost'),
  APP_PORT: z.preprocess((val) => Number(val), z.number().default(5000)),
  PORT: z.preprocess((val) => (val ? Number(val) : undefined), z.number().optional()),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  AUTHOR: z.string(),

  // Auth
  ACCESS_TOKEN_SECRET_SIGNATURE: z.string().min(32),
  ACCESS_TOKEN_LIFE: z.custom<StringValue>(),
  REFRESH_TOKEN_SECRET_SIGNATURE: z.string().min(32),
  REFRESH_TOKEN_LIFE: z.custom<StringValue>(),
  ACCESS_TOKEN_COOKIE_LIFE: z.custom<StringValue>(),

  // Redis
  REDIS_HOST: z.string().default('127.0.0.1'),
  REDIS_PORT: z.preprocess((val) => parseInt(val as string, 10), z.number().default(6379)),
  REDIS_PASSWORD: z.string().default(''),
  REDIS_URL: z.string().optional(),

  // Mail
  BREVO_API_KEY: z.string(),
  SENDER_EMAIL: z.string().email(),
  SENDER_NAME: z.string(),

  // Cloudinary
  CLOUDINARY_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),

  // Azure
  AZURE_SPEECH_KEY: z.string(),
  AZURE_SPEECH_REGION: z.string(),

  // LOG_LEVEL
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),

  // Groq
  GROQ_API_KEY: z.string(),

  // PayOS
  PAYOS_CLIENT_ID: z.string(),
  PAYOS_API_KEY: z.string(),
  PAYOS_CHECKSUM_KEY: z.string(),

  // Google
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_REDIRECT_URI: z.string()
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format())
  process.exit(1)
}

export const env = {
  ...parsed.data,
  APP_HOST: parsed.data.NODE_ENV === 'production' ? '0.0.0.0' : parsed.data.APP_HOST,
  APP_PORT: parsed.data.PORT ?? parsed.data.APP_PORT,
  CORS_ORIGINS: parsed.data.CORS_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  REDIS: {
    HOST: parsed.data.REDIS_HOST,
    PORT: parsed.data.REDIS_PORT,
    PASSWORD: parsed.data.REDIS_PASSWORD,
    URL: parsed.data.REDIS_URL
  },
  MAIL: {
    BREVO_API_KEY: parsed.data.BREVO_API_KEY,
    SENDER_EMAIL: parsed.data.SENDER_EMAIL,
    SENDER_NAME: parsed.data.SENDER_NAME
  }
}
