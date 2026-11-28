import 'dotenv/config'
import { z } from 'zod'
import { StringValue } from 'ms'

const isTest = process.env.NODE_ENV === 'test'

// Third-party keys are required everywhere except in tests, where they get placeholders
const external = isTest ? z.string().default('test-placeholder') : z.string()
const externalEmail = isTest ? z.string().email().default('test@example.com') : z.string().email()

const envSchema = z.object({
  APP_NAME: z.string(),
  APP_URL: z.string().url(),
  MONGODB_URI: z.string().url(),
  DATABASE_NAME: z.string(),
  MONGO_MAX_POOL_SIZE: z.coerce.number().int().positive().default(20),
  MONGO_SERVER_SELECTION_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
  APP_HOST: z.string().default('localhost'),
  APP_PORT: z.coerce.number().int().positive().default(5000),
  PORT: z.preprocess((val) => (val ? Number(val) : undefined), z.number().optional()),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  TRUST_PROXY: z.coerce.number().int().min(0).default(0),
  HTTP_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),
  AI_TIMEOUT_MS: z.coerce.number().int().positive().default(60000),
  SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  AUTHOR: z.string().default(''),

  // Auth
  ACCESS_TOKEN_SECRET_SIGNATURE: z.string().min(32),
  ACCESS_TOKEN_LIFE: z.custom<StringValue>(),
  REFRESH_TOKEN_SECRET_SIGNATURE: z.string().min(32),
  REFRESH_TOKEN_LIFE: z.custom<StringValue>(),
  ACCESS_TOKEN_COOKIE_LIFE: z.custom<StringValue>(),

  // Redis
  REDIS_HOST: z.string().default('127.0.0.1'),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().default(''),
  REDIS_URL: z.string().optional(),

  // Mail
  BREVO_API_KEY: external,
  SENDER_EMAIL: externalEmail,
  SENDER_NAME: external,

  // Cloudinary
  CLOUDINARY_NAME: external,
  CLOUDINARY_API_KEY: external,
  CLOUDINARY_API_SECRET: external,

  // Azure
  AZURE_SPEECH_KEY: external,
  AZURE_SPEECH_REGION: external,

  // LOG_LEVEL
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),

  // Groq
  GROQ_API_KEY: external,

  // PayOS
  PAYOS_CLIENT_ID: external,
  PAYOS_API_KEY: external,
  PAYOS_CHECKSUM_KEY: external,

  // Google
  GOOGLE_CLIENT_ID: external,
  GOOGLE_CLIENT_SECRET: external,
  GOOGLE_REDIRECT_URI: external,

  // LiveKit
  LIVEKIT_URL: z.string().optional(),
  LIVEKIT_API_KEY: z.string().optional(),
  LIVEKIT_API_SECRET: z.string().optional()
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
  },
  LIVEKIT: {
    URL: parsed.data.LIVEKIT_URL || '',
    API_KEY: parsed.data.LIVEKIT_API_KEY || '',
    API_SECRET: parsed.data.LIVEKIT_API_SECRET || ''
  }
}
