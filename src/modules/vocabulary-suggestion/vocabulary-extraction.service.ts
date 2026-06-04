import { inject, singleton } from 'tsyringe'
import {
  ATTEMPT_STATUS,
  VOCABULARY_BAND_LEVEL,
  VOCABULARY_SUGGESTION_STATUS,
  VocabularyBandLevel
} from '~/common/constants/constants'
import { TOKENS } from '~/common/constants/tokens'
import { toObjectId } from '~/common/utils'
import { LLMVocabularyExtractor, ExtractedVocabularyItem } from '~/infrastructure/providers/vocabulary-extractor'
import { IAttemptAnalysisRepository } from '../attempt/attempt-analysis.repository.interface'
import { IAttemptRepository } from '../attempt/attempt.repository.interface'
import { AssessmentIssue, AttemptScores, AttemptType, Evaluation } from '../attempt/attempt.model'
import { IForecastQuestionRepository } from '../forecast-question/forecast-question.repository.interface'
import { VocabularySuggestionService } from './vocabulary-suggestion.service'
import { IVocabularySuggestionRepository } from './vocabulary-suggestion.repository.interface'

type ExtractVocabularyJobData = {
  attemptId: string
}

const MAX_APPROVED_SUGGESTIONS_PER_BAND = 10
const MAX_PENDING_SUGGESTIONS_PER_BAND = 10

@singleton()
export class VocabularyExtractionService {
  constructor(
    @inject(TOKENS.IAttemptRepository)
    private readonly attemptRepository: IAttemptRepository,
    @inject(TOKENS.IAttemptAnalysisRepository)
    private readonly attemptAnalysisRepository: IAttemptAnalysisRepository,
    @inject(TOKENS.IForecastQuestionRepository)
    private readonly forecastQuestionRepository: IForecastQuestionRepository,
    private readonly vocabularyExtractor: LLMVocabularyExtractor,
    private readonly vocabularySuggestionService: VocabularySuggestionService,
    @inject(TOKENS.IVocabularySuggestionRepository)
    private readonly vocabularySuggestionRepository: IVocabularySuggestionRepository
  ) {}

  public async extractFromAttempt(data: ExtractVocabularyJobData) {
    const attempt = await this.attemptRepository.findById(data.attemptId)
    if (!attempt || attempt.status !== ATTEMPT_STATUS.DONE) return { skipped: true, count: 0 }

    const analysis = await this.attemptAnalysisRepository.findOne(
      { attemptId: toObjectId(data.attemptId) },
      {
        select: 'transcription.scoringTranscript speechAnalysis.fluencyMetrics.wordCount evaluation'
      }
    )

    const transcript = analysis?.transcription?.scoringTranscript
    const evaluation = analysis?.evaluation as Evaluation | undefined
    if (!transcript || !evaluation) return { skipped: true, count: 0 }
    if (!this.shouldExtract(attempt, evaluation, transcript, analysis?.speechAnalysis?.fluencyMetrics?.wordCount)) {
      return { skipped: true, count: 0 }
    }

    const forecastQuestion = await this.forecastQuestionRepository.findById(attempt.forecastQuestionId, {
      populate: {
        path: 'questionId',
        populate: { path: 'parentId' }
      }
    })

    const question = (forecastQuestion as any)?.questionId
    if (!question?._id) return { skipped: true, count: 0 }

    const availableBandLevels = await this.getAvailableBandLevels(
      question._id.toString(),
      this.getLexicalBand(attempt, evaluation)
    )
    if (!availableBandLevels.length) return { skipped: true, count: 0 }

    const extractedItems = await this.vocabularyExtractor.extract({
      question: this.buildQuestionContent(question),
      transcript,
      scores: attempt.scores,
      targetBandLevels: availableBandLevels,
      lexicalIssues: evaluation.lexical?.issues ?? [],
      grammarIssues: evaluation.grammar?.issues ?? []
    })

    const safeItems = this.filterExtractedItems(extractedItems, transcript, evaluation, availableBandLevels)

    for (const item of safeItems) {
      await this.vocabularySuggestionService.upsertExtractedSuggestion({
        questionId: question._id.toString(),
        text: item.text,
        type: item.type,
        meaningVi: item.meaningVi,
        example: item.example,
        bandLevel: item.bandLevel
      })
    }

    return { skipped: false, count: safeItems.length }
  }

