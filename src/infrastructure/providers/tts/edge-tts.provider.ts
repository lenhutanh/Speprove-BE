import { EdgeTTS } from 'node-edge-tts'
import * as mm from 'music-metadata'
import { singleton } from 'tsyringe'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import crypto from 'crypto'
import { AppError } from '~/common/errors'
import { StatusCodes } from 'http-status-codes'

@singleton()
export class EdgeTTSProvider {
  public async textToSpeech(
    text: string,
    voiceCode: string,
    speed: number = 1, // 1.0 là mặc định
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

      // 5. Lấy duration từ metadata
      const metadata = await mm.parseBuffer(buffer)

      return {
        buffer,
        duration: metadata.format.duration ?? 0
      }
    } catch (error) {
      console.error('EdgeTTS Provider Error:', error)
      throw new AppError(
        `TTS failed: ${error instanceof Error ? error.message : String(error)}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    } finally {
      // 6. Xóa file tạm sau khi xong để tránh rác ổ cứng
      try {
        await fs.unlink(tempFilePath)
      } catch (e) {
        // Bỏ qua lỗi xóa file
      }
    }
  }
}
