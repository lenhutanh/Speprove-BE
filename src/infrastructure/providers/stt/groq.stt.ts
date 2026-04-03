import { singleton } from 'tsyringe'
import Groq from 'groq-sdk'
import { env } from '~/common/config'
import { AppError } from '~/common/errors'
import { StatusCodes } from 'http-status-codes'
import { ISTTProvider, STTResult } from './stt.interface'

@singleton()
export class GroqSTTProvider implements ISTTProvider {
  private readonly client: Groq

  constructor() {
    this.client = new Groq({
      apiKey: env.GROQ_API_KEY
    })
  }

  public async transcribe(audioUrl: string, question?: string): Promise<STTResult> {
    try {
      if (!audioUrl) throw new AppError('Audio file not found', StatusCodes.NOT_FOUND)

      const whisperPrompt = question
        ? `${question}. Um, uh, I think... you know, I believe... like, it is really...`
        : `Um, uh, I think... I think it is, uh, important. Like, you know, it is... it is really good.`

      const response = (await this.client.audio.transcriptions.create({
        url: audioUrl,
        language: 'en',
        model: 'whisper-large-v3',
        response_format: 'verbose_json',
        temperature: 0,
        prompt: whisperPrompt
      })) as any

      return {
        transcript: response.text,
        duration: response.duration || 0
      }
    } catch (error) {
      console.error('Groq STT Error:', error)
      throw error
    }
  }
}
