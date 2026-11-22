import mongoose from 'mongoose'
import { MongoMemoryReplSet } from 'mongodb-memory-server'

let replSet: MongoMemoryReplSet | undefined

export async function startMongo() {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } })
  await mongoose.connect(replSet.getUri(), { dbName: 'speprove_test' })
}

export async function stopMongo() {
  await mongoose.disconnect()
  await replSet?.stop()
}

export async function resetMongo() {
  await mongoose.connection.dropDatabase()
}
