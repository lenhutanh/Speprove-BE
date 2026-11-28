export const PART2_CATEGORY = {
  OBJECT: 'object',
  PERSON: 'person',
  EVENT: 'event',
  ACTIVITY: 'activity',
  PLACE: 'place',
  FAVOURITE: 'favourite'
} as const

export type Part23CategoryValue = (typeof PART2_CATEGORY)[keyof typeof PART2_CATEGORY]

export const PART_KIND = {
  ONE: 1,
  TWO: 2,
  THREE: 3
} as const

export type PartKind = (typeof PART_KIND)[keyof typeof PART_KIND]
