import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'

export const validateMiddleware = (schema: ZodSchema<any>) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query
      })
      console.log('🚀 ~ validateMiddleware ~ parsed:', parsed)

      req.validated = parsed

      next()
    } catch (err) {
      next(err)
    }
  }
}
