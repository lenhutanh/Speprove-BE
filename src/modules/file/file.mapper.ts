import { singleton } from 'tsyringe'
import { BaseMapper } from '~/common/base'
import { FileType, AudioFileType, ImageFileType } from './file.model'
import { FileResponseDto } from './file.dto'
import { FILE_KIND } from '~/common/constants/constants'

@singleton()
export class FileMapper extends BaseMapper<FileType, FileResponseDto> {
  toResponse(entity: FileType): FileResponseDto {
    const response: FileResponseDto = {
      id: entity._id.toString(),
      url: entity.url,
      fileName: entity.fileName,
      fileSize: entity.fileSize ?? undefined,
      mimeType: entity.mimeType,
      kind: entity.kind,
      createdAt: entity.createdAt
    }

    switch (entity.kind) {
      case FILE_KIND.AUDIO: {
        const audioEntity = entity as AudioFileType
        response.duration = audioEntity.duration ?? undefined
        response.transcript = audioEntity.transcript ?? undefined
        break
      }

      case FILE_KIND.IMAGE: {
        const imageEntity = entity as ImageFileType
        response.width = imageEntity.width ?? undefined
        response.height = imageEntity.height ?? undefined
        break
      }
    }

    return response
  }
}
