import { inject, singleton } from 'tsyringe'
import { StatusCodes } from 'http-status-codes'
import { Types } from 'mongoose'
import { TOKENS } from '~/common/constants/di.tokens'
import { AppError } from '~/common/errors'
import { QueryBuilder } from '~/common/base/query-builder'
import { AccountService } from '~/modules/account/account.service'
import { SocketService } from '~/infrastructure/socket/socket.service'
import { LiveKitService } from '~/infrastructure/livekit/livekit.service'
import { IVoiceRoomRepository } from './repositories/voice-room.repository.interface'
import { VoiceRoomType } from './voice-room.model'
import { VoiceRoomMapper } from './voice-room.mapper'
import {
  CreateVoiceRoomBody,
  GetActiveVoiceRoomsQuery,
  JoinVoiceRoomBody,
  PaginatedVoiceRoomsResponse,
  PinnedQuestionDto,
  UpdateVoiceRoomBody,
  VoiceRoomMemberDto,
  VoiceRoomResponseDto
} from './types/voice-room.type'
import { VOICE_ROOM_SOCKET_EVENTS, VOICE_ROOM_STATUS } from './voice-room.constants'
import { Question } from '~/modules/question/question.model'

@singleton()
export class VoiceRoomService {
  constructor(
    @inject(TOKENS.IVoiceRoomRepository)
    private readonly voiceRoomRepository: IVoiceRoomRepository,
    private readonly voiceRoomMapper: VoiceRoomMapper,
    private readonly liveKitService: LiveKitService,
    private readonly accountService: AccountService,
    private readonly socketService: SocketService
  ) {}

  public async createRoom(hostId: string, body: CreateVoiceRoomBody) {
    const existingActiveRoom = await this.voiceRoomRepository.findOne({
      hostId: new Types.ObjectId(hostId) as any,
      status: VOICE_ROOM_STATUS.ACTIVE
    })

    if (existingActiveRoom) {
      throw new AppError(
        'You already have an active voice room. Please close it before creating a new one.',
        StatusCodes.BAD_REQUEST
      )
    }

    const room = await this.voiceRoomRepository.create({
      title: body.title,
      topicType: body.topicType,
      level: body.level,
      maxParticipants: body.maxParticipants || 2,
      isPrivate: body.isPrivate || false,
      pinCode: body.isPrivate ? body.pinCode : null,
      hostId: new Types.ObjectId(hostId) as any,
      status: VOICE_ROOM_STATUS.ACTIVE
    })

    const roomId = room._id.toString()

    await this.liveKitService.createRoom(roomId, room.maxParticipants, 600)

    const hostUser = await this.accountService.getMe(hostId)
    const hostDto = {
      id: hostId,
      name: hostUser.fullName || hostUser.username,
      avatar: hostUser.avatarUrl || null
    }

    const roomDto = this.voiceRoomMapper.toResponse(room, 0, [], true, hostDto)

    this.socketService.toRoom('lobby', VOICE_ROOM_SOCKET_EVENTS.ROOM_CREATED, roomDto)

    return {
      room: roomDto
    }
  }

