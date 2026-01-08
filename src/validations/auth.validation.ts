import { createSchema } from './base.schema'
import { emailSchema, otpSchema, passwordSchema } from '~/utils/validators.util'

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
