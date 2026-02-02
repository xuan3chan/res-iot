export class FaceLoginCommand {
  constructor(
    public readonly frames: string[], // Base64 encoded frames
    public readonly challengeType: 'BLINK' | 'TURN_HEAD' | 'OPEN_MOUTH' | 'READ_NUMBER',
    public readonly challengePassed: boolean,
    public readonly ipAddress: string,
    public readonly deviceId?: string
  ) {}
}
