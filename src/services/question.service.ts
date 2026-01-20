import { StatusCodes } from 'http-status-codes'
import { Question } from '~/models'
import { CreateQuestionBodyType, UpdateQuestionBodyType } from '~/types'
import { ApiError } from '~/utils/api-error'
import { voiceService } from './voice.service'
import { CloudinaryProvider } from '~/providers/cloudinary.provider'
import { generateTTSBuffer } from '~/utils'
import { CLOUD_FOLDERS } from '~/constants/constants'
import { questionAudioService } from './question-audio.service'

const createNew = async (data: CreateQuestionBodyType) => {
  const question = await Question.create(data)
  const voices = await voiceService.getAll()

  const results = await Promise.allSettled(
    voices.map(async (voice) => {
      try {
        const { buffer, duration } = await generateTTSBuffer(data.content, voice.providerVoiceId)

        const audioUrl = await CloudinaryProvider.uploadAudio(buffer, CLOUD_FOLDERS.QUESTION_AUDIOS)

        return await questionAudioService.createNew({
          questionId: question._id,
          voiceId: voice._id,
          audioUrl,
          duration
        })
      } catch (error) {
        console.error(`Failed to generate audio for voice ${voice.name}:`, error)
        throw error
      }
    })
  )

  const successfulAudios = results.filter((r) => r.status === 'fulfilled')
  console.log(`Successfully created ${successfulAudios.length}/${voices.length} audios`)

  return question
}

const update = async (id: string, data: UpdateQuestionBodyType) => {
  const question = await Question.findByIdAndUpdate(id, data, { new: true, runValidators: true })
  if (!question) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Question not found')
  }
  return question
}

export const questionService = {
  createNew,
  update
}
