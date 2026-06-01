import { container } from 'tsyringe'
import { TOKENS } from '~/common/constants/tokens'
import { GeneratedAudioRepository } from './generated-audio.repository'

export const registerGeneratedAudioModule = () => {
  container.registerSingleton(TOKENS.IGeneratedAudioRepository, GeneratedAudioRepository)
}
