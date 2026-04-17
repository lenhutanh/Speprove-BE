export const TOKENS = {
  // Cache
  ICacheService: Symbol('ICacheService'),

  // Domain event
  DomainEventHandler: Symbol('DomainEventHandler'),

  // Event Bus
  IEventBus: Symbol('IEventBus'),

  ITokenService: Symbol('ITokenService'),

  // Mail
  IMailService: Symbol('IMailService'),

  // Account
  IAccountRepository: Symbol('IAccountRepository'),

  // Forecast
  IForecastRepository: Symbol('IForecastRepository'),

  // Group
  IGroupRepository: Symbol('IGroupRepository'),

  // Permission
  IPermissionRepository: Symbol('IPermissionRepository'),

  // Permission Group
  IPermissionGroupRepository: Symbol('IPermissionGroupRepository'),

  // Question
  IQuestionRepository: Symbol('IQuestionRepository'),
  IQuestionAudioRepository: Symbol('IQuestionAudioRepository'),

  // Session
  ISessionRepository: Symbol('ISessionRepository'),

  // Topic
  ITopicRepository: Symbol('ITopicRepository'),

  // Voice
  IVoiceRepository: Symbol('IVoiceRepository'),

  // File
  IFileRepository: Symbol('IFileRepository'),

  // Forecast topic
  IForecastTopicRepository: Symbol('IForecastTopicRepository'),

  // Forecast question
  IForecastQuestionRepository: Symbol('IForecastQuestionRepository'),

  // Speaking session
  ISpeakingSessionRepository: Symbol('ISpeakingSessionRepository'),

  // Attempt
  IAttemptRepository: Symbol('IAttemptRepository'),

  // STT
  ISTTProvider: Symbol('ISTTProvider'),

  // LLM
  ILLMProvider: Symbol('ILLMProvider'),

  // Payment
  IPaymentRepository: Symbol('IPaymentRepository'),
  IPaymentProvider: Symbol('IPaymentProvider'),

  // Credit package
  ICreditPackageRepository: Symbol('ICreditPackageRepository'),

  // Credit log
  ICreditLogRepository: Symbol('ICreditLogRepository')
}
