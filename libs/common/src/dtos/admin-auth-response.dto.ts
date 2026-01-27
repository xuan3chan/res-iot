import { ApiProperty } from '@nestjs/swagger';
import { AdminResponseDto } from './admin-response.dto';

export class AdminAuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  user: AdminResponseDto;
}
