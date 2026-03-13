import { IBaseRepository } from '~/common/base/base.repository.interface'
import { AudioFileType, FileType } from '../file.model'

export interface IFileRepository extends IBaseRepository<FileType> {
  createAudio(data: Partial<AudioFileType>): Promise<AudioFileType>
}
