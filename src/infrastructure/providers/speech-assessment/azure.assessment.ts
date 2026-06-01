import * as sdk from 'microsoft-cognitiveservices-speech-sdk'
import { singleton } from 'tsyringe'
import { env } from '~/common/config'
import { IPronunciationAssessmentProvider, PronunciationAssessmentResult } from './assessment.interface'
import { AZURE_TICKS_PER_SECOND } from '~/common/constants/constants'
import axios from 'axios'

type AzurePronunciationAssessment = {
  AccuracyScore?: number
  CompletenessScore?: number
  FluencyScore?: number
  PronScore?: number
  ProsodyScore?: number
  ErrorType?: 'None' | 'Omission' | 'Insertion' | 'Mispronunciation'
  Feedback?: {
    Prosody?: Record<string, unknown> & {
      Break?: {
        BreakLength?: number
      }
    }
  }
}

type AzureNBestPhoneme = {
  Phoneme?: string
  Score?: number
  Confidence?: number
}

type AzurePhoneme = {
  Phoneme?: string
  Offset?: number
  Duration?: number
  PronunciationAssessment?: {
    AccuracyScore?: number
    NBestPhonemes?: AzureNBestPhoneme[]
  }
}

type AzureSyllable = {
  Syllable?: string
  Offset?: number
  Duration?: number
  PronunciationAssessment?: {
    AccuracyScore?: number
  }
  IsStress?: boolean
  IsActualStress?: boolean
}

type AzureWord = {
  Word?: string
  Offset?: number
  Duration?: number
  PronunciationAssessment?: AzurePronunciationAssessment
  Syllables?: AzureSyllable[]
  Phonemes?: AzurePhoneme[]
}

type AzureNBest = {
  Words?: AzureWord[]
  PronunciationAssessment?: AzurePronunciationAssessment
}

type AzureJsonResult = {
  NBest?: AzureNBest[]
}

type AggregatedPaResult = {
  pronunciationScore: number
  accuracyScore: number
  completenessScore: number
  fluencyScore: number
  prosodyScore: number
}

@singleton()
export class AzurePronunciationAssessmentProvider implements IPronunciationAssessmentProvider {
  private readonly speechConfig: sdk.SpeechConfig
  private readonly phonemeAlphabet = 'IPA'
  private readonly nbestPhonemeCount = 5

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
      pronunciationConfig.phonemeAlphabet = this.phonemeAlphabet
      pronunciationConfig.nbestPhonemeCount = this.nbestPhonemeCount

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

      const recognizedWords: AzureWord[] = []
      const chunkAssessments: AzurePronunciationAssessment[] = []
      let fullTranscript = ''
      let totalAudioDurationTicks = 0

