import { container } from 'tsyringe'
import { TOKENS } from '~/core/di/di.constants'
import { VoiceRepository } from './voice.repository'

export const registerVoiceModule = () => {
  container.registerSingleton(TOKENS.IVoiceRepository, VoiceRepository)
}
