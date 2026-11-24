import { container } from 'tsyringe'
import { TOKENS } from '~/common/constants/di.tokens'
import { FileRepository } from './repositories/file.repository'

export const registerFileModule = () => {
  container.registerSingleton(TOKENS.IFileRepository, FileRepository)
  // container.registerSingleton(FileWorker, FileWorker)
}
