import { StatusCodes } from 'http-status-codes'
import { CLOUD_FOLDERS } from '~/constants/constants'
import { Voice, VoiceType } from '~/models'
import { CloudinaryProvider } from '~/providers/cloudinary.provider'
import { CreateVoiceBodyType, UpdateVoiceBodyType } from '~/types'
import { ApiError } from '~/utils/api-error'
import { generateTTSBuffer } from '~/utils'
import { getVoiceSampleText } from '~/utils/voice.util'

const createNew = async (data: CreateVoiceBodyType) => {
  const existed = await Voice.findOne({ name: data.name })
  if (existed) {
    throw new ApiError(StatusCodes.CONFLICT, 'Voice name already exists')
  }

  const text = getVoiceSampleText(data.name)
  const { buffer } = await generateTTSBuffer(text, data.providerVoiceId)

  const sampleUrl = await CloudinaryProvider.uploadAudio(buffer, CLOUD_FOLDERS.VOICE_SAMPLES)

  return await Voice.create({ ...data, sampleUrl })
}

const update = async (id: string, data: UpdateVoiceBodyType) => {
  const voice = await Voice.findByIdAndUpdate(id, data, { new: true, runValidators: true })
  if (!voice) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Voice not found')
  }
  return voice
}

const getAll = async (): Promise<VoiceType[]> => {
  return await Voice.find().lean()
}

export const voiceService = {
  createNew,
  update,
  getAll
}
