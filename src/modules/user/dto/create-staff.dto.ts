export interface CreateStaffDto {
  username: string;
  email: string;
  password: string;
  phone: string;
  type_documento: string;
  n_documento: string;
  birthday: Date | string;
  roleId: string;
}
