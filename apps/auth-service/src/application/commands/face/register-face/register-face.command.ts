export class RegisterFaceCommand {
    constructor(
        public readonly userId: string,
        public readonly file: {
            buffer: Buffer;
            originalname: string;
        },
    ) {}
}
