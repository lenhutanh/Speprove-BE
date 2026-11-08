import { singleton } from 'tsyringe'
import { BaseMapper } from '~/common/base'
import { VoiceRoomType } from './voice-room.model'
import { VoiceRoomHostDto, VoiceRoomMemberDto, VoiceRoomResponseDto } from './types/voice-room.type'

@singleton()
export class VoiceRoomMapper extends BaseMapper<VoiceRoomType, VoiceRoomResponseDto> {
  toResponse(
    entity: VoiceRoomType,
    currentParticipants: number = 0,
    members: VoiceRoomMemberDto[] = [],
    includePinCode: boolean = false,
    customHost?: VoiceRoomHostDto
  ): VoiceRoomResponseDto {
    const hostDoc = entity.hostId as any
    const hostAvatar =
      customHost?.avatar ||
      (hostDoc?.avatarId && typeof hostDoc.avatarId === 'object' && 'url' in hostDoc.avatarId
        ? hostDoc.avatarId.url
        : hostDoc?.avatarUrl || null)

    const host: VoiceRoomHostDto = customHost || {
      id: hostDoc?._id?.toString() || entity.hostId?.toString() || '',
      name: hostDoc?.fullName || hostDoc?.username || 'Host',
      avatar: hostAvatar
    }

    const pinnedDoc = (entity as any).pinnedQuestionId
    let pinnedQuestion = null
    if (pinnedDoc && typeof pinnedDoc === 'object' && '_id' in pinnedDoc) {
      pinnedQuestion = {
        questionId: pinnedDoc._id.toString(),
        content: pinnedDoc.content,
        part: pinnedDoc.part,
        category: pinnedDoc.category || null,
        topicName: pinnedDoc.topicId?.name || null,
        bulletPoints: pinnedDoc.bulletPoints || [],
        parentContent: pinnedDoc.parentId?.content || null
      }
    }

    const response: VoiceRoomResponseDto = {
      id: entity._id.toString(),
      title: entity.title,
      topicType: entity.topicType,
      level: entity.level,
      maxParticipants: entity.maxParticipants,
      isPrivate: entity.isPrivate,
      host,
      status: entity.status,
      currentParticipants,
      members,
      allowMemberPin: !!(entity as any).allowMemberPin,
      pinnedQuestion,
      createdAt: (entity as any).createdAt || new Date()
    }

    if (includePinCode && entity.pinCode) {
      response.pinCode = entity.pinCode
    }

    return response
  }
}
