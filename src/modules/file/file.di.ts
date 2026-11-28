import { container } from 'tsyringe'
import { TOKENS } from '~/core/di/di.constants'
import { FileRepository } from './file.repository'

export const registerFileModule = () => {
  container.registerSingleton(TOKENS.IFileRepository, FileRepository)
}
