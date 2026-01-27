export class RegisterAdminResult {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    username: string;
    // Add other fields if needed
  };
}
