import { singleton } from 'tsyringe'
import { BaseMapper } from '~/common/base'
import { CreditLogType } from './credit-log.model'
import { CreditLogResponseDto } from './credit-log.dto'

@singleton()
export class CreditLogMapper extends BaseMapper<CreditLogType, CreditLogResponseDto> {
  public toResponse(domain: any): CreditLogResponseDto {
    return {
      id: domain._id.toString(),
      type: domain.type as 'plus' | 'minus',
      amount: domain.amount,
      description: domain.description,
      descriptionKey: domain.descriptionKey,
      descriptionMetadata: domain.descriptionMetadata
        ? domain.descriptionMetadata instanceof Map
          ? Object.fromEntries(domain.descriptionMetadata)
          : domain.descriptionMetadata
        : undefined,
      refType: domain.refType,
      refId: domain.refId?.toString(),
      balanceBefore: domain.balanceBefore,
      balanceAfter: domain.balanceAfter,
      createdAt: domain.createdAt
    }
  }

  public toResponseList(domains: CreditLogType[]): CreditLogResponseDto[] {
    return domains.map((domain) => this.toResponse(domain))
  }
}
