import { CREDIT_COST, SPEAKING_SESSION_MODE, SPEAKING_SESSION_TYPE } from '../constants/constants'

export const calculateCreditCost = (type_or_mode: string, part?: number) => {
  if (type_or_mode === SPEAKING_SESSION_TYPE.FULL_TEST) return CREDIT_COST.FULL_TEST

  if (type_or_mode === SPEAKING_SESSION_TYPE.MOCK_PART_1) return CREDIT_COST.MOCK.PART_1
  if (type_or_mode === SPEAKING_SESSION_TYPE.MOCK_PART_2) return CREDIT_COST.MOCK.PART_2
  if (type_or_mode === SPEAKING_SESSION_TYPE.MOCK_PART_3) return CREDIT_COST.MOCK.PART_3

  if (type_or_mode === SPEAKING_SESSION_MODE.PRACTICE && part) {
    const partKey = `PART_${part}` as keyof typeof CREDIT_COST.PRACTICE
    return CREDIT_COST.PRACTICE[partKey] || 0
  }

  return 0
}
