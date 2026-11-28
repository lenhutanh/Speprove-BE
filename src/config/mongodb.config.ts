import mongoose from 'mongoose'
import { env } from './env.config'
import { logger } from '~/core/logging/logger'

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      dbName: env.DATABASE_NAME,
      maxPoolSize: env.MONGO_MAX_POOL_SIZE,
      serverSelectionTimeoutMS: env.MONGO_SERVER_SELECTION_TIMEOUT_MS
    })
    logger.info('2. Connected to MongoDB successfully!')
  } catch (error) {
    logger.error('MongoDB connection error: ', error)
    process.exit(1)
  }
}

export const pingDB = async (): Promise<void> => {
  const db = mongoose.connection.db
  if (!db) throw new Error('MongoDB is not connected')
  await db.admin().ping()
}

export const closeDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close()
    logger.info('6. MongoDB connection closed.')
  } catch (error) {
    logger.error('Error while closing MongoDB connection:', error)
  }
}
