import { z } from 'zod'

export const OBJECT_ID_RULE = /^[0-9a-fA-F]{24}$/
export const OBJECT_ID_RULE_MESSAGE = 'Invalid ObjectId format'

export const EMAIL_RULE = /^\S+@\S+\.\S+$/
export const EMAIL_RULE_MESSAGE = 'Email is invalid (example@gmail.com)'

export const PASSWORD_RULE = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d\W]{8,256}$/
export const PASSWORD_RULE_MESSAGE = 'Password must include at least 1 letter, 1 number, and be at least 8 characters'

export const OTP_RULE = /^[0-9]{6}$/
export const OTP_RULE_MESSAGE = 'OTP is invalid'

export const objectIdSchema = z.string().regex(OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE)
export const emailSchema = z.string().regex(EMAIL_RULE, EMAIL_RULE_MESSAGE)
export const passwordSchema = z.string().regex(PASSWORD_RULE, PASSWORD_RULE_MESSAGE)
export const requiredString = (min = 1, max = 255, trim = true) =>
  z
    .string()
    .min(min)
    .max(max)
    .transform((s) => (trim ? s.trim() : s))

export const otpSchema = z.string().regex(OTP_RULE, OTP_RULE_MESSAGE)
