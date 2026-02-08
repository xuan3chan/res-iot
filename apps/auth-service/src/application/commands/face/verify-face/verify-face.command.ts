export class VerifyFaceCommand {
  constructor(
    public readonly file: {
      buffer: Buffer;
      originalname: string;
    }
  ) {}
}
