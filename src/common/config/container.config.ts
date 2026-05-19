import { container } from 'tsyringe'
import { registerAccountModule } from '~/modules/account/account.di'
import { TOKENS } from '../constants/tokens'
import { JwtTokenService } from '~/infrastructure/security/jwt-token.service'
import { registerForecastModule } from '~/modules/forecast/forecast.di'
import { registerGroupModule } from '~/modules/group/group.di'
import { registerPermissionModule } from '~/modules/permission/permission.di'
import { registerPermissionGroupModule } from '~/modules/permission-group/permission-group.di'
import { registerQuestionModule } from '~/modules/question/question.di'
import { registerSessionModule } from '~/modules/session/session.di'
import { registerTopicModule } from '~/modules/topic/topic.di'
import { registerVoiceModule } from '~/modules/voice/voice.di'
import { registerFileModule } from '~/modules/file/file.di'
import { EventBus } from '~/infrastructure/event-bus/event-bus'
import { AppEventEmitter } from '~/infrastructure/event-bus'
import { QueueFactory } from '~/infrastructure/queues/queue.factory'
import { WorkerFactory } from '~/infrastructure/workers/worker.factory'
import { CacheService } from '~/infrastructure/cache/cache.service'
import { registerMailModule } from '~/modules/mail/mail.di'
import { registerQuestionAudioModule } from '~/modules/question-audio/question-audio.di'
import { registerForecastTopicModule } from '~/modules/forecast-topic/forecast-topic.di'
import { registerForecastQuestionModule } from '~/modules/forecast-question/forecast-question.di'
import { registerSpeakingSessionModule } from '~/modules/speaking-session/speaking-session.di'
import { registerAttemptModule } from '~/modules/attempt/attempt.di'
import { GroqSTTProvider } from '~/infrastructure/providers/stt'
import { GroqLLMProvider } from '~/infrastructure/providers/llm/groq.llm'
import { registerPaymentModule } from '~/modules/payment/payment.di'
import { registerCreditPackageModule } from '~/modules/credit-package/credit-package.di'
import { registerCreditLogModule } from '~/modules/credit-log/credit-log.di'
import { registerInstructionAudioModule } from '~/modules/instruction-audio/instruction-audio.di'
import { registerAccountProviderModule } from '~/modules/account-provider/account-provider.di';

export function setupContainer(): void {
  console.log('🔧 Setting up DI container...')
  // Infrastructure
  container.registerSingleton(TOKENS.ITokenService, JwtTokenService)
  container.registerSingleton(TOKENS.IEventBus, EventBus)
  container.registerSingleton(TOKENS.ICacheService, CacheService)
  container.registerSingleton(AppEventEmitter, AppEventEmitter)
  container.registerSingleton(QueueFactory, QueueFactory)
  container.registerSingleton(WorkerFactory, WorkerFactory)
  container.registerSingleton(TOKENS.ISTTProvider, GroqSTTProvider)
  container.registerSingleton(TOKENS.ILLMProvider, GroqLLMProvider)

  // Module
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
  registerQuestionAudioModule()
  registerForecastTopicModule()
  registerForecastQuestionModule()
  registerSpeakingSessionModule()
  registerAttemptModule()
  registerPaymentModule()
  registerCreditPackageModule()
  registerCreditLogModule()
  registerInstructionAudioModule()
  registerAccountProviderModule()

  console.log('✅ DI container ready\n')
}
