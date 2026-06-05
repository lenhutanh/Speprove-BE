import { container } from 'tsyringe'
import { TOKENS } from '~/common/constants/di.tokens'
import { CacheService } from '~/infrastructure/cache/cache.service'
import { AppEventEmitter } from '~/infrastructure/event-bus'
import { EventBus } from '~/infrastructure/event-bus/event-bus'
import { GroqLLMProvider } from '~/infrastructure/providers/llm/groq.llm'
import { GroqSTTProvider } from '~/infrastructure/providers/stt'
import { QueueFactory } from '~/infrastructure/queues/queue.factory'
import { BcryptHasher } from '~/infrastructure/security/bcrypt-hasher.service'
import { JwtTokenService } from '~/infrastructure/security/jwt-token.service'
import { WorkerFactory } from '~/infrastructure/workers/worker.factory'
import { registerAccountProviderModule } from '~/modules/account-provider/account-provider.di'
import { registerAccountModule } from '~/modules/account/account.di'
import { registerAttemptModule } from '~/modules/attempt/attempt.di'
import { registerCreditLogModule } from '~/modules/credit-log/credit-log.di'
import { registerCreditPackageModule } from '~/modules/credit-package/credit-package.di'
import { registerFileModule } from '~/modules/file/file.di'
import { registerForecastQuestionModule } from '~/modules/forecast-question/forecast-question.di'
import { registerForecastTopicModule } from '~/modules/forecast-topic/forecast-topic.di'
import { registerForecastModule } from '~/modules/forecast/forecast.di'
import { registerGeneratedAudioModule } from '~/modules/generated-audio/generated-audio.di'
import { registerGroupModule } from '~/modules/group/group.di'
import { registerInstructionAudioModule } from '~/modules/instruction-audio/instruction-audio.di'
import { registerMailModule } from '~/modules/mail/mail.di'
import { registerPaymentModule } from '~/modules/payment/payment.di'
import { registerPermissionGroupModule } from '~/modules/permission-group/permission-group.di'
import { registerPermissionModule } from '~/modules/permission/permission.di'
import { registerQuestionModule } from '~/modules/question/question.di'
import { registerSessionModule } from '~/modules/session/session.di'
import { registerSpeakingSessionModule } from '~/modules/speaking-session/speaking-session.di'
import { registerTopicModule } from '~/modules/topic/topic.di'
import { registerVocabularySuggestionModule } from '~/modules/vocabulary-suggestion/vocabulary-suggestion.di'
import { registerVoiceModule } from '~/modules/voice/voice.di'

export function setupContainer(): void {
  console.log('Setting up DI container...')

  container.registerSingleton(TOKENS.ITokenService, JwtTokenService)
  container.registerSingleton(TOKENS.IHasher, BcryptHasher)
  container.registerSingleton(TOKENS.IEventBus, EventBus)
  container.registerSingleton(TOKENS.ICacheService, CacheService)
  container.registerSingleton(AppEventEmitter, AppEventEmitter)
  container.registerSingleton(QueueFactory, QueueFactory)
  container.registerSingleton(WorkerFactory, WorkerFactory)
  container.registerSingleton(TOKENS.ISTTProvider, GroqSTTProvider)
  container.registerSingleton(TOKENS.ILLMProvider, GroqLLMProvider)

  registerAccountModule()
  registerSessionModule()
  registerGroupModule()
  registerPermissionGroupModule()
  registerPermissionModule()
  registerVoiceModule()
  registerQuestionModule()
  registerForecastModule()
  registerTopicModule()
  registerFileModule()
  registerMailModule()
  registerForecastTopicModule()
  registerForecastQuestionModule()
  registerSpeakingSessionModule()
  registerAttemptModule()
  registerPaymentModule()
  registerCreditPackageModule()
  registerCreditLogModule()
  registerInstructionAudioModule()
  registerAccountProviderModule()
  registerGeneratedAudioModule()
  registerVocabularySuggestionModule()

  console.log('DI container ready\n')
}

