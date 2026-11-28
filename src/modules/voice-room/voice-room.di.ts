import { container } from 'tsyringe'
import { TOKENS } from '~/core/di/di.constants'
import { VoiceRoomRepository } from './voice-room.repository'

export const registerVoiceRoomModule = () => {
  container.registerSingleton(TOKENS.IVoiceRoomRepository, VoiceRoomRepository)
}
