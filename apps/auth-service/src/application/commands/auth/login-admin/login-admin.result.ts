import { UserRole } from '@libs/database';

export class LoginAdminResult {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
}
