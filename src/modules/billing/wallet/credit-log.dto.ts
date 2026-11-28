export interface CreditLogResponseDto {
  id: string
  type: 'plus' | 'minus'
  amount: number
  description: string
  descriptionKey?: string
  descriptionMetadata?: Record<string, any>
  refType?: string
  refId?: string
  balanceBefore: number
  balanceAfter: number
  createdAt: Date
}
