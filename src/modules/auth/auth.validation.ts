import { emailSchema, otpSchema, passwordSchema } from '~/common/utils/validators.util'
import { createSchema } from '~/common/base/base.validation'

export const loginSchema = createSchema({
  email: emailSchema,
  password: passwordSchema
})

export const registerSchema = createSchema({
  email: emailSchema,
  password: passwordSchema,
  confirmedPassword: passwordSchema
}).refine(
  async (data) => {
    return data.body.password === data.body.confirmedPassword
  },
  {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['body', 'confirmedPassword']
  }
)

export const verifySchema = createSchema({
  email: emailSchema,
  otp: otpSchema
})

export const forgotPasswordSchema = createSchema({
  email: emailSchema
})
