export type FileResponseDto = {
  id: string
  url: string
  fileName: string
  fileSize?: number
  mimeType: string
  kind: string

  duration?: number
  transcript?: string

  width?: number
  height?: number

  createdAt?: Date
}
