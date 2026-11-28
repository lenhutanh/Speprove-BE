import { container } from 'tsyringe'
import { TOKENS } from '~/core/di/di.constants'
import { GeneratedAudioRepository } from './generated-audio.repository'

export const registerGeneratedAudioModule = () => {
  container.registerSingleton(TOKENS.IGeneratedAudioRepository, GeneratedAudioRepository)
}
