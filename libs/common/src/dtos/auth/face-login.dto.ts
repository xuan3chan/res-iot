import { IsString, IsArray, IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FaceLoginDto {
  @ApiProperty({
    description: 'Array of base64 encoded frames (minimum 10)',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  frames: string[];

  @ApiProperty({
    description: 'Type of liveness challenge performed',
    enum: ['BLINK', 'TURN_HEAD', 'OPEN_MOUTH', 'READ_NUMBER'],
  })
  @IsEnum(['BLINK', 'TURN_HEAD', 'OPEN_MOUTH', 'READ_NUMBER'])
  challengeType: 'BLINK' | 'TURN_HEAD' | 'OPEN_MOUTH' | 'READ_NUMBER';

  @ApiProperty({
    description: 'Whether the client-side challenge was passed',
  })
  @IsBoolean()
  challengePassed: boolean;

  @ApiProperty({
    description: 'Optional device identifier',
    required: false,
  })
  @IsOptional()
  @IsString()
  deviceId?: string;
}
