import { IsEnum, IsNotEmpty, IsUrl } from 'class-validator';

export enum TargetEnvironment {
  STAGING = 'STAGING',
  PROD = 'PROD',
}

export class CreateTargetDto {
  @IsNotEmpty()
  @IsUrl()
  url: string;

  @IsEnum(TargetEnvironment)
  environment: TargetEnvironment;
}
