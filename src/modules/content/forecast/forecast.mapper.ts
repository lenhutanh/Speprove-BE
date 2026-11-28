import { singleton } from 'tsyringe'
import { BaseMapper } from '~/core/persistence/base.mapper'
import { ForecastType } from './forecast.model'
import { ForecastResponseDto } from './forecast.dto'
import { isPopulated } from '~/core/utils/mongoose.util'
import { ImageFileType } from '../../file/file.model'

@singleton()
export class ForecastMapper extends BaseMapper<ForecastType, ForecastResponseDto> {
  toResponse(entity: ForecastType): ForecastResponseDto {
    const { validFrom, validTo } = getQuarterRange(entity.quarter, entity.year)

    return {
      id: entity._id.toString(),
      name: entity.name,
      slug: entity.slug,
      quarter: entity.quarter,
      year: entity.year,
      thumbnail: isPopulated<ForecastType, 'thumbnailId'>(entity.thumbnailId, 'url')
        ? (entity.thumbnailId as unknown as ImageFileType).url
        : null,
      description: entity.description || null,
      validFrom: validFrom.toISOString(),
      validTo: validTo.toISOString(),
      createdAt: entity.createdAt?.toISOString() || ''
    }
  }
}

function getQuarterRange(quarter: number, year: number) {
  const startMonth = (quarter - 1) * 4
  const validFrom = new Date(year, startMonth, 1)
  const validTo = new Date(year, startMonth + 4, 0)
  return { validFrom, validTo }
}
