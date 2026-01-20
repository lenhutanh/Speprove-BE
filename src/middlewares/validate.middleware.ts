import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'

const validate = (schema: ZodSchema<any>) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query
      })

      req.validated = parsed

      next()
    } catch (err) {
      next(err)
    }
  }
}

export const validateMiddleware = { validate }
