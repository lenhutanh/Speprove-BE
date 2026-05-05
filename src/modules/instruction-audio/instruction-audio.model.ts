import mongoose, { InferSchemaType, Types } from 'mongoose'
import { Schema } from 'mongoose'
import { INSTRUCTION_KEYS } from '~/common/constants/constants'

const instructionAudioSchema = new mongoose.Schema({
  voiceId: { type: Types.ObjectId, ref: 'Voice', required: true },
  key: {
    type: String,
    required: true,
    enum: Object.values(INSTRUCTION_KEYS)
  },
  audioFileId: { type: Schema.Types.ObjectId, ref: 'File', required: true },
  status: { type: Number, required: true, default: 1 }
})

instructionAudioSchema.index({ voiceId: 1, key: 1 }, { unique: true })

export type InstructionAudioType = InferSchemaType<typeof instructionAudioSchema> & {
  _id: Types.ObjectId
}

export const InstructionAudio =
  mongoose.models.InstructionAudio || mongoose.model<InstructionAudioType>('InstructionAudio', instructionAudioSchema)
