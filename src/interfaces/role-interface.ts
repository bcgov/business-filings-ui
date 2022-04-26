import { Roles } from '@/enums'

export interface RoleIF {
  appointmentDate: string // yyyy-mm-dd
  cessationDate?: string
  roleType: Roles
}
