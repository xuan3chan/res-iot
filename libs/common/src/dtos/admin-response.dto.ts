import { ApiProperty } from '@nestjs/swagger';

export class AdminResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  hasFaceRegistered: boolean;

  @ApiProperty()
  updatedAt: Date;
}
