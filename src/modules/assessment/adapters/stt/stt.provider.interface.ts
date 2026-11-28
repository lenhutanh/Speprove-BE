export type STTResult = {
  transcript: string
  duration: number
  provider?: {
    name: string
    model: string
  }
  confidence?: number
  segments?: {
    index: number
    text: string
    startTime?: number
    endTime?: number
    confidence?: number
    metadata?: Record<string, unknown>
  }[]
  metadata?: Record<string, unknown>
}

export interface ISTTProvider {
  transcribe(audioUrl: string, question: string): Promise<STTResult>
}
