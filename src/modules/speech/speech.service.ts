import { singleton } from 'tsyringe'
import { FfmpegProvider } from '~/infrastructure/providers/media/ffmpeg.provider'

@singleton()
export class SpeechService {
  constructor(private readonly ffmpegProvider: FfmpegProvider) {}
  public async convertToDual(input: string, wavOut: string, mp3Out: string): Promise<void> {
    await FfmpegProvider.run(input, (cmd) =>
      cmd
        .inputOptions(['-err_detect', 'ignore_err', '-fflags', '+discardcorrupt'])

        .output(wavOut)
        .format('wav')
        .audioChannels(1)
        .audioFrequency(16000)
        .audioCodec('pcm_s16le')
        .audioFilters(['loudnorm'])

        .output(mp3Out)
        .audioCodec('libmp3lame')
        .audioBitrate('128k')
        .audioChannels(1)
        .audioFrequency(44100)
    )
  }
}
