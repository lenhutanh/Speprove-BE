import { container } from 'tsyringe'
import { TOKENS } from '~/common/constants/di.tokens'
import { InstructionAudioRepository } from './instruction-audio.repository'

export const registerInstructionAudioModule = () => {
  container.registerSingleton(TOKENS.IInstructionAudioRepository, InstructionAudioRepository)
}
