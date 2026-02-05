export class RegisterUserResult {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}
