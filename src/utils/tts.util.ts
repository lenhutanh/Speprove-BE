import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'
import * as mm from 'music-metadata'

export const generateTTSBuffer = async (text: string, voiceId: string) => {
  const tts = new MsEdgeTTS()

  try {
    await tts.setMetadata(voiceId, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3)

    const { audioStream } = await tts.toStream(text)
    const chunks: Uint8Array[] = []

    for await (const chunk of audioStream) {
      chunks.push(chunk)
    }

    const buffer = Buffer.concat(chunks)

    const { format } = await mm.parseBuffer(buffer)

    return { buffer: Buffer.concat(chunks), duration: format.duration }
  } catch (error) {
    console.error('TTS Generation Error:', error)
    throw error
  } finally {
    tts.close()
  }
}
