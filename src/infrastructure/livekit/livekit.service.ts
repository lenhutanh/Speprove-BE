import { AccessToken, RoomServiceClient, TrackSource, TrackType, VideoGrant } from 'livekit-server-sdk'
import { singleton } from 'tsyringe'
import { env } from '~/common/config/env.config'
import { logger } from '~/infrastructure/logging/logger'

export interface GenerateTokenOptions {
  roomId: string
  identity: string
  name: string
  avatar?: string | null
  isHost?: boolean
  ttl?: string
}

@singleton()
export class LiveKitService {
  private roomService: RoomServiceClient | null = null

  constructor() {
    if (env.LIVEKIT.URL && env.LIVEKIT.API_KEY && env.LIVEKIT.API_SECRET) {
      const httpUrl = env.LIVEKIT.URL.replace(/^wss:\/\//i, 'https://').replace(/^ws:\/\//i, 'http://')
      this.roomService = new RoomServiceClient(httpUrl, env.LIVEKIT.API_KEY, env.LIVEKIT.API_SECRET, {
        requestTimeout: Math.ceil(env.HTTP_TIMEOUT_MS / 1000)
      })
    }
  }

  public getServerUrl(): string {
    return env.LIVEKIT.URL
  }

  public async generateToken(options: GenerateTokenOptions): Promise<string> {
    const { roomId, identity, name, avatar, isHost = false, ttl = '3h' } = options

    const at = new AccessToken(env.LIVEKIT.API_KEY, env.LIVEKIT.API_SECRET, {
      identity,
      name,
      metadata: JSON.stringify({
        avatar: avatar || null,
        isHost
      }),
      ttl
    })

    const grant: VideoGrant = {
      roomJoin: true,
      room: roomId,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true
    }

    at.addGrant(grant)
    return await at.toJwt()
  }

  public async createRoom(roomId: string, maxParticipants = 6, emptyTimeout = 600) {
    if (!this.roomService) return null
    try {
      return await this.roomService.createRoom({
        name: roomId,
        emptyTimeout,
        maxParticipants
      })
    } catch (err: any) {
      logger.warn('LiveKit createRoom warning/error:', err?.message || err)
      return null
    }
  }

  public async listRooms(names?: string[]) {
    if (!this.roomService) return null
    try {
      return await this.roomService.listRooms(names)
    } catch {
      return null
    }
  }

  public async listParticipants(roomId: string) {
    if (!this.roomService) return []
    try {
      return await this.roomService.listParticipants(roomId)
    } catch {
      return []
    }
  }

  public async getParticipantCount(roomId: string): Promise<number> {
    const participants = await this.listParticipants(roomId)
    return participants.length
  }

  public async removeParticipant(roomId: string, identity: string) {
    if (!this.roomService) return
    try {
      await this.roomService.removeParticipant(roomId, identity)
    } catch (err: any) {
      logger.warn('LiveKit removeParticipant warning/error:', err?.message || err)
    }
  }

  public async muteParticipantAudio(roomId: string, identity: string) {
    if (!this.roomService) return
    try {
      const participant = await this.roomService.getParticipant(roomId, identity)
      if (!participant?.tracks) return

      for (const track of participant.tracks) {
        if (track.type === TrackType.AUDIO || track.source === TrackSource.MICROPHONE) {
          if (!track.muted) {
            await this.roomService.mutePublishedTrack(roomId, identity, track.sid, true)
          }
        }
      }
    } catch (err: any) {
      logger.warn('LiveKit muteParticipantAudio warning/error:', err?.message || err)
    }
  }

  public async setParticipantSpeakingPermission(roomId: string, identity: string, canPublish: boolean) {
    if (!this.roomService) return
    try {
      await this.roomService.updateParticipant(roomId, identity, {
        permission: {
          canPublish,
          canSubscribe: true,
          canPublishData: true
        }
      })
      if (!canPublish) {
        await this.muteParticipantAudio(roomId, identity)
      }
    } catch (err: any) {
      logger.warn('LiveKit setParticipantSpeakingPermission warning/error:', err?.message || err)
    }
  }

  public async deleteRoom(roomId: string) {
    if (!this.roomService) return
    try {
      await this.roomService.deleteRoom(roomId)
    } catch (err: any) {
      logger.warn('LiveKit deleteRoom error:', err?.message || err)
    }
  }
}