      recognizer.recognized = (s, e) => {
        if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
          const jsonStr = e.result.properties.getProperty(sdk.PropertyId.SpeechServiceResponse_JsonResult)

          if (jsonStr) {
            const json = JSON.parse(jsonStr) as AzureJsonResult
            const nBest = json?.NBest?.[0]

            if (nBest?.Words) {
              recognizedWords.push(...nBest.Words)
            }

            if (nBest?.PronunciationAssessment) {
              chunkAssessments.push(nBest.PronunciationAssessment)
            }
          }

          fullTranscript += e.result.text + ' '
          totalAudioDurationTicks += e.result.duration
        }
      }

      recognizer.canceled = (s, e) => {
        if (e.reason === sdk.CancellationReason.Error) {
          recognizer.stopContinuousRecognitionAsync()
          reject(new Error(`Azure recognizer error: ${e.errorDetails}`))
        }
      }

      recognizer.sessionStopped = () => {
        recognizer.stopContinuousRecognitionAsync(() => {
          recognizer.close()

          if (chunkAssessments.length === 0) {
            return reject(new Error('No speech recognized in the audio stream.'))
          }

          const aggregatedAssessment = this._averageAssessment(chunkAssessments)
          const aggregatedJson: AzureJsonResult = {
            NBest: [
              {
                Words: recognizedWords,
                PronunciationAssessment: aggregatedAssessment
              }
            ]
          }

          resolve(
            this._mapResult(
              {
                pronunciationScore: aggregatedAssessment.PronScore ?? 0,
                accuracyScore: aggregatedAssessment.AccuracyScore ?? 0,
                completenessScore: aggregatedAssessment.CompletenessScore ?? 0,
                fluencyScore: aggregatedAssessment.FluencyScore ?? 0,
                prosodyScore: aggregatedAssessment.ProsodyScore ?? 0
              },
              aggregatedJson,
              fullTranscript.trim(),
              totalAudioDurationTicks
            )
          )
        })
      }

      recognizer.startContinuousRecognitionAsync()
    })
  }

  private _averageAssessment(assessments: AzurePronunciationAssessment[]): AzurePronunciationAssessment {
    const avg = (key: keyof AzurePronunciationAssessment) => {
      const values = assessments.map((a) => a[key]).filter((v): v is number => typeof v === 'number')
      return values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : 0
    }

    return {
      PronScore: avg('PronScore'),
      AccuracyScore: avg('AccuracyScore'),
      CompletenessScore: avg('CompletenessScore'),
      FluencyScore: avg('FluencyScore'),
      ProsodyScore: avg('ProsodyScore')
    }
  }

  private _mapResult(
    pa: AggregatedPaResult,
    json: AzureJsonResult,
    transcript: string,
    audioDurationTicks: number
  ): PronunciationAssessmentResult {
    const nBest = json?.NBest?.[0]
    const paResult = nBest?.PronunciationAssessment

    const words =
      nBest?.Words?.map((w, wordIndex) => {
        const assessment = w.PronunciationAssessment ?? {}
        const phonemes =
          w.Phonemes?.map((p) => {
            const expectedIpa = p.Phoneme ?? ''
            const nBestPhonemes =
              p.PronunciationAssessment?.NBestPhonemes?.map((candidate) => ({
                phoneme: candidate.Phoneme ?? '',
                score: candidate.Score,
                confidence: candidate.Confidence
              })) ?? []
            const spokenIpa = this._selectSpokenPhoneme(expectedIpa, nBestPhonemes)

            return {
              phoneme: expectedIpa,
              expectedIpa,
              spokenIpa,
              accuracyScore: p.PronunciationAssessment?.AccuracyScore ?? 0,
              offset: (p.Offset ?? 0) / AZURE_TICKS_PER_SECOND,
              duration: p.Duration != null ? p.Duration / AZURE_TICKS_PER_SECOND : undefined,
              nBestPhonemes
            }
          }) ?? []

        return {
          wordIndex,
          word: w.Word ?? '',
          accuracyScore: assessment.AccuracyScore ?? 0,
          errorType: assessment.ErrorType ?? 'None',
          expectedIpa: phonemes.map((p) => p.expectedIpa).join(''),
          spokenIpa: phonemes.map((p) => p.spokenIpa).join(''),
          offset: (w.Offset ?? 0) / AZURE_TICKS_PER_SECOND,
          duration: (w.Duration ?? 0) / AZURE_TICKS_PER_SECOND,
          syllables:
            w.Syllables?.map((s) => ({
              syllable: s.Syllable ?? '',
              accuracyScore: s.PronunciationAssessment?.AccuracyScore ?? 0,
              offset: (s.Offset ?? 0) / AZURE_TICKS_PER_SECOND,
              duration: (s.Duration ?? 0) / AZURE_TICKS_PER_SECOND,
              expectedStress: s.IsStress,
              actualStress: s.IsActualStress
            })) ?? [],
          phonemes,
          breakAfter: assessment.Feedback?.Prosody?.Break?.BreakLength
            ? assessment.Feedback.Prosody.Break.BreakLength / AZURE_TICKS_PER_SECOND
            : 0,
          prosodyFeedback: assessment.Feedback?.Prosody
        }
      }) ?? []

    return {
      transcript,
      audioDuration: audioDurationTicks / AZURE_TICKS_PER_SECOND,
      speechDuration:
        words.length > 0 ? words[words.length - 1].offset + words[words.length - 1].duration - words[0].offset : 0,
      pronunciationScore: pa.pronunciationScore ?? 0,
      accuracyScore: pa.accuracyScore ?? 0,
      completenessScore: pa.completenessScore ?? 0,
      fluencyScore: pa.fluencyScore ?? 0,
      prosody: {
        score: pa.prosodyScore ?? 0,
        rhythm: 0,
        stress: 0,
        intonation: 0,
        feedback: paResult?.Feedback
      },
      words,
      raw: {
        provider: 'azure',
        phonemeAlphabet: this.phonemeAlphabet,
        nbestPhonemeCount: this.nbestPhonemeCount,
        scores: paResult
      }
    }
  }

  private _selectSpokenPhoneme(
    expectedIpa: string,
    candidates: { phoneme: string; score?: number; confidence?: number }[]
  ): string {
    if (!candidates.length) return expectedIpa

    const scores = candidates
      .map((candidate) => candidate.score)
      .filter((score): score is number => typeof score === 'number')
    if (!scores.length) return candidates[0].phoneme || expectedIpa

    const topScore = Math.max(...scores)
    const topCandidates = candidates.filter((candidate) => candidate.score === topScore)
    const expectedTopCandidate = topCandidates.find((candidate) => candidate.phoneme === expectedIpa)

    return expectedTopCandidate?.phoneme || topCandidates[0]?.phoneme || candidates[0].phoneme || expectedIpa
  }
}
