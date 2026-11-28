import { PaginatedResult } from '~/core/persistence/base.repository.interface'
import { VoiceRoomLevelType, VoiceRoomPolicyType, VoiceRoomTopicType } from './voice-room.constants'

export interface CreateVoiceRoomBody {
  title: string
  topicType?: VoiceRoomTopicType
  level?: VoiceRoomLevelType
  maxParticipants?: number
  isPrivate?: boolean
  pinCode?: string | null
}

export interface UpdateVoiceRoomBody {
  title?: string
  topicType?: VoiceRoomTopicType
  level?: VoiceRoomLevelType
  maxParticipants?: number
  isPrivate?: boolean
  pinCode?: string | null
  speakingPolicy?: VoiceRoomPolicyType
  questionPinPolicy?: VoiceRoomPolicyType
  welcomeMessage?: string | null
}

export interface PinQuestionBody {
  questionId: string
}

export interface PinnedQuestionDto {
  questionId: string
  content: string
  part: number
  category?: string | null
  topicName?: string | null
  bulletPoints?: string[]
  parentContent?: string | null
  pinnedBy?: string | null
  pinnedAt?: Date | string | null
}

export interface JoinVoiceRoomBody {
  pinCode?: string
}

export interface GetActiveVoiceRoomsQuery {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
  topicType?: VoiceRoomTopicType
  level?: VoiceRoomLevelType
  isPrivate?: boolean
}

export interface VoiceRoomHostDto {
  id: string
  name: string
  avatar: string | null
}

export interface VoiceRoomMemberDto {
  id: string
  name: string
  avatar?: string | null
}

export interface VoiceRoomResponseDto {
  id: string
  title: string
  topicType: VoiceRoomTopicType
  level: VoiceRoomLevelType
  maxParticipants: number
  isPrivate: boolean
  pinCode?: string | null
  host: VoiceRoomHostDto
  status: string
  currentParticipants: number
  members: VoiceRoomMemberDto[]
  speakingPolicy: VoiceRoomPolicyType
  questionPinPolicy: VoiceRoomPolicyType
  welcomeMessage: string | null
  pinnedQuestion?: PinnedQuestionDto | null
  createdAt: Date
}

export type PaginatedVoiceRoomsResponse = PaginatedResult<VoiceRoomResponseDto>
