import * as sdk from 'microsoft-cognitiveservices-speech-sdk'
import { singleton } from 'tsyringe'
import { env } from '~/common/config'

@singleton()
export class AzureSpeechProvider {
  private speechConfig: sdk.SpeechConfig

  constructor() {
    this.speechConfig = sdk.SpeechConfig.fromSubscription(env.AZURE_SPEECH_KEY, env.AZURE_SPEECH_REGION)

    this.speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio24Khz48KBitRateMonoMp3
  }

  public async textToSpeech(
    text: string,
    voiceCode: string,
    speed: number = 1,
    pitch: number = 0
  ): Promise<{ buffer: Buffer; duration: number }> {
    const config = this.speechConfig
    config.speechSynthesisVoiceName = voiceCode

    const synthesizer = new sdk.SpeechSynthesizer(config)

    const rateAttr = `${(speed - 1) * 100}%`
    const pitchAttr = `${pitch > 0 ? '+' : ''}${pitch}%`

    const ssml = `
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
  <voice name="${voiceCode}">
    <prosody rate="${rateAttr}" pitch="${pitchAttr}">
      ${text}
    </prosody>
  </voice>
</speak>
`

    try {
      const result: sdk.SpeechSynthesisResult = await new Promise((resolve, reject) => {
        synthesizer.speakSsmlAsync(ssml, resolve, reject)
      })

      if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
        const buffer = Buffer.from(result.audioData)
        const durationSeconds = result.audioDuration / 10000000

        return {
          buffer,
          duration: durationSeconds
        }
      }

      if (result.reason === sdk.ResultReason.Canceled) {
        const cancellation = sdk.CancellationDetails.fromResult(result)

        throw new Error(`Azure TTS canceled: ${cancellation.errorDetails}`)
      }

      throw new Error('Unknown Azure TTS error')
    } finally {
      synthesizer.close()
    }
  }
}