  public async getActiveRooms(query?: GetActiveVoiceRoomsQuery): Promise<PaginatedVoiceRoomsResponse> {
    const { page = 1, limit = 12, sortBy = 'createdAt', sortOrder = 'desc', search, ...filters } = query || {}

    const qb = new QueryBuilder<VoiceRoomType>()
    qb.applyFilters(filters, ['topicType', 'level', 'isPrivate'])
      .populate({
        path: 'hostId',
        select: 'fullName username avatarId',
        populate: { path: 'avatarId', select: 'url' }
      })
      .sort(sortBy as any, sortOrder)

    if (search) {
      qb.search(['title'], search)
    }

    const { filter, options } = qb.build()
    filter.status = VOICE_ROOM_STATUS.ACTIVE

    const { data: rooms, pagination } = await this.voiceRoomRepository.paginate(filter, page, limit, options)

    if (rooms.length === 0) {
      return {
        data: [],
        pagination
      }
    }

    const roomIds = rooms.map((r) => r._id.toString())
    const lkRooms = await this.liveKitService.listRooms(roomIds)

    if (!lkRooms) {
      return {
        data: rooms.map((room) => this.voiceRoomMapper.toResponse(room, 0, [], false)),
        pagination
      }
    }

    const lkRoomMap = new Map(lkRooms.map((r) => [r.name, r]))
    const validRooms: VoiceRoomResponseDto[] = []
    const zombieRoomIds: string[] = []
    const safeThresholdTime = Date.now() - 3 * 60 * 1000

    for (const room of rooms) {
      const roomId = room._id.toString()
      const lkRoom = lkRoomMap.get(roomId)

      if (!lkRoom) {
        const createdAtTime = new Date((room as any).createdAt).getTime()
        if (createdAtTime < safeThresholdTime) {
          zombieRoomIds.push(roomId)
        } else {
          validRooms.push(this.voiceRoomMapper.toResponse(room, 0, [], false))
        }
        continue
      }

      validRooms.push(this.voiceRoomMapper.toResponse(room, lkRoom.numParticipants, [], false))
    }

    if (zombieRoomIds.length > 0) {
      this.voiceRoomRepository
        .updateMany({ _id: { $in: zombieRoomIds as any } }, { status: VOICE_ROOM_STATUS.CLOSED, endedAt: new Date() })
        .catch((err) => {
          console.warn('Failed to batch clean zombie rooms:', err?.message || err)
        })
    }

    return {
      data: validRooms,
      pagination
    }
  }

  public async getRoomById(id: string, userId?: string): Promise<VoiceRoomResponseDto> {
    const room = await this.voiceRoomRepository.findById(id, {
      populate: [
        {
          path: 'hostId',
          select: 'fullName username avatarId',
          populate: { path: 'avatarId', select: 'url' }
        },
        {
          path: 'pinnedQuestionId',
          populate: [
            { path: 'topicId', select: 'name' },
            { path: 'parentId', select: 'content' }
          ]
        }
      ]
    })
    if (!room || room.status !== VOICE_ROOM_STATUS.ACTIVE) {
      throw new AppError('Voice room not found or has ended', StatusCodes.NOT_FOUND)
    }

    const participants = await this.liveKitService.listParticipants(id)
    const members: VoiceRoomMemberDto[] = participants.map((p) => {
      let avatar: string | null = null
      try {
        const parsed = JSON.parse(p.metadata || '{}')
        avatar = parsed.avatar || null
      } catch {
        avatar = null
      }
      return {
        id: p.identity,
        name: p.name,
        avatar
      }
    })

    const isHost = this.checkIsHost(room, userId)

    return this.voiceRoomMapper.toResponse(room, members.length, members, isHost)
  }

  public async joinRoom(roomId: string, userId: string, body: JoinVoiceRoomBody) {
    const room = await this.voiceRoomRepository.findById(roomId, {
      populate: {
        path: 'hostId',
        select: 'fullName username avatarId',
        populate: { path: 'avatarId', select: 'url' }
      }
    })
    if (!room || room.status !== VOICE_ROOM_STATUS.ACTIVE) {
      throw new AppError('Voice room not found or has ended', StatusCodes.NOT_FOUND)
    }

    const isHost = this.checkIsHost(room, userId)

    const participants = await this.liveKitService.listParticipants(roomId)
    const isAlreadyInRoom = participants.some((p) => p.identity === userId)

    if (!isAlreadyInRoom && participants.length >= room.maxParticipants) {
      throw new AppError(`Room is full (${room.maxParticipants}/${room.maxParticipants})`, StatusCodes.FORBIDDEN)
    }

    if (!isHost && room.isPrivate && room.pinCode) {
      if (!body.pinCode || body.pinCode !== room.pinCode) {
        throw new AppError('Invalid PIN code', StatusCodes.FORBIDDEN)
      }
    }

    const user = await this.accountService.getMe(userId)
    const name = user.fullName || user.username
    const avatar = user.avatarUrl || null

    const token = await this.liveKitService.generateToken({
      roomId,
      identity: userId,
      name,
      avatar,
      isHost
    })

    const currentCount = isAlreadyInRoom ? participants.length : participants.length + 1

    return {
      room: this.voiceRoomMapper.toResponse(room, currentCount, [], isHost),
      token,
      serverUrl: this.liveKitService.getServerUrl()
    }
  }

