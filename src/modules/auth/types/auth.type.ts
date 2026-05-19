import { z } from 'zod'
import {
  changePasswordSchema,
  forgotPasswordSchema,
  googleCallbackSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  setPasswordSchema,
  updateProfileSchema,
  verifySchema
} from '../auth.validation'

export type LoginBodyType = z.infer<typeof loginSchema>['body']
export type RegisterBodyType = z.infer<typeof registerSchema>['body']
export type VerifyBodyType = z.infer<typeof verifySchema>['body']
export type ForgotPasswordBodyType = z.infer<typeof forgotPasswordSchema>['body']
export type ResetPasswordBodyType = z.infer<typeof resetPasswordSchema>['body']
export type GoogleCallbackType = z.infer<typeof googleCallbackSchema>['query']
export type ChangePasswordBodyType = z.infer<typeof changePasswordSchema>['body']
export type SetPasswordBodyType = z.infer<typeof setPasswordSchema>['body']
export type UpdateProfileBodyType = z.infer<typeof updateProfileSchema>['body']
