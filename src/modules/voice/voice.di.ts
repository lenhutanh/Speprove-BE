import { container } from 'tsyringe'
import { TOKENS } from '~/common/constants/di.tokens'
import { VoiceRepository } from './repositories/voice.repository'

export const registerVoiceModule = () => {
  container.registerSingleton(TOKENS.IVoiceRepository, VoiceRepository)
}
