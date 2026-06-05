export const ATTEMPT_STATUS = {
  PENDING: 0,
  PROCESSING: 1,
  DONE: 2,
  FAILED: 3
} as const

export type AttemptStatus = (typeof ATTEMPT_STATUS)[keyof typeof ATTEMPT_STATUS]

export const ANALYSIS_PROFILE = {
  FAST: 'fast',
  STANDARD: 'standard',
  PREMIUM: 'premium'
} as const

export type AnalysisProfile = (typeof ANALYSIS_PROFILE)[keyof typeof ANALYSIS_PROFILE]
