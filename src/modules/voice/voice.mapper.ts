import { BaseMapper } from '~/common/base'
import { VoiceType } from './voice.model'
import { VoiceResponseDto } from './voice.dto'
import { singleton } from 'tsyringe'

@singleton()
export class VoiceMapper extends BaseMapper<VoiceType, VoiceResponseDto> {
  toResponse(entity: VoiceType): VoiceResponseDto {
    const fileNode = entity.sampleAudioFileId as any

    return {
      id: entity._id.toString(),
      name: entity.name,
      voiceCode: entity.voiceCode,
      gender: entity.gender,
      locale: entity.locale,
      sampleAudioUrl: fileNode?.url || '',
      isDefault: entity.isDefault
    }
  }
}
