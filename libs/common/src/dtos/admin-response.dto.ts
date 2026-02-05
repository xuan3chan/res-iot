import { ApiProperty } from '@nestjs/swagger';
import { AdminRole } from '../enums/role.enum';

export class AdminResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: AdminRole })
  role: AdminRole;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  hasFaceRegistered: boolean;

  @ApiProperty()
  updatedAt: Date;
}
