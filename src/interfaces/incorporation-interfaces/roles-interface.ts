import { Roles } from '@/enums'

export interface RolesIF {
  roleType: Roles;
  appointmentDate?: string;
  cessationDate?: string;
}
