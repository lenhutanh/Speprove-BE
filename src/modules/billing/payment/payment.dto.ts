export type PaymentResponseDto = {
  id: string
  orderCode: number
  amount: number
  points: number
  status: string
  method: string
  expiredAt: Date
  createdAt: Date
  qrCode: string
  accountName: string
  accountNumber: string
  bin: string
  description: string
}
