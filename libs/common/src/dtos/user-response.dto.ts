import { UserRole } from '@libs/database';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    name: string;

    @ApiProperty({ enum: UserRole })
    role: UserRole;

    @ApiProperty()
    isActive: boolean;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}
