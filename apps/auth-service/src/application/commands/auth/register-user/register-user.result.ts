import { UserRole } from '@libs/database';

export class RegisterUserResult {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
}
