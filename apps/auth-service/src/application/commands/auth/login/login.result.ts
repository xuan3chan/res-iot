import { UserRole } from '@libs/database';

export class LoginResult {
    accessToken: string;
    user: {
        id: string;
        email: string;
        name: string;
        role: UserRole;
    };
}
