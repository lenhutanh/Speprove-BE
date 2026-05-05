export type SpeakingSessionResponseDto = {
  id: string
  userId: string
  forecastId: string
  voiceId: string
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
