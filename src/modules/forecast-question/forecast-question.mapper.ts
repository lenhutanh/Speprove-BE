import { singleton } from 'tsyringe'
import { BaseMapper } from '~/common/base'
import { ForecastQuestionType } from './forecast-question.model'
import { ForecastQuestionResponseDto } from './forecast-question.dto'

@singleton()
export class ForecastQuestionMapper extends BaseMapper<ForecastQuestionType, ForecastQuestionResponseDto> {
  toResponse(entity: any): ForecastQuestionResponseDto {
    const q = entity.q || entity.questionId
    if (!q) return {} as any
    const forecast = entity.forecastId
    const forecastTopic = entity.forecastTopicId
    const topic = forecastTopic?.topicId
    const isForecastPopulated =
      forecast && typeof forecast === 'object' && '_id' in forecast && 'name' in forecast && 'slug' in forecast

    const res: ForecastQuestionResponseDto = {
      id: entity._id.toString(),
      questionId: q._id?.toString() || q.id,
      content: q.content,
      part: q.part,
      order: entity.order,
      prev: entity.prev,
      next: entity.next
    }

    if (isForecastPopulated) {
      res.forecast = {
        id: forecast._id.toString(),
        name: forecast.name,
        slug: forecast.slug
      }
    }

    if (isForecastPopulated) {
      res.forecastTopic = null
    }

    if (forecastTopic && typeof forecastTopic === 'object' && '_id' in forecastTopic) {
      if (topic && typeof topic === 'object' && '_id' in topic && 'name' in topic && 'slug' in topic) {
        res.forecastTopic = {
          id: forecastTopic._id.toString(),
          topic: {
            id: topic._id.toString(),
            name: topic.name,
            slug: topic.slug
          }
        }
      }
    }

    if (q.parentId) {
      res.parent = {
        id: q.parentId._id.toString(),
        questionId: q.parentId._id.toString(),
        content: q.parentId.content,
        part: q.parentId.part,
        category: q.parentId.category
      }
    }

    if (q.part === 2) {
      res.category = q.category
      res.bulletPoints = q.bulletPoints || []

      if (entity.followUpForecastQuestions && entity.followUpForecastQuestions.length > 0) {
        res.childPart3 = entity.followUpForecastQuestions.map((p3Record: any) => this.toResponse(p3Record))
      }
    }

    return res
  }
}
