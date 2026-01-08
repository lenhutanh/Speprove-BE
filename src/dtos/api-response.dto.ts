export class ApiResponse<T> {
  readonly success: boolean = true

  constructor(
    public message: string,
    public data?: T,
    public meta?: {
      totalElements: number
      totalPages: number
      page: number
      pageSize: number
    }
  ) {}
}
