import { container } from 'tsyringe'
import { TOKENS } from '~/common/constants/di.tokens'
import { VoiceRoomRepository } from './repositories/voice-room.repository'

export const registerVoiceRoomModule = () => {
  container.registerSingleton(TOKENS.IVoiceRoomRepository, VoiceRoomRepository)
}
