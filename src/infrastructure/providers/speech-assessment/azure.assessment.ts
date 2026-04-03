import * as sdk from 'microsoft-cognitiveservices-speech-sdk'
import { singleton } from 'tsyringe'
import { env } from '~/common/config'
import { IPronunciationAssessmentProvider, PronunciationAssessmentResult, Syllable } from './assessment.interface'
import { AZURE_TICKS_PER_SECOND } from '~/common/constants/constants'
import axios from 'axios'

@singleton()
export class AzurePronunciationAssessmentProvider implements IPronunciationAssessmentProvider {
  private readonly speechConfig: sdk.SpeechConfig

  constructor() {
    this.speechConfig = sdk.SpeechConfig.fromSubscription(env.AZURE_SPEECH_KEY, env.AZURE_SPEECH_REGION)
    this.speechConfig.speechRecognitionLanguage = 'en-US'
  }

  public async assess(audioUrl: string, referenceText: string): Promise<PronunciationAssessmentResult> {
    const response = await axios.get(audioUrl, { responseType: 'stream' })
    return this._runAssessment(response.data, referenceText)
  }

  private _runAssessment(
    audioStream: NodeJS.ReadableStream,
    referenceText: string
  ): Promise<PronunciationAssessmentResult> {
    return new Promise((resolve, reject) => {
      const pronunciationConfig = new sdk.PronunciationAssessmentConfig(
        referenceText || '',
        sdk.PronunciationAssessmentGradingSystem.HundredMark,
        sdk.PronunciationAssessmentGranularity.Phoneme,
        true
      )
      pronunciationConfig.enableProsodyAssessment = true

      const audioFormat = sdk.AudioStreamFormat.getWaveFormatPCM(16000, 16, 1)
      const pushStream = sdk.AudioInputStream.createPushStream(audioFormat)

      audioStream.on('data', (chunk: Buffer) => {
        const ab = chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength)
        pushStream.write(ab as ArrayBuffer)
      })

      audioStream.on('end', () => pushStream.close())
      audioStream.on('error', (err) => reject(err))

      const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream)
      const recognizer = new sdk.SpeechRecognizer(this.speechConfig, audioConfig)
      pronunciationConfig.applyTo(recognizer)

      // Các biến để tích lũy dữ liệu từ nhiều đoạn (chunks)
      const recognizedWords: any[] = []
      let fullTranscript = ''
      let totalAudioDurationTicks = 0

      let chunkCount = 0
      let totalAccuracy = 0
      let totalFluency = 0
      let totalProsody = 0
      let totalRhythm = 0
      let totalStress = 0
      let totalIntonation = 0

      // Sự kiện: Kích hoạt khi Azure nhận diện xong một cụm từ/câu
      recognizer.recognized = (s, e) => {
        if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
          const pa = sdk.PronunciationAssessmentResult.fromResult(e.result)
          const jsonStr = e.result.properties.getProperty(sdk.PropertyId.SpeechServiceResponse_JsonResult)

          if (jsonStr) {
            const json = JSON.parse(jsonStr)
            const nBest = json?.NBest?.[0]

            // Gom các từ vào mảng chung
            if (nBest && nBest.Words) {
              recognizedWords.push(...nBest.Words)
            }

            // Tích lũy các điểm chi tiết của Prosody
            const prosodyRaw = nBest?.PronunciationAssessment?.ProsodyScore
            if (prosodyRaw?.Feedback) {
              totalRhythm += prosodyRaw.Feedback.Rhythm?.Score ?? 0
              totalStress += prosodyRaw.Feedback.Stress?.Score ?? 0
              totalIntonation += prosodyRaw.Feedback.Intonation?.Score ?? 0
            }
          }

          fullTranscript += e.result.text + ' '
          totalAudioDurationTicks += e.result.duration

          // Tích lũy điểm tổng
          if (pa.accuracyScore) totalAccuracy += pa.accuracyScore
          if (pa.fluencyScore) totalFluency += pa.fluencyScore
          if (pa.prosodyScore) totalProsody += pa.prosodyScore

          chunkCount++
        }
      }

      // Sự kiện: Bị lỗi hoặc file stream hỏng
      recognizer.canceled = (s, e) => {
        if (e.reason === sdk.CancellationReason.Error) {
          recognizer.stopContinuousRecognitionAsync()
          reject(new Error(`Azure recognizer error: ${e.errorDetails}`))
        }
      }

