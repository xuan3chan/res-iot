export class RegisterAdminFaceCommand {
  constructor(
    public readonly adminId: string,
    public readonly file: {
      buffer: Buffer;
      originalname: string;
    }
  ) {}
}
