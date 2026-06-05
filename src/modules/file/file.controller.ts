import { singleton } from 'tsyringe'
import { FileService } from './file.service'
import { Response } from 'express'
import { ResponseTransformer } from '~/common/http'
import { AuthenticatedRequest } from '~/common/types/request.type'

@singleton()
export class FileController {
  constructor(private readonly fileService: FileService) {}

  public async uploadImage(req: AuthenticatedRequest, res: Response) {
    const userId = req.user._id
    const image = await this.fileService.uploadImage(userId, req.validated.body.purpose, req.file)
    return ResponseTransformer.success(res, image, 'Upload image successfully')
  }

  public async uploadAudio(req: AuthenticatedRequest, res: Response) {
    const userId = req.user._id
    const audio = await this.fileService.uploadAudio(userId, req.validated.body.purpose, req.file)
    return ResponseTransformer.success(res, audio, 'Upload audio successfully')
  }
}
