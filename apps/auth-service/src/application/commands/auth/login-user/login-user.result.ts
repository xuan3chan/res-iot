import { UserRole } from '@libs/database';

export class LoginUserResult {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
}
