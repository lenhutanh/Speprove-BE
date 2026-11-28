import { container } from 'tsyringe'
import { TOKENS } from '~/core/di/di.constants'
import { TopicRepository } from './topic.repository'

export const registerTopicModule = () => {
  container.registerSingleton(TOKENS.ITopicRepository, TopicRepository)
}
