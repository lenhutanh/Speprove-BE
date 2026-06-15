import { container } from 'tsyringe'
import { TOKENS } from '~/common/constants/di.tokens'
import { FileRepository } from './repositories/file.repository'

export const registerFileModule = () => {
  container.registerSingleton(TOKENS.IFileRepository, FileRepository)
  // container.register(TOKENS.DomainEventHandler, { useClass: FileUploadedHandler })
  // container.registerSingleton(FileWorker, FileWorker)
}
