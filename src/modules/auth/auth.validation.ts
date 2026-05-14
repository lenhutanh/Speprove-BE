import { emailSchema, otpSchema, passwordSchema } from '~/common/utils/validators.util'
import { createSchema } from '~/common/base/base.validation'
import z from 'zod'

export const loginSchema = createSchema({
  email: emailSchema,
  password: passwordSchema
})

export const registerSchema = createSchema({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: passwordSchema
}).refine(
  async (data) => {
    return data.body.password === data.body.confirmPassword
  },
  {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['body', 'confirmPassword']
  }
)

export const verifySchema = createSchema({
  email: emailSchema,
  otp: otpSchema
})

export const forgotPasswordSchema = createSchema({
  email: emailSchema
})

export const resetPasswordSchema = createSchema({
  newPassword: passwordSchema,
  confirmPassword: passwordSchema,
  resetToken: z.string()
}).refine(
  async (data) => {
    return data.body.newPassword === data.body.confirmPassword
  },
  {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['body', 'confirmPassword']
  }
)
