import { IsEnum, IsUUID } from 'class-validator';

export enum ScanProfile {
  QUICK = 'QUICK',
  FULL = 'FULL',
}

export class TriggerScanDto {
  @IsUUID()
  targetId: string;

  @IsEnum(ScanProfile)
  profile: ScanProfile;
}
