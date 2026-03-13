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

export function setupContainer(): void {
  console.log('🔧 Setting up DI container...')
  // Infrastructure
  container.registerSingleton(TOKENS.ITokenService, JwtTokenService)
  container.registerSingleton(TOKENS.IEventBus, EventBus)
  container.registerSingleton(TOKENS.ICacheService, CacheService)
  container.registerSingleton(AppEventEmitter, AppEventEmitter)
  container.registerSingleton(QueueFactory, QueueFactory)
  container.registerSingleton(WorkerFactory, WorkerFactory)

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

  console.log('✅ DI container ready\n')
}
