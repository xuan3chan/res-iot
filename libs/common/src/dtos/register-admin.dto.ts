import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterAdminDto {
  @ApiProperty({ example: 'admin@example.com', description: 'Admin email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123', description: 'Admin password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({
    example: 'admin_user',
    description: 'Username (auto-generated from email if not provided)',
  })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({ example: 'Admin User', description: 'Full name' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
