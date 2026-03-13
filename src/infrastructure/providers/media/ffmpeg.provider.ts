import ffmpeg from 'fluent-ffmpeg'
import { Readable } from 'stream'
import { singleton } from 'tsyringe'

export type FfmpegConfigurator = (command: ffmpeg.FfmpegCommand) => ffmpeg.FfmpegCommand

@singleton()
export class FfmpegProvider {
  static async run(input: string | Readable, configure: FfmpegConfigurator): Promise<void> {
    return new Promise((resolve, reject) => {
      let command = ffmpeg(input)

      command = configure(command)

      command
        .on('start', (cmdLine) => {
          console.log(`[FFmpeg] Start: ${cmdLine}`)
        })
        .on('stderr', (line) => {
          console.log(`[FFmpeg] ${line}`)
        })
        .on('progress', (progress) => {
          if (progress.percent) {
            console.log(`[FFmpeg] ${progress.percent.toFixed(2)}%`)
          }
        })
        .on('end', () => {
          console.log('[FFmpeg] Finished')
          resolve()
        })
        .on('error', (err) => {
          console.error('[FFmpeg] Error:', err.message)
          reject(err)
        })
        .run()
    })
  }

  static async probe(path: string): Promise<ffmpeg.FfprobeData> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(path, (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
  }

  static async getDuration(path: string): Promise<number> {
    const metadata = await this.probe(path)

    return metadata.format?.duration ?? 0
  }

  static async convertAudio(
    input: string,
    output: string,
    options?: {
      sampleRate?: number
      channels?: number
      codec?: string
      format?: string
    }
  ) {
    await this.run(input, (cmd) => {
      if (options?.channels) cmd.audioChannels(options.channels)
      if (options?.sampleRate) cmd.audioFrequency(options.sampleRate)
      if (options?.codec) cmd.audioCodec(options.codec)
      if (options?.format) cmd.format(options.format)

      return cmd.save(output)
    })
  }
}
