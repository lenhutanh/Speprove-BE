import { singleton } from 'tsyringe'
import { FfmpegProvider } from '~/infrastructure/providers/media/ffmpeg.provider'

@singleton()
export class SpeechService {
  constructor(private readonly ffmpegProvider: FfmpegProvider) {}
  /**
   * Chuẩn hóa audio cho speech processing (STT / MFA)
   * - mono
   * - 16kHz
   * - PCM 16bit
   * - remove silence
   * - normalize volume
   */
  public async normalizeAudio(input: string, output: string): Promise<void> {
    await FfmpegProvider.run(input, (cmd) =>
      cmd
        .audioChannels(1) // mono
        .audioFrequency(16000) // 16kHz sample rate
        .audioCodec('pcm_s16le') // PCM 16-bit
        .format('wav')
        .audioFilters([
          'highpass=f=80', // remove mic rumble
          'lowpass=f=8000', // remove high freq noise
          'loudnorm', // normalize volume
          'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.1'
        ])
        .save(output)
    )
  }
}
