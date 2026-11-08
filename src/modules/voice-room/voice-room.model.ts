import mongoose, { Schema } from 'mongoose'
import { BaseSchemaContent, BaseSchemaOptions } from '~/common/base/base.model'
import {
  VOICE_ROOM_LEVEL,
  VOICE_ROOM_STATUS,
  VOICE_ROOM_TOPIC_TYPE,
  VoiceRoomLevelType,
  VoiceRoomStatusType,
  VoiceRoomTopicType
} from './voice-room.constants'

const voiceRoomSchema = new Schema(
  {
    ...BaseSchemaContent,
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
    allowMemberPin: {
      type: Boolean,
      default: false
    },
    pinnedQuestionId: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      default: null
    }
  },
  BaseSchemaOptions
)

voiceRoomSchema.index({ status: 1, createdAt: -1 })
voiceRoomSchema.index({ hostId: 1, status: 1 })

export type VoiceRoomType = mongoose.InferSchemaType<typeof voiceRoomSchema> & {
  _id: mongoose.Types.ObjectId
  topicType: VoiceRoomTopicType
  level: VoiceRoomLevelType
  status: VoiceRoomStatusType
}

export const VoiceRoom = mongoose.models.VoiceRoom || mongoose.model<VoiceRoomType>('VoiceRoom', voiceRoomSchema)
