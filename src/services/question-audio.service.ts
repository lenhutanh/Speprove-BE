import { QuestionAudio } from '~/models'

const createNew = async (data: any) => {
  return await QuestionAudio.create(data)
}

export const questionAudioService = {
  createNew
}
