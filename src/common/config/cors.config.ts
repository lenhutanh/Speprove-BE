import { CorsOptions } from 'cors'
import { env } from '~/common/config/env.config'
import { StatusCodes } from 'http-status-codes'
import { AppError } from '../errors'

const WHITELIST_DOMAINS = ['http://localhost:3000']

export const corsOptions: CorsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Cho phép Postman / Các phần mềm gọi API trực tiếp trong môi trường DEV
    // Khi gọi từ Postman, 'origin' sẽ là undefined
    if (!origin && env.NODE_ENV === 'development') {
      return callback(null, true)
    }

    // Kiểm tra domain có nằm trong Whitelist không
    // Dùng origin! (non-null assertion) vì ở đây origin chắc chắn là string nếu không rơi vào trường hợp 1
    if (origin && WHITELIST_DOMAINS.includes(origin)) {
      return callback(null, true)
    }

    // Nếu không thỏa mãn các điều kiện trên thì từ chối
    return callback(new AppError(`${origin} not allowed by our CORS Policy.`, StatusCodes.FORBIDDEN))
  },

  // Cho phép nhận cookies (như JWT trong httpOnly cookie)
  credentials: true,

  // Fix lỗi cho các trình duyệt cũ hoặc SmartTV
  optionsSuccessStatus: 200
}
