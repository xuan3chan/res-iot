import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@libs/database';

export class CreateUserDto {
    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({ enum: UserRole })
    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;
}
