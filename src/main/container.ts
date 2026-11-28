import { container } from 'tsyringe'
import { TOKENS } from '~/core/di/di.constants'
import { CacheService } from '~/core/cache/cache.service'
import { QueueRegistry } from '~/core/queue/queue.registry'
import { PasswordHasher } from '~/core/security/password-hasher.service'
import { TokenService } from '~/core/security/token.service'
import { WorkerRegistry } from '~/core/queue/worker.registry'
import { registerAccountProviderModule } from '~/modules/auth/social-identity/account-provider.di'
import { registerAssessmentModule } from '~/modules/assessment/assessment.di'
import { registerAccountModule } from '~/modules/account/account.di'
import { registerAttemptModule } from '~/modules/practice/attempt/attempt.di'
import { registerCreditLogModule } from '~/modules/billing/wallet/credit-log.di'
import { registerCreditPackageModule } from '~/modules/billing/package/credit-package.di'
import { registerFileModule } from '~/modules/file/file.di'
import { registerForecastQuestionModule } from '~/modules/content/forecast-question/forecast-question.di'
import { registerForecastTopicModule } from '~/modules/content/forecast-topic/forecast-topic.di'
import { registerForecastModule } from '~/modules/content/forecast/forecast.di'
import { registerGeneratedAudioModule } from '~/modules/tts/generated-audio.di'
import { registerGroupModule } from '~/modules/account/group/group.di'
import { registerMailModule } from '~/modules/notification/mail.di'
import { registerPaymentModule } from '~/modules/billing/payment/payment.di'
import { registerPermissionGroupModule } from '~/modules/account/permission-group/permission-group.di'
import { registerPermissionModule } from '~/modules/account/permission/permission.di'
import { registerQuestionModule } from '~/modules/content/question/question.di'
import { registerSessionModule } from '~/modules/auth/session/session.di'
import { registerSpeakingSessionModule } from '~/modules/practice/mock-test/speaking-session.di'
import { registerTopicModule } from '~/modules/content/topic/topic.di'
import { registerVocabularySuggestionModule } from '~/modules/content/vocabulary/vocabulary-suggestion.di'
import { registerVoiceModule } from '~/modules/content/voice/voice.di'
import { registerVoiceRoomModule } from '~/modules/voice-room/voice-room.di'
import { logger } from '~/core/logging/logger'

export function setupContainer(): void {
  logger.info('Setting up DI container...')

  container.registerSingleton(TOKENS.ITokenService, TokenService)
  container.registerSingleton(TOKENS.IPasswordHasher, PasswordHasher)
  container.registerSingleton(TOKENS.ICacheService, CacheService)
  container.registerSingleton(QueueRegistry, QueueRegistry)
  container.registerSingleton(WorkerRegistry, WorkerRegistry)

  registerAccountModule()
  registerAssessmentModule()
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
  registerAccountProviderModule()
  registerGeneratedAudioModule()
  registerVocabularySuggestionModule()
  registerVoiceRoomModule()

  logger.info('DI container ready\n')
}
