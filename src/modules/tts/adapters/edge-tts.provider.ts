import { EdgeTTS } from 'node-edge-tts'
import * as mm from 'music-metadata'
import { singleton } from 'tsyringe'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import crypto from 'crypto'
import { AppError } from '~/core/errors/app.error'
import { StatusCodes } from 'http-status-codes'
import { logger } from '~/core/logging/logger'

@singleton()
export class EdgeTTSProvider {
  public async textToSpeech(
    text: string,
    voiceCode: string,
    speed: number = 1,
    pitch: number = 0
  ): Promise<{ buffer: Buffer; duration: number }> {
    const rateStr = speed >= 1 ? `+${Math.round((speed - 1) * 100)}%` : `-${Math.round((1 - speed) * 100)}%`
    const pitchStr = pitch >= 0 ? `+${pitch}%` : `${pitch}%`

    const tempFileName = `tts_${crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.mp3`
    const tempFilePath = path.join(os.tmpdir(), tempFileName)

    const tts = new EdgeTTS({
      voice: voiceCode,
      rate: rateStr,
      pitch: pitchStr,
      outputFormat: 'audio-24khz-48kbitrate-mono-mp3'
    })

    try {
      await tts.ttsPromise(text, tempFilePath)

      const buffer = await fs.readFile(tempFilePath)

      if (buffer.length === 0) {
        throw new Error('Dữ liệu nhận được rỗng.')
      }

      const metadata = await mm.parseBuffer(buffer)

      return {
        buffer,
        duration: metadata.format.duration ?? 0
      }
    } catch (error) {
      logger.error('EdgeTTS Provider Error:', error)
      throw new AppError(
        `TTS failed: ${error instanceof Error ? error.message : String(error)}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    } finally {
      try {
        await fs.unlink(tempFilePath)
      } catch (e) {
        // A failed cleanup of the temp file must not fail the request
      }
    }
  }
}
