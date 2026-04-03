export type SpeakingSessionResponseSto = {
  id: string
  userId: string
  forecastId: string
  type: string
  status: number
  result?: {
    fluency: number | null
    lexical: number | null
    grammar: number | null
    pronunciation: number | null
    overall: number | null
  }
  startedAt: Date
  finishedAt?: Date
}