      // Sự kiện: Hoàn tất xử lý toàn bộ file audio
      recognizer.sessionStopped = (s, e) => {
        recognizer.stopContinuousRecognitionAsync(() => {
          recognizer.close()

          // Nếu không nhận diện được gì, trả về rỗng để tránh lỗi chia cho 0
          if (chunkCount === 0) {
            return reject(new Error('No speech recognized in the audio stream.'))
          }

          // Tính điểm trung bình cho toàn bộ bài
          const avgAccuracy = totalAccuracy / chunkCount
          const avgFluency = totalFluency / chunkCount
          const avgProsody = totalProsody / chunkCount
          const avgRhythm = totalRhythm / chunkCount
          const avgStress = totalStress / chunkCount
          const avgIntonation = totalIntonation / chunkCount

          // Giả lập lại file JSON tổng hợp để truyền vào hàm _mapResult cũ của bạn
          const aggregatedJson = {
            NBest: [
              {
                Words: recognizedWords,
                PronunciationAssessment: {
                  ProsodyScore: {
                    Feedback: {
                      Rhythm: { Score: avgRhythm },
                      Stress: { Score: avgStress },
                      Intonation: { Score: avgIntonation }
                    }
                  }
                }
              }
            ]
          }

          // Giả lập object PA Result
          const aggregatedPaResult = {
            accuracyScore: avgAccuracy,
            fluencyScore: avgFluency,
            prosodyScore: avgProsody
          } as sdk.PronunciationAssessmentResult

          // Resolve với mapper
          resolve(this._mapResult(aggregatedPaResult, aggregatedJson, fullTranscript.trim(), totalAudioDurationTicks))
        })
      }

      // Bắt đầu nhận diện liên tục thay vì nhận diện 1 lần
      recognizer.startContinuousRecognitionAsync()
    })
  }

  private _mapResult(
    pa: sdk.PronunciationAssessmentResult,
    json: any,
    transcript: string,
    audioDurationTicks: number
  ): PronunciationAssessmentResult {
    const nBest = json?.NBest?.[0]
    const paResult = nBest?.PronunciationAssessment
    const prosodyRaw = paResult?.ProsodyScore

    const words = (nBest?.Words ?? []).map((w: any) => {
      const assessment = w.PronunciationAssessment ?? {}

      const mappedSyllables: Syllable[] = (w.Syllables ?? []).map((s: any) => ({
        syllable: s.Syllable,
        accuracyScore: s.PronunciationAssessment?.AccuracyScore ?? 0,
        offset: (s.Offset ?? 0) / AZURE_TICKS_PER_SECOND,
        duration: (s.Duration ?? 0) / AZURE_TICKS_PER_SECOND
      }))

      const maxDuration = Math.max(...mappedSyllables.map((s) => s.duration), 0)

      const syllables = mappedSyllables.map((s) => ({
        ...s,
        isActualStress: mappedSyllables.length === 1 ? true : s.duration === maxDuration && maxDuration > 0
      }))

      return {
        word: w.Word ?? '',
        accuracyScore: assessment.AccuracyScore ?? 0,
        offset: (w.Offset ?? 0) / AZURE_TICKS_PER_SECOND,
        duration: (w.Duration ?? 0) / AZURE_TICKS_PER_SECOND,
        syllables: syllables,
        phonemes: (w.Phonemes ?? []).map((p: any) => ({
          phoneme: p.Phoneme ?? '',
          accuracyScore: p.PronunciationAssessment?.AccuracyScore ?? 0,
          offset: (p.Offset ?? 0) / AZURE_TICKS_PER_SECOND
        })),
        breakAfter: assessment.Feedback?.Prosody?.Break?.BreakLength
          ? assessment.Feedback.Prosody.Break.BreakLength / AZURE_TICKS_PER_SECOND
          : 0
      }
    })

    return {
      transcript,
      audioDuration: audioDurationTicks / AZURE_TICKS_PER_SECOND,
      speechDuration:
        words.length > 0 ? words[words.length - 1].offset + words[words.length - 1].duration - words[0].offset : 0,
      accuracyScore: pa.accuracyScore ?? 0,
      fluencyScore: pa.fluencyScore ?? 0,
      prosody: {
        score: pa.prosodyScore ?? 0,
        rhythm: prosodyRaw?.Feedback?.Rhythm?.Score ?? 0,
        stress: prosodyRaw?.Feedback?.Stress?.Score ?? 0,
        intonation: prosodyRaw?.Feedback?.Intonation?.Score ?? 0
      },
      words
    }
  }
}
