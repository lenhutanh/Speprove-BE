import 'dotenv/config'

export const env = {
  APP_NAME: process.env.APP_NAME as string,
  MONGODB_URI: process.env.MONGODB_URI as string,
  DATABASE_NAME: process.env.DATABASE_NAME as string,
  APP_HOST: process.env.APP_HOST as string,
  APP_PORT: Number(process.env.APP_PORT),
  NODE_ENV: process.env.NODE_ENV || 'development',
  AUTHOR: process.env.AUTHOR as string,

  ACCESS_TOKEN_SECRET_SIGNATURE: process.env.ACCESS_TOKEN_SECRET_SIGNATURE as string,
  ACCESS_TOKEN_LIFE: process.env.ACCESS_TOKEN_LIFE as string,
  REFRESH_TOKEN_SECRET_SIGNATURE: process.env.REFRESH_TOKEN_SECRET_SIGNATURE as string,
  REFRESH_TOKEN_LIFE: process.env.REFRESH_TOKEN_LIFE as string,

  REDIS: {
    HOST: process.env.REDIS_HOST || '127.0.0.1',
    PORT: parseInt(process.env.REDIS_PORT || '6379'),
    PASSWORD: process.env.REDIS_PASSWORD || '',
    URL: process.env.REDIS_URL
  },

  MAIL: {
    BREVO_API_KEY: process.env.BREVO_API_KEY as string,
    SENDER_EMAIL: process.env.SENDER_EMAIL as string,
    SENDER_NAME: process.env.SENDER_NAME as string
  },

  CLOUDINARY_NAME: process.env.CLOUDINARY_NAME as string,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string
}
