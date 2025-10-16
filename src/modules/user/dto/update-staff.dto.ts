export interface UpdateStaffDto {
  username?: string;
  email?: string;
  password?: string;
  phone?: string;
  type_documento?: string;
  n_documento?: string;
  birthday?: Date | string;
  email_verified_at?: boolean;
  roleId?: string;
}