  private shouldExtract(attempt: AttemptType, evaluation: Evaluation, transcript: string, fluencyWordCount?: number) {
    const lexicalBand = this.getLexicalBand(attempt, evaluation)
    const grammarBand = this.getGrammarBand(attempt, evaluation)
    const seriousLexicalIssues = (evaluation.lexical?.issues ?? []).filter((issue) => issue.severity === 'major')
    const wordCount = fluencyWordCount ?? this.wordCount(transcript)

    return lexicalBand >= 6 && grammarBand >= 6 && wordCount >= 20 && seriousLexicalIssues.length === 0
  }

  private filterExtractedItems(
    items: ExtractedVocabularyItem[],
    transcript: string,
    evaluation: Evaluation,
    availableBandLevels: VocabularyBandLevel[]
  ) {
    const issueSpans = [...(evaluation.lexical?.issues ?? []), ...(evaluation.grammar?.issues ?? [])]
      .map((issue: AssessmentIssue) => issue.spanText)
      .filter((span): span is string => !!span)

    const seen = new Set<string>()

    return items
      .filter((item) => {
        const normalizedText = this.normalizeText(item.text)
        const confidence = item.confidence ?? 1

        if (seen.has(normalizedText)) return false
        if (confidence < 0.7) return false
        if (this.wordCount(item.text) > 8) return false
        if (!this.isValidBandLevel(item.bandLevel)) return false
        if (!availableBandLevels.includes(item.bandLevel)) return false
        if (this.overlapsIssue(normalizedText, issueSpans)) return false

        seen.add(normalizedText)
        return true
      })
      .slice(0, 3)
  }

  private buildQuestionContent(question: any) {
    if (question.part === 2) {
      const bullets = (question.bulletPoints ?? []).map((b: string) => `- ${b}`).join('\n')
      return bullets ? `${question.content}\n${bullets}` : question.content
    }

    if (question.part === 3 && question.parentId?.content) {
      return `PART 2 TOPIC (context): ${question.parentId.content}\n\nPART 3 QUESTION: ${question.content}`
    }

    return question.content
  }

  private async getAvailableBandLevels(questionId: string, lexicalBand: number) {
    const targetBandLevels = this.resolveTargetBandLevels(lexicalBand)
    const availableBandLevels: VocabularyBandLevel[] = []

    for (const bandLevel of targetBandLevels) {
      const [approvedCount, pendingCount] = await Promise.all([
        this.vocabularySuggestionRepository.count({
          questionId: toObjectId(questionId),
          bandLevel,
          status: VOCABULARY_SUGGESTION_STATUS.APPROVED
        }),
        this.vocabularySuggestionRepository.count({
          questionId: toObjectId(questionId),
          bandLevel,
          status: VOCABULARY_SUGGESTION_STATUS.PENDING
        })
      ])

      if (approvedCount < MAX_APPROVED_SUGGESTIONS_PER_BAND && pendingCount < MAX_PENDING_SUGGESTIONS_PER_BAND) {
        availableBandLevels.push(bandLevel)
      }
    }

    return availableBandLevels
  }

  private resolveTargetBandLevels(lexicalBand: number): VocabularyBandLevel[] {
    if (lexicalBand >= 8) return [8]
    if (lexicalBand >= 7) return [7]
    return [6]
  }

  private getLexicalBand(attempt: AttemptType, evaluation: Evaluation) {
    const scores = attempt.scores as Partial<AttemptScores> | undefined
    return scores?.lexical ?? evaluation.lexical?.band ?? 0
  }

  private getGrammarBand(attempt: AttemptType, evaluation: Evaluation) {
    const scores = attempt.scores as Partial<AttemptScores> | undefined
    return scores?.grammar ?? evaluation.grammar?.band ?? 0
  }

  private isValidBandLevel(value: number): value is VocabularyBandLevel {
    return VOCABULARY_BAND_LEVEL.includes(value as VocabularyBandLevel)
  }

  private overlapsIssue(normalizedText: string, issueSpans: string[]) {
    return issueSpans.some((span) => {
      const normalizedSpan = this.normalizeText(span)
      return normalizedSpan.includes(normalizedText) || normalizedText.includes(normalizedSpan)
    })
  }

  private wordCount(text: string) {
    return this.normalizeText(text).split(/\s+/).filter(Boolean).length
  }

  private normalizeText(text: string) {
    return text
      .trim()
      .toLowerCase()
      .replace(/[\u201c\u201d]/g, '"')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/\s+/g, ' ')
  }
}