  public async leaveRoom(roomId: string, userId: string): Promise<void> {
    const room = await this.voiceRoomRepository.findById(roomId)
    if (!room) {
      throw new AppError('Voice room not found', StatusCodes.NOT_FOUND)
    }

    if (room.status !== VOICE_ROOM_STATUS.ACTIVE) {
      throw new AppError('Voice room has already ended', StatusCodes.BAD_REQUEST)
    }

    await this.liveKitService.removeParticipant(roomId, userId)

    const remainingCount = await this.liveKitService.getParticipantCount(roomId)

    this.socketService.toRoom('lobby', VOICE_ROOM_SOCKET_EVENTS.ROOM_UPDATED, {
      id: roomId,
      currentParticipants: remainingCount
    })

    this.socketService.toRoom(`voice-room:${roomId}`, VOICE_ROOM_SOCKET_EVENTS.MEMBER_LEFT, {
      userId
    })
  }

  public async closeRoom(roomId: string, userId: string): Promise<void> {
    const room = await this.voiceRoomRepository.findById(roomId)
    if (!room) {
      throw new AppError('Voice room not found', StatusCodes.NOT_FOUND)
    }

    if (room.status !== VOICE_ROOM_STATUS.ACTIVE) {
      throw new AppError('Voice room has already ended', StatusCodes.BAD_REQUEST)
    }

    if (!this.checkIsHost(room, userId)) {
      throw new AppError('Only the host can close this room', StatusCodes.FORBIDDEN)
    }

    await this.voiceRoomRepository.updateById(roomId, {
      status: VOICE_ROOM_STATUS.CLOSED,
      endedAt: new Date()
    })

    await this.liveKitService.deleteRoom(roomId)

    this.socketService.toRoom('lobby', VOICE_ROOM_SOCKET_EVENTS.ROOM_CLOSED, { id: roomId })
  }

  public async updateRoom(roomId: string, userId: string, body: UpdateVoiceRoomBody): Promise<VoiceRoomResponseDto> {
    const room = await this.voiceRoomRepository.findById(roomId, {
      populate: {
        path: 'hostId',
        select: 'fullName username avatarId',
        populate: { path: 'avatarId', select: 'url' }
      }
    })
    if (!room) {
      throw new AppError('Voice room not found', StatusCodes.NOT_FOUND)
    }

    if (room.status !== VOICE_ROOM_STATUS.ACTIVE) {
      throw new AppError('Voice room has already ended', StatusCodes.BAD_REQUEST)
    }

    if (!this.checkIsHost(room, userId)) {
      throw new AppError('Only the host can update this room', StatusCodes.FORBIDDEN)
    }

    const currentCount = await this.liveKitService.getParticipantCount(roomId)

    if (body.maxParticipants !== undefined && body.maxParticipants < currentCount) {
      throw new AppError(
        `Cannot set maximum participants (${body.maxParticipants}) lower than current participant count (${currentCount})`,
        StatusCodes.BAD_REQUEST
      )
    }

    const updateData: any = {}
    if (body.title !== undefined) updateData.title = body.title
    if (body.topicType !== undefined) updateData.topicType = body.topicType
    if (body.level !== undefined) updateData.level = body.level
    if (body.maxParticipants !== undefined) updateData.maxParticipants = body.maxParticipants
    if (body.isPrivate !== undefined) {
      updateData.isPrivate = body.isPrivate
      updateData.pinCode = body.isPrivate ? body.pinCode : null
    } else if (body.pinCode !== undefined) {
      updateData.pinCode = body.pinCode
    }
    if (body.allowMemberPin !== undefined) {
      updateData.allowMemberPin = body.allowMemberPin
    }

    const updatedRoom = await this.voiceRoomRepository.updateById(roomId, updateData)
    if (!updatedRoom) {
      throw new AppError('Failed to update voice room', StatusCodes.INTERNAL_SERVER_ERROR)
    }

    const responseDtoForLobby = this.voiceRoomMapper.toResponse(updatedRoom, currentCount, [], false)
    const responseDtoForRoom = this.voiceRoomMapper.toResponse(updatedRoom, currentCount, [], true)

    this.socketService.toRoom('lobby', VOICE_ROOM_SOCKET_EVENTS.ROOM_UPDATED, responseDtoForLobby)
    this.socketService.toRoom(`voice-room:${roomId}`, VOICE_ROOM_SOCKET_EVENTS.DETAILS_UPDATED, responseDtoForRoom)

    return responseDtoForRoom
  }

