export const FORECAST_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
} as const

export type ForecastStatusType = (typeof FORECAST_STATUS)[keyof typeof FORECAST_STATUS]

export const PART_GROUP = {
  PART1: '1',
  PART23: '2,3'
} as const
