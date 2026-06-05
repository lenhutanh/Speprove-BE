import { BaseRepository } from '~/common/base/base.repository'
import { AudioFileType, File, FileType } from '../file.model'
import { IFileRepository } from './file.repository.interface'
import { FILE_KIND } from '../file.constants'

export class FileRepository extends BaseRepository<FileType> implements IFileRepository {
  constructor() {
    super(File)
  }

  public async create(data: Partial<FileType>): Promise<FileType> {
    return await super.create(data as FileType)
  }

  public async createAudio(data: Partial<AudioFileType>): Promise<AudioFileType> {
    const audio = await this.create({ ...data, kind: FILE_KIND.AUDIO } as FileType)
    return audio as AudioFileType
  }
}
