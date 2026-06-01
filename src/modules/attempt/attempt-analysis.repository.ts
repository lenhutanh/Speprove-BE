import { singleton } from 'tsyringe'
import { BaseRepository } from '~/common/base'
import { AttemptAnalysis, AttemptAnalysisType } from './attempt-analysis.model'
import { IAttemptAnalysisRepository } from './attempt-analysis.repository.interface'

@singleton()
export class AttemptAnalysisRepository
  extends BaseRepository<AttemptAnalysisType>
  implements IAttemptAnalysisRepository
{
  constructor() {
    super(AttemptAnalysis)
  }
}
