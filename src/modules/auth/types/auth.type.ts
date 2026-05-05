import { z } from 'zod'
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifySchema
} from '../auth.validation'

export type LoginBodyType = z.infer<typeof loginSchema>['body']
export type RegisterBodyType = z.infer<typeof registerSchema>['body']
export type VerifyBodyType = z.infer<typeof verifySchema>['body']
export type ForgotPasswordBodyType = z.infer<typeof forgotPasswordSchema>['body']
export type ResetPasswordBodyType = z.infer<typeof resetPasswordSchema>['body']
