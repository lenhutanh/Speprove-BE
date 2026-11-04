import { z } from 'zod'
import { idParamSchema, querySchema } from '~/common/base/base.validation'
import { requiredString } from '~/common/utils/validators.util'
import { VOICE_ROOM_LEVEL, VOICE_ROOM_TOPIC_TYPE } from './voice-room.constants'

export const createVoiceRoomSchema = z.object({
  body: z
    .object({
      title: requiredString(1, 100),
      topicType: z.enum(Object.values(VOICE_ROOM_TOPIC_TYPE) as [string, ...string[]]).optional(),
      level: z.enum(Object.values(VOICE_ROOM_LEVEL) as [string, ...string[]]).optional(),
      maxParticipants: z.coerce.number().int().min(2).max(10).default(2),
      isPrivate: z.boolean().optional().default(false),
      pinCode: z.string().regex(/^\d{6}$/, 'PIN code must be exactly 6 digits').optional().nullable()
    })
    .refine((data) => !data.isPrivate || (data.isPrivate && !!data.pinCode), {
      message: 'PIN code is required for private rooms',
      path: ['pinCode']
    })
    .strip()
})

export const getActiveVoiceRoomsSchema = querySchema({
  topicType: z.enum(Object.values(VOICE_ROOM_TOPIC_TYPE) as [string, ...string[]]).optional(),
  level: z.enum(Object.values(VOICE_ROOM_LEVEL) as [string, ...string[]]).optional(),
  isPrivate: z.coerce.boolean().optional()
})

export const getVoiceRoomByIdSchema = idParamSchema

export const joinVoiceRoomSchema = z.object({
  params: idParamSchema.shape.params,
  body: z
    .object({
      pinCode: z.string().regex(/^\d{6}$/, 'PIN code must be exactly 6 digits').optional()
    })
    .strip()
})

export const leaveVoiceRoomSchema = idParamSchema

export const updateVoiceRoomSchema = z.object({
  params: idParamSchema.shape.params,
  body: z
    .object({
      title: z.string().trim().min(1).max(100).optional(),
      topicType: z.enum(Object.values(VOICE_ROOM_TOPIC_TYPE) as [string, ...string[]]).optional(),
      level: z.enum(Object.values(VOICE_ROOM_LEVEL) as [string, ...string[]]).optional(),
      maxParticipants: z.coerce.number().int().min(2).max(10).optional(),
      isPrivate: z.boolean().optional(),
      pinCode: z.string().regex(/^\d{6}$/, 'PIN code must be exactly 6 digits').optional().nullable()
    })
    .refine((data) => data.isPrivate === undefined || !data.isPrivate || (data.isPrivate && !!data.pinCode), {
      message: 'PIN code is required when room is private',
      path: ['pinCode']
    })
    .strip()
})
