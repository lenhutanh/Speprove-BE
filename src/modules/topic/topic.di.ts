import { container } from 'tsyringe'
import { TOKENS } from '~/common/constants/di.tokens'
import { TopicRepository } from './repositories/topic.repository'

export const registerTopicModule = () => {
  container.registerSingleton(TOKENS.ITopicRepository, TopicRepository)
}
