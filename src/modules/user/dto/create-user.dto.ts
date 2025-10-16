export interface CreateUserData {
  email: string;
  password: string;
  avatar?: string | null;
  roleId: string;
}