  public async pinQuestion(roomId: string, userId: string, questionId: string): Promise<PinnedQuestionDto> {
    const room = await this.voiceRoomRepository.findById(roomId)
    if (!room) {
      throw new AppError('Voice room not found', StatusCodes.NOT_FOUND)
    }

    if (room.status !== VOICE_ROOM_STATUS.ACTIVE) {
      throw new AppError('Voice room has already ended', StatusCodes.BAD_REQUEST)
    }

    const isHost = this.checkIsHost(room, userId)
    if (!isHost && !room.allowMemberPin) {
      throw new AppError('Only the host can pin questions in this room', StatusCodes.FORBIDDEN)
    }

    const questionDoc = await Question.findById(questionId)
      .populate('topicId', 'name')
      .populate('parentId', 'content')

    if (!questionDoc) {
      throw new AppError('Question not found', StatusCodes.NOT_FOUND)
    }

    const q = questionDoc as any
    const pinnedQuestionDto: PinnedQuestionDto = {
      questionId: q._id.toString(),
      content: q.content,
      part: q.part,
      category: q.category || null,
      topicName: q.topicId?.name || null,
      bulletPoints: q.bulletPoints || [],
      parentContent: q.parentId?.content || null,
      pinnedBy: userId,
      pinnedAt: new Date()
    }

    await this.voiceRoomRepository.updateById(roomId, {
      pinnedQuestionId: q._id
    })

    this.socketService.toRoom(`voice-room:${roomId}`, VOICE_ROOM_SOCKET_EVENTS.QUESTION_PINNED, pinnedQuestionDto)

    return pinnedQuestionDto
  }

  public async unpinQuestion(roomId: string, userId: string): Promise<void> {
    const room = await this.voiceRoomRepository.findById(roomId)
    if (!room) {
      throw new AppError('Voice room not found', StatusCodes.NOT_FOUND)
    }

    if (room.status !== VOICE_ROOM_STATUS.ACTIVE) {
      throw new AppError('Voice room has already ended', StatusCodes.BAD_REQUEST)
    }

    const isHost = this.checkIsHost(room, userId)
    if (!isHost && !room.allowMemberPin) {
      throw new AppError('Only the host can unpin questions in this room', StatusCodes.FORBIDDEN)
    }

    await this.voiceRoomRepository.updateById(roomId, {
      pinnedQuestionId: null
    })

    this.socketService.toRoom(`voice-room:${roomId}`, VOICE_ROOM_SOCKET_EVENTS.QUESTION_UNPINNED, { roomId })
  }

  public async handleWebhookEvent(event: any) {
    if (!event || !event.event) return

    const roomName = event.room?.name
    if (!roomName) return

    if (event.event === 'room_finished') {
      await this.voiceRoomRepository.updateById(roomName, {
        status: VOICE_ROOM_STATUS.CLOSED,
        endedAt: new Date()
      })
      this.socketService.toRoom('lobby', VOICE_ROOM_SOCKET_EVENTS.ROOM_CLOSED, { id: roomName })
    } else if (event.event === 'participant_joined' || event.event === 'participant_left') {
      const currentParticipants = event.room?.numParticipants || 0

      this.socketService.toRoom('lobby', VOICE_ROOM_SOCKET_EVENTS.ROOM_UPDATED, {
        id: roomName,
        currentParticipants
      })

      if (event.event === 'participant_left' && event.participant?.identity) {
        this.socketService.toRoom(`voice-room:${roomName}`, VOICE_ROOM_SOCKET_EVENTS.MEMBER_LEFT, {
          userId: event.participant.identity
        })
      } else if (event.event === 'participant_joined' && event.participant) {
        let avatar: string | null = null
        try {
          const parsed = JSON.parse(event.participant.metadata || '{}')
          avatar = parsed.avatar || null
        } catch {
          avatar = null
        }
        this.socketService.toRoom(`voice-room:${roomName}`, VOICE_ROOM_SOCKET_EVENTS.MEMBER_JOINED, {
          id: event.participant.identity,
          name: event.participant.name,
          avatar
        })
      }
    }
  }

  private checkIsHost(room: VoiceRoomType, userId?: string): boolean {
    if (!userId) return false
    const rawHostId = (room.hostId as any)?._id?.toString() || room.hostId?.toString()
    return rawHostId === userId
  }
}
