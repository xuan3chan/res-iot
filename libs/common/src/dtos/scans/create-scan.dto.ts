import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateScanDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  targetId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  profileId?: string;
}
