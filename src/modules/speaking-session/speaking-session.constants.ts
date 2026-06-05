export const SPEAKING_SESSION_MODE = {
  PRACTICE: 'practice',
  MOCK: 'mock'
} as const

export const SESSION_STATUS = {
  NOT_STARTED: 0,
  IN_PROGRESS: 1,
  COMPLETED: 2
} as const

export const SPEAKING_SESSION_TYPE = {
  MOCK_PART_1: 'mock_p1',
  MOCK_PART_2: 'mock_p2',
  MOCK_PART_3: 'mock_p3',
  FULL_TEST: 'full_test'
} as const
