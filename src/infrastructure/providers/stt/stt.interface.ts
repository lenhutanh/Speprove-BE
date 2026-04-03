export type STTResult = {
  transcript: string
  duration: number
}

export interface ISTTProvider {
  transcribe(audioUrl: string, question: string): Promise<STTResult>
}
