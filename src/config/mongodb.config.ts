import mongoose from 'mongoose'
import { env } from './env.config'

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGODB_URI, { dbName: env.DATABASE_NAME })
    console.log('2. Connected to MongoDB successfully!')
  } catch (error) {
    console.error('MongoDB connection error: ', error)
    process.exit(1)
  }
}

export const closeDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close()
    console.log('6. MongoDB connection closed.')
  } catch (error) {
    console.error('Error while closing MongoDB connection:', error)
  }
}
