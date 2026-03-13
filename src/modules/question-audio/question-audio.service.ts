import { inject, singleton } from 'tsyringe'
import { TOKENS } from '~/common/constants/tokens'
import { FileService } from '../file/file.service'
import { hashContent } from '~/common/utils'
import { IQuestionAudioRepository } from './question-audio.repository.interface'

@singleton()
export class QuestionAudioService {
  constructor(
    private readonly fileService: FileService,
    @inject(TOKENS.IQuestionAudioRepository) private readonly questionAudioRepository: IQuestionAudioRepository
  ) {}
  public async generate(data: any) {
    const contentHash = hashContent({
      text: data.text,
      voiceId: data.voiceId,
      speed: data.speed,
      pitch: data.pitch
    })

    let existing = await this.questionAudioRepository.findOne({
      contentHash
    })

    if (existing) {
      return await this.questionAudioRepository.updateOne(
        { questionId: data.questionId, voiceId: data.voiceId },
        {
          questionId: data.questionId,
          voiceId: data.voiceId,
          fileId: existing.fileId,
          contentHash
        },
        { upsert: true }
      )
    }

    const file = await this.fileService.generateAndSaveAudio({
      text: data.text,
      voiceCode: data.voiceCode,
      speed: data.speed,
      pitch: data.pitch,
      folder: data.folder
    })

    return await this.questionAudioRepository.create({
      questionId: data.questionId,
      voiceId: data.voiceId,
      fileId: file._id,
      contentHash
    })
  }
}
