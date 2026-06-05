import { Request, Response } from 'express'
import { singleton } from 'tsyringe'
import { AuthenticatedRequest } from '~/common/types/request.type'
import { PaymentService } from './payment.service'
import { ResponseTransformer } from '~/common/http'
import { StatusCodes } from 'http-status-codes'
import { PAYMENT_PROVIDER } from './payment.constants'

@singleton()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  public async webhookPayOS(req: Request, res: Response) {
    try {
      await this.paymentService.handleWebhook(PAYMENT_PROVIDER.PAYOS, req.body)
      return ResponseTransformer.success(res)
    } catch {
      return ResponseTransformer.success(res)
    }
  }

  public async create(req: AuthenticatedRequest, res: Response) {
    const result = await this.paymentService.create(req.user._id, req.validated.body)
    return ResponseTransformer.success(res, result, 'Create payment successfully', StatusCodes.CREATED)
  }

  public async getDetails(req: AuthenticatedRequest, res: Response) {
    const payment = await this.paymentService.getDetails(req.user._id, req.validated.params.id)
    return ResponseTransformer.success(res, payment, 'Get payment details successfully')
  }
}
