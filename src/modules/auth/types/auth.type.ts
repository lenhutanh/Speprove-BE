import { z } from 'zod'
import { createSchema } from '../../../common/base/base.validation'
import { emailSchema, otpSchema, passwordSchema } from '~/common/utils/validators.util'

export const loginSchema = createSchema({
  email: emailSchema,
  password: passwordSchema
})

export const registerSchema = createSchema({
  email: emailSchema,
  password: passwordSchema,
  confirmedPassword: passwordSchema
})

export const verifySchema = createSchema({
  email: emailSchema,
  otp: otpSchema
})

export type LoginBodyType = z.infer<typeof loginSchema>['body']
export type RegisterBodyType = z.infer<typeof registerSchema>['body']
export type VerifyBodyType = z.infer<typeof verifySchema>['body']
