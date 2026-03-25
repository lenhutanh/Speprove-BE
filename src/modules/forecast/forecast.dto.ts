export type ForecastResponseDto = {
  id: string
  name: string
  slug: string
  quarter: number
  year: number
  thumbnail: string | null
  description: string | null
  validFrom: string
  validTo: string
  isActive: boolean
  createdAt: string
}
