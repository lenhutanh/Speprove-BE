import { CREDIT_COST, SPEAKING_SESSION_MODE } from '../constants/constants'

export const getCreditCost = (mode: string, part: number) => {
  if (mode === SPEAKING_SESSION_MODE.PRACTICE) {
    const partKey = `PART_${part}` as keyof typeof CREDIT_COST.PRACTICE
    return CREDIT_COST.PRACTICE[partKey] || 0
  }
  return 0
}
