import { singleton } from 'tsyringe'
import Groq from 'groq-sdk'
import { env } from '~/config/env.config'
import { AppError } from '~/core/errors/app.error'
import { StatusCodes } from 'http-status-codes'
import { ISTTProvider, STTResult } from './stt.provider.interface'
import { logger } from '~/core/logging/logger'

type GroqVerboseSegment = {
  text?: string
  start?: number
  end?: number
  avg_logprob?: number
  compression_ratio?: number
  no_speech_prob?: number
  temperature?: number
}

type GroqVerboseTranscription = {
  text?: string
  duration?: number
  language?: string
  task?: string
  segments?: GroqVerboseSegment[]
}

@singleton()
export class GroqSTTProvider implements ISTTProvider {
  private readonly client: Groq
  private readonly model = 'whisper-large-v3'

  constructor() {
    this.client = new Groq({
      apiKey: env.GROQ_API_KEY,
      timeout: env.AI_TIMEOUT_MS
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
        model: this.model,
        response_format: 'verbose_json',
        temperature: 0,
        prompt: whisperPrompt
      })) as GroqVerboseTranscription

      return {
        transcript: response.text ?? '',
        duration: response.duration || 0,
        provider: {
          name: 'groq',
          model: this.model
        },
        segments: Array.isArray(response.segments)
          ? response.segments.map((segment, index) => ({
              index,
              text: String(segment.text ?? ''),
              startTime: typeof segment.start === 'number' ? segment.start : undefined,
              endTime: typeof segment.end === 'number' ? segment.end : undefined,
              metadata: {
                avgLogprob: segment.avg_logprob,
                compressionRatio: segment.compression_ratio,
                noSpeechProb: segment.no_speech_prob,
                temperature: segment.temperature
              }
            }))
          : [],
        metadata: {
          language: response.language,
          task: response.task,
          model: this.model
        }
      }
    } catch (error) {
      logger.error('Groq STT Error:', error)
      throw error
    }
  }
}
