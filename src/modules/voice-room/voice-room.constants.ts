export const VOICE_ROOM_STATUS = {
  ACTIVE: 'ACTIVE',
  CLOSED: 'CLOSED'
} as const

export type VoiceRoomStatusType = (typeof VOICE_ROOM_STATUS)[keyof typeof VOICE_ROOM_STATUS]

export const VOICE_ROOM_TOPIC_TYPE = {
  PART_1: 'PART_1',
  PART_2: 'PART_2',
  PART_3: 'PART_3',
  FREE_TALK: 'FREE_TALK'
} as const

export type VoiceRoomTopicType = (typeof VOICE_ROOM_TOPIC_TYPE)[keyof typeof VOICE_ROOM_TOPIC_TYPE]

export const VOICE_ROOM_LEVEL = {
  ALL: 'ALL',
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED'
} as const

export type VoiceRoomLevelType = (typeof VOICE_ROOM_LEVEL)[keyof typeof VOICE_ROOM_LEVEL]

export const VOICE_ROOM_SOCKET_EVENTS = {
  LOBBY_JOIN: 'voice-room:lobby:join',
  LOBBY_LEAVE: 'voice-room:lobby:leave',
  ROOM_CREATED: 'voice-room:created',
  ROOM_UPDATED: 'voice-room:updated',
  ROOM_CLOSED: 'voice-room:closed',
  ROOM_JOIN: 'voice-room:room:join',
  ROOM_LEAVE: 'voice-room:room:leave',
  CHAT_SEND: 'voice-room:chat:send',
  CHAT_MESSAGE: 'voice-room:chat:message',
  MEMBER_JOINED: 'voice-room:member-joined',
  MEMBER_LEFT: 'voice-room:member-left',
  DETAILS_UPDATED: 'voice-room:details-updated'
} as const
