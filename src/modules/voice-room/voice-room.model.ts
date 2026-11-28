import mongoose, { Schema } from 'mongoose'
import { BASE_SCHEMA_CONTENT, BASE_SCHEMA_OPTIONS } from '~/core/persistence/base.model'
import {
  VOICE_ROOM_CONFIG,
  VOICE_ROOM_LEVEL,
  VOICE_ROOM_POLICY,
  VOICE_ROOM_STATUS,
  VOICE_ROOM_TOPIC_TYPE,
  VoiceRoomLevelType,
  VoiceRoomPolicyType,
  VoiceRoomStatusType,
  VoiceRoomTopicType
} from './voice-room.constants'

const voiceRoomSchema = new Schema(
  {
    ...BASE_SCHEMA_CONTENT,
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    topicType: {
      type: String,
      enum: Object.values(VOICE_ROOM_TOPIC_TYPE),
      default: VOICE_ROOM_TOPIC_TYPE.FREE_TALK
    },
    level: {
      type: String,
      enum: Object.values(VOICE_ROOM_LEVEL),
      default: VOICE_ROOM_LEVEL.ALL
    },
    maxParticipants: {
      type: Number,
      required: true,
      min: 2,
      max: 10,
      default: 2
    },
    isPrivate: {
      type: Boolean,
      default: false
    },
    pinCode: {
      type: String,
      default: null,
      trim: true
    },
    hostId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true
    },
    status: {
      type: String,
      enum: Object.values(VOICE_ROOM_STATUS),
      default: VOICE_ROOM_STATUS.ACTIVE
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    endedAt: {
      type: Date,
      default: null
    },
    speakingPolicy: {
      type: String,
      enum: Object.values(VOICE_ROOM_POLICY),
      default: VOICE_ROOM_POLICY.ALL
    },
    questionPinPolicy: {
      type: String,
      enum: Object.values(VOICE_ROOM_POLICY),
      default: VOICE_ROOM_POLICY.HOST_ONLY
    },
    welcomeMessage: {
      type: String,
      default: null,
      trim: true,
      maxlength: VOICE_ROOM_CONFIG.MAX_WELCOME_MESSAGE_LENGTH
    },
    pinnedQuestionId: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      default: null
    }
  },
  BASE_SCHEMA_OPTIONS
)

voiceRoomSchema.index({ status: 1, createdAt: -1 })
voiceRoomSchema.index({ hostId: 1, status: 1 })

export type VoiceRoomType = mongoose.InferSchemaType<typeof voiceRoomSchema> & {
  _id: mongoose.Types.ObjectId
  topicType: VoiceRoomTopicType
  level: VoiceRoomLevelType
  status: VoiceRoomStatusType
  speakingPolicy: VoiceRoomPolicyType
  questionPinPolicy: VoiceRoomPolicyType
}

export const VoiceRoom = mongoose.models.VoiceRoom || mongoose.model<VoiceRoomType>('VoiceRoom', voiceRoomSchema)
