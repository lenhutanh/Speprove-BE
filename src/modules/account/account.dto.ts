import { GroupResponseDto } from '../group/group.dto'

export interface AccountResponseDto {
  id: string
  username: string
  email: string
  fullName: string
  avatarUrl: string
  kind: number
  status: number
  group: GroupResponseDto | null
  isSuperAdmin: boolean
  createdAt: string
}
