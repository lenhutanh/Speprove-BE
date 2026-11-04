import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { WebhookReceiver } from 'livekit-server-sdk'
import { singleton } from 'tsyringe'
import { env } from '~/common/config/env.config'
import { ResponseTransformer } from '~/common/http'
import { AuthenticatedRequest } from '~/common/types/request.type'
import { VoiceRoomService } from './voice-room.service'

@singleton()
export class VoiceRoomController {
  constructor(private readonly voiceRoomService: VoiceRoomService) {}

  public async createRoom(req: AuthenticatedRequest, res: Response) {
    const userId = req.user._id.toString()
    const result = await this.voiceRoomService.createRoom(userId, req.validated.body)
    return ResponseTransformer.success(res, result, 'Create voice room successfully', StatusCodes.CREATED)
  }

  public async getActiveRooms(req: Request, res: Response) {
    const rooms = await this.voiceRoomService.getActiveRooms(req.validated?.query)
    return ResponseTransformer.paginate(res, rooms.data, rooms.pagination, 'Get active voice rooms successfully')
  }

  public async getRoomById(req: Request, res: Response) {
    const userId = (req as any).user?._id?.toString()
    const result = await this.voiceRoomService.getRoomById(req.validated.params.id, userId)
    return ResponseTransformer.success(res, result, 'Get voice room details successfully')
  }

  public async joinRoom(req: AuthenticatedRequest, res: Response) {
    const userId = req.user._id.toString()
    const result = await this.voiceRoomService.joinRoom(req.validated.params.id, userId, req.validated.body)
    return ResponseTransformer.success(res, result, 'Join voice room successfully')
  }

  public async leaveRoom(req: AuthenticatedRequest, res: Response) {
    const userId = req.user._id.toString()
    await this.voiceRoomService.leaveRoom(req.validated.params.id, userId)
    return ResponseTransformer.successNoData(res, 'Leave voice room successfully')
  }

  public async closeRoom(req: AuthenticatedRequest, res: Response) {
    const userId = req.user._id.toString()
    await this.voiceRoomService.closeRoom(req.validated.params.id, userId)
    return ResponseTransformer.successNoData(res, 'Close voice room successfully')
  }

  public async updateRoom(req: AuthenticatedRequest, res: Response) {
    const userId = req.user._id.toString()
    const result = await this.voiceRoomService.updateRoom(req.validated.params.id, userId, req.validated.body)
    return ResponseTransformer.success(res, result, 'Update voice room successfully')
  }

  public async handleWebhook(req: Request, res: Response) {
    if (env.LIVEKIT.API_KEY && env.LIVEKIT.API_SECRET) {
      const receiver = new WebhookReceiver(env.LIVEKIT.API_KEY, env.LIVEKIT.API_SECRET)
      try {
        const authHeader = req.headers.authorization
        if (authHeader) {
          let rawBody = ''
          if (Buffer.isBuffer(req.body)) {
            rawBody = req.body.toString('utf-8')
          } else if (typeof req.body === 'string') {
            rawBody = req.body
          } else {
            rawBody = JSON.stringify(req.body)
          }

          const event = await receiver.receive(rawBody, authHeader)
          await this.voiceRoomService.handleWebhookEvent(event)
        }
      } catch (err: any) {
        console.warn('LiveKit webhook error:', err?.message || err)
      }
    }
    return res.status(StatusCodes.OK).send('OK')
  }
}
